import React from 'react';

type FooterWidgetProps = {
  sizingLabel?: string;
};

export const FooterWidget: React.FC<FooterWidgetProps> = ({ sizingLabel }) => {
  return (
    <div className="widget-surface widget-surface--footer footer-widget">
      <div className="footer-widget__left">
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
      {sizingLabel && <div className="footer-widget__sizing">{sizingLabel}</div>}
    </div>
  );
};
