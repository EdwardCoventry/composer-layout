import React from 'react';

export function useSafeTimeout() {
  const timeoutRef = React.useRef<number | null>(null);

  const clearTimeout = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setTimeout = React.useCallback(
    (fn: () => void, ms: number) => {
      clearTimeout();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        fn();
      }, ms);
    },
    [clearTimeout],
  );

  React.useEffect(() => clearTimeout, [clearTimeout]);

  return { setTimeout, clearTimeout };
}

