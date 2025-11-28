import React from 'react';
import { LayoutFrame } from '../components/LayoutFrame';
import { ComposerHeightMode } from '../types/layout';
import { useViewportCategory } from '../hooks/useViewportCategory';
import { ComposerWidget, ComposerSizingPreset } from '../components/ComposerWidget';
import { ContentWidget } from '../components/ContentWidget';

export const QuizScreenLayout: React.FC = () => {
  const { isMobile } = useViewportCategory();

  // Track if the user has explicitly changed the preset
  const [hasUserChosenPreset, setHasUserChosenPreset] = React.useState(false);

  // User choice (initialized from platform default)
  const [sizingPreset, setSizingPreset] = React.useState<ComposerSizingPreset>(() => (isMobile ? 'auto' : 'vhFraction'));

  // Optional: if platform changes and user hasn't picked, reset to platform default
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

  // Effective preset: grid forces vhFraction on mobile; otherwise user preset
  const effectivePreset: ComposerSizingPreset = React.useMemo(() => {
    if (isMobile && isGridOpen) return 'vhFraction';
    return sizingPreset;
  }, [isMobile, isGridOpen, sizingPreset]);

  // Derive composer height mode from the effective preset
  const composerHeightMode: ComposerHeightMode | undefined = React.useMemo(() => {
    if (effectivePreset === 'auto') return { type: 'content', maxFraction: 0.6 };
    return { type: 'fraction', fraction: 0.5, minPx: 200 };
  }, [effectivePreset]);

  // Compute an optional grid max height cap (null on mobile)
  const gridMaxHeight = isMobile ? null : 'min(40vh, 320px)';

  return (
    <LayoutFrame
      header={<div>Header (fixed)</div>}
      contentPanel={<ContentWidget isMobile={isMobile} />}
      composerPanel={
        <ComposerWidget
          isMobile={isMobile}
          sizingPreset={sizingPreset}
          onChangeSizingPreset={handleChangeSizingPreset}
          isGridOpen={isGridOpen}
          onToggleGrid={() => setIsGridOpen((v) => !v)}
          gridMaxHeight={gridMaxHeight}
        />
      }
      showComposerPanel={true}
      composerHeightMode={composerHeightMode}
      footer={<div>Footer</div>}
      overlayPadContentPanel
    />
  );
};
