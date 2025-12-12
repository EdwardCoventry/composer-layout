import { useEffect, useState } from 'react';
export function useViewportCategory(mobileMaxWidth: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= mobileMaxWidth;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth <= mobileMaxWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mobileMaxWidth]);
  return { isMobile };
}
