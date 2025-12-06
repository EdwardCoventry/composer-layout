import React from 'react';
import type { AssistantImage, AssistantMode, AssistantPreferences, SendState } from '../types';
import { PreferencesControl } from './preferences/PreferencesControl';
import { PhotoPicker } from './PhotoPicker';
import { ComposeInputCard } from './ComposeInputCard';
import { AddMenu, type AddMenuVariant } from './add-menu/AddMenu';
import { PreferencesPopup } from './preferences/Popup';
import { PreferencesFullscreen } from './preferences/Fullscreen';

export type ComposerPanelProps = {
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

export const ComposerPanel: React.FC<ComposerPanelProps> = ({ mode, modes, text, images, preferences, sendState, error, isMobile, isEmbed = false, showImagesSection = false, onTextChange, onFilesSelected, onRemoveImage, onUpdatePreferences, onStart, onClearMode, onSelectMode }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const addButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const requiresText = mode?.requiresText ?? false;
  const requiresImages = mode?.requiresImages ?? false;
  const trimmedText = text.trim();
  const defaultRequiresSomeInput = !mode; // when no mode, require text OR image
  const disableStart =
    sendState === 'sending' ||
    (requiresText && !trimmedText) ||
    (requiresImages && images.length === 0) ||
    (defaultRequiresSomeInput && !trimmedText && images.length === 0);
  const placeholder = mode?.placeholder || 'Tell the assistant what you need.';

  const openUpload = React.useCallback(() => fileInputRef.current?.click(), []);
  const openCamera = React.useCallback(() => cameraInputRef.current?.click(), []);

  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addVariant: AddMenuVariant = React.useMemo(() => (isEmbed ? 'fullscreen' : isMobile ? 'sheet' : 'context'), [isEmbed, isMobile]);
  // Use fullscreen preferences on embed and mobile; popup on desktop
  const PrefShell = React.useMemo(() => ((isEmbed || isMobile) ? PreferencesFullscreen : PreferencesPopup), [isEmbed, isMobile]);
  const contentVariant = React.useMemo(() => ((isEmbed || isMobile) ? 'fullscreen' : 'popup'), [isEmbed, isMobile]);

  const handleAddAttachment = React.useCallback(() => setAddMenuOpen(true), []);
  const handleCloseAddMenu = React.useCallback(() => setAddMenuOpen(false), []);

  const handleUploadChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesSelected(e.target.files, 'upload');
    e.target.value = '';
  }, [onFilesSelected]);

  const handleCameraChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesSelected(e.target.files, 'camera');
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div className="assistant-composer" data-mobile={isMobile}>
      <div className="assistant-stack">
        <PreferencesControl preferences={preferences} onUpdatePreferences={onUpdatePreferences} Shell={PrefShell} contentVariant={contentVariant} isEmbed={isEmbed} />

        <PhotoPicker requiresImages={requiresImages} images={images} showWhenOptional={showImagesSection} openCamera={openCamera} openUpload={openUpload} onRemoveImage={onRemoveImage} />

        <ComposeInputCard mode={mode} text={text} placeholder={placeholder} sendState={sendState} error={error} disableStart={disableStart} isMobile={isMobile} addButtonRef={addButtonRef} onTextChange={onTextChange} onStart={onStart} onClearMode={onClearMode} onAddAttachment={handleAddAttachment} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUploadChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={handleCameraChange} />

      <AddMenu open={addMenuOpen} variant={addVariant} anchorRef={addButtonRef} modes={modes} onClose={handleCloseAddMenu} onSelectMode={onSelectMode} onPickCamera={openCamera} onPickGallery={openUpload} />
    </div>
  );
};
