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
  onInputFocusChange?: (focused: boolean) => void;
};

type SendState = 'idle' | 'sending' | 'sent';
type AnswerSource = 'card' | 'input' | null;

export const ComposerWidget: React.FC<ComposerWidgetProps> = ({
  isMobile,
  isOptionsOpen,
  onToggleOptions,
  optionsMaxHeight,
  onInputFocus,
  onInputFocusChange,
}) => {
  const optionsMaxHeightValue =
    optionsMaxHeight == null ? undefined : typeof optionsMaxHeight === 'number' ? `${optionsMaxHeight}px` : optionsMaxHeight;

  const [sendState, setSendState] = React.useState<SendState>('idle');
  const [answeredBy, setAnsweredBy] = React.useState<AnswerSource>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [pendingRefocus, setPendingRefocus] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const { setTimeout: setSendTimeout, clearTimeout: clearSendTimeout } = useSafeTimeout();
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const isCompactLayout = isOptionsOpen;

  const beginSend = React.useCallback(
    (source: Exclude<AnswerSource, null>) => {
      if (sendState === 'sending') return;

      clearSendTimeout();
      setSendState('sending');
      setAnsweredBy(source);
      setSendTimeout(() => {
        setSendState('sent');
      }, 3000);
    },
    [sendState, clearSendTimeout, setSendTimeout]
  );

  const handleSendClick = React.useCallback(() => {
    if (sendState === 'sending' || answeredBy) return;
    if (!inputValue.trim()) return;

    beginSend('input');
    setInputValue('');
  }, [sendState, answeredBy, inputValue, beginSend]);

  const handleOptionSelect = React.useCallback(
    (option: string) => {
      if (answeredBy || sendState === 'sending') return;
      setSelectedOption(option);
      setInputValue(option);
      beginSend('card');
    },
    [answeredBy, sendState, beginSend]
  );

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const minHeight = 52;
    const maxHeight = isCompactLayout ? 52 : isMobile ? 220 : 200;
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputValue, isCompactLayout, isMobile]);

  React.useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile || isOptionsOpen || !pendingRefocus) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      setPendingRefocus(false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [isMobile, isOptionsOpen, pendingRefocus]);

  const renderSendIcon = React.useCallback((state: SendState) => {
    if (state === 'sending') return <span className="composer-widget__send-spinner" aria-hidden />;
    if (state === 'sent') return <CheckIcon />;
    return <SendIcon />;
  }, []);

  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendClick();
      }
    },
    [handleSendClick]
  );

  const handleInputFocusInternal = React.useCallback(() => {
    if (isMobile && isOptionsOpen) setPendingRefocus(true);
    onInputFocus?.();
    onInputFocusChange?.(true);
  }, [isMobile, isOptionsOpen, onInputFocus, onInputFocusChange]);

  const handleInputBlurInternal = React.useCallback(() => {
    onInputFocusChange?.(false);
    setPendingRefocus(false);
  }, [onInputFocusChange]);

  const handleInputClick = React.useCallback(() => {
    if (isMobile && isOptionsOpen) setPendingRefocus(true);
  }, [isMobile, isOptionsOpen]);

  const hasAnswered = sendState !== 'idle';
  const isSendingFromCard = sendState === 'sending' && answeredBy === 'card';
  const sendButtonVisualState: SendState = isSendingFromCard ? 'idle' : sendState;
  const sendLabel = sendButtonVisualState === 'sending' ? 'Sending...' : sendButtonVisualState === 'sent' ? 'Sent' : 'Send';
  const optionsButtonLabel = isMobile ? 'Suggestions' : 'Show Suggestions';
  const handleOptionsToggle = React.useCallback(() => onToggleOptions(), [onToggleOptions]);
  const basePlaceholder = isMobile ? 'Type anything...' : 'Type your answer...';
  const inputPlaceholder =
    sendState === 'sending'
      ? 'Sending...'
      : sendState === 'sent'
        ? 'Answer sent'
        : answeredBy === 'card' && selectedOption
          ? selectedOption
          : basePlaceholder;
  const inputDisabled = hasAnswered;
  const cardsDisabled = hasAnswered;

  const optionsToggleButton = (
    <button
      type="button"
      className={`composer-widget__icon-btn${isCompactLayout ? ' composer-widget__icon-btn--square' : ' composer-widget__icon-btn--wide'}`}
      onClick={handleOptionsToggle}
      aria-label={isOptionsOpen ? 'Hide options' : optionsButtonLabel}
      aria-pressed={isOptionsOpen}
    >
      <OptionsIcon isMobile={isMobile} />
      {isCompactLayout ? null : <span className="composer-widget__icon-label">{optionsButtonLabel}</span>}
    </button>
  );

  const inputField = (
    <textarea
      ref={inputRef}
      rows={1}
      placeholder={inputPlaceholder}
      className={`field composer-widget__input${isCompactLayout ? ' composer-widget__input--compact' : ''}`}
      onFocus={handleInputFocusInternal}
      onBlur={handleInputBlurInternal}
      onClick={handleInputClick}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      disabled={inputDisabled}
      onKeyDown={handleInputKeyDown}
      enterKeyHint={isMobile ? 'send' : undefined}
    />
  );

  const sendButton = (
    <button
      type="button"
      className={`composer-widget__send-btn${isCompactLayout ? ' composer-widget__send-btn--tall' : ' composer-widget__send-btn--wide'}`}
      data-state={sendButtonVisualState}
      onClick={handleSendClick}
      disabled={sendState !== 'idle' || !inputValue.trim()}
      aria-live="polite"
    >
      <span className="composer-widget__send-icon" aria-hidden={sendButtonVisualState === 'sending'}>
        {renderSendIcon(sendButtonVisualState)}
      </span>
      <span className="composer-widget__send-label">{sendLabel}</span>
    </button>
  );

  return (
    <div
      className="composer-widget"
      data-mobile={isMobile}
      data-options-open={isOptionsOpen}
      data-answered-by={answeredBy ?? 'none'}
      data-layout={isCompactLayout ? 'compact' : 'expanded'}
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

        <div className={`composer-widget__inputs${isCompactLayout ? '' : ' composer-widget__inputs--stacked'}`}>
          {isCompactLayout ? (
            <div className="composer-widget__input-row">
              {optionsToggleButton}
              {inputField}
              {sendButton}
            </div>
          ) : (
            <>
              <div className="composer-widget__input-row composer-widget__input-row--full">{inputField}</div>
              <div className="composer-widget__input-row composer-widget__input-row--actions">
                {optionsToggleButton}
                {sendButton}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
