import React from 'react';

export const ContextAddMenu: React.FC<{ content: React.ReactNode; onClose: () => void; style: React.CSSProperties; }> = ({ content, onClose, style }) => {
  const handleBackdropClick = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePanelClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="assistant-add-overlay" data-variant="context" role="dialog" aria-label="Add to request" aria-modal="true" onClick={handleBackdropClick}>
      <div className="assistant-add__panel" onClick={handlePanelClick} role="presentation" style={style}>
        {content}
      </div>
    </div>
  );
};
