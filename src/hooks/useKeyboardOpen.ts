import { useEffect, useState } from 'react';

// Heuristic: compare window.innerHeight with visualViewport.height.
export function useKeyboardOpen(threshold: number = 150) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // gracefully do nothing if unsupported

    const onResize = () => {
      const diff = window.innerHeight - vv.height;
      setOpen(diff > threshold);
    };

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    onResize();

    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, [threshold]);

  return open;
}

