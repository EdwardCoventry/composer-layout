import { useEffect, useRef, useState } from 'react';

export interface ViewportKeyboardState {
  effectiveBottomInset: number;
  keyboardActive: boolean;
  keyboardHeight: number;
  keyboardOpen: boolean;
  layoutViewportHeight: number;
  liveBottomInset: number;
  settling: boolean;
  stableClosedBottomInset: number;
  textEntryFocused: boolean;
  viewportShifted: boolean;
  visualViewportHeight: number;
  visualViewportOffsetTop: number;
}

interface RawViewportState {
  geometrySuggestsKeyboard: boolean;
  keyboardHeight: number;
  layoutViewportHeight: number;
  liveBottomInset: number;
  textEntryFocused: boolean;
  viewportShifted: boolean;
  visualViewportHeight: number;
  visualViewportOffsetTop: number;
}

const DEFAULT_VIEWPORT_KEYBOARD_STATE: ViewportKeyboardState = {
  effectiveBottomInset: 0,
  keyboardActive: false,
  keyboardHeight: 0,
  keyboardOpen: false,
  layoutViewportHeight: 0,
  liveBottomInset: 0,
  settling: false,
  stableClosedBottomInset: 0,
  textEntryFocused: false,
  viewportShifted: false,
  visualViewportHeight: 0,
  visualViewportOffsetTop: 0
};

const INSET_DELTA_THRESHOLD = 24;
const VIEWPORT_SETTLE_MS = 140;
const FOCUS_SETTLE_MS = 220;

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) {
    const type = target.type?.toLowerCase();
    return !['checkbox', 'radio', 'range', 'color', 'file', 'button', 'submit', 'reset'].includes(type);
  }
  const el = target as HTMLElement;
  return el.isContentEditable;
}

function getStableViewportHeight(): number {
  if (typeof window === 'undefined') return 0;

  const root = document.documentElement;
  const viewport = window.visualViewport;
  const layoutViewportHeight = Math.max(
    Math.round(Number(window.innerHeight) || 0),
    Math.round(Number(root.clientHeight) || 0)
  );
  const visualViewportHeight = Math.round(Number(viewport?.height) || layoutViewportHeight || 0);
  const visualViewportOffsetTop = Math.round(Number(viewport?.offsetTop) || 0);
  return Math.max(layoutViewportHeight, visualViewportHeight + Math.max(0, visualViewportOffsetTop));
}

function readRawViewportState(
  baselineViewportHeight: number,
  stableClosedBottomInset: number,
  threshold: number
): RawViewportState {
  if (typeof window === 'undefined') {
    return {
      geometrySuggestsKeyboard: false,
      keyboardHeight: 0,
      layoutViewportHeight: 0,
      liveBottomInset: 0,
      textEntryFocused: false,
      viewportShifted: false,
      visualViewportHeight: 0,
      visualViewportOffsetTop: 0
    };
  }

  const root = document.documentElement;
  const viewport = window.visualViewport;
  const layoutViewportHeight = Math.max(
    Math.round(Number(window.innerHeight) || 0),
    Math.round(Number(root.clientHeight) || 0)
  );
  const visualViewportHeight = Math.round(Number(viewport?.height) || layoutViewportHeight || 0);
  const visualViewportOffsetTop = Math.round(Number(viewport?.offsetTop) || 0);
  const visualViewportBottom = visualViewportHeight + Math.max(0, visualViewportOffsetTop);
  const liveBottomInset = Math.max(0, layoutViewportHeight - visualViewportBottom);
  const effectiveBaseline = Math.max(baselineViewportHeight, layoutViewportHeight, visualViewportBottom);
  const keyboardHeight = Math.max(0, effectiveBaseline - Math.max(layoutViewportHeight, visualViewportBottom));
  const viewportShifted = visualViewportOffsetTop < -1 || effectiveBaseline - visualViewportBottom > threshold;
  const textEntryFocused = isTextEntryTarget(document.activeElement);
  const geometrySuggestsKeyboard =
    keyboardHeight > threshold ||
    viewportShifted ||
    liveBottomInset > stableClosedBottomInset + INSET_DELTA_THRESHOLD;

  return {
    geometrySuggestsKeyboard,
    keyboardHeight,
    layoutViewportHeight,
    liveBottomInset,
    textEntryFocused,
    viewportShifted,
    visualViewportHeight,
    visualViewportOffsetTop
  };
}

function areStatesEqual(left: ViewportKeyboardState, right: ViewportKeyboardState) {
  return (
    left.effectiveBottomInset === right.effectiveBottomInset &&
    left.keyboardActive === right.keyboardActive &&
    left.keyboardHeight === right.keyboardHeight &&
    left.keyboardOpen === right.keyboardOpen &&
    left.layoutViewportHeight === right.layoutViewportHeight &&
    left.liveBottomInset === right.liveBottomInset &&
    left.settling === right.settling &&
    left.stableClosedBottomInset === right.stableClosedBottomInset &&
    left.textEntryFocused === right.textEntryFocused &&
    left.viewportShifted === right.viewportShifted &&
    left.visualViewportHeight === right.visualViewportHeight &&
    left.visualViewportOffsetTop === right.visualViewportOffsetTop
  );
}

export function useViewportKeyboardState(threshold: number = 300): ViewportKeyboardState {
  const baselineViewportHeightRef = useRef(0);
  const blurSettlingUntilRef = useRef(0);
  const stableClosedBottomInsetRef = useRef(0);
  const viewportChangeAtRef = useRef(0);
  const lastViewportSignatureRef = useRef('');
  const snapshotRef = useRef<ViewportKeyboardState>(DEFAULT_VIEWPORT_KEYBOARD_STATE);
  const [snapshot, setSnapshot] = useState<ViewportKeyboardState>(() => {
    const initialBaseline = getStableViewportHeight();
    baselineViewportHeightRef.current = initialBaseline;
    const initialRaw = readRawViewportState(initialBaseline, 0, threshold);
    const initialState: ViewportKeyboardState = {
      ...DEFAULT_VIEWPORT_KEYBOARD_STATE,
      ...initialRaw,
      effectiveBottomInset: initialRaw.liveBottomInset,
      keyboardOpen: initialRaw.geometrySuggestsKeyboard && initialRaw.textEntryFocused,
      keyboardActive: initialRaw.geometrySuggestsKeyboard && initialRaw.textEntryFocused,
      stableClosedBottomInset: 0
    };
    snapshotRef.current = initialState;
    return initialState;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let settleTimer: number | null = null;
    let settleStepCount = 0;
    let rafStepOne: number | null = null;
    let rafStepTwo: number | null = null;

    const sync = (resetBaseline = false) => {
      const stableViewportHeight = getStableViewportHeight();
      const now = window.performance.now();
      const activeElementIsTextEntry = isTextEntryTarget(document.activeElement);
      const currentSnapshot = snapshotRef.current;

      if (
        resetBaseline ||
        baselineViewportHeightRef.current <= 0 ||
        (!currentSnapshot.keyboardActive && !activeElementIsTextEntry && now >= blurSettlingUntilRef.current)
      ) {
        baselineViewportHeightRef.current = stableViewportHeight;
      } else if (stableViewportHeight > baselineViewportHeightRef.current) {
        baselineViewportHeightRef.current = stableViewportHeight;
      }

      const nextRaw = readRawViewportState(
        baselineViewportHeightRef.current,
        stableClosedBottomInsetRef.current,
        threshold
      );
      const viewportSignature = [
        nextRaw.liveBottomInset,
        nextRaw.layoutViewportHeight,
        nextRaw.visualViewportHeight,
        nextRaw.visualViewportOffsetTop
      ].join(':');

      if (viewportSignature !== lastViewportSignatureRef.current) {
        lastViewportSignatureRef.current = viewportSignature;
        viewportChangeAtRef.current = now;
      }

      const viewportStable = now - viewportChangeAtRef.current >= VIEWPORT_SETTLE_MS;
      const focusSettling = now < blurSettlingUntilRef.current;
      const keyboardHintActive =
        nextRaw.textEntryFocused || focusSettling || (currentSnapshot.keyboardOpen && !viewportStable);
      const keyboardOpen = nextRaw.geometrySuggestsKeyboard && keyboardHintActive;
      const settling = !keyboardOpen && (!viewportStable || focusSettling);
      const stableClosedBottomInset =
        !keyboardOpen && !nextRaw.textEntryFocused && viewportStable && !focusSettling
          ? nextRaw.liveBottomInset
          : stableClosedBottomInsetRef.current;
      const keyboardActive = keyboardOpen || settling;
      const effectiveBottomInset = keyboardOpen
        ? nextRaw.liveBottomInset
        : keyboardActive
          ? Math.max(nextRaw.liveBottomInset, stableClosedBottomInsetRef.current)
          : stableClosedBottomInset;

      stableClosedBottomInsetRef.current = stableClosedBottomInset;

      if (!keyboardActive && !nextRaw.textEntryFocused) {
        baselineViewportHeightRef.current = stableViewportHeight;
      }

      const next: ViewportKeyboardState = {
        ...nextRaw,
        effectiveBottomInset,
        keyboardActive,
        keyboardOpen,
        settling,
        stableClosedBottomInset
      };

      snapshotRef.current = next;
      setSnapshot((current) => (areStatesEqual(current, next) ? current : next));
    };

    const clearSettleTimer = () => {
      if (settleTimer == null) return;
      window.clearInterval(settleTimer);
      settleTimer = null;
      settleStepCount = 0;
    };

    const clearAnimationFrames = () => {
      if (rafStepOne != null) {
        window.cancelAnimationFrame(rafStepOne);
        rafStepOne = null;
      }
      if (rafStepTwo != null) {
        window.cancelAnimationFrame(rafStepTwo);
        rafStepTwo = null;
      }
    };

    const settle = (resetBaseline = false, steps = 12, intervalMs = 60) => {
      clearSettleTimer();
      sync(resetBaseline);
      settleTimer = window.setInterval(() => {
        sync();
        settleStepCount += 1;
        if (settleStepCount >= steps) {
          clearSettleTimer();
        }
      }, intervalMs);
    };

    const viewport = window.visualViewport;
    const syncNow = () => {
      clearAnimationFrames();
      rafStepOne = window.requestAnimationFrame(() => {
        rafStepTwo = window.requestAnimationFrame(() => {
          sync();
        });
      });
    };
    const resetAndSettle = () => settle(true);
    const settleNow = () => settle();
    const handleFocusIn = () => {
      blurSettlingUntilRef.current = 0;
      settle();
    };
    const handleFocusOut = () => {
      blurSettlingUntilRef.current = window.performance.now() + FOCUS_SETTLE_MS;
      settle();
    };

    settle(true);

    viewport?.addEventListener('resize', syncNow);
    viewport?.addEventListener('scroll', syncNow);
    window.addEventListener('resize', settleNow);
    window.addEventListener('orientationchange', resetAndSettle);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('pageshow', resetAndSettle);

    return () => {
      clearSettleTimer();
      clearAnimationFrames();
      viewport?.removeEventListener('resize', syncNow);
      viewport?.removeEventListener('scroll', syncNow);
      window.removeEventListener('resize', settleNow);
      window.removeEventListener('orientationchange', resetAndSettle);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('pageshow', resetAndSettle);
    };
  }, [threshold]);

  return snapshot;
}
