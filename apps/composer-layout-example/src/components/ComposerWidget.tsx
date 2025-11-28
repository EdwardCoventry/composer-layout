import React from 'react';

export type ComposerSizingPreset = 'auto' | 'vhFraction';

type ComposerWidgetProps = {
  isMobile: boolean;
  sizingPreset: ComposerSizingPreset;
  isOptionsOpen: boolean;
  onToggleOptions: () => void;
  optionsMaxHeight?: number | string | null;
  onInputFocus?: () => void;
};

type SendState = 'idle' | 'sending' | 'sent';

const OptionsIcon: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const viewBoxSize = isMobile ? 28 : 24;
  const cols = isMobile ? 1 : 2;
  const rows = isMobile ? 3 : 2;
  const gap = isMobile ? 2: 3.5;
  const desiredWidth = isMobile ? 18 : 24;
  const desiredHeight = isMobile ? 24 : 16;
  const strokeWidth = 2;
  const maxSize = viewBoxSize - strokeWidth;
  const targetWidth = Math.min(desiredWidth, maxSize);
  const targetHeight = Math.min(desiredHeight, maxSize);
  const cellWidth = (targetWidth - gap * (cols - 1)) / cols;
  const cellHeight = (targetHeight - gap * (rows - 1)) / rows;
  const x = (viewBoxSize - targetWidth) / 2;
  const y = (viewBoxSize - targetHeight) / 2;

  const strokeProps = {
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const cells = Array.from({ length: rows * cols }, (_, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellX = x + col * (cellWidth + gap);
    const cellY = y + row * (cellHeight + gap);
    return <rect key={idx} x={cellX} y={cellY} width={cellWidth} height={cellHeight} rx={1.5} fill="none" {...strokeProps} />;
  });

  return (
    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} role="img" aria-hidden focusable="false">
      {cells}
    </svg>
  );
};

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
  isOptionsOpen,
  onToggleOptions,
  optionsMaxHeight,
  onInputFocus,
}) => {
  const optionsMaxHeightValue =
    optionsMaxHeight == null
      ? undefined
      : typeof optionsMaxHeight === 'number'
        ? `${optionsMaxHeight}px`
        : optionsMaxHeight;

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
  const optionsToggleLabel = isOptionsOpen ? 'Hide options' : 'Show options';
  const handleOptionsToggle = () => onToggleOptions();

  return (
    <div className="composer-widget" data-mobile={isMobile} data-options-open={isOptionsOpen}>
      <div className="composer-widget__controls" />

      <div className="composer-widget__middle">
        <div
          className={`composer-widget__options-grid${isOptionsOpen ? ' is-open' : ''}`}
          data-testid="options-grid"
          style={optionsMaxHeightValue ? ({ '--options-max-height': optionsMaxHeightValue } as React.CSSProperties) : undefined}
        >
          <div className="composer-widget__option">Option One</div>
          <div className="composer-widget__option">Option Two</div>
          <div className="composer-widget__option">Option Three</div>
          <div className="composer-widget__option">Option Four</div>
        </div>

        <div className="composer-widget__inputs">
          <div className="composer-widget__input-row">
            <button
              type="button"
              className="composer-widget__icon-btn"
              onClick={handleOptionsToggle}
              aria-label={optionsToggleLabel}
              aria-pressed={isOptionsOpen}
            >
              <OptionsIcon isMobile={isMobile} />
            </button>
            <input type="text" placeholder="Type here..." className="field composer-widget__input" onFocus={onInputFocus} />
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
        </div>
      </div>
    </div>
  );
};
