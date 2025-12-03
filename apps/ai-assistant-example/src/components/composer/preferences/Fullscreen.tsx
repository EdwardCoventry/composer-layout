import React from 'react';

export const PreferencesFullscreen: React.FC<{ content: React.ReactNode; onClose: () => void; isEmbed?: boolean; }> = ({ content, onClose, isEmbed }) => (
  <div className="assistant-modal" data-variant="fullscreen" data-embed={isEmbed ? 'true' : 'false'} role="dialog" aria-label="Edit preferences">
    <div className="assistant-modal__backdrop" onClick={onClose} />
    <div className="assistant-modal__body" data-variant="fullscreen" data-embed={isEmbed ? 'true' : 'false'}>
      {content}
    </div>
  </div>
);

