import React from 'react';
import { SendState } from './types';

type FooterNoteProps = {
  sendState: SendState;
  onNavigate?: (path: string) => void;
};

export const FooterNote: React.FC<FooterNoteProps> = ({ sendState, onNavigate }) => {
  const [isFromShowcase, setIsFromShowcase] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsFromShowcase(params.get('from') === 'showcase');
    }
  }, []);

  const handleEmbed = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate('/embed');
  };

  return (
    <div className="assistant-footer widget-surface widget-surface--footer">
      <div className="assistant-footer__left">
        {isFromShowcase ? (
          <a
            href="/"
            className="assistant-footer__link"
            data-testid="assistant-footer-link"
          >
            <span className="assistant-footer__link-arrow">←</span>
            <span>Back to Showcase</span>
          </a>
        ) : (
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
        )}
      </div>
      <a
        href="/embed"
        className="assistant-footer__embed-link"
        onClick={handleEmbed}
        data-testid="assistant-embed-link"
        data-status={sendState}
      >
        Embed
      </a>
    </div>
  );
};
