import { useEffect, useState } from 'react';

// Simple viewport categorization without matchMedia to avoid test environment issues.
export function useViewportCategory(mobileMaxWidth: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth <= mobileMaxWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [mobileMaxWidth]);

  return { isMobile };
}

