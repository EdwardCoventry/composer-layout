import React from 'react';

export const ContextAddMenu: React.FC<{ content: React.ReactNode; onClose: () => void; style: React.CSSProperties; }> = ({ content, onClose, style }) => (
  <div className="assistant-add-overlay" data-variant="context" role="dialog" aria-label="Add to request" aria-modal="true" onClick={onClose}>
    <div className="assistant-add__panel" onClick={(e) => e.stopPropagation()} role="presentation" style={style}>
      {content}
    </div>
  </div>
);

