import React, { useState, useEffect } from 'react';

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
    setApps((registryData as unknown as { apps: AppEntry[] }).apps || []);
  }, []);

  return (
    <div className="showcase-shell">
      <header className="showcase-header">
        <h1 className="showcase-header__title">Examples Showcase</h1>
        <p className="showcase-header__subtitle">Select an example application to launch.</p>
      </header>

      <div className="showcase-grid">
        {apps.map((app) => (
          <a 
            key={app.name} 
            href={`${app.path}?from=showcase`}
            className="showcase-card"
          >
            <div className="showcase-card__preview">
              {app.name.slice(0, 2)}
            </div>
            <h2 className="showcase-card__title">{app.title}</h2>
            <p className="showcase-card__desc">
              {app.description || `Launch the ${app.title} application.`}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default App;

