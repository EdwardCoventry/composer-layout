import React from 'react';

interface FooterProps {
  rightElement?: React.ReactNode;
  className?: string;
}

/**
 * Shared Footer component for example apps.
 * Shows "Back to Showcase" if sessionStorage flag is set, otherwise shows a default link.
 * Accepts a rightElement prop for custom right-side content.
 * Accepts className for style overrides.
 */
export const Footer: React.FC<FooterProps> = ({ rightElement, className }) => {
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

  // Use showcase-specific classes if provided
  const isShowcase = className === 'showcase-footer';
  const containerClass = isShowcase
    ? 'showcase-footer'
    : className
    ? `${className} widget-surface widget-surface--footer`
    : 'assistant-footer widget-surface widget-surface--footer';
  const linkClass = isShowcase
    ? 'showcase-footer__link'
    : className === 'footer-widget'
    ? 'footer-widget__link'
    : 'assistant-footer__link';
  const linkArrowClass = isShowcase
    ? 'showcase-footer__link-arrow'
    : className === 'footer-widget'
    ? 'footer-widget__link-arrow'
    : 'assistant-footer__link-arrow';
  const leftClass = isShowcase
    ? 'showcase-footer__left'
    : className === 'footer-widget'
    ? 'footer-widget__left'
    : 'assistant-footer__left';

  return (
    <div className={containerClass}>
      <div className={leftClass}>
        {isFromShowcase ? (
          <a
            href="/"
            className={linkClass}
            data-testid="assistant-footer-link"
          >
            <span className={linkArrowClass}>←</span>
            <span>Back to Showcase</span>
          </a>
        ) : (
          <a
            href="https://edwardcoventry.com"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
            data-testid="assistant-footer-link"
          >
            <span>edwardcoventry.com</span>
            <span className={linkArrowClass}>↗</span>
          </a>
        )}
      </div>
      {rightElement}
    </div>
  );
};

export default Footer;
