import React from 'react';

export type ComposerSizingPreset = 'auto' | 'vhFraction';

type ComposerWidgetProps = {
  isMobile: boolean;
  sizingPreset: ComposerSizingPreset;
  onChangeSizingPreset: (preset: ComposerSizingPreset) => void;
  isGridOpen: boolean;
  onToggleGrid: () => void;
  gridMaxHeight?: number | string | null;
  onInputFocus?: () => void;
};

type SendState = 'idle' | 'sending' | 'sent';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path
      d="M4.5 12L4 5l16 7-16 7 .5-7L14 12 4.5 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path d="M5.5 12.5L10 17l8.5-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ComposerWidget: React.FC<ComposerWidgetProps> = ({
  isMobile,
  sizingPreset,
  onChangeSizingPreset,
  isGridOpen,
  onToggleGrid,
  gridMaxHeight,
  onInputFocus,
}) => {
  const handleToggleGrid = () => {
    onToggleGrid();
  };

  const gridMaxHeightValue =
    gridMaxHeight == null
      ? undefined
      : typeof gridMaxHeight === 'number'
        ? `${gridMaxHeight}px`
        : gridMaxHeight;

  const [sendState, setSendState] = React.useState<SendState>('idle');
  const sendTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const handleSendClick = () => {
    if (sendState === 'sending') return;

    if (sendTimerRef.current !== null) {
      window.clearTimeout(sendTimerRef.current);
    }

    setSendState('sending');

    const delayMs = 1000 + Math.floor(Math.random() * 2000);
    sendTimerRef.current = window.setTimeout(() => {
      setSendState('sent');
      sendTimerRef.current = null;
    }, delayMs);
  };

  const renderSendIcon = () => {
    if (sendState === 'sending') {
      return <span className="composer-widget__send-spinner" aria-hidden />;
    }
    if (sendState === 'sent') {
      return <CheckIcon />;
    }
    return <SendIcon />;
  };

  const sendLabel = sendState === 'sending' ? 'Sending...' : sendState === 'sent' ? 'Sent' : 'Send';

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
          style={gridMaxHeightValue ? ({ '--grid-max-height': gridMaxHeightValue } as React.CSSProperties) : undefined}
        >
          <div className="composer-widget__tile">Tile 1</div>
          <div className="composer-widget__tile">Tile 2</div>
          <div className="composer-widget__tile">Tile 3</div>
          <div className="composer-widget__tile">Tile 4</div>
        </div>

      <div className="composer-widget__inputs">
        <div className="composer-widget__input-row">
          <input type="text" placeholder="Type here..." className="field composer-widget__input" onFocus={onInputFocus} />
          <button type="button" className="composer-widget__icon-btn" aria-label="Add item">
            <PlusIcon />
          </button>
            <button
              type="button"
              className="composer-widget__send-btn"
              data-state={sendState}
              onClick={handleSendClick}
              aria-live="polite"
            >
              <span className="composer-widget__send-icon" aria-hidden={sendState === 'sending'}>
                {renderSendIcon()}
              </span>
              <span className="composer-widget__send-label">{sendLabel}</span>
            </button>
          </div>
          <textarea
            placeholder="More input..."
            rows={3}
            className="field field--textarea"
            onFocus={onInputFocus}
          />
        </div>
      </div>
    </div>
  );
};

