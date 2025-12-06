import React from 'react';
import { PreferencesShell } from './PreferencesShell';

const PreferencesFullscreenInner: React.FC<{ content: React.ReactNode; onClose: () => void; isEmbed?: boolean; }> = ({ content, onClose, isEmbed }) => (
  <PreferencesShell variant="fullscreen" onClose={onClose} isEmbed={isEmbed}>
    {content}
  </PreferencesShell>
);

export const PreferencesFullscreen = React.memo(PreferencesFullscreenInner);
PreferencesFullscreen.displayName = 'PreferencesFullscreen';
