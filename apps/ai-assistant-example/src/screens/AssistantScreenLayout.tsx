import React from 'react';
import { LayoutFrame, type ComposerHeightMode, useViewportCategory } from 'composer-layout';
import { AssistantHeader } from '../components/AssistantHeader';
import { HeroPanel } from '../components/HeroPanel';
import { ComposerPanel } from '../components/ComposerPanel';
import { ResultPanel } from '../components/ResultPanel';
import { FooterNote } from '../components/FooterNote';
import { HistoryPanel } from '../components/HistoryPanel';
import { useAssistantExperience } from './useAssistantExperience';
import type { AssistantHistoryEntry } from '../components/types';

type AssistantScreenLayoutProps = {
  onNavigate?: (path: string) => void;
};

export const AssistantScreenLayout: React.FC<AssistantScreenLayoutProps> = ({ onNavigate }) => {
  const { isMobile } = useViewportCategory();
  const {
    heroTitle,
    heroSubtitle,
    modes,
    historyItems,
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
    handleSelectHistoryEntry,
    updatePreferences,
    setText,
    setError,
    clearMode
  } = useAssistantExperience();
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [toast, setToast] = React.useState('');
  const toastTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!historyOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHistoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [historyOpen]);

  const composerHeightMode: ComposerHeightMode | undefined = React.useMemo(() => {
    if (isMobile) {
      return { type: 'content', maxFraction: 0.72 };
    }
    return { type: 'fraction', fraction: 0.48, minPx: 260 };
  }, [isMobile]);

  const handleCloseHistory = React.useCallback(() => {
    setHistoryOpen(false);
  }, []);

  const handleToggleHistory = React.useCallback(() => {
    if (historyOpen) {
      handleCloseHistory();
      return;
    }
    setHistoryOpen(true);
  }, [handleCloseHistory, historyOpen]);

  const showToast = React.useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 2200);
  }, []);

  const handleShare = React.useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const shareData: ShareData = {
      title: 'AI Assistant',
      text: 'Try this AI assistant',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url ?? '');
        showToast('Link copied');
        return;
      } catch {
        showToast('Copy not available');
        return;
      }
    }

    showToast('Copy not available');
  }, [showToast]);

  const handleHistorySelection = React.useCallback(
    (entry: AssistantHistoryEntry) => {
      handleCloseHistory();
      handleSelectHistoryEntry(entry);
    },
    [handleCloseHistory, handleSelectHistoryEntry]
  );

  const contentBody =
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
      <HeroPanel
        modes={modes}
        selectedModeKey={selectedModeKey}
        onSelectMode={handleModeSelect}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
      />
    );

  return (
    <LayoutFrame
      header={
        <AssistantHeader
          historyOpen={historyOpen}
          onToggleHistory={handleToggleHistory}
          onShare={handleShare}
        />
      }
      contentPanel={
        <div className="assistant-content-shell">
          <div className="assistant-content">
            {contentBody}
          </div>
          {toast && <div className="assistant-toast">{toast}</div>}
          <HistoryPanel
            open={historyOpen}
            items={historyItems}
            onClose={handleCloseHistory}
            onSelect={handleHistorySelection}
          />
        </div>
      }
      composerPanel={
        <ComposerPanel
          mode={selectedMode}
          modes={modes}
          text={text}
          images={images}
          preferences={preferences}
          sendState={sendState}
          error={error}
          isMobile={isMobile}
          isEmbed={false}
          onTextChange={(value) => {
            setError('');
            setText(value);
          }}
          onFilesSelected={handleFilesSelected}
          onRemoveImage={handleRemoveImage}
          onUpdatePreferences={updatePreferences}
          onStart={handleStart}
          onClearMode={clearMode}
          onSelectMode={handleModeSelect}
        />
      }
      showComposerPanel={stage === 'compose'}
      composerHeightMode={composerHeightMode}
      overlayPadContentPanel
      footer={<FooterNote sendState={sendState} onNavigate={onNavigate} />}
    />
  );
};
