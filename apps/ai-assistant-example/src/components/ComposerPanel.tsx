import React from 'react';
import { AssistantImage, AssistantMode, AssistantPreferences, SendState } from './types';

type ComposerPanelProps = {
  mode: AssistantMode | null;
  text: string;
  images: AssistantImage[];
  preferences: AssistantPreferences;
  sendState: SendState;
  error: string;
  isMobile: boolean;
  onTextChange: (value: string) => void;
  onFilesSelected: (files: FileList | File[], source: 'camera' | 'upload') => void;
  onRemoveImage: (id: string) => void;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  onStart: () => void;
  onClearMode: () => void;
};

const toneOptions: AssistantPreferences['tone'][] = ['Friendly', 'Neutral', 'Direct'];
const detailOptions: AssistantPreferences['detail'][] = ['Brief', 'Balanced', 'Deep'];

const SliderIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
    <path d="M4 7h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 7a2 2 0 1 1 4 0a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M6 17a2 2 0 1 1 4 0a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
    <path
      d="M7 7h2l1-2h4l1 2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
    <rect x="4" y="5" width="16" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="m7.5 15.5 3-3.5 3 4L16.5 13 19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="10" cy="9" r="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
    <path d="m5 12 14-7-4 14-2.5-4.5L8 10.5l11-5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ComposerPanel: React.FC<ComposerPanelProps> = ({
  mode,
  text,
  images,
  preferences,
  sendState,
  error,
  isMobile,
  onTextChange,
  onFilesSelected,
  onRemoveImage,
  onUpdatePreferences,
  onStart,
  onClearMode
}) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const requiresText = mode?.requiresText ?? false;
  const requiresImages = mode?.requiresImages ?? false;
  const allowsImages = mode?.allowsImages ?? true;
  const trimmedText = text.trim();
  const isSending = sendState === 'sending';
  const buttonLabel = isSending ? 'Working...' : sendState === 'sent' ? 'Done' : 'Start';
  const disableStart = isSending || (requiresText && !trimmedText) || (requiresImages && images.length === 0);
  const placeholder = mode?.placeholder || 'Tell the assistant what you need.';

  const preferencesSummary = `Tone: ${preferences.tone} · Detail: ${preferences.detail} · Sources: ${preferences.includeSources ? 'On' : 'Off'}`;

  const handleTextChange = (value: string) => {
    onTextChange(value);
  };

  return (
    <div className="assistant-composer" data-mobile={isMobile}>
      <div className="assistant-stack">
        <div className="assistant-pref-bar">
          <div className="assistant-pref-bar__text">
            <div className="assistant-pref-bar__label">Preferences</div>
            <div className="assistant-pref-bar__summary">{preferencesSummary}</div>
          </div>
          <button type="button" className="assistant-pref-bar__edit" onClick={() => setPrefsOpen(true)}>
            <SliderIcon />
            Edit
          </button>
        </div>

        {(requiresImages || images.length > 0) && (
          <div className="assistant-photos-card">
            <div className="assistant-photos-card__head">
              <div className="assistant-photos-card__title">
                <CameraIcon />
                <span>Photos ({images.length})</span>
                {requiresImages && <span className="assistant-photos-card__required">Required</span>}
              </div>
              <div className="assistant-photos-card__actions">
                <button type="button" className="assistant-photos-card__action" onClick={() => cameraInputRef.current?.click()}>
                  <CameraIcon />
                  <span>Camera</span>
                </button>
                <button type="button" className="assistant-photos-card__action" onClick={() => fileInputRef.current?.click()}>
                  <GalleryIcon />
                  <span>Gallery</span>
                </button>
              </div>
            </div>
            <div className="assistant-photos-card__hint">
              {requiresImages
                ? 'Add a photo for the assistant.'
                : images.length > 0
                  ? 'Attached photos will be sent with your request.'
                  : 'Optional — add a photo if it helps.'}
            </div>
            {images.length > 0 ? (
              <div className="assistant-upload__preview" aria-live="polite">
                {images.map((img) => (
                  <div key={img.id} className="assistant-upload__item">
                    <img src={img.url} alt={img.name || 'Selected'} />
                    <button
                      type="button"
                      className="assistant-upload__remove"
                      onClick={() => onRemoveImage(img.id)}
                      aria-label={`Remove ${img.name || 'image'}`}
                    >
                      ×
                    </button>
                    <span className="assistant-upload__caption">{img.name || img.source}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="assistant-compose-card">
          {mode ? (
            <div className="assistant-mode-tag">
              <span className="assistant-mode-tag__emoji" aria-hidden>
                {mode.emoji}
              </span>
              <span className="assistant-mode-tag__label">{mode.tagLine}</span>
              <button type="button" className="assistant-mode-tag__clear" onClick={onClearMode} aria-label="Clear selected mode">
                ×
              </button>
            </div>
          ) : null}

          <div className="assistant-input-stack">
            <div className="assistant-input-row">
              <textarea
                className="assistant-input assistant-input--row"
                placeholder={placeholder}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={isSending}
                rows={isMobile ? 3 : 2}
              />
              <div className="assistant-input-buttons">
                <button
                  type="button"
                  className="assistant-plus-btn"
                  aria-label="Add attachment or quick option"
                  onClick={() => {
                    if (!allowsImages) return;
                    fileInputRef.current?.click();
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  className="assistant-send-btn"
                  data-state={sendState}
                  onClick={onStart}
                  disabled={disableStart}
                >
                  <SendIcon />
                  {buttonLabel}
                </button>
              </div>
            </div>
            <div className="assistant-input-status" data-state={error ? 'error' : 'idle'} aria-live="polite">
              {error || '\u00A0'}
            </div>
          </div>
        </div>
      </div>

      {prefsOpen && (
        <div className="assistant-modal" role="dialog" aria-label="Edit preferences">
          <div className="assistant-modal__backdrop" onClick={() => setPrefsOpen(false)} />
          <div className="assistant-modal__body">
            <div className="assistant-modal__header">
              <div className="assistant-section__label">Preferences</div>
              <button
                type="button"
                className="assistant-modal__close"
                onClick={() => setPrefsOpen(false)}
                aria-label="Close preferences"
              >
                ×
              </button>
            </div>
            <div className="assistant-preferences">
              <div className="assistant-pref-group">
                <span className="assistant-pref-label">Tone</span>
                <div className="assistant-pref-chips">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className="assistant-pref-chip"
                      data-active={preferences.tone === tone}
                      onClick={() => onUpdatePreferences({ tone })}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              <div className="assistant-pref-group">
                <span className="assistant-pref-label">Detail</span>
                <div className="assistant-pref-chips">
                  {detailOptions.map((detail) => (
                    <button
                      key={detail}
                      type="button"
                      className="assistant-pref-chip"
                      data-active={preferences.detail === detail}
                      onClick={() => onUpdatePreferences({ detail })}
                    >
                      {detail}
                    </button>
                  ))}
                </div>
              </div>
              <label className="assistant-toggle">
                <input
                  type="checkbox"
                  checked={preferences.includeSources}
                  onChange={(e) => onUpdatePreferences({ includeSources: e.target.checked })}
                />
                <span>Show sources when possible</span>
              </label>
            </div>
            <div className="assistant-modal__footer">
              <button type="button" className="assistant-send-btn" onClick={() => setPrefsOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) onFilesSelected(e.target.files, 'upload');
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) onFilesSelected(e.target.files, 'camera');
          e.target.value = '';
        }}
      />
    </div>
  );
};
