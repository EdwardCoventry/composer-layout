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
  const keyboardThreshold = 150;

  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const closeOptions = React.useCallback(() => setIsOptionsOpen(false), []);

  const { prepareToOpenOptions, handleInputFocus } = useKeyboardOptionsSync({
    isOptionsOpen,
    onRequestCloseOptions: closeOptions,
    keyboardThreshold
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
      const next = !open;
      if (next) {
        prepareToOpenOptions();
      }
      return next;
    });
  }, [prepareToOpenOptions]);

  const toggleComposer = React.useCallback(() => setShowComposerPanel((v) => !v), []);

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
        />
      }
      showComposerPanel={showComposerPanel}
      composerHeightMode={composerHeightMode}
      footer={<FooterWidget sizingLabel={sizingLabel} />}
      overlayPadContentPanel
      keyboardThreshold={keyboardThreshold}
      hideComposerFooter={isMobile && isOptionsOpen}
    />
  );
};
