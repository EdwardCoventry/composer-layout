import React from 'react';
import Footer from "../../../common/components/footer/Footer";

const ShowcaseFooter: React.FC = () => {
  const className = React.useMemo(() => 'showcase-footer widget-surface widget-surface--footer', []);
  return (
    <Footer className={className} />
  );
};

export default ShowcaseFooter;
