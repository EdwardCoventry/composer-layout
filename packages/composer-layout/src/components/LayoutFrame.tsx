import React, { useMemo, useRef, useLayoutEffect, useState, useCallback } from 'react';
import { LayoutFrameProps, ComposerHeightMode, DEFAULT_OVERLAY_CONTENT_MAX_FRACTION } from '../types/layout';
import { useViewportCategory } from '../hooks/useViewportCategory';
import { useKeyboardOpen } from '../hooks/useKeyboardOpen';

// Clamp a fraction into [0,1]
function clampFraction(value: number | undefined): number | undefined {
  if (value == null) return value;
  return Math.max(0, Math.min(1, value));
}

// Unified style resolver for composer region
function getComposerRegionStyle(mode: ComposerHeightMode, variant: 'inline' | 'overlay'): React.CSSProperties {
  const type = mode.type;
  if (type === 'fraction') {
    const fraction = clampFraction(mode.fraction) ?? 0;
    const vh = `${fraction * 100}vh`;
    if (variant === 'inline') {
      return { flex: '0 0 auto', height: vh, minHeight: mode.minPx ? `${mode.minPx}px` : undefined, maxHeight: vh, boxSizing: 'border-box' };
    }
    return { height: vh, maxHeight: vh, boxSizing: 'border-box' };
  }
  if (type === 'content') {
    const maxF = clampFraction(mode.maxFraction);
    const maxVh = maxF != null ? `${maxF * 100}vh` : (variant === 'overlay' ? `${DEFAULT_OVERLAY_CONTENT_MAX_FRACTION * 100}vh` : undefined);
    if (variant === 'inline') {
      return { flex: '0 0 auto', maxHeight: maxVh, boxSizing: 'border-box' };
    }
    return { maxHeight: maxVh, boxSizing: 'border-box' };
  }
  // calculated
  const h = mode.getHeight();
  const maxF = clampFraction(mode.maxFraction);
  const maxVh = maxF != null ? `${maxF * 100}vh` : undefined;
  if (variant === 'inline') {
    return { flex: '0 0 auto', height: `${h}px`, maxHeight: maxVh, boxSizing: 'border-box' };
  }
  return { height: `${h}px`, maxHeight: maxVh, boxSizing: 'border-box' };
}

function computeComposerPixelHeight(mode: ComposerHeightMode, viewportHeight: number): number | undefined {
  switch (mode.type) {
    case 'fraction': {
      const fraction = clampFraction(mode.fraction) ?? 0;
      const vh = fraction * viewportHeight;
      return Math.max(mode.minPx ?? 0, vh);
    }
    case 'calculated':
      return mode.getHeight();
    case 'content':
      return undefined; // measure dynamically
  }
}

const OVERFLOW_TOLERANCE_PX = 1;
const bottomRegionInnerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%' };
const composerScrollAreaStyle: React.CSSProperties = { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const composerContentWrapperStyle: React.CSSProperties = { flex: '0 1 auto', minHeight: 0 };
const bottomFooterStyle: React.CSSProperties = { flex: '0 0 auto' };

export const LayoutFrame: React.FC<LayoutFrameProps> = ({
  header,
  contentPanel,
  composerPanel,
  showComposerPanel = !!composerPanel,
  composerHeightMode,
  footer,
  overlayPadContentPanel = false,
  keyboardThreshold = 150,
  hideFooterOnComposerOverflow = false
}) => {
  const { isMobile } = useViewportCategory();
  const keyboardOpen = useKeyboardOpen(keyboardThreshold);

  const hasComposerPanel = !!composerPanel && showComposerPanel;
  const hasFooter = !!footer;
  const isOverlay = isMobile && keyboardOpen && hasComposerPanel;

  // Only resolve styles if we have a composer panel & height mode
  const inlineComposerStyle = useMemo(() => (
    hasComposerPanel && composerHeightMode ? getComposerRegionStyle(composerHeightMode, 'inline') : {}
  ), [hasComposerPanel, composerHeightMode]);
  const overlayComposerStyle = useMemo(() => (
    hasComposerPanel && composerHeightMode ? getComposerRegionStyle(composerHeightMode, 'overlay') : {}
  ), [hasComposerPanel, composerHeightMode]);

  const bottomRef = useRef<HTMLElement | null>(null);
  const [measuredBottomHeight, setMeasuredBottomHeight] = useState<number | undefined>();
  const composerPanelRef = useRef<HTMLDivElement | null>(null);
  const composerContentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const footerHeightRef = useRef(0);
  const [footerHiddenForOverflow, setFooterHiddenForOverflow] = useState(false);

  // Single effect for measurement / resize observer
  useLayoutEffect(() => {
    if (!isOverlay || !hasComposerPanel) return;
    if (!bottomRef.current) return;
    // Initial measure
    setMeasuredBottomHeight(bottomRef.current.getBoundingClientRect().height);
    // Resize observer only for content mode
    if (composerHeightMode?.type === 'content' && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => { if (entries[0]) setMeasuredBottomHeight(entries[0].contentRect.height); });
      ro.observe(bottomRef.current);
      return () => ro.disconnect();
    }
  }, [isOverlay, hasComposerPanel, composerHeightMode]);

  const updateFooterHeight = useCallback(() => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    footerHeightRef.current = rect.height;
  }, []);

  const recomputeFooterVisibility = useCallback(() => {
    if (!hideFooterOnComposerOverflow || !hasComposerPanel || !hasFooter) {
      if (footerHiddenForOverflow) {
        setFooterHiddenForOverflow(false);
      }
      return;
    }
    const scrollEl = composerPanelRef.current;
    if (!scrollEl) return;

    const footerHeight = footerHeightRef.current;
    if (!footerHeight) {
      if (footerHiddenForOverflow) {
        setFooterHiddenForOverflow(false);
      }
      return;
    }

    const contentHeight = scrollEl.scrollHeight;
    const viewportHeight = scrollEl.clientHeight;
    const heightWithFooter = viewportHeight - (footerHiddenForOverflow ? footerHeight : 0);
    const overflowIfFooterVisible = contentHeight - heightWithFooter > OVERFLOW_TOLERANCE_PX;

    if (overflowIfFooterVisible !== footerHiddenForOverflow) {
      setFooterHiddenForOverflow(overflowIfFooterVisible);
    }
  }, [footerHiddenForOverflow, hasComposerPanel, hasFooter, hideFooterOnComposerOverflow]);

  // Track footer size so we can calculate whether removing it would prevent overflow.
  useLayoutEffect(() => {
    if (!hasFooter) return;
    if (!footerRef.current) return;
    updateFooterHeight();
    recomputeFooterVisibility();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      updateFooterHeight();
      recomputeFooterVisibility();
    });
    ro.observe(footerRef.current);
    return () => ro.disconnect();
  }, [hasFooter, isOverlay, recomputeFooterVisibility, showComposerPanel, updateFooterHeight]);

  // Watch composer area/content size to determine if we should hide the footer for more space.
  useLayoutEffect(() => {
    if (!hideFooterOnComposerOverflow || !hasComposerPanel || !hasFooter) return;
    const scrollEl = composerPanelRef.current;
    const contentEl = composerContentRef.current;
    if (!scrollEl) return;

    const handleResize = () => recomputeFooterVisibility();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(scrollEl);
      if (contentEl) ro.observe(contentEl);
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [hideFooterOnComposerOverflow, hasComposerPanel, hasFooter, recomputeFooterVisibility, isOverlay, showComposerPanel]);

  // Ensure we reset footer visibility when the auto-hide feature is disabled.
  useLayoutEffect(() => {
    if ((!hideFooterOnComposerOverflow || !hasComposerPanel || !hasFooter) && footerHiddenForOverflow) {
      setFooterHiddenForOverflow(false);
    }
  }, [footerHiddenForOverflow, hasComposerPanel, hasFooter, hideFooterOnComposerOverflow]);

  const viewportHeight = typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 0;
  const computedHeightForPadding = hasComposerPanel && composerHeightMode
    ? (computeComposerPixelHeight(composerHeightMode, viewportHeight) ?? measuredBottomHeight)
    : undefined;
  const contentExtraPadding = overlayPadContentPanel && isOverlay && computedHeightForPadding ? computedHeightForPadding : 0;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }} data-role="layout-frame" data-overlay={isOverlay ? 'true' : 'false'}>
      <header style={{ flex: '0 0 auto' }} data-role="header">{header}</header>

      {/* Main semantic region as content panel */}
      <main style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }} data-role="content-wrapper" aria-label="Content Panel">
        <section style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', boxSizing: 'border-box', position: 'relative', paddingBottom: contentExtraPadding ? `${contentExtraPadding}px` : undefined, display: 'flex', flexDirection: 'column' }} data-role="content-panel" data-content-overlay-pad={contentExtraPadding ? contentExtraPadding : 0}>
          {contentPanel}
        </section>
      </main>

      {hasComposerPanel && !isOverlay && (
        <section ref={(el) => (bottomRef.current = el)} style={{ ...inlineComposerStyle, boxSizing: 'border-box' }} data-role="bottom-region" data-mode="inline" aria-label="Composer Region">
          <div style={bottomRegionInnerStyle} data-role="bottom-region-inner">
            <div ref={(el) => (composerPanelRef.current = el)} style={composerScrollAreaStyle} data-role="composer-panel" aria-label="Composer Panel">
              <div ref={(el) => (composerContentRef.current = el)} style={composerContentWrapperStyle} data-role="composer-panel-content">
                {composerPanel}
              </div>
            </div>
            {hasFooter && !footerHiddenForOverflow && (
              <div ref={(el) => (footerRef.current = el)} style={bottomFooterStyle} data-role="footer">{footer}</div>
            )}
          </div>
        </section>
      )}

      {hasComposerPanel && isOverlay && (
        <section ref={(el) => (bottomRef.current = el)} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, boxSizing: 'border-box', ...overlayComposerStyle }} data-role="bottom-region" data-mode="overlay" aria-label="Composer Region (Overlay)">
          <div style={bottomRegionInnerStyle} data-role="bottom-region-inner">
            <div ref={(el) => (composerPanelRef.current = el)} style={composerScrollAreaStyle} data-role="composer-panel" aria-label="Composer Panel">
              <div ref={(el) => (composerContentRef.current = el)} style={composerContentWrapperStyle} data-role="composer-panel-content">
                {composerPanel}
              </div>
            </div>
            {hasFooter && !footerHiddenForOverflow && (
              <div ref={(el) => (footerRef.current = el)} style={bottomFooterStyle} data-role="footer">{footer}</div>
            )}
          </div>
        </section>
      )}

      {!hasComposerPanel && hasFooter && (
        <footer style={{ flex: '0 0 auto' }} data-role="footer" data-footer-standalone="true">{footer}</footer>
      )}
    </div>
  );
};
