import React from 'react';
import { AssistantMode } from './types';

type HeroPanelProps = {
  modes: AssistantMode[];
  selectedModeKey: string;
  onSelectMode: (modeKey: string) => void;
  heroTitle: string;
  heroSubtitle: string;
  hideTitleSubtitle?: boolean;
  hideModes?: boolean;
  /**
   * Layout variant: 'embed' (hug content) or 'fill' (fill available space)
   * Default is 'embed'.
   */
  variant?: 'embed' | 'fill';
};

type ModeTagsPanelProps = {
  modes: AssistantMode[];
  selectedModeKey: string;
  onSelectMode: (modeKey: string) => void;
};

export const ModeTagsPanel: React.FC<ModeTagsPanelProps> = ({
  modes,
  selectedModeKey,
  onSelectMode
}) => (
  <div className="assistant-mode-row">
    {modes.map((mode) => (
      <button
        key={mode.key}
        type="button"
        className="assistant-mode-pill"
        data-active={mode.key === selectedModeKey}
        onClick={() => onSelectMode(mode.key)}
      >
        <span className="assistant-mode-pill__emoji" aria-hidden>
          {mode.emoji}
        </span>
        <span className="assistant-mode-pill__label">{mode.tagLine}</span>
      </button>
    ))}
  </div>
);

export const HeroPanel: React.FC<HeroPanelProps> = ({
  modes,
  selectedModeKey,
  onSelectMode,
  heroTitle,
  heroSubtitle,
  hideTitleSubtitle = false,
  hideModes = false,
  variant = 'embed',
}) => {
  const handleSelectMode = React.useCallback(
    (modeKey: string) => onSelectMode(modeKey),
    [onSelectMode]
  );
  const className = React.useMemo(
    () => `assistant-hero${variant === 'fill' ? ' assistant-hero--fill' : ''}`,
    [variant]
  );

  return (
    <div className={className}>
      <div className="assistant-hero__content">
        {!hideTitleSubtitle && (
          <>
            <h1 className="assistant-hero__title">{heroTitle}</h1>
            <p className="assistant-hero__subtitle">{heroSubtitle}</p>
          </>
        )}

        {!hideModes && (
          <ModeTagsPanel
            modes={modes}
            selectedModeKey={selectedModeKey}
            onSelectMode={handleSelectMode}
          />
        )}
      </div>
    </div>
  );
};
