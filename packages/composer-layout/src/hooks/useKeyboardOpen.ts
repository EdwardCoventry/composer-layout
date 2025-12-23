import { useEffect, useRef, useState } from 'react';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';

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

function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

function getOrientationKey(): string {
  if (typeof window === 'undefined') return 'unknown';
  const orientation = window.screen?.orientation?.type ?? '';
  return `${orientation}-${window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'}`;
}

export function useKeyboardOpen(threshold: number = 300): boolean {
  const detectedOpen = useDetectKeyboardOpen(threshold, false);
  const [textFocused, setTextFocused] = useState(() => {
    if (typeof document === 'undefined') return false;
    return isTextEntryTarget(document.activeElement);
  });
  const [viewportHeight, setViewportHeight] = useState(() => getViewportHeight());
  const [maxViewportHeight, setMaxViewportHeight] = useState(() => getViewportHeight());
  const orientationRef = useRef(getOrientationKey());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocusIn = (event: FocusEvent) => {
      if (isTextEntryTarget(event.target)) {
        setTextFocused(true);
      }
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (isTextEntryTarget(event.target)) {
        setTextFocused(false);
      }
    };

    window.addEventListener('focusin', handleFocusIn, true);
    window.addEventListener('focusout', handleFocusOut, true);
    return () => {
      window.removeEventListener('focusin', handleFocusIn, true);
      window.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const handleResize = () => {
      const nextHeight = getViewportHeight();
      const orientationKey = getOrientationKey();
      if (orientationKey !== orientationRef.current) {
        orientationRef.current = orientationKey;
        setViewportHeight(nextHeight);
        setMaxViewportHeight(nextHeight);
        return;
      }
      setViewportHeight(nextHeight);
      setMaxViewportHeight((prev) => Math.max(prev, nextHeight));
    };

    if (vv) {
      vv.addEventListener('resize', handleResize);
      vv.addEventListener('scroll', handleResize);
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', handleResize);
        vv.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const hasViewport = typeof window !== 'undefined' && !!window.visualViewport;
  const openByViewport = hasViewport ? maxViewportHeight - viewportHeight > threshold : false;
  const openByDetector = !!detectedOpen;

  if (!textFocused) return false;
  return openByViewport || openByDetector;
}

