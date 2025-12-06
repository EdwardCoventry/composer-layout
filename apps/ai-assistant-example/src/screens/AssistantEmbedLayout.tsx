import React from 'react';
import { useViewportCategory } from 'composer-layout';
import { HeroPanel, ModeTagsPanel, ResultPanel, PreferencesControl, PhotoPicker, ComposeInputCard, AddMenu } from '../components';
import { useAssistantExperience } from './useAssistantExperience';
import { PreferencesFullscreen } from '../components/composer/preferences/Fullscreen';
import { useWindowSize } from 'ui/hooks/useWindowSize';
import { computeEmbedLayout, calculateCollapsePlan } from './embedLayoutMetrics';
import type { EmbedLayout } from './embedLayoutMetrics';

type AssistantEmbedLayoutProps = {
  onNavigate?: (path: string) => void;
};

export const AssistantEmbedLayout: React.FC<AssistantEmbedLayoutProps> = () => {
  const { isMobile } = useViewportCategory();
  const {
    heroTitle,
    heroSubtitle,
    modes,
    selectedMode,
    selectedModeKey,
    text,
    images,
    preferences,
    stage,
    sendState,
    answer,
    error,
    handleModeSelect,
    handleFilesSelected,
    handleRemoveImage,
    handleStart,
    handleRestart,
    updatePreferences,
    setText,
    setError,
    clearMode
  } = useAssistantExperience();

  const { height: viewportHeight, width: viewportWidth } = useWindowSize({ width: 1200, height: 900 });

  // Compute layout tokens + measurements, including longestTagLabel locally
  const { tokens, measurements } = React.useMemo<EmbedLayout>(() => {
    const longestTagLabel = modes.reduce((max, mode) => Math.max(max, mode.tagLine.length), 0);
    return computeEmbedLayout({
      viewportHeight,
      viewportWidth,
      longestTagLabel,
      modeCount: modes.length,
      hasSelectedMode: Boolean(selectedMode),
      imagesCount: images.length,
    });
  }, [viewportHeight, viewportWidth, modes, selectedMode, images.length]);

  // CSS variables for embed layout
  const shellStyle = React.useMemo<React.CSSProperties>(() => {
    const vars: Record<string, string> = {
      '--assistant-embed-gap': `${tokens.embedGap}px`,
      '--assistant-card-padding': `${tokens.cardPaddingX}px`,
      '--assistant-card-padding-y': `${tokens.cardPaddingY}px`,
      '--assistant-card-gap': `${tokens.cardGap}px`,
      '--assistant-hero-gap': `${tokens.heroGap}px`,
      '--assistant-hero-title': `${tokens.heroTitleSize / 16}rem`,
      '--assistant-hero-subtitle': `${tokens.heroSubtitleSize / 16}rem`,
      '--assistant-tag-gap': `${tokens.tagGap}px`,
      '--assistant-photos-gap': `${tokens.photosGap}px`,
      '--assistant-input-button-height': `${tokens.inputButtonHeight}px`,
      '--assistant-input-gap': `${tokens.inputGap}px`,
    };
    return vars as unknown as React.CSSProperties;
  }, [tokens]);

  const requiresText = selectedMode?.requiresText ?? false;
  const requiresImages = selectedMode?.requiresImages ?? false;
  const photosActive = requiresImages || images.length > 0;
  const placeholder = selectedMode?.placeholder || 'Tell the assistant what you need.';
  const trimmedText = text.trim();
  const disableStart = sendState === 'sending' || (requiresText && !trimmedText) || (requiresImages && images.length === 0);

  const applyCollapse = stage !== 'answer';
  const collapsePlan = React.useMemo(
    () => calculateCollapsePlan(measurements, viewportHeight, applyCollapse, requiresImages || images.length > 0),
    [applyCollapse, measurements, viewportHeight, requiresImages, images.length]
  );

  const stackItemCount = React.useMemo(() => (
    stage === 'answer'
      ? 1
      : (collapsePlan.hideHeroCopy ? 0 : 1) +
        (collapsePlan.hideTags ? 0 : 1) +
        (collapsePlan.hidePreferences ? 0 : 1) +
        (collapsePlan.hidePhotos ? 0 : 1) +
        1 // composer always present
  ), [stage, collapsePlan]);
  const isSingleStackItem = stackItemCount === 1;

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  const openUpload = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openCamera = React.useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleTextChange = React.useCallback((value: string) => {
    setError('');
    setText(value);
  }, [setError, setText]);

  const addButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  const handleAddAttachment = React.useCallback(() => setAddMenuOpen(true), []);
  const handleCloseAddMenu = React.useCallback(() => setAddMenuOpen(false), []);
  const handleSelectModeAndClose = React.useCallback((modeKey: string) => {
    handleModeSelect(modeKey);
    setAddMenuOpen(false);
  }, [handleModeSelect]);
  const handlePickCameraAndClose = React.useCallback(() => {
    setAddMenuOpen(false);
    cameraInputRef.current?.click();
  }, []);
  const handlePickGalleryAndClose = React.useCallback(() => {
    setAddMenuOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleUploadChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesSelected(e.target.files, 'upload');
    e.target.value = '';
  }, [handleFilesSelected]);

  const handleCameraChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesSelected(e.target.files, 'camera');
    e.target.value = '';
  }, [handleFilesSelected]);

  const content = React.useMemo(() => (
    stage === 'answer' ? (
      <ResultPanel
        answer={answer}
        selectedMode={selectedMode}
        preferences={preferences}
        images={images}
        text={text}
        onRestart={handleRestart}
      />
    ) : (
      <>
        {!collapsePlan.hideHeroCopy && (
          <HeroPanel
            modes={modes}
            selectedModeKey={selectedModeKey}
            onSelectMode={handleModeSelect}
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
            hideModes
          />
        )}
        {!collapsePlan.hideTags && (
          <ModeTagsPanel
            modes={modes}
            selectedModeKey={selectedModeKey}
            onSelectMode={handleModeSelect}
          />
        )}
        {!collapsePlan.hidePreferences && (
          <PreferencesControl
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            Shell={PreferencesFullscreen}
            contentVariant="fullscreen"
            isEmbed
          />
        )}
        {photosActive && !collapsePlan.hidePhotos && (
          <PhotoPicker
            requiresImages={requiresImages}
            images={images}
            openCamera={openCamera}
            openUpload={openUpload}
            onRemoveImage={handleRemoveImage}
          />
        )}
        <ComposeInputCard
          mode={selectedMode}
          text={text}
          placeholder={placeholder}
          sendState={sendState}
          error={error}
          disableStart={disableStart}
          isMobile={isMobile}
          showInlinePhotos={isSingleStackItem && photosActive}
          photosCount={images.length}
          photosRequired={requiresImages}
          onPickCamera={openCamera}
          onPickGallery={openUpload}
          addButtonRef={addButtonRef}
          onTextChange={handleTextChange}
          onStart={handleStart}
          onClearMode={clearMode}
          onAddAttachment={handleAddAttachment}
        />
      </>
    )
  ), [stage, answer, selectedMode, preferences, images, text, handleRestart, collapsePlan, modes, selectedModeKey, handleModeSelect, heroTitle, heroSubtitle, photosActive, requiresImages, openCamera, openUpload, handleRemoveImage, sendState, error, disableStart, isMobile, isSingleStackItem, handleTextChange, handleStart, clearMode, handleAddAttachment, placeholder, updatePreferences]);

  return (
    <div className="assistant-embed-shell" data-single={isSingleStackItem ? 'true' : undefined} style={shellStyle}>
      <div className="assistant-embed-stack" data-single={isSingleStackItem ? 'true' : undefined}>
        {content}
      </div>
      <AddMenu
        open={addMenuOpen}
        variant="fullscreen"
        anchorRef={addButtonRef}
        modes={modes}
        onClose={handleCloseAddMenu}
        onSelectMode={handleSelectModeAndClose}
        onPickCamera={handlePickCameraAndClose}
        onPickGallery={handlePickGalleryAndClose}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleUploadChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={handleCameraChange}
      />
    </div>
  );
};
