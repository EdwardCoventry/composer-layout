import React, { useMemo, useRef, useLayoutEffect, useState, useEffect } from 'react';
import { LayoutFrameProps, ComposerHeightMode, DEFAULT_OVERLAY_CONTENT_MAX_FRACTION } from '../types/layout';
import { useViewportCategory } from '../hooks/useViewportCategory';
import { useViewportKeyboardState } from '../hooks/useViewportKeyboardState';

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
  keyboardThreshold = 300,
  lockComposerPosition = false,
  hideComposerFooter = false,
  contentPanelMode = 'default',
  headerBehavior
}) => {
  const { isMobile } = useViewportCategory();
  const keyboardState = useViewportKeyboardState(keyboardThreshold);
  const keyboardOpen = keyboardState.keyboardOpen;
  const keyboardActive = keyboardState.keyboardActive;
  const viewportHeight =
    keyboardState.visualViewportHeight || keyboardState.layoutViewportHeight || (typeof window === 'undefined' ? 0 : window.innerHeight);

  const hasComposerPanel = !!composerPanel && showComposerPanel;
  const hasFooter = !!footer;
  const hasHeader = !!header;
  const overlayActive = isMobile && keyboardActive && hasComposerPanel;
  const chatMessageMode = contentPanelMode === 'chat-message';
  const lockPositionActive = lockComposerPosition && isMobile && hasComposerPanel;
  const shouldFixComposer = overlayActive || lockPositionActive;
  const mobileBottomInset = isMobile ? keyboardState.effectiveBottomInset : 0;
  const resolvedHeaderBehavior = useMemo(() => {
    const pinned = headerBehavior?.pinned ?? chatMessageMode;
    const floating = Boolean(headerBehavior?.floating);
    const snap = floating && Boolean(headerBehavior?.snap);
    return {
      pinned,
      floating,
      snap,
      collapsedHeight: headerBehavior?.collapsedHeight
    };
  }, [chatMessageMode, headerBehavior]);
  const prevKeyboardOpenRef = useRef(keyboardOpen);
  const [forceFooterVisible, setForceFooterVisible] = useState(false);
  const headerContentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const wasOpen = prevKeyboardOpenRef.current;
    if (!hideComposerFooter) {
      setForceFooterVisible(false);
    } else if (wasOpen && !keyboardOpen) {
      setForceFooterVisible(true);
    } else if (keyboardOpen) {
      setForceFooterVisible(false);
    }
    prevKeyboardOpenRef.current = keyboardOpen;
  }, [keyboardOpen, hideComposerFooter]);

  // Hide footer when explicitly requested or when the keyboard forces overlay mode on mobile.
  // If the keyboard reports a close transition while the footer is hidden, force it visible.
  const footerHidden = (hideComposerFooter || overlayActive) && !forceFooterVisible;

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
        bottom: `${mobileBottomInset}px`,
        zIndex: 20,
        boxSizing: 'border-box',
        ...overlayComposerStyle
      };
    }
    if (chatMessageMode) {
      return {
        ...inlineComposerStyle,
        position: 'sticky',
        bottom: `${mobileBottomInset}px`,
        zIndex: 20,
        boxSizing: 'border-box'
      };
    }
    return { ...inlineComposerStyle, boxSizing: 'border-box' };
  }, [chatMessageMode, hasComposerPanel, shouldFixComposer, inlineComposerStyle, mobileBottomInset, overlayComposerStyle]);

  const bottomRef = useRef<HTMLElement | null>(null);
  const [measuredBottomHeight, setMeasuredBottomHeight] = useState<number | undefined>();
  const composerPanelRef = useRef<HTMLDivElement | null>(null);
  const composerContentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !chatMessageMode || !hasHeader) return;

    const node = headerContentRef.current;
    if (!node) return;

    const measureHeader = () => {
      setMeasuredHeaderHeight(node.getBoundingClientRect().height);
    };

    measureHeader();
    window.addEventListener('resize', measureHeader);
    window.addEventListener('orientationchange', measureHeader);

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', measureHeader);
        window.removeEventListener('orientationchange', measureHeader);
      };
    }

    const ro = new ResizeObserver(() => measureHeader());
    ro.observe(node);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureHeader);
      window.removeEventListener('orientationchange', measureHeader);
    };
  }, [chatMessageMode, hasHeader, header]);

  const collapsedHeaderHeight = useMemo(() => {
    if (!chatMessageMode || !hasHeader || !resolvedHeaderBehavior.pinned) return 0;
    if (resolvedHeaderBehavior.collapsedHeight == null) return measuredHeaderHeight;
    return Math.max(0, Math.min(resolvedHeaderBehavior.collapsedHeight, measuredHeaderHeight));
  }, [
    chatMessageMode,
    hasHeader,
    measuredHeaderHeight,
    resolvedHeaderBehavior.collapsedHeight,
    resolvedHeaderBehavior.pinned
  ]);
  const canCollapsePinnedHeader =
    chatMessageMode &&
    hasHeader &&
    resolvedHeaderBehavior.pinned &&
    resolvedHeaderBehavior.collapsedHeight != null &&
    measuredHeaderHeight > collapsedHeaderHeight;
  const canFloatHeader =
    chatMessageMode &&
    hasHeader &&
    resolvedHeaderBehavior.floating &&
    measuredHeaderHeight > 0;
  const headerHideDistance = Math.max(0, measuredHeaderHeight - collapsedHeaderHeight);
  const usesDynamicHeader = (canFloatHeader || canCollapsePinnedHeader) && headerHideDistance > 0;

  useEffect(() => {
    setHeaderOffset((current) => Math.min(current, headerHideDistance));
  }, [headerHideDistance]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    lastScrollYRef.current = Math.max(0, window.scrollY || window.pageYOffset || 0);

    if (!usesDynamicHeader) {
      setHeaderOffset(0);
      return;
    }

    const updateHeaderOffset = () => {
      const nextScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const delta = nextScrollY - lastScrollYRef.current;
      lastScrollYRef.current = nextScrollY;

      setHeaderOffset((current) => {
        if (nextScrollY <= 0 || headerHideDistance <= 0) return 0;

        if (resolvedHeaderBehavior.floating) {
          if (resolvedHeaderBehavior.snap && delta < 0) {
            return 0;
          }
          if (delta > 0) {
            return Math.min(headerHideDistance, current + delta);
          }
          if (delta < 0) {
            return Math.max(0, current + delta);
          }
          return current;
        }

        if (canCollapsePinnedHeader) {
          return Math.min(headerHideDistance, nextScrollY);
        }

        return current;
      });
    };

    updateHeaderOffset();
    window.addEventListener('scroll', updateHeaderOffset, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateHeaderOffset);
    };
  }, [
    canCollapsePinnedHeader,
    headerHideDistance,
    resolvedHeaderBehavior.floating,
    resolvedHeaderBehavior.snap,
    usesDynamicHeader
  ]);

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
  const contentExtraPadding =
    overlayPadContentPanel && (shouldFixComposer || chatMessageMode) && computedHeightForPadding
      ? computedHeightForPadding + mobileBottomInset
      : 0;
  const layoutFrameStyle: React.CSSProperties = chatMessageMode
    ? { minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'visible' }
    : { height: '100dvh', maxHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
  const visibleHeaderHeight = usesDynamicHeader
    ? Math.max(resolvedHeaderBehavior.pinned ? collapsedHeaderHeight : 0, measuredHeaderHeight - headerOffset)
    : measuredHeaderHeight;
  const headerStyle: React.CSSProperties = chatMessageMode
    ? usesDynamicHeader
      ? {
          flex: '0 0 auto',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: `${visibleHeaderHeight}px`,
          overflow: 'hidden',
          boxSizing: 'border-box'
        }
      : resolvedHeaderBehavior.pinned
        ? { flex: '0 0 auto', position: 'sticky', top: 0, zIndex: 30 }
        : { flex: '0 0 auto' }
    : { flex: '0 0 auto' };
  const headerContentStyle: React.CSSProperties | undefined = usesDynamicHeader
    ? {
        transform: `translateY(-${headerOffset}px)`,
        transition: resolvedHeaderBehavior.snap ? 'transform 160ms ease' : undefined
      }
    : undefined;
  const contentWrapperStyle: React.CSSProperties = chatMessageMode
    ? { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'visible' }
    : { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' };
  const contentPanelStyle: React.CSSProperties = chatMessageMode
    ? {
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'visible',
        boxSizing: 'border-box',
        position: 'relative',
        paddingBottom: contentExtraPadding ? `${contentExtraPadding}px` : undefined,
        display: 'flex',
        flexDirection: 'column'
      }
    : {
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        boxSizing: 'border-box',
        position: 'relative',
        paddingBottom: contentExtraPadding ? `${contentExtraPadding}px` : undefined,
        display: 'flex',
        flexDirection: 'column'
      };
  const bottomRegionMode = overlayActive ? 'overlay' : chatMessageMode ? 'sticky' : 'inline';
  const headerMode = chatMessageMode
    ? usesDynamicHeader
      ? resolvedHeaderBehavior.pinned
        ? resolvedHeaderBehavior.floating
          ? resolvedHeaderBehavior.snap
            ? 'pinned-floating-snap'
            : 'pinned-floating'
          : 'pinned-collapse'
        : resolvedHeaderBehavior.snap
          ? 'floating-snap'
          : 'floating'
      : resolvedHeaderBehavior.pinned
        ? 'sticky'
        : 'scroll'
    : 'inline';

  return (
    <div
      style={layoutFrameStyle}
      data-role="layout-frame"
      data-content-mode={contentPanelMode}
      data-keyboard-active={keyboardActive ? 'true' : 'false'}
      data-overlay={overlayActive ? 'true' : 'false'}
      data-viewport-settling={keyboardState.settling ? 'true' : 'false'}
    >
      {hasHeader ? (
        <header
          style={headerStyle}
          data-role="header"
          data-mode={headerMode}
          data-pinned={resolvedHeaderBehavior.pinned ? 'true' : 'false'}
          data-floating={resolvedHeaderBehavior.floating ? 'true' : 'false'}
          data-snap={resolvedHeaderBehavior.snap ? 'true' : 'false'}
        >
          <div ref={headerContentRef} style={headerContentStyle} data-role="header-content">
            {header}
          </div>
        </header>
      ) : null}

      {/* Main semantic region as content panel */}
      <main style={contentWrapperStyle} data-role="content-wrapper" aria-label="Content Panel">
        <section style={contentPanelStyle} data-role="content-panel" data-content-overlay-pad={contentExtraPadding ? contentExtraPadding : 0} data-content-mode={contentPanelMode}>
          {contentPanel}
        </section>
      </main>

      {hasComposerPanel && (
        <section
          ref={bottomRef}
          style={bottomRegionStyle}
          data-role="bottom-region"
          data-mode={bottomRegionMode}
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
