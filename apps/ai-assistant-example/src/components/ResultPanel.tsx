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

export const ResultPanel: React.FC<ResultPanelProps> = ({ answer, selectedMode, preferences, images, text: _text, onRestart }) => {
    const modeLabel = React.useMemo(() => selectedMode?.label || 'Organize info', [selectedMode]);
    const summary = React.useMemo(() => answer?.summary || 'Organize these meeting notes into action items, concise with a couple of explanations.', [answer]);
    const title = React.useMemo(() => answer?.title || modeLabel, [answer, modeLabel]);

    const outputLabel = React.useMemo(() => selectedMode?.tagLine || 'Organize notes into actions', [selectedMode]);

    const toneLabel = preferences.tone;
    const detailLabel = preferences.detail;
    const sourcesLabel = React.useMemo(() => preferences.includeSources ? 'Sources included' : 'No sources', [preferences.includeSources]);
    const imagesLabel = React.useMemo(() => (images.length ? `${images.length} image${images.length === 1 ? '' : 's'}` : 'No images'), [images]);

    const willDo = React.useMemo(() => answer?.bullets ?? [
        'Extract action items from the notes.',
        'Group related actions together by topic.',
        'Highlight anything ambiguous or missing that may need follow-up.',
    ], [answer]);

    const behaviorBullets = React.useMemo(() => [
        'Preview appears after 3s if streaming is slow.',
        'You can go back to the composer to edit settings.',
    ], []);

    return (
        <div className="assistant-result">
            <div className="assistant-result__card widget-surface widget-surface--content">
                <h2 className="assistant-result__title">{title}</h2>
                <p className="assistant-result__lead">{summary}</p>

                {/* Compact run overview instead of a chip grid */}
                <div className="assistant-result__run-overview">
                    <div className="assistant-result__run-main">
                        <span className="assistant-result__run-label">Mode</span>{' '}
                        <span className="assistant-result__run-value">{modeLabel}</span>
                        <span className="assistant-result__run-separator"> \u00b7 </span>
                        <span className="assistant-result__run-label">Output</span>{' '}
                        <span className="assistant-result__run-value">{outputLabel}</span>
                    </div>

                    <div className="assistant-result__run-secondary">
                        <span>Tone: {toneLabel}</span>
                        <span className="assistant-result__run-separator"> \u00b7 </span>
                        <span>Detail: {detailLabel}</span>
                        <span className="assistant-result__run-separator"> \u00b7 </span>
                        <span>{sourcesLabel}</span>
                        <span className="assistant-result__run-separator"> \u00b7 </span>
                        <span>{imagesLabel}</span>
                    </div>
                </div>

                <div className="assistant-result__groups">
                    <div className="assistant-group">
                        <div className="assistant-group__title">What this run will do</div>
                        <ul className="assistant-result__list">
                            {willDo.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="assistant-group">
                        <div className="assistant-group__title">How preview works</div>
                        <ul className="assistant-result__list assistant-result__list--note">
                            {behaviorBullets.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="assistant-result__actions">
                    <button type="button" className="assistant-primary" onClick={onRestart}>
                        Back to composer
                    </button>
                </div>
            </div>
        </div>
    );
};
