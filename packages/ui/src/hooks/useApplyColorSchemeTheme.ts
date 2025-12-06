import React from 'react';

export function useApplyColorSchemeTheme() {
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = mediaQuery.matches ? 'dark' : 'light';
    };

    applyTheme();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }

    mediaQuery.addListener(applyTheme);
    return () => mediaQuery.removeListener(applyTheme);
  }, []);
}

