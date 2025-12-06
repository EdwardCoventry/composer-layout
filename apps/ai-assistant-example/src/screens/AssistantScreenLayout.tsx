import React from 'react';
import {type ComposerHeightMode, LayoutFrame, useViewportCategory} from 'composer-layout';
import {AssistantHeader} from '../components';
import {HeroPanel} from '../components';
import {ComposerPanel} from '../components';
import {ResultPanel} from '../components';
import {FooterNote} from '../components';
import {HistoryPanel} from '../components';
import {useAssistantExperience} from './useAssistantExperience';
import type {AssistantHistoryEntry} from '../components/types';
import {useToast} from 'ui/hooks/useToast';

type AssistantScreenLayoutProps = {
    onNavigate?: (path: string) => void;
};

export const AssistantScreenLayout: React.FC<AssistantScreenLayoutProps> = ({onNavigate}) => {
    const {isMobile} = useViewportCategory();
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
    const {toast, showToast} = useToast(2200);

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
            return {type: 'content', maxFraction: 0.72};
        }
        // Desktop: use a fixed fraction without allowAutoHeight to avoid hug-to-content behavior
        return {type: 'fraction', fraction: 0.48, minPx: 260};
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

    const contentBody = React.useMemo(() => (
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
                variant="fill"
            />
        )
    ), [stage, answer, selectedMode, preferences, images, text, handleRestart, modes, selectedModeKey, handleModeSelect, heroTitle, heroSubtitle]);

    const handleHomeClick = React.useCallback(() => {
        if (stage === 'answer') {
            handleRestart();
        } else if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            if (onNavigate) {
                onNavigate('/');
            }
        }
    }, [stage, handleRestart, onNavigate]);

    const handleTextChange = React.useCallback((value: string) => {
        setError('');
        setText(value);
    }, [setError, setText]);

    return (
        <LayoutFrame
            header={
                <AssistantHeader
                    historyOpen={historyOpen}
                    onToggleHistory={handleToggleHistory}
                    onShare={handleShare}
                    onHomeClick={handleHomeClick}
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
                    onTextChange={handleTextChange}
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
            footer={<FooterNote sendState={sendState} onNavigate={onNavigate}/>}
        />
    );
};
