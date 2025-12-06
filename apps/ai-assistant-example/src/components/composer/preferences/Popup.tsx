import React from 'react';
import { PreferencesShell } from './PreferencesShell';

const PreferencesPopupInner = ({ content, onClose, isEmbed }: { content: React.ReactNode; onClose: () => void; isEmbed?: boolean; }) => (
  <PreferencesShell variant="popup" onClose={onClose} isEmbed={isEmbed}>
    {content}
  </PreferencesShell>
);

export const PreferencesPopup = React.memo(PreferencesPopupInner);
PreferencesPopup.displayName = 'PreferencesPopup';
