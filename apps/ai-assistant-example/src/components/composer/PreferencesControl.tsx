import React from 'react';
import type { AssistantPreferences } from '../types';
import { SliderIcon } from './icons';
import { TagInput } from './TagInput';
import { PreferencesModal } from './preferences/Modal';
import { PreferencesFullscreen } from './preferences/Fullscreen';

const preferencesSummary = (preferences: AssistantPreferences) => `Tone: ${preferences.tone} · Detail: ${preferences.detail}`;

export type PreferencesControlProps = {
  preferences: AssistantPreferences;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  isMobile?: boolean;
  isEmbed?: boolean;
};

const ChipRow: React.FC<{ options: { value: string; label: string }[]; value: string; onSelect: (value: string) => void; }> = ({ options, value, onSelect }) => (
  <div className="assistant-chip-row">
    {options.map((opt) => (
      <button key={opt.value} type="button" className="assistant-chip" data-active={value === opt.value} onClick={() => onSelect(opt.value)}>
        {opt.label}
      </button>
    ))}
  </div>
);

export const PreferencesControl: React.FC<PreferencesControlProps> = ({ preferences, onUpdatePreferences, isMobile = false, isEmbed = false }) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const variant: 'modal' | 'fullscreen' = isMobile || isEmbed ? 'fullscreen' : 'modal';
  const servingsInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!prefsOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPrefsOpen(false); };
    window.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = previousOverflow; };
  }, [prefsOpen]);

  const closePrefs = () => setPrefsOpen(false);

  const updateTags = (key: 'allergies' | 'dietary' | 'personalization', tag: string) => {
    const current = preferences[key]?.tags || [];
    if (current.includes(tag)) return;
    onUpdatePreferences({ [key]: { ...(preferences[key] || { notes: '' }), tags: [...current, tag] } });
  };

  const removeTag = (key: 'allergies' | 'dietary' | 'personalization', tag: string) => {
    const current = preferences[key]?.tags || [];
    onUpdatePreferences({ [key]: { ...(preferences[key] || { notes: '' }), tags: current.filter((t) => t !== tag) } });
  };

  const updateNotes = (key: 'allergies' | 'dietary' | 'personalization', notes: string) => {
    onUpdatePreferences({ [key]: { ...(preferences[key] || { tags: [] }), notes } });
  };

  const modalContent = (
    <>
      <div className="assistant-modal__header">
        <div className="assistant-modal__titles">
          <div className="assistant-section__label">Preferences</div>
          <div className="assistant-modal__title">Personalize the assistant</div>
        </div>
        <button type="button" className="assistant-modal__close" onClick={closePrefs} aria-label="Close preferences">×</button>
      </div>
      <div className="assistant-modal__content">
        <div className="assistant-pref-form" data-variant={variant}>
          <div className="assistant-pref-form__section assistant-pref-form__section--wide">
            <div className="assistant-pref-form__label">Topics to avoid</div>
            <TagInput tags={preferences.allergies?.tags || []} onAdd={(tag) => updateTags('allergies', tag)} onRemove={(tag) => removeTag('allergies', tag)} placeholder="politics, legal advice, medical..." />
            <textarea className="assistant-pref-textarea" placeholder="Notes on what to skip" value={preferences.allergies?.notes || ''} onChange={(e) => updateNotes('allergies', e.target.value)} />
          </div>

          <div className="assistant-pref-form__section assistant-pref-form__section--wide">
            <div className="assistant-pref-form__label">Focus areas</div>
            <TagInput tags={preferences.dietary?.tags || []} onAdd={(tag) => updateTags('dietary', tag)} onRemove={(tag) => removeTag('dietary', tag)} placeholder="productivity, design systems..." />
            <textarea className="assistant-pref-textarea" placeholder="Priorities for the assistant" value={preferences.dietary?.notes || ''} onChange={(e) => updateNotes('dietary', e.target.value)} />
          </div>

          <div className="assistant-pref-form__row">
            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Audience size</div>
              <div className="assistant-tag-row">
                <input ref={servingsInputRef} type="number" min={1} className="assistant-pref-input" placeholder="Number of people" value={preferences.servings?.value ?? ''} onChange={(e) => onUpdatePreferences({ servings: { ...(preferences.servings || { notes: '' }), value: e.target.value ? Number(e.target.value) : null } })} />
                <button type="button" className="assistant-tag-input__add" onClick={() => servingsInputRef.current?.focus()} aria-label="Edit servings">+ Add</button>
              </div>
              <textarea className="assistant-pref-textarea" placeholder="Who this is for (role, team size)" value={preferences.servings?.notes || ''} onChange={(e) => onUpdatePreferences({ servings: { ...(preferences.servings || { value: null }), notes: e.target.value } })} />
            </div>

            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Style cues</div>
              <TagInput tags={preferences.personalization?.tags || []} onAdd={(tag) => updateTags('personalization', tag)} onRemove={(tag) => removeTag('personalization', tag)} placeholder="concise, playful, persuasive..." />
              <textarea className="assistant-pref-textarea" placeholder="Style or voice notes" value={preferences.personalization?.notes || ''} onChange={(e) => updateNotes('personalization', e.target.value)} />
            </div>
          </div>

          <div className="assistant-pref-form__row assistant-pref-form__row--last">
            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Tone</div>
              <ChipRow options={[{ value: 'Friendly', label: 'Friendly' }, { value: 'Neutral', label: 'Neutral' }, { value: 'Direct', label: 'Direct' }]} value={preferences.tone} onSelect={(tone) => onUpdatePreferences({ tone: tone as AssistantPreferences['tone'] })} />
              <textarea className="assistant-pref-textarea" placeholder="Tone notes (optional)" value={preferences.toneNotes || ''} onChange={(e) => onUpdatePreferences({ toneNotes: e.target.value })} />
            </div>

            <div className="assistant-pref-form__section">
              <div className="assistant-pref-form__label">Detail</div>
              <ChipRow options={[{ value: 'Brief', label: 'Brief' }, { value: 'Balanced', label: 'Balanced' }, { value: 'Deep', label: 'Deep' }]} value={preferences.detail} onSelect={(detail) => onUpdatePreferences({ detail: detail as AssistantPreferences['detail'] })} />
              <textarea className="assistant-pref-textarea" placeholder="Detail notes (optional)" value={preferences.detailNotes || ''} onChange={(e) => onUpdatePreferences({ detailNotes: e.target.value })} />
            </div>
          </div>
        </div>
        {/* Moved divider & footer inside content container to align with content gutter */}
        <div className="assistant-modal__divider" aria-hidden />
        <div className="assistant-modal__footer">
          <button type="button" className="assistant-send-btn" onClick={closePrefs}>Done</button>
        </div>
      </div>
      {/* Remove external variant-specific divider/footer blocks; content now owns them */}
      {/* previously: fullscreen/modal conditional blocks with divider/footer here */}
    </>
  );

  const shell = variant === 'fullscreen'
    ? <PreferencesFullscreen content={modalContent} onClose={closePrefs} isEmbed={isEmbed} />
    : <PreferencesModal content={modalContent} onClose={closePrefs} isEmbed={isEmbed} />;

  return (
    <>
      <div className="assistant-pref-bar">
        <div className="assistant-pref-bar__text">
          <div className="assistant-pref-bar__label">Preferences</div>
          <div className="assistant-pref-bar__summary">{preferencesSummary(preferences)}</div>
        </div>
        <button type="button" className="assistant-pref-bar__edit" onClick={() => setPrefsOpen(true)}>
          <SliderIcon />
          Edit
        </button>
      </div>

      {prefsOpen && shell}
    </>
  );
};
