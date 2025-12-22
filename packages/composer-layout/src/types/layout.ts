import React from 'react';

export const DEFAULT_OVERLAY_CONTENT_MAX_FRACTION = 0.6;

export type ComposerHeightMode =
  | { type: 'fraction'; fraction: number; minPx?: number; allowAutoHeight?: boolean }
  | { type: 'content'; maxFraction?: number }
  | { type: 'calculated'; getHeight: () => number; maxFraction?: number };

export interface LayoutFrameProps {
  header: React.ReactNode;
  contentPanel: React.ReactNode;
  composerPanel?: React.ReactNode;
  showComposerPanel?: boolean;
  composerHeightMode?: ComposerHeightMode;
  footer?: React.ReactNode;
  overlayPadContentPanel?: boolean;
  keyboardThreshold?: number;
  /**
   * Keep the composer region fixed on mobile even when the keyboard is closed.
   * This avoids focus loss on some WebKit builds when switching layout modes.
   */
  lockComposerPosition?: boolean;
  /**
   * If true, the footer inside the composer region is hidden (e.g. on mobile when an options grid is open).
   */
  hideComposerFooter?: boolean;
}
