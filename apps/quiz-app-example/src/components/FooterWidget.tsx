import React from 'react';
import Footer from '@common/footer/Footer';

type FooterWidgetProps = {
  sizingLabel?: string;
};

export const FooterWidget: React.FC<FooterWidgetProps> = ({ sizingLabel }) => {
  return (
    <Footer
      className="footer-widget"
      rightElement={
        sizingLabel ? (
          <div className="footer-widget__sizing">{sizingLabel}</div>
        ) : null
      }
    />
  );
};
