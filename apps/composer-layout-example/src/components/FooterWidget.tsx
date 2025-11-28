import React from 'react';

export const FooterWidget: React.FC = () => {
  return (
    <div className="widget-surface widget-surface--footer footer-widget">
      <span className="footer-widget__dot" aria-hidden />
      <a
        href="https://edwardcoventry.com"
        target="_blank"
        rel="noreferrer"
        className="footer-widget__link"
        data-testid="footer-link"
      >
        <span>Edward Coventry</span>
        <span className="footer-widget__link-arrow">↗</span>
      </a>
    </div>
  );
};
