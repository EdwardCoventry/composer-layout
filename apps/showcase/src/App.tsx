import React, { useState, useEffect } from 'react';
import PreviewFrame from './components/PreviewFrame';
import ShowcaseFooter from './components/ShowcaseFooter';

interface AppEntry {
  name: string;
  path: string;
  title: string;
  description?: string;
}

// This will be populated by the build script
import registryData from './registry.json';

const App = () => {
  const [apps, setApps] = useState<AppEntry[]>([]);

  useEffect(() => {
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

  useEffect(() => {
    // In a real scenario, we might fetch this, but here we import it.
    // Use type assertion if the JSON import structure isn't strictly typed in TS yet.
    const loadedApps = (registryData as unknown as { apps: AppEntry[] }).apps || [];
    const sortOrder: Record<string, number> = {
      'chat-messages-example': 0,
      'ai-assistant-example': 1,
      'quiz-app-example': 2,
    };
    const sortedApps = [...loadedApps].sort((a, b) => {
      return (sortOrder[a.name] ?? 99) - (sortOrder[b.name] ?? 99);
    });
    setApps(sortedApps);
  }, []);

  return (
    <div className="showcase-shell">
      <header className="showcase-header widget-surface widget-surface--header">
        <h1 className="showcase-header__title">Composer-Layout</h1>
        <p className="showcase-header__subtitle">Select an example application to launch.</p>
      </header>
      <div className="showcase-grid">
        {apps.map((app) => (
          <a
            key={app.name}
            href={app.path}
            className="showcase-frame-link"
            tabIndex={0}
            aria-label={`Open ${app.title}`}
          >
            <div className="showcase-card__preview">
              <PreviewFrame
                appPath={app.path}
                title={app.title}
                initials={app.name.slice(0, 2).toUpperCase()}
              />
            </div>
          </a>
        ))}
      </div>
      <ShowcaseFooter />
    </div>
  );
};

export default App;
