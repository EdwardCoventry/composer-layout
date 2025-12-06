import React from 'react';
import { PreferencesShell } from './PreferencesShell';

const PreferencesModalInner: React.FC<{
    content: React.ReactNode;
    onClose: () => void;
    isEmbed?: boolean;
}> = ({ content, onClose, isEmbed }) => (
  <PreferencesShell variant="modal" onClose={onClose} isEmbed={isEmbed}>
    {content}
  </PreferencesShell>
);

export const PreferencesModal = React.memo(PreferencesModalInner);
PreferencesModal.displayName = 'PreferencesModal';
