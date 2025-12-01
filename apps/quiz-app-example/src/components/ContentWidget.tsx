import React from 'react';

type ContentWidgetProps = {
  isMobile: boolean;
};

export const ContentWidget: React.FC<ContentWidgetProps> = ({ isMobile }) => {
  const containerAlignmentClass = isMobile ? 'content-widget--center' : 'content-widget--bottom';

  return (
    <div className={`content-widget ${containerAlignmentClass}`} data-testid="content-widget">
      <div className="widget-surface widget-surface--content content-widget__card" style={{ textAlign: 'left' }}>
        <span className="badge">Content preview</span>
        <h1 className="line-clamp line-clamp-4 content-widget__title">
          This is the content widget title
        </h1>
        <p className="line-clamp line-clamp-3 content-widget__text">
          Vertically {isMobile ? 'centered' : 'bottom-aligned'} container; text stays left-aligned on every size.
        </p>
        <p className="line-clamp line-clamp-2 content-widget__text content-widget__text--tight">
          Resize the viewport to see vertical alignment change while text stays left-aligned.
        </p>
      </div>
    </div>
  );
};

