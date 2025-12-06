import React from 'react';
import Footer from '@common/footer/Footer';

type FooterWidgetProps = {
  sizingLabel?: string;
};

export const FooterWidget: React.FC<FooterWidgetProps> = ({ sizingLabel }) => {
  const rightEl = React.useMemo(
    () =>
      sizingLabel ? (
        <div className="footer-widget__sizing">{sizingLabel}</div>
      ) : null,
    [sizingLabel]
  );

  return (
    <Footer className="footer-widget" rightElement={rightEl} />
  );
};
