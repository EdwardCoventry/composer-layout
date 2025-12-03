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
    // In a real scenario, we might fetch this, but here we import it.
    // Use type assertion if the JSON import structure isn't strictly typed in TS yet.
    setApps((registryData as unknown as { apps: AppEntry[] }).apps || []);
  }, []);

  return (
    <div style={{
      fontFamily: '"Inter", sans-serif',
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      <header style={{ borderBottom: '1px solid var(--border-color, #ddd)', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>Examples Showcase</h1>
        <p style={{ margin: '10px 0 0', opacity: 0.7 }}>Select an example application to launch.</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {apps.map((app) => (
          <a 
            key={app.name} 
            href={`${app.path}?from=showcase`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid var(--border-color, #ddd)',
              borderRadius: '12px',
              padding: '24px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              backgroundColor: 'var(--card-bg, rgba(255,255,255,0.05))',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              aspectRatio: '16/9',
              backgroundColor: '#eee',
              marginBottom: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#ccc',
              textTransform: 'uppercase'
            }}>
              {app.name.slice(0, 2)}
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>{app.title}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              {app.description || `Launch the ${app.title} application.`}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default App;

