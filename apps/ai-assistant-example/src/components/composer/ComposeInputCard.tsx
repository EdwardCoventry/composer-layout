import React from 'react';
import type { AssistantMode, SendState } from '../types';
import { CameraIcon, GalleryIcon, SendIcon } from './icons';

type ComposeInputCardProps = {
  mode: AssistantMode | null;
  text: string;
  placeholder: string;
  sendState: SendState;
  error: string;
  disableStart: boolean;
  isMobile: boolean;
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

// Inline tick icon for 'sent' state
const TickIcon: React.FC = React.memo(() => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden focusable="false">
    <circle cx="10" cy="10" r="10" fill="currentColor" />
    <path d="M6 10.5L9 13.5L14 8.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
));
TickIcon.displayName = 'TickIcon';

export const ComposeInputCard: React.FC<ComposeInputCardProps> = ({ mode, text, placeholder, sendState, error, disableStart, isMobile, addButtonRef, showInlinePhotos = false, photosCount = 0, photosRequired = false, onPickCamera, onPickGallery, onTextChange, onStart, onClearMode, onAddAttachment }) => {
  const isSending = sendState === 'sending';
  const isSent = sendState === 'sent';
  const buttonLabel = React.useMemo(() => (isSending ? 'Working...' : isSent ? 'Sent' : 'Start'), [isSending, isSent]);

  const handleTextareaChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  }, [onTextChange]);

  const handleTextareaKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disableStart && !isSending) {
        onStart();
      }
    }
  }, [disableStart, isSending, onStart]);

  const handleAddAttachment = React.useCallback(() => {
    onAddAttachment();
  }, [onAddAttachment]);

  const handleSendClick = React.useCallback(() => {
    onStart();
  }, [onStart]);

  const handleClearMode = React.useCallback(() => {
    onClearMode();
  }, [onClearMode]);

  const handlePickCamera = React.useCallback(() => {
    onPickCamera?.();
  }, [onPickCamera]);

  const handlePickGallery = React.useCallback(() => {
    onPickGallery?.();
  }, [onPickGallery]);

  return (
    <div className="assistant-compose-card">
      {mode ? (
        <div className="assistant-mode-tag">
          <span className="assistant-mode-tag__emoji" aria-hidden>{mode.emoji}</span>
          <span className="assistant-mode-tag__label">{mode.tagLine}</span>
          <button type="button" className="assistant-mode-tag__clear" onClick={handleClearMode} aria-label="Clear selected mode">×</button>
        </div>
      ) : null}

      {showInlinePhotos ? (
        <div className="assistant-inline-photos">
          <div className="assistant-inline-photos__meta">
            <CameraIcon />
            <span className="assistant-inline-photos__label">Photos <span className="assistant-photos-card__badge">{photosCount}</span></span>
            {photosRequired && photosCount === 0 ? (<span className="assistant-photos-card__required">Required</span>) : null}
          </div>
          <div className="assistant-inline-photos__actions">
            <button type="button" className="assistant-photos-card__action assistant-inline-photos__action" onClick={handlePickCamera} disabled={false}>
              <CameraIcon />
              <span>Camera</span>
            </button>
            <button type="button" className="assistant-photos-card__action assistant-inline-photos__action" onClick={handlePickGallery} disabled={false}>
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
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            disabled={isSending}
            rows={isMobile ? 3 : 2}
            enterKeyHint="send"
          />
          <div className="assistant-input-buttons">
            <button type="button" className="assistant-plus-btn" aria-label="Add attachment or quick option" ref={addButtonRef} onClick={handleAddAttachment}>+</button>
            <button type="button" className="assistant-send-btn" data-state={sendState} onClick={handleSendClick} disabled={disableStart}>
              {isSent ? <TickIcon /> : <SendIcon />}
              {buttonLabel}
            </button>
          </div>
        </div>
        {error ? (<div className="assistant-input-status" data-state="error" aria-live="polite">{error}</div>) : null}
      </div>
    </div>
  );
};
