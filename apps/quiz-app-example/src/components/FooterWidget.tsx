import React from 'react';

type FooterWidgetProps = {
  sizingLabel?: string;
};

export const FooterWidget: React.FC<FooterWidgetProps> = ({ sizingLabel }) => {
  const [isFromShowcase, setIsFromShowcase] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsFromShowcase(params.get('from') === 'showcase');
    }
  }, []);

  return (
    <div className="widget-surface widget-surface--footer footer-widget">
      <div className="footer-widget__left">
        {isFromShowcase ? (
          <a
            href="/"
            className="footer-widget__link"
            data-testid="footer-link"
          >
            <span className="footer-widget__link-arrow">←</span>
            <span>Back to Showcase</span>
          </a>
        ) : (
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
        )}
      </div>
      {sizingLabel && <div className="footer-widget__sizing">{sizingLabel}</div>}
    </div>
  );
};
