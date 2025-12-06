import React from 'react';
import { AssistantScreenLayout } from './screens/AssistantScreenLayout';
import { AssistantEmbedLayout } from './screens/AssistantEmbedLayout';
import { useApplyColorSchemeTheme } from 'ui/hooks/useApplyColorSchemeTheme';

export default function App() {
  const [route, setRoute] = React.useState<'home' | 'embed'>(() => {
    if (typeof window === 'undefined') return 'home';
    return window.location.pathname.startsWith('/embed') ? 'embed' : 'home';
  });

  useApplyColorSchemeTheme();

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
