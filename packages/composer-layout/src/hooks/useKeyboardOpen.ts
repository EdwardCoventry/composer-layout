import { useEffect, useState } from 'react';

export function useKeyboardOpen(threshold: number = 150) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    let baselineInnerHeight = window.innerHeight;

    const onResize = () => {
      // Track the largest seen innerHeight to estimate available space when the keyboard is closed.
      baselineInnerHeight = Math.max(baselineInnerHeight, window.innerHeight);
      const viewportHeight = vv?.height ?? window.innerHeight;
      const referenceHeight = vv ? window.innerHeight : baselineInnerHeight;
      const diff = referenceHeight - viewportHeight;
      setOpen(diff > threshold);
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
  }, [threshold]);

  return open;
}

