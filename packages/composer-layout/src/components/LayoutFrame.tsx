import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
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
      if (mode.allowAutoHeight) {
        return {
          flex: '0 0 auto',
          height: 'auto',
          minHeight: mode.minPx ? `max(${vh}, ${mode.minPx}px)` : vh,
          boxSizing: 'border-box'
        };
      }
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

const bottomRegionInnerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%' };
const composerScrollAreaStyle: React.CSSProperties = { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' };
const composerContentWrapperStyle: React.CSSProperties = { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' };
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
  lockComposerPosition = false,
  hideComposerFooter = false
}) => {
  const { isMobile } = useViewportCategory();
  const keyboardOpen = useKeyboardOpen(keyboardThreshold);
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.visualViewport?.height || window.innerHeight;
  });

  const hasComposerPanel = !!composerPanel && showComposerPanel;
  const hasFooter = !!footer;
  const overlayActive = isMobile && keyboardOpen && hasComposerPanel;
  const lockPositionActive = lockComposerPosition && isMobile && hasComposerPanel;
  const shouldFixComposer = overlayActive || lockPositionActive;
  // Hide footer when explicitly requested or when the keyboard forces overlay mode on mobile
  const footerHidden = hideComposerFooter || overlayActive;

  // Only resolve styles if we have a composer panel & height mode
  const inlineComposerStyle = useMemo(() => (
    hasComposerPanel && composerHeightMode ? getComposerRegionStyle(composerHeightMode, 'inline') : {}
  ), [hasComposerPanel, composerHeightMode]);
  const overlayComposerStyle = useMemo(() => (
    hasComposerPanel && composerHeightMode ? getComposerRegionStyle(composerHeightMode, 'overlay') : {}
  ), [hasComposerPanel, composerHeightMode]);
  const bottomRegionStyle = useMemo(() => {
    if (!hasComposerPanel) return {};
    if (shouldFixComposer) {
      return {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        boxSizing: 'border-box',
        ...overlayComposerStyle
      };
    }
    return { ...inlineComposerStyle, boxSizing: 'border-box' };
  }, [hasComposerPanel, shouldFixComposer, inlineComposerStyle, overlayComposerStyle]);

  const bottomRef = useRef<HTMLElement | null>(null);
  const [measuredBottomHeight, setMeasuredBottomHeight] = useState<number | undefined>();
  const composerPanelRef = useRef<HTMLDivElement | null>(null);
  const composerContentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const onResize = () => {
      setViewportHeight(vv?.height || window.innerHeight);
    };
    if (vv) {
      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    onResize();
    return () => {
      if (vv) {
        vv.removeEventListener('resize', onResize);
        vv.removeEventListener('scroll', onResize);
      }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Single effect for measurement / resize observer (overlay padding)
  useLayoutEffect(() => {
    if (!shouldFixComposer || !hasComposerPanel) return;
    if (!bottomRef.current) return;
    // Initial measure
    setMeasuredBottomHeight(bottomRef.current.getBoundingClientRect().height);
    // Resize observer only for content mode
    if (composerHeightMode?.type === 'content' && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => { if (entries[0]) setMeasuredBottomHeight(entries[0].contentRect.height); });
      ro.observe(bottomRef.current);
      return () => ro.disconnect();
    }
  }, [shouldFixComposer, hasComposerPanel, composerHeightMode]);

  const baseComposerHeight = hasComposerPanel && composerHeightMode
    ? computeComposerPixelHeight(composerHeightMode, viewportHeight)
    : undefined;
  const computedHeightForPadding = hasComposerPanel
    ? (baseComposerHeight ?? measuredBottomHeight)
    : undefined;
  const contentExtraPadding = overlayPadContentPanel && shouldFixComposer && computedHeightForPadding ? computedHeightForPadding : 0;

  return (
    // Avoid forcing visualViewport px height here; it breaks content panel sizing on WebKit.
    <div style={{ height: '100dvh', maxHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-role="layout-frame" data-overlay={overlayActive ? 'true' : 'false'}>
      <header style={{ flex: '0 0 auto' }} data-role="header">{header}</header>

      {/* Main semantic region as content panel */}
      <main style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }} data-role="content-wrapper" aria-label="Content Panel">
        <section style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', boxSizing: 'border-box', position: 'relative', paddingBottom: contentExtraPadding ? `${contentExtraPadding}px` : undefined, display: 'flex', flexDirection: 'column' }} data-role="content-panel" data-content-overlay-pad={contentExtraPadding ? contentExtraPadding : 0}>
          {contentPanel}
        </section>
      </main>

      {hasComposerPanel && (
        <section
          ref={bottomRef}
          style={bottomRegionStyle}
          data-role="bottom-region"
          data-mode={overlayActive ? 'overlay' : 'inline'}
          aria-label={overlayActive ? 'Composer Region (Overlay)' : 'Composer Region'}
        >
          <div style={bottomRegionInnerStyle} data-role="bottom-region-inner">
            <div
              ref={composerPanelRef}
              style={composerScrollAreaStyle}
              data-role="composer-panel"
              aria-label="Composer Panel"
            >
              <div ref={composerContentRef} style={composerContentWrapperStyle} data-role="composer-panel-content">
                {composerPanel}
              </div>
            </div>
            {hasFooter && !footerHidden && (
              <div ref={footerRef} style={bottomFooterStyle} data-role="footer">{footer}</div>
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
