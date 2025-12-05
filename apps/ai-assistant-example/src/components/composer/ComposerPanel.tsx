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

  const openUpload = () => fileInputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addVariant: AddMenuVariant = isEmbed ? 'fullscreen' : isMobile ? 'sheet' : 'context';
  // Use fullscreen preferences on embed and mobile; popup on desktop
  const PrefShell = (isEmbed || isMobile) ? PreferencesFullscreen : PreferencesPopup;
  const contentVariant = (isEmbed || isMobile) ? 'fullscreen' : 'popup';

  return (
    <div className="assistant-composer" data-mobile={isMobile}>
      <div className="assistant-stack">
        <PreferencesControl preferences={preferences} onUpdatePreferences={onUpdatePreferences} Shell={PrefShell} contentVariant={contentVariant} isEmbed={isEmbed} />

        <PhotoPicker requiresImages={requiresImages} images={images} showWhenOptional={showImagesSection} openCamera={openCamera} openUpload={openUpload} onRemoveImage={onRemoveImage} />

        <ComposeInputCard mode={mode} text={text} placeholder={placeholder} sendState={sendState} error={error} disableStart={disableStart} isMobile={isMobile} addButtonRef={addButtonRef} onTextChange={onTextChange} onStart={onStart} onClearMode={onClearMode} onAddAttachment={() => setAddMenuOpen(true)} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files) onFilesSelected(e.target.files, 'upload'); e.target.value = ''; }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files) onFilesSelected(e.target.files, 'camera'); e.target.value = ''; }} />

      <AddMenu open={addMenuOpen} variant={addVariant} anchorRef={addButtonRef} modes={modes} onClose={() => setAddMenuOpen(false)} onSelectMode={onSelectMode} onPickCamera={openCamera} onPickGallery={openUpload} />
    </div>
  );
};
