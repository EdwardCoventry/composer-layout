import { useEffect, useState } from 'react';

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) {
    const type = target.type?.toLowerCase();
    // Exclude non-text entry inputs.
    return !['checkbox', 'radio', 'range', 'color', 'file', 'button', 'submit', 'reset'].includes(type);
  }
  const el = target as HTMLElement;
  return el.isContentEditable;
}

export function useKeyboardOpen(threshold: number = 150) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const baselineLayoutHeightRef = { current: window.innerHeight } as { current: number };
    const baselineVisualHeightRef = { current: vv?.height ?? window.innerHeight } as { current: number };
    const orientationRef = { current: getOrientationKey() } as { current: string };
    const openRef = { current: false } as { current: boolean };
    const editingRef = { current: false } as { current: boolean };
    const focusFallbackUntilRef = { current: 0 } as { current: number };
    const lastOpenSignalRef = { current: 0 } as { current: number };
    const lastCloseCandidateRef = { current: 0 } as { current: number };
    let evalHandle: number | undefined;

    const isCoarsePointer = () => {
      try {
        return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      } catch {
        return false;
      }
    };

    const isTextEntryActive = () => {
      if (typeof document === 'undefined') return false;
      return isTextEntryTarget(document.activeElement);
    };

    function getOrientationKey() {
      if (typeof window === 'undefined') return 'unknown';
      const o = (window.screen && window.screen.orientation && window.screen.orientation.type) || '';
      return `${o}-${window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'}`;
    }

    const resetBaselines = () => {
      baselineLayoutHeightRef.current = window.innerHeight;
      baselineVisualHeightRef.current = vv?.height ?? window.innerHeight;
      lastCloseCandidateRef.current = 0;
    };

    const evaluate = () => {
      evalHandle = undefined;
      const layoutHeight = window.innerHeight;
      const visualHeight = vv?.height ?? layoutHeight;
      const pageTop = vv && 'pageTop' in vv ? (vv as VisualViewport & { pageTop?: number }).pageTop ?? 0 : 0;
      const viewportOffset = vv ? Math.max(vv.offsetTop ?? 0, pageTop) : 0;
      const coarse = isCoarsePointer();
      const textActive = isTextEntryActive();
      editingRef.current = coarse && textActive;

      // Rebase after orientation changes when closed.
      const orientationKey = getOrientationKey();
      if (!openRef.current && orientationKey !== orientationRef.current) {
        orientationRef.current = orientationKey;
        resetBaselines();
      }

      // Baseline refresh only when not open and not editing to avoid WebKit shrink noise.
      if (!openRef.current && !editingRef.current) {
        baselineLayoutHeightRef.current = layoutHeight;
        baselineVisualHeightRef.current = visualHeight;
      } else {
        baselineLayoutHeightRef.current = Math.max(baselineLayoutHeightRef.current, layoutHeight);
        baselineVisualHeightRef.current = Math.max(baselineVisualHeightRef.current, visualHeight);
      }

      const baseVisual = baselineVisualHeightRef.current || 1;
      const diffVisual = baseVisual - visualHeight;
      const diffLayout = baselineLayoutHeightRef.current - visualHeight;
      const diff = Math.max(diffVisual, diffLayout);

      const dropThreshold = Math.max(threshold, baseVisual * 0.22);
      const closeThreshold = Math.min(120, threshold); // tolerate small deltas when closing
      const offsetTriggered = viewportOffset > 6;
      const now = Date.now();
      const focusFallbackActive = editingRef.current && now < focusFallbackUntilRef.current;

      let nextOpen = openRef.current;

      const qualifiesOpen = editingRef.current && (diff >= dropThreshold || offsetTriggered || focusFallbackActive);
      if (qualifiesOpen) {
        lastOpenSignalRef.current = now;
        nextOpen = true;
      } else if (editingRef.current && openRef.current) {
        // Sticky while editing for a short window to cover Safari rebound after toolbar changes.
        nextOpen = now - lastOpenSignalRef.current < 450 || diff > closeThreshold || offsetTriggered;
      } else if (!editingRef.current) {
        const nearBaseline = diff < closeThreshold && viewportOffset <= 2;
        if (nearBaseline) {
          if (!lastCloseCandidateRef.current) lastCloseCandidateRef.current = now;
          const stableClose = now - lastCloseCandidateRef.current > 220;
          nextOpen = stableClose ? false : openRef.current;
        } else {
          lastCloseCandidateRef.current = 0;
          nextOpen = diff >= dropThreshold || offsetTriggered || openRef.current;
        }
      } else {
        // Editing but no strong signal; allow close if clearly near baseline for a while.
        const nearBaseline = diff < closeThreshold && viewportOffset <= 2;
        if (nearBaseline) {
          if (!lastCloseCandidateRef.current) lastCloseCandidateRef.current = now;
          const stableClose = now - lastCloseCandidateRef.current > 420;
          nextOpen = stableClose ? false : openRef.current;
        } else {
          lastCloseCandidateRef.current = 0;
          nextOpen = openRef.current;
        }
      }

      if (nextOpen !== openRef.current) {
        openRef.current = nextOpen;
        setOpen(nextOpen);
      }
    };

    const scheduleEvaluate = () => {
      if (evalHandle !== undefined) return;
      evalHandle = window.requestAnimationFrame(() => {
        evalHandle = window.setTimeout(evaluate, 60) as unknown as number;
      });
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isTextEntryTarget(e.target)) return;
      focusFallbackUntilRef.current = Date.now() + 1200;
      scheduleEvaluate();
    };

    const onFocusOut = (e: FocusEvent) => {
      if (!isTextEntryTarget(e.target)) return;
      focusFallbackUntilRef.current = 0;
      scheduleEvaluate();
    };

    const onResize = () => scheduleEvaluate();

    const onOrientationChange = () => {
      orientationRef.current = getOrientationKey();
      resetBaselines();
      scheduleEvaluate();
    };

    if (vv) {
      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('focusin', onFocusIn, true);
    window.addEventListener('focusout', onFocusOut, true);

    scheduleEvaluate();

    return () => {
      if (evalHandle !== undefined) {
        window.clearTimeout(evalHandle);
        cancelAnimationFrame(evalHandle);
      }
      if (vv) {
        vv.removeEventListener('resize', onResize);
        vv.removeEventListener('scroll', onResize);
      }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('focusin', onFocusIn, true);
      window.removeEventListener('focusout', onFocusOut, true);
    };
  }, [threshold]);

  return open;
}

