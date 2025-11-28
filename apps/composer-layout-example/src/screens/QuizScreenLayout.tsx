import React from 'react';
import {
  LayoutFrame,
  type ComposerHeightMode,
  useViewportCategory,
  useKeyboardOptionsSync,
} from 'composer-layout';
import { ComposerWidget, ComposerSizingPreset } from '../components/ComposerWidget';
import { ContentWidget } from '../components/ContentWidget';
import { HeaderWidget } from '../components/HeaderWidget';
import { FooterWidget } from '../components/FooterWidget';

export const QuizScreenLayout: React.FC = () => {
  const { isMobile } = useViewportCategory();
  const [hasUserChosenPreset, setHasUserChosenPreset] = React.useState(false);
  const [sizingPreset, setSizingPreset] = React.useState<ComposerSizingPreset>(() => (isMobile ? 'auto' : 'vhFraction'));
  const [showComposerPanel, setShowComposerPanel] = React.useState(true);
  const keyboardThreshold = 150;

  React.useEffect(() => {
    if (!hasUserChosenPreset) {
      setSizingPreset(isMobile ? 'auto' : 'vhFraction');
    }
  }, [isMobile, hasUserChosenPreset]);

  const handleChangeSizingPreset = React.useCallback((p: ComposerSizingPreset) => {
    setHasUserChosenPreset(true);
    setSizingPreset(p);
  }, []);

  const [isGridOpen, setIsGridOpen] = React.useState(false);
  const closeGrid = React.useCallback(() => setIsGridOpen(false), []);

  const { prepareToOpenOptions } = useKeyboardOptionsSync({
    isOptionsOpen: isGridOpen,
    onRequestCloseOptions: closeGrid,
    keyboardThreshold
  });

  const effectivePreset: ComposerSizingPreset = React.useMemo(() => {
    if (isMobile && isGridOpen) return 'vhFraction';
    return sizingPreset;
  }, [isMobile, isGridOpen, sizingPreset]);

  const composerHeightMode: ComposerHeightMode | undefined = React.useMemo(() => {
    if (effectivePreset === 'auto') return { type: 'content', maxFraction: 0.6 };
    return { type: 'fraction', fraction: 0.5, minPx: 200 };
  }, [effectivePreset]);

  const gridMaxHeight = isMobile ? null : 'min(40vh, 320px)';

  const handleToggleGrid = React.useCallback(() => {
    setIsGridOpen((open) => {
      const next = !open;
      if (next) {
        prepareToOpenOptions();
      }
      return next;
    });
  }, [prepareToOpenOptions]);

  return (
    <LayoutFrame
      header={<HeaderWidget showComposerPanel={showComposerPanel} onToggleComposer={() => setShowComposerPanel((v) => !v)} />}
      contentPanel={<ContentWidget isMobile={isMobile} />}
      composerPanel={
        <ComposerWidget
          isMobile={isMobile}
          sizingPreset={sizingPreset}
          onChangeSizingPreset={handleChangeSizingPreset}
          isGridOpen={isGridOpen}
          onToggleGrid={handleToggleGrid}
          gridMaxHeight={gridMaxHeight}
        />
      }
      showComposerPanel={showComposerPanel}
      composerHeightMode={composerHeightMode}
      footer={<FooterWidget />}
      overlayPadContentPanel
      keyboardThreshold={keyboardThreshold}
    />
  );
};

