import React from 'react';

export const DEFAULT_OVERLAY_CONTENT_MAX_FRACTION = 0.6;

export type ComposerHeightMode =
  | { type: 'fraction'; fraction: number; minPx?: number; allowAutoHeight?: boolean }
  | { type: 'content'; maxFraction?: number }
  | { type: 'calculated'; getHeight: () => number; maxFraction?: number };

export type ContentPanelMode = 'default' | 'chat-message';

export interface HeaderBehavior {
  /**
   * Keep some part of the header pinned to the top while the page scrolls.
   * Defaults to `true` in `chat-message` mode and `false` elsewhere.
   */
  pinned?: boolean;
  /**
   * Let the header reappear as soon as the user reverses scroll direction.
   */
  floating?: boolean;
  /**
   * When combined with `floating`, reveal the full header immediately on reverse scroll.
   */
  snap?: boolean;
  /**
   * The visible pinned header height in pixels after collapsing.
   * Only applies when `pinned` is `true`.
   */
  collapsedHeight?: number;
}

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
  /**
   * Switch the layout between the default internal-scroll panel and a chat-message mode
   * that pins the header to the top, the composer to the bottom, and lets the page own
   * the vertical scrollbar.
   */
  contentPanelMode?: ContentPanelMode;
  /**
   * Optional scroll behavior overrides for the header in `chat-message` mode.
   * Defaults to a fully pinned sticky header to preserve existing behavior.
   */
  headerBehavior?: HeaderBehavior;
}
