import React from 'react';
import { AssistantAnswer, AssistantImage, AssistantMode, AssistantPreferences } from './types';

type ResultPanelProps = {
  answer: AssistantAnswer | null;
  selectedMode: AssistantMode | null;
  preferences: AssistantPreferences;
  images: AssistantImage[];
  text: string;
  onRestart: () => void;
};

export const ResultPanel: React.FC<ResultPanelProps> = ({ answer, selectedMode, preferences, images, text, onRestart }) => {
  const fallbackSummary = text.trim()
    ? `Here is a quick response to: “${text.trim()}”.`
    : 'Here is a placeholder response after the simulated wait.';
  const bullets = answer?.bullets ?? [
    'Reframes the request in assistant-friendly language.',
    `Tone: ${preferences.tone}, Detail: ${preferences.detail}${preferences.includeSources ? ', with sources' : ''}.`,
    images.length ? `Used ${images.length} attached image${images.length === 1 ? '' : 's'} for extra context.` : 'No images were provided, so this is text-first.',
    'Tap “Back to composer” to try another request or change the mode.',
  ];

  const modeLabel = selectedMode?.label || 'Quick answer';

  return (
    <div className="assistant-result">
      <div className="assistant-result__card widget-surface widget-surface--content">
        <div className="badge">Assistant response</div>
        <h2 className="assistant-result__title">{answer?.title || 'Draft response'}</h2>
        <p className="assistant-result__lead">{answer?.summary || fallbackSummary}</p>
        <div className="assistant-result__callout">{answer?.highlight || 'Response generated after the 3 second demo delay.'}</div>
        <ul className="assistant-result__list">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="assistant-result__meta">
          <span>{modeLabel}</span>
          <span>{preferences.tone} · {preferences.detail}</span>
          <span>{images.length ? `${images.length} image${images.length === 1 ? '' : 's'}` : 'Text-only run'}</span>
        </div>
        <div className="assistant-result__actions">
          <button type="button" className="assistant-secondary" onClick={onRestart}>
            Back to composer
          </button>
        </div>
      </div>
    </div>
  );
};
