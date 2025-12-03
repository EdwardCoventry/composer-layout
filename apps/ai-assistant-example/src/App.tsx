import React from 'react';
import { AssistantScreenLayout } from './screens/AssistantScreenLayout';
import { AssistantEmbedLayout } from './screens/AssistantEmbedLayout';

export default function App() {
  const [route, setRoute] = React.useState<'home' | 'embed'>(() => {
    if (typeof window === 'undefined') return 'home';
    return window.location.pathname.startsWith('/embed') ? 'embed' : 'home';
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = mediaQuery.matches ? 'dark' : 'light';
    };

    applyTheme();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyTheme);
    } else {
      mediaQuery.addListener(applyTheme);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', applyTheme);
      } else {
        mediaQuery.removeListener(applyTheme);
      }
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePop = () => {
      setRoute(window.location.pathname.startsWith('/embed') ? 'embed' : 'home');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = React.useCallback((next: string) => {
    if (typeof window === 'undefined') return;
    window.history.pushState({}, '', next);
    setRoute(next.startsWith('/embed') ? 'embed' : 'home');
  }, []);

  if (route === 'embed') {
    return <AssistantEmbedLayout onNavigate={navigate} />;
  }

  return <AssistantScreenLayout onNavigate={navigate} />;
}
