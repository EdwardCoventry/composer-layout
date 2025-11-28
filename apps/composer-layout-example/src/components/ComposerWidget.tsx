import React from 'react';

export type ComposerSizingPreset = 'auto' | 'vhFraction';

type ComposerWidgetProps = {
  isMobile: boolean;
  sizingPreset: ComposerSizingPreset;
  onChangeSizingPreset: (preset: ComposerSizingPreset) => void;
  isGridOpen: boolean;
  onToggleGrid: () => void;
  gridMaxHeight?: number | string | null;
};

export const ComposerWidget: React.FC<ComposerWidgetProps> = ({
  isMobile,
  sizingPreset,
  onChangeSizingPreset,
  isGridOpen,
  onToggleGrid,
  gridMaxHeight,
}) => {
  const handleToggleGrid = () => {
    onToggleGrid();
  };

  const gridMaxHeightValue = gridMaxHeight == null
    ? undefined
    : typeof gridMaxHeight === 'number'
      ? `${gridMaxHeight}px`
      : gridMaxHeight;

  return (
    <div className="composer-widget" data-mobile={isMobile} data-grid-open={isGridOpen}>
      <div className="composer-widget__controls">
        <button type="button" onClick={handleToggleGrid} data-testid="toggle-grid" className="control-chip" data-active={isGridOpen}>
          <span className="control-chip__dot" aria-hidden />
          {isGridOpen ? 'Hide options' : 'Show options'}
        </button>
        <button
          type="button"
          onClick={() => onChangeSizingPreset(sizingPreset === 'auto' ? 'vhFraction' : 'auto')}
          data-testid="toggle-sizing"
          className="control-chip"
          data-active={sizingPreset === 'vhFraction'}
        >
          Sizing: {sizingPreset === 'auto' ? 'Auto (content)' : 'Viewport fraction'}
        </button>
      </div>

      <div className="composer-widget__middle">
        <div
          className={`composer-widget__grid${isGridOpen ? ' is-open' : ''}`}
          data-testid="grid"
          style={gridMaxHeightValue ? { '--grid-max-height': gridMaxHeightValue } as React.CSSProperties : undefined}
        >
          <div className="composer-widget__tile">Tile 1</div>
          <div className="composer-widget__tile">Tile 2</div>
          <div className="composer-widget__tile">Tile 3</div>
          <div className="composer-widget__tile">Tile 4</div>
        </div>

        <div className="composer-widget__inputs">
          <input
            type="text"
            placeholder="Type here..."
            className="field"
          />
          <textarea
            placeholder="More input..."
            rows={3}
            className="field field--textarea"
          />
        </div>
      </div>
    </div>
  );
};

