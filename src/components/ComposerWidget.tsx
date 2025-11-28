import React from 'react';

export type ComposerSizingPreset = 'auto' | 'vhFraction';

type ComposerWidgetProps = {
  isMobile: boolean;
  sizingPreset: ComposerSizingPreset;
  onChangeSizingPreset: (preset: ComposerSizingPreset) => void;
  isGridOpen: boolean;
  onToggleGrid: () => void;
  /** Optional cap for grid height. Null disables the cap (no max-height). */
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

  // Root: flex column that fills available height in composer scroll area
  const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    gap: 8,
  };

  const controlsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flex: '0 0 auto',
  };

  // Middle area to host grid + inputs; grid should consume spare space when open
  const middleAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    gap: 8,
  };

  const gridContainerStyle: React.CSSProperties = isGridOpen
    ? {
        display: 'grid',
        // Fill available vertical space within middle area
        flex: '1 1 auto',
        minHeight: 0,
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gridTemplateRows: isMobile ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
        gap: 8,
        // Optional ceiling and scroll
        ...(gridMaxHeight != null ? { maxHeight: typeof gridMaxHeight === 'number' ? `${gridMaxHeight}px` : gridMaxHeight } : {}),
        overflowY: 'auto',
      }
    : {
        display: 'none',
        flex: '0 0 auto',
      };

  const tileStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.1)',
    border: '1px solid rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 6,
    minHeight: 56,
  };

  const inputsStyle: React.CSSProperties = {
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: '0 0 auto',
  };

  return (
    <div style={rootStyle}>
      {/* Controls Row */}
      <div style={controlsRowStyle}>
        <button type="button" onClick={handleToggleGrid} data-testid="toggle-grid">
          {isGridOpen ? 'Hide grid' : 'Show grid'}
        </button>
        <button
          type="button"
          onClick={() => onChangeSizingPreset(sizingPreset === 'auto' ? 'vhFraction' : 'auto')}
          data-testid="toggle-sizing"
        >
          Sizing: {sizingPreset === 'auto' ? 'Auto (content)' : 'Viewport fraction'}
        </button>
      </div>

      {/* Middle Area: grid + inputs */}
      <div style={middleAreaStyle}>
        <div style={gridContainerStyle} data-testid="grid">
          <div style={tileStyle}>Tile 1</div>
          <div style={tileStyle}>Tile 2</div>
          <div style={tileStyle}>Tile 3</div>
          <div style={tileStyle}>Tile 4</div>
        </div>

        <div style={inputsStyle}>
          <input
            type="text"
            placeholder="Type here..."
            style={{ padding: 8, borderRadius: 4, border: '1px solid rgba(0,0,0,0.3)' }}
          />
          <textarea placeholder="More input..." rows={3} style={{ padding: 8, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
};
