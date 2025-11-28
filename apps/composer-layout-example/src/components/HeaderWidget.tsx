import React from 'react';

type HeaderWidgetProps = {
  showComposerPanel: boolean;
  onToggleComposer: () => void;
};

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({
  showComposerPanel,
  onToggleComposer,
}) => {
  return (
    <div className="widget-surface widget-surface--header">
      <div className="header-widget__inner">
        <div className="header-widget__text">
          <span className="header-widget__title">Composer Layout</span>
          <span className="header-widget__subtitle">Responsive content + composer demo</span>
        </div>
        <div className="header-widget__actions">
          <button type="button" className="header-widget__toggle" onClick={onToggleComposer}>
            {showComposerPanel ? 'Hide composer' : 'Show composer'}
          </button>
        </div>
      </div>
    </div>
  );
};
