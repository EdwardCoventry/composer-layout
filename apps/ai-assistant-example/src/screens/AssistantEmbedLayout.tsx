import React from 'react';
import { useViewportCategory } from 'composer-layout';
import { HeroPanel, ModeTagsPanel } from '../components/HeroPanel';
import { ResultPanel } from '../components/ResultPanel';
import { PreferencesControl, PhotoPicker, ComposeInputCard, AddMenu } from '../components/ComposerPanel';
import { useAssistantExperience } from './useAssistantExperience';
import { PreferencesFullscreen } from '../components/composer/preferences/Fullscreen';

type CollapseFlags = { hideHeroCopy: boolean; hideTags: boolean; hidePreferences: boolean; hidePhotos: boolean };
type EmbedMeasurements = {
  stackGap: number;
  heroCopy: number;
  heroModes: number;
  preferences: number;
  photos: number;
  composer: number;
  shellPaddingTop: number;
  shellPaddingBottom: number;
};

type EmbedTokens = {
  embedGap: number;
  cardPaddingX: number;
  cardPaddingY: number;
  cardGap: number;
  heroGap: number;
  heroTitleSize: number;
  heroSubtitleSize: number;
  tagGap: number;
  photosGap: number;
  inputButtonHeight: number;
  inputGap: number;
};

type MeasurementInputs = {
  viewportHeight: number;
  viewportWidth: number;
  longestTagLabel: number;
  modeCount: number;
  hasSelectedMode: boolean;
  imagesCount?: number;
};

const ROOT_FONT_SIZE = 16;
const BORDER_WIDTH = 2;
const SPACE = { xxs: 4, xs: 6 };
const DEFAULT_LINE_HEIGHT = 1.2;
const HERO_TITLE_LINE_HEIGHT = 1.1;
const HERO_SUBTITLE_LINE_HEIGHT = 1.5;
const MODE_LABEL_FONT_SIZE = 14;
const MODE_LABEL_LINE_HEIGHT = 1.2;
const MODE_LABEL_AVG_CHAR_WIDTH = 0.52; // average width factor for 14px font
const MODE_LABEL_MIN_WIDTH = 64;
const MODE_EMOJI_SIZE = 16;
const MODE_ROW_MARGIN_FACTOR = 0.5;
const PREF_LABEL_FONT_SIZE = 12;
const PREF_SUMMARY_FONT_SIZE = 14;
const PREF_TEXT_GAP = 2;
const PREF_SUMMARY_MARGIN_TOP = 2;
const PREF_BUTTON_FONT_SIZE = ROOT_FONT_SIZE;
const PREF_BUTTON_PADDING_Y = 8;
const PHOTOS_ICON_SIZE = 18;
const PHOTOS_TITLE_FONT_SIZE = ROOT_FONT_SIZE;
const PHOTOS_REQUIRED_FONT_SIZE = 12;
const PHOTOS_ACTION_HEIGHT = 38;
const PHOTOS_HINT_FONT_SIZE = 14;
const PHOTOS_PREVIEW_MIN_WIDTH = 120;
const PHOTOS_PREVIEW_IMAGE_HEIGHT = 120;
const PHOTOS_PREVIEW_CAPTION_FONT_SIZE = 12;
const PHOTOS_PREVIEW_CAPTION_LINE_HEIGHT = 1.2;
const PHOTOS_PREVIEW_CAPTION_PADDING_Y = 6;
const MODE_TAG_PADDING_Y = 6;
const MODE_TAG_FONT_SIZE = ROOT_FONT_SIZE;
const COMPOSER_STATUS_HEIGHT = 18;
const STACK_STATUS_GAP_FACTOR = 0.6;

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const computeEmbedTokens = (viewportHeight: number, viewportWidth: number): EmbedTokens => {
  const scale = Math.max(14, viewportHeight * 0.018 + 8); // --assistant-embed-scale
  const growGap = Math.max(0, viewportHeight * 0.006); // --assistant-grow-gap & --assistant-grow-hero-gap
  const growCardPad = Math.max(0, viewportHeight * 0.022); // --assistant-grow-card-pad

  const embedGapBase = Math.max(6, scale * 0.65);
  const cardPaddingBase = scale * 1.1;
  const cardGapBase = scale * 0.75;

  const heroGapBase = Math.max(14, viewportWidth * 0.01 + 8);
  const heroTitleBase = Math.max(1.8 * ROOT_FONT_SIZE, viewportWidth * 0.022 + 1.2 * ROOT_FONT_SIZE);
  const heroSubtitleBase = Math.max(1 * ROOT_FONT_SIZE, viewportWidth * 0.008 + 0.85 * ROOT_FONT_SIZE);
  const tagGapBase = Math.max(10, viewportWidth * 0.01 + 6);

  return {
    embedGap: embedGapBase + growGap,
    cardPaddingX: cardPaddingBase,
    cardPaddingY: cardPaddingBase + growCardPad,
    cardGap: cardGapBase + growGap,
    heroGap: heroGapBase + growGap,
    heroTitleSize: heroTitleBase + Math.max(0, viewportHeight * 0.004), // --assistant-grow-hero-title
    heroSubtitleSize: heroSubtitleBase + Math.max(0, viewportHeight * 0.003), // --assistant-grow-hero-subtitle
    tagGap: tagGapBase + Math.max(0, viewportHeight * 0.003), // --assistant-grow-tag-gap
    photosGap: Math.max(12, viewportWidth * 0.008 + 8),
    inputButtonHeight: Math.max(44, viewportHeight * 0.012 + 40), // --assistant-input-button-height
    inputGap: Math.max(10, viewportHeight * 0.006 + 8) // --assistant-input-gap
  };
};

// Minimum heights are estimated with all dynamic content at their minimum sizes.
const calcHeroCopyHeight = (tokens: EmbedTokens) => {
  const titleHeight = tokens.heroTitleSize * HERO_TITLE_LINE_HEIGHT;
  const subtitleHeight = tokens.heroSubtitleSize * HERO_SUBTITLE_LINE_HEIGHT;
  return Math.round(titleHeight + tokens.heroGap + subtitleHeight + tokens.heroGap * 0.4);
};

const calcHeroModesHeight = (vw: number, longestTagLabel: number, modeCount: number, tokens: EmbedTokens) => {
  const chipPadY = clampNumber(vw * 0.006 + 7, 10, 14); // matches clamp() in CSS
  const chipPadX = clampNumber(vw * 0.008 + 10, 14, 18);
  const labelHeight = MODE_LABEL_FONT_SIZE * MODE_LABEL_LINE_HEIGHT;
  const chipHeight = chipPadY * 2 + Math.max(labelHeight, MODE_EMOJI_SIZE) + BORDER_WIDTH * 2;

  const estimatedLabelWidth = Math.max(
    MODE_LABEL_MIN_WIDTH,
    longestTagLabel * MODE_LABEL_FONT_SIZE * MODE_LABEL_AVG_CHAR_WIDTH
  );
  const chipWidth = chipPadX * 2 + BORDER_WIDTH * 2 + MODE_EMOJI_SIZE + SPACE.xs + estimatedLabelWidth;

  const containerWidth = Math.max(320, Math.min(1120, vw));
  const chipsPerRow = Math.max(1, Math.floor((containerWidth + tokens.tagGap) / (chipWidth + tokens.tagGap)));
  const heroRows = modeCount ? Math.ceil(modeCount / chipsPerRow) : 0;

  if (heroRows === 0) return 0;
  return Math.round(heroRows * chipHeight + Math.max(0, heroRows - 1) * tokens.tagGap + tokens.tagGap * MODE_ROW_MARGIN_FACTOR);
};

const calcPreferencesHeight = (tokens: EmbedTokens) => {
  const prefLabelHeight = PREF_LABEL_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const prefSummaryHeight = PREF_SUMMARY_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const prefTextBlock = prefLabelHeight + PREF_TEXT_GAP + PREF_SUMMARY_MARGIN_TOP + prefSummaryHeight;

  const prefButtonText = PREF_BUTTON_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const prefButtonHeight = prefButtonText + PREF_BUTTON_PADDING_Y * 2 + BORDER_WIDTH * 2;

  return Math.round(tokens.cardPaddingY * 2 + Math.max(prefTextBlock, prefButtonHeight));
};

const calcPhotosHeight = (tokens: EmbedTokens, imagesCount: number, viewportWidth: number) => {
  const titleHeight = PHOTOS_TITLE_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const requiredHeight = PHOTOS_REQUIRED_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const headHeight = Math.max(PHOTOS_ACTION_HEIGHT, titleHeight, requiredHeight, PHOTOS_ICON_SIZE);
  const hintHeight = PHOTOS_HINT_FONT_SIZE * DEFAULT_LINE_HEIGHT;

  let previewHeight = 0;
  if (imagesCount > 0) {
    const containerWidth = Math.max(240, Math.min(1120, viewportWidth - tokens.cardPaddingX * 2));
    const previewWidth = PHOTOS_PREVIEW_MIN_WIDTH;
    const columns = Math.max(1, Math.floor((containerWidth + tokens.photosGap) / (previewWidth + tokens.photosGap)));
    const rows = Math.ceil(imagesCount / columns);
    const captionHeight = PHOTOS_PREVIEW_CAPTION_FONT_SIZE * PHOTOS_PREVIEW_CAPTION_LINE_HEIGHT;
    const previewItemHeight =
      PHOTOS_PREVIEW_IMAGE_HEIGHT + captionHeight + PHOTOS_PREVIEW_CAPTION_PADDING_Y * 2 + BORDER_WIDTH * 2;
    previewHeight = rows * previewItemHeight + Math.max(0, rows - 1) * tokens.photosGap;
  }

  const gapAfterHint = previewHeight > 0 ? tokens.cardGap : 0;

  return Math.round(tokens.cardPaddingY * 2 + headHeight + tokens.cardGap + hintHeight + gapAfterHint + previewHeight);
};

const calcComposerHeight = (tokens: EmbedTokens, hasMode: boolean) => {
  const inputHeight = tokens.inputButtonHeight * 2 + tokens.inputGap; // --assistant-input-height
  const stackGap = tokens.cardGap * STACK_STATUS_GAP_FACTOR; // matches assistant-input-stack gap
  const stackHeight = inputHeight + stackGap + COMPOSER_STATUS_HEIGHT;

  const modeTagTextHeight = MODE_TAG_FONT_SIZE * DEFAULT_LINE_HEIGHT;
  const modeTagHeight = hasMode ? MODE_TAG_PADDING_Y * 2 + modeTagTextHeight + BORDER_WIDTH * 2 : 0;

  return Math.round(tokens.cardPaddingY * 2 + (modeTagHeight ? modeTagHeight + tokens.cardGap : 0) + stackHeight);
};

export const computeEmbedMeasurements = ({
  viewportHeight,
  viewportWidth,
  longestTagLabel,
  modeCount,
  hasSelectedMode,
  imagesCount = 0
}: MeasurementInputs): EmbedMeasurements => {
  const tokens = computeEmbedTokens(viewportHeight, viewportWidth);

  return {
    stackGap: tokens.embedGap,
    heroCopy: calcHeroCopyHeight(tokens),
    heroModes: calcHeroModesHeight(viewportWidth, longestTagLabel, modeCount, tokens),
    preferences: calcPreferencesHeight(tokens),
    photos: calcPhotosHeight(tokens, imagesCount, viewportWidth),
    composer: calcComposerHeight(tokens, hasSelectedMode),
    shellPaddingTop: 0,
    shellPaddingBottom: 0
  };
};

export const calculateMinHeight = (measurements: EmbedMeasurements, flags: CollapseFlags) => {
  const sections: number[] = [];
  if (!flags.hideHeroCopy) sections.push(measurements.heroCopy);
  if (!flags.hideTags) sections.push(measurements.heroModes);
  if (!flags.hidePreferences) sections.push(measurements.preferences);
  if (!flags.hidePhotos) sections.push(measurements.photos);
  sections.push(measurements.composer);

  const gaps = Math.max(0, sections.length - 1) * measurements.stackGap;
  const contentHeight = sections.reduce((sum, h) => sum + h, 0) + gaps;
  return contentHeight + measurements.shellPaddingTop + measurements.shellPaddingBottom;
};

export const calculateCollapsePlan = (
  measurements: EmbedMeasurements,
  viewportHeight: number,
  applyCollapse: boolean,
  photosActive: boolean = true
): CollapseFlags => {
  if (!applyCollapse) {
    return { hideHeroCopy: false, hideTags: false, hidePreferences: false, hidePhotos: !photosActive };
  }

  let plan: CollapseFlags = {
    hideHeroCopy: false,
    hideTags: false,
    hidePreferences: false,
    hidePhotos: !photosActive
  };
  const collapseOrder: (keyof CollapseFlags)[] = ['hideTags', 'hideHeroCopy', 'hidePreferences', 'hidePhotos'];

  if (calculateMinHeight(measurements, plan) <= viewportHeight) return plan;

  for (const key of collapseOrder) {
    plan = { ...plan, [key]: true };
    if (calculateMinHeight(measurements, plan) <= viewportHeight) break;
  }

  return plan;
};

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

  const [viewportHeight, setViewportHeight] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 900
  );
  const [viewportWidth, setViewportWidth] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const addButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const requiresText = selectedMode?.requiresText ?? false;
  const requiresImages = selectedMode?.requiresImages ?? false;
  const photosActive = requiresImages || images.length > 0;
  const placeholder = selectedMode?.placeholder || 'Tell the assistant what you need.';
  const trimmedText = text.trim();
  const disableStart = sendState === 'sending' || (requiresText && !trimmedText) || (requiresImages && images.length === 0);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  const openUpload = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openCamera = React.useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const longestTagLabel = React.useMemo(
    () => modes.reduce((max, mode) => Math.max(max, mode.tagLine.length), 0),
    [modes]
  );

  const measurements = React.useMemo<EmbedMeasurements>(() => {
    return computeEmbedMeasurements({
      viewportHeight,
      viewportWidth,
      longestTagLabel,
      modeCount: modes.length,
      hasSelectedMode: Boolean(selectedMode),
      imagesCount: images.length
    });
  }, [images.length, longestTagLabel, modes.length, selectedMode, viewportHeight, viewportWidth]);

  const applyCollapse = stage !== 'answer';
  const collapsePlan = React.useMemo(
    () => calculateCollapsePlan(measurements, viewportHeight, applyCollapse, photosActive),
    [applyCollapse, measurements, photosActive, viewportHeight]
  );

  const stackItemCount =
    stage === 'answer'
      ? 1
      : (collapsePlan.hideHeroCopy ? 0 : 1) +
        (collapsePlan.hideTags ? 0 : 1) +
        (collapsePlan.hidePreferences ? 0 : 1) +
        (collapsePlan.hidePhotos ? 0 : 1) +
        1; // composer always present
  const isSingleStackItem = stackItemCount === 1;

  const content =
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
            // variant='embed' is default, so no need to specify
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
          onTextChange={(value) => {
            setError('');
            setText(value);
          }}
          onStart={handleStart}
          onClearMode={clearMode}
          onAddAttachment={() => setAddMenuOpen(true)}
        />
      </>
    );

  return (
    <div className="assistant-embed-shell" data-single={isSingleStackItem ? 'true' : undefined}>
      <div className="assistant-embed-stack" data-single={isSingleStackItem ? 'true' : undefined}>
        {content}
      </div>
      <AddMenu
        open={addMenuOpen}
        variant="fullscreen"
        anchorRef={addButtonRef}
        modes={modes}
        onClose={() => setAddMenuOpen(false)}
        onSelectMode={(modeKey: string) => {
          handleModeSelect(modeKey);
          setAddMenuOpen(false);
        }}
        onPickCamera={() => {
          setAddMenuOpen(false);
          openCamera();
        }}
        onPickGallery={() => {
          setAddMenuOpen(false);
          openUpload();
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files, 'upload');
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
          if (e.target.files) handleFilesSelected(e.target.files, 'camera');
          e.target.value = '';
        }}
      />
    </div>
  );
};
