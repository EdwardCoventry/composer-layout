import React from 'react';

type AssistantHeaderProps = {
  historyOpen: boolean;
  onToggleHistory: () => void;
  onShare: () => void | Promise<void>;
  onHomeClick?: () => void;
};

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path d="M9 12.5 15 8m-6 4.5 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="7" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({ historyOpen, onToggleHistory, onShare, onHomeClick }) => {
  return (
    <div className="assistant-header widget-surface widget-surface--header">
      <div className="assistant-header__inner">
        <button
          type="button"
          className="assistant-header__icon-btn"
          onClick={onToggleHistory}
          aria-label={historyOpen ? 'Close history' : 'Open history'}
          aria-pressed={historyOpen}
          data-active={historyOpen}
        >
          <MenuIcon />
        </button>

        <div className="assistant-header__text">
          <button
            type="button"
            className="assistant-header__title"
            onClick={onHomeClick}
            tabIndex={0}
            aria-label="Go to AI Assistant home"
          >
            AI Assistant
          </button>
        </div>
        <div className="assistant-header__actions">
          <button type="button" className="assistant-header__icon-btn assistant-header__share" onClick={onShare} aria-label="Share">
            <ShareIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
