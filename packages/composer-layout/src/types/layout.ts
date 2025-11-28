import React from 'react';

export const DEFAULT_OVERLAY_CONTENT_MAX_FRACTION = 0.6;

export type ComposerHeightMode =
  | { type: 'fraction'; fraction: number; minPx?: number }
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
   * If true, the footer inside the composer region is hidden (e.g. on mobile when an options grid is open).
   */
  hideComposerFooter?: boolean;
}

