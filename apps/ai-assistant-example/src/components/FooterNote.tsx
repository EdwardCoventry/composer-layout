import React from 'react';
import { SendState } from './types';
import Footer from '@common/footer/Footer';

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
    <Footer
      rightElement={
        <a
          href="/embed"
          className="assistant-footer__embed-link"
          onClick={handleEmbed}
          data-testid="assistant-embed-link"
          data-status={sendState}
        >
          Embed
        </a>
      }
    />
  );
};
