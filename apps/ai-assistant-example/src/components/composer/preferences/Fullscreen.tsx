import React from 'react';
import { PreferencesShell } from './PreferencesShell';

export const PreferencesFullscreen: React.FC<{ content: React.ReactNode; onClose: () => void; isEmbed?: boolean; }> = ({ content, onClose, isEmbed }) => (
  <PreferencesShell variant="fullscreen" onClose={onClose} isEmbed={isEmbed}>
    {content}
  </PreferencesShell>
);
