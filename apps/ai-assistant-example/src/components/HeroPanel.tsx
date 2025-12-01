import React from 'react';
import { AssistantMode } from './types';

type HeroPanelProps = {
  modes: AssistantMode[];
  selectedModeKey: string;
  onSelectMode: (modeKey: string) => void;
  heroTitle: string;
  heroSubtitle: string;
};

export const HeroPanel: React.FC<HeroPanelProps> = ({ modes, selectedModeKey, onSelectMode, heroTitle, heroSubtitle }) => {
  return (
    <div className="assistant-hero">
      <div className="assistant-hero__content">
        <h1 className="assistant-hero__title">{heroTitle}</h1>
        <p className="assistant-hero__subtitle">{heroSubtitle}</p>

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
      </div>
    </div>
  );
};
