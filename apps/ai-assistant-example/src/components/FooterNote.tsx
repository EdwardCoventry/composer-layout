import React from 'react';
import { SendState } from './types';

type FooterNoteProps = {
  sendState: SendState;
};

export const FooterNote: React.FC<FooterNoteProps> = ({ sendState }) => {
  const statusText = sendState === 'sending' ? 'Simulating response…' : sendState === 'sent' ? 'Response ready' : 'Ready';

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
      <div className="assistant-footer__status">{statusText}</div>
    </div>
  );
};
