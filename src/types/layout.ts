import React from 'react';

export const DEFAULT_OVERLAY_CONTENT_MAX_FRACTION = 0.6; // fallback cap for content mode in overlay

// Height modes for the composer panel (formerly bottom panel)
export type ComposerHeightMode =
  | { type: 'fraction'; fraction: number; minPx?: number }
  | { type: 'content'; maxFraction?: number }
  | { type: 'calculated'; getHeight: () => number; maxFraction?: number };

export interface LayoutFrameProps {
  header: React.ReactNode;
  /** Content panel (formerly main section) */
  contentPanel: React.ReactNode;
  /** Composer panel (formerly bottom panel) */
  composerPanel?: React.ReactNode;
  /** Toggle visibility of composer panel */
  showComposerPanel?: boolean;
  /** Height mode governing composer panel / BottomRegion. Optional if no composerPanel is provided. */
  composerHeightMode?: ComposerHeightMode;
  footer?: React.ReactNode;
  /** Adds bottom padding to content panel scroll area during overlay so content isn't hidden. */
  overlayPadContentPanel?: boolean;
  /** Threshold (px) diff between innerHeight and visualViewport.height to consider keyboard open */
  keyboardThreshold?: number;
}
