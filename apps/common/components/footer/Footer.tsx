import React from 'react';

interface FooterProps {
  rightElement?: React.ReactNode;
}

/**
 * Shared Footer component for example apps.
 * Shows "Back to Showcase" if sessionStorage flag is set, otherwise shows a default link.
 * Accepts a rightElement prop for custom right-side content.
 */
export const Footer: React.FC<FooterProps> = ({ rightElement }) => {
  const [isFromShowcase] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const fromShowcase = window.sessionStorage.getItem('fromShowcase');
      if (fromShowcase === '1') {
        window.sessionStorage.removeItem('fromShowcase');
        return true;
      }
    }
    return false;
  });

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
      {rightElement}
    </div>
  );
};

export default Footer;
