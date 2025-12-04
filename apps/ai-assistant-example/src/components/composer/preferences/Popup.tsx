import React from 'react';
import { PreferencesShell } from './PreferencesShell';

export function PreferencesPopup({ content, onClose, isEmbed }: { content: React.ReactNode; onClose: () => void; isEmbed?: boolean; }) {
  return (
    <PreferencesShell variant="popup" onClose={onClose} isEmbed={isEmbed}>
      {content}
    </PreferencesShell>
  );
}
