import React from 'react';
import type { AssistantImage } from '../types';
import { CameraIcon, GalleryIcon } from './icons';

type PhotoPickerProps = {
  requiresImages: boolean;
  images: AssistantImage[];
  showWhenOptional?: boolean;
  openCamera: () => void;
  openUpload: () => void;
  onRemoveImage: (id: string) => void;
};

export const PhotoPicker: React.FC<PhotoPickerProps> = ({ requiresImages, images, showWhenOptional, openCamera, openUpload, onRemoveImage }) => {
  const shouldShow = React.useMemo(() => showWhenOptional || requiresImages || images.length > 0, [showWhenOptional, requiresImages, images.length]);
  const hintText = React.useMemo(() => {
    if (requiresImages) return 'Add a photo for the assistant.';
    if (images.length > 0) return 'Attached photos will be sent with your request.';
    return 'Optional — add a photo if it helps.';
  }, [requiresImages, images.length]);

  const handleRemove = React.useCallback((id: string) => {
    onRemoveImage(id);
  }, [onRemoveImage]);

  const handleCamera = React.useCallback(() => {
    openCamera();
  }, [openCamera]);

  const handleUpload = React.useCallback(() => {
    openUpload();
  }, [openUpload]);

  if (!shouldShow) return null;

  return (
    <div className="assistant-photos-card">
      <div className="assistant-photos-card__head">
        <div className="assistant-photos-card__title">
          <CameraIcon />
          <span className="assistant-photos-card__label">
            Photos <span className="assistant-photos-card__badge">{images.length}</span>
          </span>
          {requiresImages && images.length === 0 ? (
            <span className="assistant-photos-card__required">Required</span>
          ) : null}
        </div>
        <div className="assistant-photos-card__actions">
          <button type="button" className="assistant-photos-card__action" onClick={handleCamera}>
            <CameraIcon />
            <span>Camera</span>
          </button>
          <button type="button" className="assistant-photos-card__action" onClick={handleUpload}>
            <GalleryIcon />
            <span>Gallery</span>
          </button>
        </div>
      </div>
      <div className="assistant-photos-card__hint">
        {hintText}
      </div>
      {images.length > 0 ? (
        <div className="assistant-upload__preview" aria-live="polite">
          {images.map((img) => (
            <div key={img.id} className="assistant-upload__item">
              <img src={img.url} alt={img.name || 'Selected'} />
              <button type="button" className="assistant-upload__remove" onClick={() => handleRemove(img.id)} aria-label={`Remove ${img.name || 'image'}`}>
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
