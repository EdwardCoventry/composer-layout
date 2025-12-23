import React from 'react';
import {
  LayoutFrame,
  type ComposerHeightMode,
  useViewportCategory,
  useKeyboardOptionsSync,
} from 'composer-layout';
import { ComposerWidget } from '../components/ComposerWidget';
import { ContentWidget } from '../components/ContentWidget';
import { HeaderWidget } from '../components/HeaderWidget';
import { FooterWidget } from '../components/FooterWidget';

export const QuizScreenLayout: React.FC = () => {
  const { isMobile } = useViewportCategory();
  const [showComposerPanel, setShowComposerPanel] = React.useState(true);

  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [footerHidden, setFooterHidden] = React.useState(false);
  const closeOptions = React.useCallback(() => setIsOptionsOpen(false), []);

  const { keyboardOpen, prepareToOpenOptions, handleInputFocus, dismissKeyboard } = useKeyboardOptionsSync({
    isOptionsOpen,
    onRequestCloseOptions: closeOptions
  });

  const mobileComposerMaxFraction = React.useMemo(() => (isMobile && isOptionsOpen ? 0.75 : 0.6), [isMobile, isOptionsOpen]);

  const composerHeightMode: ComposerHeightMode | undefined = React.useMemo(() => {
    if (isMobile) return { type: 'content', maxFraction: mobileComposerMaxFraction };
    return { type: 'fraction', fraction: 0.5, minPx: 200 };
  }, [isMobile, mobileComposerMaxFraction]);

  const sizingLabel = React.useMemo(() => (isMobile ? 'Sizing: Auto (content)' : 'Sizing: Viewport fraction'), [isMobile]);
  const optionsMaxHeight = React.useMemo(() => (isMobile ? 'none' : 'min(70vh, 420px)'), [isMobile]);

  const handleToggleOptions = React.useCallback(() => {
    setIsOptionsOpen((open) => {
      if (open) return false;
      // On mobile, force blur so options stay open even if keyboard is minimized.
      if (isMobile) {
        dismissKeyboard();
      }
      // Also run standard keyboard/options sync behavior
      prepareToOpenOptions();
      return true;
    });
  }, [isMobile, dismissKeyboard, prepareToOpenOptions]);

  const toggleComposer = React.useCallback(() => setShowComposerPanel((v) => !v), []);

  React.useEffect(() => {
    setFooterHidden(keyboardOpen);
  }, [keyboardOpen]);

  const handleInputFocusChange = React.useCallback((focused: boolean) => {
    setFooterHidden(focused);
  }, []);

  return (
    <LayoutFrame
      header={<HeaderWidget showComposerPanel={showComposerPanel} onToggleComposer={toggleComposer} />}
      contentPanel={<ContentWidget isMobile={isMobile} />}
      composerPanel={
        <ComposerWidget
          isMobile={isMobile}
          isOptionsOpen={isOptionsOpen}
          onToggleOptions={handleToggleOptions}
          optionsMaxHeight={optionsMaxHeight}
          onInputFocus={handleInputFocus}
          onInputFocusChange={handleInputFocusChange}
        />
      }
      showComposerPanel={showComposerPanel}
      composerHeightMode={composerHeightMode}
      footer={<FooterWidget sizingLabel={sizingLabel} />}
      overlayPadContentPanel
      hideComposerFooter={isMobile && (isOptionsOpen || footerHidden)}
      lockComposerPosition={isMobile}
    />
  );
};
