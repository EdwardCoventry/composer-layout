import React from 'react';
import { OptionsIcon, SendIcon, CheckIcon } from './ComposerIcons';
import { ComposerOptionsGrid } from './ComposerOptionsGrid';
import { useSafeTimeout } from 'ui/hooks/useSafeTimeout';

type ComposerWidgetProps = {
  isMobile: boolean;
  isOptionsOpen: boolean;
  onToggleOptions: () => void;
  optionsMaxHeight?: number | string | null;
  onInputFocus?: () => void;
};

type SendState = 'idle' | 'sending' | 'sent';
type AnswerSource = 'card' | 'input' | null;

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
  const { setTimeout: setSendTimeout, clearTimeout: clearSendTimeout } = useSafeTimeout();
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const MIN_INPUT_HEIGHT = 44;
  const MAX_INPUT_HEIGHT = 160;

  const beginSend = React.useCallback((source: Exclude<AnswerSource, null>) => {
    if (sendState === 'sending') return;

    clearSendTimeout();
    setSendState('sending');
    setAnsweredBy(source);
    setSendTimeout(() => {
      setSendState('sent');
    }, 3000);
  }, [sendState, clearSendTimeout, setSendTimeout]);

  const handleSendClick = React.useCallback(() => {
    if (sendState === 'sending' || answeredBy) return;
    if (!inputValue.trim()) return;

    beginSend('input');
    setInputValue('');
  }, [sendState, answeredBy, inputValue, beginSend]);

  const handleOptionSelect = React.useCallback((option: string) => {
    if (answeredBy || sendState === 'sending') return;
    setSelectedOption(option);
    beginSend('card');
  }, [answeredBy, sendState, beginSend]);

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

  const renderSendIcon = React.useCallback(() => {
    const visualState = answeredBy === 'card' ? 'idle' : sendState;
    if (visualState === 'sending') {
      return <span className="composer-widget__send-spinner" aria-hidden />;
    }
    if (visualState === 'sent') {
      return <CheckIcon />;
    }
    return <SendIcon />;
  }, [answeredBy, sendState]);

  const handleInputKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  }, [handleSendClick]);

  const hasAnswered = answeredBy !== null;
  const buttonVisualState: SendState = answeredBy === 'card' ? 'idle' : sendState;
  const sendLabel =
    answeredBy === 'card' ? 'Send' : sendState === 'sending' ? 'Sending...' : hasAnswered ? 'Sent' : 'Send';
  const optionsToggleLabel = isOptionsOpen ? 'Hide options' : 'Show options';
  const handleOptionsToggle = React.useCallback(() => onToggleOptions(), [onToggleOptions]);
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
        <ComposerOptionsGrid
          isOpen={isOptionsOpen}
          optionsMaxHeightValue={optionsMaxHeightValue}
          answeredBy={answeredBy}
          sendState={sendState}
          selectedOption={selectedOption}
          cardsDisabled={cardsDisabled}
          onSelectOption={handleOptionSelect}
        />

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
              onKeyDown={handleInputKeyDown}
              enterKeyHint={isMobile ? 'send' : undefined}
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
