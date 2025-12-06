import React from 'react';

export const FullscreenAddMenu: React.FC<{ content: React.ReactNode; onClose: () => void; }> = ({ content, onClose }) => {
  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="assistant-add-overlay" data-variant="fullscreen" role="dialog" aria-label="Add to request" aria-modal="true">
      <div className="assistant-add__fullscreen">
        <div className="assistant-add__fullscreen-header">
          <div className="assistant-add__fullscreen-titles">
            <div className="assistant-section__label">Add to request</div>
            <div className="assistant-add__fullscreen-title">Choose an option</div>
          </div>
          <button type="button" className="assistant-modal__close" onClick={handleClose} aria-label="Close add options">×</button>
        </div>
        <div className="assistant-add__fullscreen-body">{content}</div>
      </div>
    </div>
  );
};
