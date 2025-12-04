import React from 'react';

export type ComposerSizingPreset = 'auto' | 'vhFraction';

type ComposerWidgetProps = {
  isMobile: boolean;
  isOptionsOpen: boolean;
  onToggleOptions: () => void;
  optionsMaxHeight?: number | string | null;
  onInputFocus?: () => void;
};

type SendState = 'idle' | 'sending' | 'sent';
type AnswerSource = 'card' | 'input' | null;

const OptionsIcon: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const viewBoxSize = isMobile ? 28 : 24;
  const cols = isMobile ? 1 : 2;
  const rows = isMobile ? 3 : 2;
  const gap = isMobile ? 2 : 3.5;
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
  const [answeredBy, setAnsweredBy] = React.useState<AnswerSource>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const sendTimerRef = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const MIN_INPUT_HEIGHT = 44;
  const MAX_INPUT_HEIGHT = 160;

  React.useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const beginSend = React.useCallback((source: Exclude<AnswerSource, null>) => {
    if (sendState === 'sending') return;

    if (sendTimerRef.current !== null) {
      window.clearTimeout(sendTimerRef.current);
    }

    setSendState('sending');
    setAnsweredBy(source);

    const delayMs = 3000;
    sendTimerRef.current = window.setTimeout(() => {
      setSendState('sent');
      sendTimerRef.current = null;
    }, delayMs);
  }, [sendState]);

  const handleSendClick = () => {
    if (sendState === 'sending' || answeredBy) return;
    if (!inputValue.trim()) return;

    beginSend('input');
    setInputValue('');
  };

  const handleOptionSelect = (option: string) => {
    if (answeredBy || sendState === 'sending') return;
    setSelectedOption(option);
    beginSend('card');
  };

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden';
  }, [inputValue]);

  React.useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const renderSendIcon = () => {
    const visualState = answeredBy === 'card' ? 'idle' : sendState;
    if (visualState === 'sending') {
      return <span className="composer-widget__send-spinner" aria-hidden />;
    }
    if (visualState === 'sent') {
      return <CheckIcon />;
    }
    return <SendIcon />;
  };

  const hasAnswered = answeredBy !== null;
  const buttonVisualState: SendState = answeredBy === 'card' ? 'idle' : sendState;
  const sendLabel =
    answeredBy === 'card' ? 'Send' : sendState === 'sending' ? 'Sending...' : hasAnswered ? 'Sent' : 'Send';
  const optionsToggleLabel = isOptionsOpen ? 'Hide options' : 'Show options';
  const handleOptionsToggle = () => onToggleOptions();
  const options = React.useMemo(() => ['Option One', 'Option Two', 'Option Three', 'Option Four'], []);
  const inputPlaceholder =
    answeredBy === 'card' && selectedOption ? selectedOption : hasAnswered ? 'Answer sent' : 'Type here...';
  const inputDisabled = hasAnswered;
  const cardsDisabled = hasAnswered || sendState === 'sending';

  return (
    <div
      className="composer-widget"
      data-mobile={isMobile}
      data-options-open={isOptionsOpen}
      data-answered-by={answeredBy ?? 'none'}
    >
      <div className="composer-widget__middle">
        <div
          className={`composer-widget__options-grid${isOptionsOpen ? ' is-open' : ''}`}
          data-testid="options-grid"
          style={optionsMaxHeightValue ? ({ '--options-max-height': optionsMaxHeightValue } as React.CSSProperties) : undefined}
        >
          {options.map((option) => {
            const isSelected = selectedOption === option;
            const isCardSending = isSelected && answeredBy === 'card' && sendState === 'sending';
            const isCardSent = isSelected && answeredBy === 'card' && sendState === 'sent';
            return (
              <button
                key={option}
                type="button"
                className="composer-widget__option"
                onClick={() => handleOptionSelect(option)}
                data-selected={isSelected}
                disabled={cardsDisabled}
              >
                {isSelected && (
                  <span className="composer-widget__option-pill" data-state={isCardSending ? 'sending' : 'sent'}>
                    {isCardSending ? (
                      <span className="composer-widget__send-spinner" aria-hidden />
                    ) : (
                      <CheckIcon />
                    )}
                    <span>{isCardSending ? 'Sending...' : isCardSent ? 'Sent' : 'Sending...'}</span>
                  </span>
                )}
                <span className="composer-widget__option-label">{option}</span>
              </button>
            );
          })}
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
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={inputPlaceholder}
              className="field composer-widget__input"
              onFocus={onInputFocus}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={inputDisabled}
            />
            <button
              type="button"
              className="composer-widget__send-btn"
              data-state={buttonVisualState}
              onClick={handleSendClick}
              disabled={hasAnswered || !inputValue.trim()}
              aria-live="polite"
            >
              <span className="composer-widget__send-icon" aria-hidden={buttonVisualState === 'sending'}>
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
