import React from 'react';
import { AssistantImage, AssistantMode, AssistantPreferences, SendState } from './types';

type PreferencesControlProps = {
  preferences: AssistantPreferences;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  isMobile?: boolean;
  isEmbed?: boolean;
};

type PhotoPickerProps = {
  requiresImages: boolean;
  allowsImages?: boolean;
  images: AssistantImage[];
  showWhenOptional?: boolean;
  openCamera: () => void;
  openUpload: () => void;
  onRemoveImage: (id: string) => void;
};

type ComposeInputCardProps = {
  mode: AssistantMode | null;
  text: string;
  placeholder: string;
  sendState: SendState;
  error: string;
  disableStart: boolean;
  isMobile: boolean;
  allowsImages: boolean;
  addButtonRef?: React.RefObject<HTMLButtonElement | null>;
  showInlinePhotos?: boolean;
  photosCount?: number;
  photosRequired?: boolean;
  onPickCamera?: () => void;
  onPickGallery?: () => void;
  onTextChange: (value: string) => void;
  onStart: () => void;
  onClearMode: () => void;
  onAddAttachment: () => void;
};

type ComposerPanelProps = {
  mode: AssistantMode | null;
  modes: AssistantMode[];
  text: string;
  images: AssistantImage[];
  preferences: AssistantPreferences;
  sendState: SendState;
  error: string;
  isMobile: boolean;
  isEmbed?: boolean;
  showImagesSection?: boolean;
  onTextChange: (value: string) => void;
  onFilesSelected: (files: FileList | File[], source: 'camera' | 'upload') => void;
  onRemoveImage: (id: string) => void;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  onStart: () => void;
  onClearMode: () => void;
  onSelectMode: (modeKey: string) => void;
};

type AddMenuVariant = 'context' | 'sheet' | 'fullscreen';

type AddMenuProps = {
  open: boolean;
  variant: AddMenuVariant;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  modes: AssistantMode[];
  onClose: () => void;
  onSelectMode: (modeKey: string) => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
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

const preferencesSummary = (preferences: AssistantPreferences) =>
  `Tone: ${preferences.tone} · Detail: ${preferences.detail}`;

type TagInputProps = {
  tags: string[];
  placeholder?: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

const TagInput: React.FC<TagInputProps> = ({ tags, placeholder, onAdd, onRemove }) => {
  const [input, setInput] = React.useState('');

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    onAdd(value);
    setInput('');
  };

  return (
    <div className="assistant-tag-input">
      <div className="assistant-tags">
        {tags.map((tag) => (
          <span key={tag} className="assistant-tag">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onRemove(tag)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="assistant-tag-row">
        <input
          className="assistant-tag-input__field"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button type="button" className="assistant-tag-input__add" onClick={handleAdd}>
          + Add
        </button>
      </div>
    </div>
  );
};

type SegmentedButtonsProps = {
  options: { value: string; label: string }[];
  value: string;
  onSelect: (value: string) => void;
};

const SegmentedButtons: React.FC<SegmentedButtonsProps> = ({ options, value, onSelect }) => (
  <div className="assistant-segmented">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className="assistant-segmented__btn"
        data-active={value === opt.value}
        onClick={() => onSelect(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ChipRow: React.FC<SegmentedButtonsProps> = ({ options, value, onSelect }) => (
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
);

export const PreferencesControl: React.FC<PreferencesControlProps> = ({
  preferences,
  onUpdatePreferences,
  isMobile = false,
  isEmbed = false
}) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const variant: 'modal' | 'fullscreen' = isMobile || isEmbed ? 'fullscreen' : 'modal';
  const servingsInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!prefsOpen) return undefined;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPrefsOpen(false);
    };

    window.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [prefsOpen]);

  const closePrefs = () => setPrefsOpen(false);

  const updateTags = (
    key: 'allergies' | 'dietary' | 'personalization',
    tag: string
  ) => {
    const current = preferences[key]?.tags || [];
    if (current.includes(tag)) return;
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { notes: '' }),
        tags: [...current, tag]
      }
    });
  };

  const removeTag = (key: 'allergies' | 'dietary' | 'personalization', tag: string) => {
    const current = preferences[key]?.tags || [];
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { notes: '' }),
        tags: current.filter((t) => t !== tag)
      }
    });
  };

  const updateNotes = (
    key: 'allergies' | 'dietary' | 'personalization',
    notes: string
  ) => {
    onUpdatePreferences({
      [key]: {
        ...(preferences[key] || { tags: [] }),
        notes
      }
    });
  };

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

      {prefsOpen && (
        <div
          className="assistant-modal"
          data-variant={variant}
          data-embed={isEmbed ? 'true' : 'false'}
          role="dialog"
          aria-label="Edit preferences"
        >
          <div className="assistant-modal__backdrop" onClick={closePrefs} />
          <div className="assistant-modal__body" data-variant={variant} data-embed={isEmbed ? 'true' : 'false'}>
            <div className="assistant-modal__header">
              <div className="assistant-modal__titles">
                <div className="assistant-section__label">Preferences</div>
                <div className="assistant-modal__title">Personalize the assistant</div>
              </div>
              <button
                type="button"
                className="assistant-modal__close"
                onClick={closePrefs}
                aria-label="Close preferences"
              >
                ×
              </button>
            </div>
            <div className="assistant-modal__content">
              <div className="assistant-pref-form" data-variant={variant}>
                <div className="assistant-pref-form__section assistant-pref-form__section--wide">
                  <div className="assistant-pref-form__label">Topics to avoid</div>
                  <TagInput
                    tags={preferences.allergies?.tags || []}
                    onAdd={(tag) => updateTags('allergies', tag)}
                    onRemove={(tag) => removeTag('allergies', tag)}
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
                    onAdd={(tag) => updateTags('dietary', tag)}
                    onRemove={(tag) => removeTag('dietary', tag)}
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
                    <div className="assistant-tag-row">
                      <input
                        ref={servingsInputRef}
                        type="number"
                        min={1}
                        className="assistant-pref-input"
                        placeholder="Number of people"
                        value={preferences.servings?.value ?? ''}
                        onChange={(e) =>
                          onUpdatePreferences({
                            servings: { ...(preferences.servings || { notes: '' }), value: e.target.value ? Number(e.target.value) : null }
                          })
                        }
                      />
                      <button
                        type="button"
                        className="assistant-tag-input__add"
                        onClick={() => servingsInputRef.current?.focus()}
                        aria-label="Edit servings"
                      >
                        + Add
                      </button>
                    </div>
                    <textarea
                      className="assistant-pref-textarea"
                      placeholder="Who this is for (role, team size)"
                      value={preferences.servings?.notes || ''}
                      onChange={(e) => onUpdatePreferences({ servings: { ...(preferences.servings || { value: null }), notes: e.target.value } })}
                    />
                  </div>

                  <div className="assistant-pref-form__section">
                    <div className="assistant-pref-form__label">Style cues</div>
                    <TagInput
                      tags={preferences.personalization?.tags || []}
                      onAdd={(tag) => updateTags('personalization', tag)}
                      onRemove={(tag) => removeTag('personalization', tag)}
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
                      options={[
                        { value: 'Friendly', label: 'Friendly' },
                        { value: 'Neutral', label: 'Neutral' },
                        { value: 'Direct', label: 'Direct' }
                      ]}
                      value={preferences.tone}
                      onSelect={(tone) => onUpdatePreferences({ tone: tone as AssistantPreferences['tone'] })}
                    />
                    <textarea
                      className="assistant-pref-textarea"
                      placeholder="Tone notes (optional)"
                      value={preferences.toneNotes || ''}
                      onChange={(e) => onUpdatePreferences({ toneNotes: e.target.value })}
                    />
                  </div>

                  <div className="assistant-pref-form__section">
                    <div className="assistant-pref-form__label">Detail</div>
                    <ChipRow
                      options={[
                        { value: 'Brief', label: 'Brief' },
                        { value: 'Balanced', label: 'Balanced' },
                        { value: 'Deep', label: 'Deep' }
                      ]}
                      value={preferences.detail}
                      onSelect={(detail) => onUpdatePreferences({ detail: detail as AssistantPreferences['detail'] })}
                    />
                    <textarea
                      className="assistant-pref-textarea"
                      placeholder="Detail notes (optional)"
                      value={preferences.detailNotes || ''}
                      onChange={(e) => onUpdatePreferences({ detailNotes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            {!isEmbed && (
              <>
                <div className="assistant-modal__divider" aria-hidden />
                <div className="assistant-modal__footer">
                  <button type="button" className="assistant-send-btn" onClick={closePrefs}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  requiresImages,
  allowsImages = true,
  images,
  showWhenOptional,
  openCamera,
  openUpload,
  onRemoveImage
}) => {
  const shouldShow = showWhenOptional || requiresImages || images.length > 0;
  if (!shouldShow || (!allowsImages && images.length === 0)) return null;

  return (
    <div className="assistant-photos-card">
      <div className="assistant-photos-card__head">
        <div className="assistant-photos-card__title">
          <CameraIcon />
          <span>Photos ({images.length})</span>
          {requiresImages && <span className="assistant-photos-card__required">Required</span>}
        </div>
        <div className="assistant-photos-card__actions">
          <button type="button" className="assistant-photos-card__action" onClick={openCamera} disabled={!allowsImages}>
            <CameraIcon />
            <span>Camera</span>
          </button>
          <button type="button" className="assistant-photos-card__action" onClick={openUpload} disabled={!allowsImages}>
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
  );
};

export const ComposeInputCard: React.FC<ComposeInputCardProps> = ({
  mode,
  text,
  placeholder,
  sendState,
  error,
  disableStart,
  isMobile,
  allowsImages,
  addButtonRef,
  showInlinePhotos = false,
  photosCount = 0,
  photosRequired = false,
  onPickCamera,
  onPickGallery,
  onTextChange,
  onStart,
  onClearMode,
  onAddAttachment
}) => {
  const isSending = sendState === 'sending';
  const buttonLabel = isSending ? 'Working...' : sendState === 'sent' ? 'Done' : 'Start';

  return (
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

      {showInlinePhotos ? (
        <div className="assistant-inline-photos">
          <div className="assistant-inline-photos__meta">
            <CameraIcon />
            <span className="assistant-inline-photos__label">Photos ({photosCount})</span>
            {photosRequired ? <span className="assistant-photos-card__required">Required</span> : null}
          </div>
          <div className="assistant-inline-photos__actions">
            <button
              type="button"
              className="assistant-photos-card__action assistant-inline-photos__action"
              onClick={onPickCamera}
              disabled={!allowsImages}
            >
              <CameraIcon />
              <span>Camera</span>
            </button>
            <button
              type="button"
              className="assistant-photos-card__action assistant-inline-photos__action"
              onClick={onPickGallery}
              disabled={!allowsImages}
            >
              <GalleryIcon />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="assistant-input-stack">
        <div className="assistant-input-row">
          <textarea
            className="assistant-input assistant-input--row"
            placeholder={placeholder}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={isSending}
            rows={isMobile ? 3 : 2}
          />
          <div className="assistant-input-buttons">
            <button
              type="button"
              className="assistant-plus-btn"
              aria-label="Add attachment or quick option"
              ref={addButtonRef}
              onClick={() => {
                if (!allowsImages) return;
                onAddAttachment();
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
        {error ? (
          <div className="assistant-input-status" data-state="error" aria-live="polite">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const AddMenu: React.FC<AddMenuProps> = ({
  open,
  variant,
  anchorRef,
  modes,
  onClose,
  onSelectMode,
  onPickCamera,
  onPickGallery
}) => {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const handleRef = React.useRef<HTMLDivElement | null>(null);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const [sheetHeightPx, setSheetHeightPx] = React.useState<number | null>(null);
  const [contextPlacement, setContextPlacement] = React.useState<{
    bottom: number;
    right: number;
    width: number;
    maxHeight: number;
  }>({
    bottom: 24,
    right: 16,
    width: 380,
    maxHeight: 520
  });

  React.useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  React.useLayoutEffect(() => {
    if (!open || variant !== 'sheet') {
      setSheetHeightPx(null);
      return undefined;
    }

    if (typeof window === 'undefined') return undefined;

    const measure = () => {
      const vh = window.innerHeight || 0;
      const minHeight = vh * 0.34;
      const maxHeight = vh * 0.88;
      const contentHeight = panelRef.current ? panelRef.current.scrollHeight : 0;
      const handleElement = handleRef.current;
      const handleRect = handleElement?.getBoundingClientRect();
      const handleStyles = handleElement ? window.getComputedStyle(handleElement) : null;
      const handleMargin =
        (handleStyles ? parseFloat(handleStyles.marginTop || '0') + parseFloat(handleStyles.marginBottom || '0') : 0) || 0;
      const handleHeight = (handleRect?.height || 0) + handleMargin;
      const sheetStyles = sheetRef.current ? window.getComputedStyle(sheetRef.current) : null;
      const borderTop = sheetStyles ? parseFloat(sheetStyles.borderTopWidth || '0') : 0;
      const borderBottom = sheetStyles ? parseFloat(sheetStyles.borderBottomWidth || '0') : 0;
      const totalNeeded = contentHeight + handleHeight + borderTop + borderBottom;
      const desired = Math.max(minHeight, Math.min(maxHeight, totalNeeded));
      setSheetHeightPx(desired);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, variant]);

  React.useEffect(() => {
    if (!open || variant !== 'context') {
      setContextPlacement((prev) => ({ ...prev, maxHeight: 0 }));
      return undefined;
    }

    const computePosition = () => {
      const anchorRect = anchorRef?.current?.getBoundingClientRect();
      const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
      const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;
      if (!viewportW || !viewportH) return;

      const gutter = 16;
      const targetWidth = Math.min(420, Math.max(340, viewportW * 0.42));
      const width = Math.min(targetWidth, viewportW - gutter * 2);
      const right = anchorRect ? Math.max(gutter, viewportW - anchorRect.right) : gutter;
      const verticalGap = 10;
      const bottom = anchorRect ? Math.max(gutter, viewportH - anchorRect.top + verticalGap) : 24;
      const maxHeight = Math.max(340, Math.min(640, viewportH - bottom - gutter));

      setContextPlacement({
        bottom,
        right,
        width,
        maxHeight
      });
    };

    const frame = window.requestAnimationFrame(computePosition);
    const handleRelayout = () => computePosition();

    window.addEventListener('resize', handleRelayout);
    window.addEventListener('scroll', handleRelayout, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleRelayout);
      window.removeEventListener('scroll', handleRelayout, true);
    };
  }, [open, variant, anchorRef]);

  if (!open) return null;

  const contentStyle: React.CSSProperties =
    variant === 'context'
      ? { maxHeight: contextPlacement.maxHeight || undefined, overflowY: 'auto' }
      : {};

  const primaryItems = [
    {
      key: 'camera',
      label: 'Take a photo',
      subLabel: 'Use your camera',
      icon: <CameraIcon />,
      action: () => {
        onPickCamera();
        onClose();
      }
    },
    {
      key: 'gallery',
      label: 'Choose from gallery',
      subLabel: 'Choose from files',
      icon: <GalleryIcon />,
      action: () => {
        onPickGallery();
        onClose();
      }
    }
  ];

  const quickModeItems = modes.map((m) => ({
    key: m.key,
    label: m.tagLine,
    subLabel: m.description || m.heroSubtitle,
    icon: m.emoji,
    action: () => {
      onSelectMode(m.key);
      onClose();
    }
  }));

  const visibleQuickModes = ['direct', 'plan', 'organize'];
  const filteredQuickModes = quickModeItems.filter((item) => visibleQuickModes.includes(item.key));

  const renderRow = (
    item: {
      key: string;
      label: string;
      subLabel?: string;
      icon: React.ReactNode;
      action: () => void;
    },
    kind: 'primary' | 'mode'
  ) => (
    <button
      key={item.key}
      type="button"
      className="assistant-add__row"
      data-kind={kind}
      onClick={item.action}
    >
      <span className="assistant-add__row-icon" aria-hidden>
        {item.icon}
      </span>
      <span className="assistant-add__row-text">
        <span className="assistant-add__row-title">{item.label}</span>
        {item.subLabel ? <span className="assistant-add__row-sub">{item.subLabel}</span> : null}
      </span>
    </button>
  );

  const content = (
    <div className="assistant-add__content" ref={panelRef} style={contentStyle}>
      <div className="assistant-add__list assistant-add__list--primary">
        {primaryItems.map((item) => renderRow(item, 'primary'))}
      </div>

      <div className="assistant-add__section">
        <div className="assistant-add__label">QUICK MODES</div>
        {variant === 'fullscreen' ? (
          <div className="assistant-add__quick-grid">
            {filteredQuickModes.map((item) => renderRow(item, 'mode'))}
          </div>
        ) : (
          <div className="assistant-add__list">
            {filteredQuickModes.map((item) => renderRow(item, 'mode'))}
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div
        className="assistant-add-overlay"
        data-variant="fullscreen"
        role="dialog"
        aria-label="Add to request"
        aria-modal="true"
      >
        <div className="assistant-add__fullscreen">
          <div className="assistant-add__fullscreen-header">
            <div className="assistant-add__fullscreen-titles">
              <div className="assistant-section__label">Add to request</div>
              <div className="assistant-add__fullscreen-title">Choose an option</div>
            </div>
            <button
              type="button"
              className="assistant-modal__close"
              onClick={onClose}
              aria-label="Close add options"
            >
              ×
            </button>
          </div>
          <div className="assistant-add__fullscreen-body">{content}</div>
        </div>
      </div>
    );
  }

  if (variant === 'sheet') {
    return (
      <div
        className="assistant-add-overlay"
        data-variant="sheet"
        role="dialog"
        aria-label="Add to request"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="assistant-add__sheet"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
          ref={sheetRef}
          style={{ height: sheetHeightPx ? `${sheetHeightPx}px` : undefined }}
        >
          <div ref={handleRef} className="assistant-add__handle" />
          <div className="assistant-add__body">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="assistant-add-overlay"
      data-variant="context"
      role="dialog"
      aria-label="Add to request"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="assistant-add__panel"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
        style={{
          bottom: `${contextPlacement.bottom}px`,
          right: `${contextPlacement.right}px`,
          width: `${contextPlacement.width}px`,
          maxHeight: contextPlacement.maxHeight || undefined
        }}
      >
        {content}
      </div>
    </div>
  );
};

export const ComposerPanel: React.FC<ComposerPanelProps> = ({
  mode,
  modes,
  text,
  images,
  preferences,
  sendState,
  error,
  isMobile,
  isEmbed = false,
  showImagesSection = false,
  onTextChange,
  onFilesSelected,
  onRemoveImage,
  onUpdatePreferences,
  onStart,
  onClearMode,
  onSelectMode
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const addButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const requiresText = mode?.requiresText ?? false;
  const requiresImages = mode?.requiresImages ?? false;
  const allowsImages = mode?.allowsImages ?? true;
  const trimmedText = text.trim();
  const disableStart = sendState === 'sending' || (requiresText && !trimmedText) || (requiresImages && images.length === 0);
  const placeholder = mode?.placeholder || 'Tell the assistant what you need.';

  const openUpload = () => {
    if (!allowsImages) return;
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    if (!allowsImages) return;
    cameraInputRef.current?.click();
  };

  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addVariant: AddMenuVariant = isEmbed ? 'fullscreen' : isMobile ? 'sheet' : 'context';

  return (
    <div className="assistant-composer" data-mobile={isMobile}>
      <div className="assistant-stack">
        <PreferencesControl
          preferences={preferences}
          onUpdatePreferences={onUpdatePreferences}
          isMobile={isMobile}
          isEmbed={isEmbed}
        />

        <PhotoPicker
          requiresImages={requiresImages}
          allowsImages={allowsImages}
          images={images}
          showWhenOptional={showImagesSection}
          openCamera={openCamera}
          openUpload={openUpload}
          onRemoveImage={onRemoveImage}
        />

        <ComposeInputCard
          mode={mode}
          text={text}
          placeholder={placeholder}
          sendState={sendState}
          error={error}
          disableStart={disableStart}
          isMobile={isMobile}
          allowsImages={allowsImages}
          addButtonRef={addButtonRef}
          onTextChange={onTextChange}
          onStart={onStart}
          onClearMode={onClearMode}
          onAddAttachment={() => setAddMenuOpen(true)}
        />
      </div>

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

      <AddMenu
        open={addMenuOpen}
        variant={addVariant}
        anchorRef={addButtonRef}
        modes={modes}
        onClose={() => setAddMenuOpen(false)}
        onSelectMode={onSelectMode}
        onPickCamera={openCamera}
        onPickGallery={openUpload}
      />
    </div>
  );
};
