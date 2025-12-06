import React from 'react';

export function useWindowSize(initial = { width: 1200, height: 900 }) {
  const [size, setSize] = React.useState(() => {
    if (typeof window === 'undefined') {
      return initial;
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

