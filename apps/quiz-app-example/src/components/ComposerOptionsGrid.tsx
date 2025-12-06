import React from 'react';
import { CheckIcon } from './ComposerIcons';

type AnswerSource = 'card' | 'input' | null;
type SendState = 'idle' | 'sending' | 'sent';

const OPTIONS = ['Option One', 'Option Two', 'Option Three', 'Option Four'] as const;

type ComposerOptionsGridProps = {
  isOpen: boolean;
  optionsMaxHeightValue?: string;
  answeredBy: AnswerSource;
  sendState: SendState;
  selectedOption: string | null;
  cardsDisabled: boolean;
  onSelectOption: (option: string) => void;
};

export const ComposerOptionsGrid: React.FC<ComposerOptionsGridProps> = ({
  isOpen,
  optionsMaxHeightValue,
  answeredBy,
  sendState,
  selectedOption,
  cardsDisabled,
  onSelectOption,
}) => {
  return (
    <div
      className={`composer-widget__options-grid${isOpen ? ' is-open' : ''}`}
      data-testid="options-grid"
      style={
        optionsMaxHeightValue
          ? ({ '--options-max-height': optionsMaxHeightValue } as React.CSSProperties)
          : undefined
      }
    >
      {OPTIONS.map((option) => {
        const isSelected = selectedOption === option;
        const isCardSending = isSelected && answeredBy === 'card' && sendState === 'sending';
        const isCardSent = isSelected && answeredBy === 'card' && sendState === 'sent';

        return (
          <button
            key={option}
            type="button"
            className="composer-widget__option"
            onClick={() => onSelectOption(option)}
            data-selected={isSelected}
            disabled={cardsDisabled}
          >
            {isSelected && (
              <span className="composer-widget__option-pill" data-state={isCardSending ? 'sending' : 'sent'}>
                {isCardSending ? <span className="composer-widget__send-spinner" aria-hidden /> : <CheckIcon />}
                <span>{isCardSending ? 'Sending...' : isCardSent ? 'Sent' : 'Sending...'}</span>
              </span>
            )}
            <span className="composer-widget__option-label">{option}</span>
          </button>
        );
      })}
    </div>
  );
};

