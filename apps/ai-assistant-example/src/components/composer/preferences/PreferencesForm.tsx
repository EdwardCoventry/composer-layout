import React, { useCallback, useMemo } from 'react';
import type { AssistantPreferences } from '../../types';
import { TagInput } from '../TagInput';

type TagPreferenceKey = 'allergies' | 'dietary' | 'personalization';

type ChipRowProps = {
  options: { value: string; label: string }[];
  value: string;
  onSelect: (value: string) => void;
};

const ChipRow = React.memo(({ options, value, onSelect }: ChipRowProps) => (
  <div className="assistant-chip-row">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className="assistant-chip"
        data-active={value === opt.value}
        onClick={() => onSelect(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
));
ChipRow.displayName = 'ChipRow';

export type PreferencesFormProps = {
  preferences: AssistantPreferences;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  contentVariant: 'popup' | 'modal' | 'fullscreen';
  onClose: () => void;
  renderFooterInside?: boolean; // when true, render footer inside the scrollable content
};

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onUpdatePreferences,
  contentVariant,
  onClose,
  renderFooterInside = contentVariant !== 'popup',
}) => {
  const updateTags = useCallback((key: TagPreferenceKey, tag: string) => {
    const current = preferences[key]?.tags || [];
    if (current.includes(tag)) return;
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { notes: '' }),
        tags: [...current, tag],
      },
    });
  }, [preferences, onUpdatePreferences]);

  const removeTag = useCallback((key: TagPreferenceKey, tag: string) => {
    const current = preferences[key]?.tags || [];
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { notes: '' }),
        tags: current.filter((t: string) => t !== tag),
      },
    });
  }, [preferences, onUpdatePreferences]);

  const updateNotes = useCallback((key: TagPreferenceKey, notes: string) => {
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { tags: [] }),
        notes,
      },
    });
  }, [preferences, onUpdatePreferences]);

  const toneOptions = useMemo(() => ([
    { value: 'Friendly', label: 'Friendly' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Direct', label: 'Direct' },
  ]), []);

  const detailOptions = useMemo(() => ([
    { value: 'Brief', label: 'Brief' },
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Deep', label: 'Deep' },
  ]), []);

  const handleToneSelect = useCallback((tone: string) => {
    onUpdatePreferences({ tone: tone as AssistantPreferences['tone'] });
  }, [onUpdatePreferences]);

  const handleDetailSelect = useCallback((detail: string) => {
    onUpdatePreferences({ detail: detail as AssistantPreferences['detail'] });
  }, [onUpdatePreferences]);

  const handleToneNotesChange = useCallback((value: string) => {
    onUpdatePreferences({ toneNotes: value });
  }, [onUpdatePreferences]);

  const handleDetailNotesChange = useCallback((value: string) => {
    onUpdatePreferences({ detailNotes: value });
  }, [onUpdatePreferences]);

  return (
    <>
      {/* Top spacer to preserve top padding without affecting footer */}
      <div className="assistant-modal__top-spacer" aria-hidden />
      <div
        className="assistant-modal__header"
        style={contentVariant === 'popup' ? { paddingTop: 'var(--assistant-popup-top-pad, 16px)' } : undefined}
      >
        <div className="assistant-modal__titles">
          <div className="assistant-section__label">Preferences</div>
          <div className="assistant-modal__title">Personalize the assistant</div>
        </div>
        <button
          type="button"
          className="assistant-modal__close"
          onClick={onClose}
          aria-label="Close preferences"
        >
          ×
        </button>
      </div>

      <div className="assistant-modal__content">
        <div className="assistant-pref-form" data-variant={contentVariant}>
          <div className="assistant-pref-form__section assistant-pref-form__section--wide">
            <div className="assistant-pref-form__label">Topics to avoid</div>
            <TagInput
              tags={preferences.allergies?.tags || []}
              onAdd={(tag: string) => updateTags('allergies', tag)}
              onRemove={(tag: string) => removeTag('allergies', tag)}
              placeholder="politics, legal advice, medical..."
            />
            <textarea
              className="assistant-pref-textarea"
              placeholder="Notes on what to skip"
              value={preferences.allergies?.notes || ''}
              onChange={(e) => updateNotes('allergies', e.target.value)}
            />
          </div>

          <div className="assistant-pref-form__section assistant-pref-form__section--wide">
            <div className="assistant-pref-form__label">Focus areas</div>
            <TagInput
              tags={preferences.dietary?.tags || []}
              onAdd={(tag: string) => updateTags('dietary', tag)}
              onRemove={(tag: string) => removeTag('dietary', tag)}
              placeholder="productivity, design systems..."
            />
            <textarea
              className="assistant-pref-textarea"
              placeholder="Priorities for the assistant"
              value={preferences.dietary?.notes || ''}
              onChange={(e) => updateNotes('dietary', e.target.value)}
            />
          </div>

          <div className="assistant-pref-form__row">
            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Audience size</div>
              {/* Replace TagInput for servings with a numeric input bound to value */}
              <input
                type="number"
                className="assistant-pref-input"
                placeholder="Number of people"
                value={preferences.servings?.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === '' ? null : Number(raw);
                  onUpdatePreferences({
                    servings: {
                      ...(preferences.servings || {}),
                      value: Number.isNaN(parsed) ? null : parsed,
                    },
                  });
                }}
              />
              <textarea
                className="assistant-pref-textarea"
                placeholder="Who this is for (role, team size)"
                value={preferences.servings?.notes || ''}
                onChange={(e) =>
                  onUpdatePreferences({
                    servings: {
                      ...(preferences.servings || { value: null }),
                      notes: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Style cues</div>
              <TagInput
                tags={preferences.personalization?.tags || []}
                onAdd={(tag: string) => updateTags('personalization', tag)}
                onRemove={(tag: string) => removeTag('personalization', tag)}
                placeholder="concise, playful, persuasive..."
              />
              <textarea
                className="assistant-pref-textarea"
                placeholder="Style or voice notes"
                value={preferences.personalization?.notes || ''}
                onChange={(e) => updateNotes('personalization', e.target.value)}
              />
            </div>
          </div>

          <div className="assistant-pref-form__row assistant-pref-form__row--last">
            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Tone</div>
              <ChipRow
                options={toneOptions}
                value={preferences.tone}
                onSelect={handleToneSelect}
              />
              <textarea
                className="assistant-pref-textarea"
                placeholder="Tone notes (optional)"
                value={preferences.toneNotes || ''}
                onChange={(e) =>
                  handleToneNotesChange(e.target.value)
                }
              />
            </div>

            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Detail</div>
              <ChipRow
                options={detailOptions}
                value={preferences.detail}
                onSelect={handleDetailSelect}
              />
              <textarea
                className="assistant-pref-textarea"
                placeholder="Detail notes (optional)"
                value={preferences.detailNotes || ''}
                onChange={(e) =>
                  handleDetailNotesChange(e.target.value)
                }
              />
            </div>
          </div>
        </div>
        {renderFooterInside && (
          <PreferencesFooter onClose={onClose} showDivider={true} />
        )}
      </div>
    </>
  );
};

export const PreferencesFooter: React.FC<{ onClose: () => void; showDivider?: boolean }> = ({ onClose, showDivider = true }) => (
  <div className="assistant-modal__footer" role="group" aria-label="Preferences actions">
    {showDivider && <div className="assistant-footer-divider" aria-hidden />}
    <div className="assistant-modal__footer-content">
      <button type="button" className="done-btn" onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);
