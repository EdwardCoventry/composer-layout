import React from 'react';
import { SendState } from './types';

type FooterNoteProps = {
  sendState: SendState;
  onNavigate?: (path: string) => void;
};

export const FooterNote: React.FC<FooterNoteProps> = ({ sendState, onNavigate }) => {
  const handleEmbed = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate('/embed');
  };

  return (
    <div className="assistant-footer widget-surface widget-surface--footer">
      <div className="assistant-footer__left">
        <a
          href="https://edwardcoventry.com"
          target="_blank"
          rel="noreferrer"
          className="assistant-footer__link"
          data-testid="assistant-footer-link"
        >
          <span>edwardcoventry.com</span>
          <span className="assistant-footer__link-arrow">↗</span>
        </a>
      </div>
      <a
        href="/embed"
        className="assistant-footer__button"
        onClick={handleEmbed}
        data-testid="assistant-embed-link"
        data-status={sendState}
      >
        Embed
      </a>
    </div>
  );
};
