import React from 'react';
import { LayoutFrame, type ComposerHeightMode, useViewportCategory } from 'composer-layout';
import { AssistantHeader } from '../components/AssistantHeader';
import { HeroPanel } from '../components/HeroPanel';
import { ComposerPanel } from '../components/ComposerPanel';
import { ResultPanel } from '../components/ResultPanel';
import { FooterNote } from '../components/FooterNote';
import { HistoryPanel } from '../components/HistoryPanel';
import type { AssistantAnswer, AssistantHistoryEntry, AssistantImage, AssistantMode, AssistantPreferences, SendState } from '../components/types';

const DEFAULT_HERO = {
  title: 'What shall we make?',
  subtitle: 'Type your request or choose a starting point.'
};

const ASSISTANT_MODES: AssistantMode[] = [
  {
    key: 'direct',
    label: 'Quick answer',
    emoji: '💡',
    tagLine: 'Ask me anything',
    heroTitle: 'What can I help with?',
    heroSubtitle: 'Type your request or choose a starting point.',
    placeholder: 'Draft an email asking for a deadline extension...',
    requiresText: true,
    requiresImages: false,
    allowsImages: true,
    description: 'Fast text-first question or task.'
  },
  {
    key: 'plan',
    label: 'Planner',
    emoji: '🧭',
    tagLine: 'Plan it out',
    heroTitle: 'Need an outline or plan?',
    heroSubtitle: 'Share a goal and constraints; we will build a quick plan.',
    placeholder: 'Plan a 30 minute workshop about accessibility...',
    requiresText: true,
    requiresImages: false,
    allowsImages: false,
    description: 'Creates a short plan or outline from your notes.'
  },
  {
    key: 'brainstorm',
    label: 'Brainstorm',
    emoji: '✨',
    tagLine: 'Brainstorm ideas',
    heroTitle: 'Need some quick ideas?',
    heroSubtitle: 'Share a goal and we will riff on directions.',
    placeholder: 'Brainstorm 5 taglines for a spring launch...',
    requiresText: false,
    requiresImages: false,
    allowsImages: true,
    description: 'Rapid-fire idea starter.'
  },
  {
    key: 'rewrite',
    label: 'Rewrite',
    emoji: '✍️',
    tagLine: 'Rewrite text',
    heroTitle: 'Tidy up your draft.',
    heroSubtitle: 'Paste text and we will rewrite it with a new tone.',
    placeholder: 'Rewrite this paragraph to be concise...',
    requiresText: true,
    requiresImages: false,
    allowsImages: true,
    description: 'Rephrase or tighten copy.'
  },
  {
    key: 'organize',
    label: 'Organize info',
    emoji: '🗂️',
    tagLine: 'Organize details',
    heroTitle: 'Turn messy notes into something usable.',
    heroSubtitle: 'Paste bullet points or disjoint notes; the assistant will tidy them.',
    placeholder: 'Organize these meeting notes into action items...',
    requiresText: true,
    requiresImages: false,
    allowsImages: true,
    description: 'Organizes pasted snippets into a clearer shape.'
  },
  {
    key: 'vision',
    label: 'Snapshot insight',
    emoji: '📷',
    tagLine: 'Use a photo',
    heroTitle: 'Show me what you see.',
    heroSubtitle: 'Upload or snap a photo and add any guidance.',
    placeholder: 'Check this whiteboard sketch for missing steps...',
    requiresText: false,
    requiresImages: true,
    allowsImages: true,
    description: 'Requires an image; pairs it with optional guidance.'
  },
  {
    key: 'random',
    label: 'Surprise me',
    emoji: '🎲',
    tagLine: 'Surprise me',
    heroTitle: 'Want a random prompt?',
    heroSubtitle: 'We will improvise a prompt if you do not add one.',
    placeholder: 'Invent a creative writing challenge for the weekend...',
    requiresText: false,
    requiresImages: false,
    allowsImages: false,
    description: 'No required input; sends a playful starter.'
  }
];

const ASSISTANT_HISTORY_ENTRIES: AssistantHistoryEntry[] = [
  {
    id: 'hist-05',
    title: 'Plan a 30 minute workshop about accessibility',
    prompt: 'Plan a 30 minute workshop about accessibility',
    modeKey: 'plan',
    timestamp: '1 Dec, 13:49',
    typeLabel: 'Plan it out · Text',
    groupLabel: 'Today'
  },
  {
    id: 'hist-04',
    title: 'Brainstorm 5 taglines for a spring launch',
    prompt: 'Brainstorm 5 taglines for a spring launch',
    modeKey: 'brainstorm',
    timestamp: '30 Nov, 19:14',
    typeLabel: 'Brainstorm · Text-only',
    groupLabel: 'Yesterday'
  },
  {
    id: 'hist-03',
    title: 'Rewrite this paragraph to be concise',
    prompt: 'Rewrite this paragraph to be concise',
    modeKey: 'rewrite',
    timestamp: '30 Nov, 14:32',
    typeLabel: 'Rewrite · Text',
    groupLabel: 'Yesterday'
  },
  {
    id: 'hist-02',
    title: 'Organize these meeting notes into action items',
    prompt: 'Organize these meeting notes into action items',
    modeKey: 'organize',
    timestamp: '29 Nov, 21:08',
    typeLabel: 'Organize info',
    groupLabel: 'Earlier this week'
  },
  {
    id: 'hist-01',
    title: 'Upload a photo of a sketch and outline next steps',
    prompt: 'Upload a photo of a sketch and outline next steps',
    modeKey: 'vision',
    timestamp: '29 Nov, 10:22',
    typeLabel: 'Snapshot insight · Text + Image',
    groupLabel: 'Earlier this week'
  }
];

function buildAnswer(mode: AssistantMode, text: string, prefs: AssistantPreferences, images: AssistantImage[]): AssistantAnswer {
  const usedText = text || 'No text provided — we improvised a placeholder response.';
  const usesImages = images.length > 0;
  const summary = `Mode: ${mode.label}. ${usedText}`;
  const detail =
    prefs.detail === 'Deep'
      ? 'Expanded, step-by-step reasoning with examples.'
      : prefs.detail === 'Balanced'
        ? 'Concise but with a couple of explanations.'
        : 'Quick bullet points.';

  const bullets = [
    `${mode.tagLine} (${mode.requiresImages ? 'photo-first' : 'text-first'})`,
    `Tone: ${prefs.tone}, Detail: ${prefs.detail}${prefs.includeSources ? ', include sources' : ''}.`,
    usesImages ? `Used ${images.length} image${images.length === 1 ? '' : 's'} for context.` : 'No images provided.',
    'This screen replaces the live model response after the 3 second delay.'
  ];

  return {
    title: `${mode.label} preview`,
    summary,
    bullets,
    highlight: detail
  };
}

function readFileAsImage(file: File, source: 'upload' | 'camera'): Promise<AssistantImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `${source}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        url: typeof reader.result === 'string' ? reader.result : '',
        name: file.name,
        source
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const AssistantScreenLayout: React.FC = () => {
  const { isMobile } = useViewportCategory();
  const [selectedModeKey, setSelectedModeKey] = React.useState<string>('');
  const selectedMode = React.useMemo(() => ASSISTANT_MODES.find((mode) => mode.key === selectedModeKey) ?? null, [selectedModeKey]);
  const effectiveMode = selectedMode ?? ASSISTANT_MODES[0];
  const [text, setText] = React.useState('');
  const [images, setImages] = React.useState<AssistantImage[]>([]);
  const [preferences, setPreferences] = React.useState<AssistantPreferences>({
    tone: 'Friendly',
    detail: 'Balanced',
    includeSources: true
  });
  const [stage, setStage] = React.useState<'compose' | 'answer'>('compose');
  const [sendState, setSendState] = React.useState<SendState>('idle');
  const [answer, setAnswer] = React.useState<AssistantAnswer | null>(null);
  const [error, setError] = React.useState('');
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyItems] = React.useState<AssistantHistoryEntry[]>(ASSISTANT_HISTORY_ENTRIES);
  const [toast, setToast] = React.useState('');
  const sendTimerRef = React.useRef<number | null>(null);
  const toastTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
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

  const heroTitle = selectedMode ? selectedMode.heroTitle : DEFAULT_HERO.title;
  const heroSubtitle = selectedMode ? selectedMode.heroSubtitle : DEFAULT_HERO.subtitle;

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

  const handleModeSelect = React.useCallback(
    (modeKey: string) => {
      const next = ASSISTANT_MODES.find((mode) => mode.key === modeKey);
      const willSelect = selectedModeKey === modeKey ? '' : modeKey;
      setSelectedModeKey(willSelect);
      if (next && !next.allowsImages) {
        setImages([]);
      }
      setError('');
      setSendState('idle');
      setStage('compose');
    },
    [selectedModeKey]
  );

  const handleFilesSelected = React.useCallback(
    async (files: FileList | File[], source: 'camera' | 'upload') => {
      if (!files || files.length === 0) return;
      try {
        const previews = await Promise.all(Array.from(files).map((file) => readFileAsImage(file, source)));
        setImages((prev) => [...prev, ...previews]);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Could not read that file. Try another?');
      }
    },
    []
  );

  const handleRemoveImage = React.useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleStart = React.useCallback(() => {
    if (sendState === 'sending') return;
    const trimmed = text.trim();
    const needsText = selectedMode?.requiresText ?? false;
    const needsImages = selectedMode?.requiresImages ?? false;
    if (needsText && !trimmed) {
      setError('Add a quick line of text for this mode.');
      return;
    }
    if (needsImages && images.length === 0) {
      setError('Add at least one image for this mode.');
      return;
    }

    setError('');
    setSendState('sending');
    sendTimerRef.current = window.setTimeout(() => {
      setSendState('sent');
      setAnswer(buildAnswer(selectedMode ?? effectiveMode, trimmed, preferences, images));
      setStage('answer');
      sendTimerRef.current = null;
    }, 3000);
  }, [effectiveMode, images, preferences, selectedMode, sendState, text]);

  const handleRestart = React.useCallback(() => {
    setStage('compose');
    setSendState('idle');
    setAnswer(null);
    setError('');
  }, []);

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

  const handleSelectHistoryEntry = React.useCallback(
    (entry: AssistantHistoryEntry) => {
      handleCloseHistory();
      setStage('compose');
      setSendState('idle');
      setAnswer(null);
      setError('');
      setImages([]);
      setSelectedModeKey(entry.modeKey ?? '');
      setText(entry.prompt);
    },
    [handleCloseHistory]
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
        modes={ASSISTANT_MODES}
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
            onSelect={handleSelectHistoryEntry}
          />
        </div>
      }
      composerPanel={
        <ComposerPanel
          mode={selectedMode}
          text={text}
          images={images}
          preferences={preferences}
          sendState={sendState}
          error={error}
          isMobile={isMobile}
          onTextChange={(value) => {
            setError('');
            setText(value);
          }}
          onFilesSelected={handleFilesSelected}
          onRemoveImage={handleRemoveImage}
          onUpdatePreferences={(prefs) => setPreferences((prev) => ({ ...prev, ...prefs }))}
          onStart={handleStart}
          onClearMode={() => setSelectedModeKey('')}
        />
      }
      showComposerPanel={stage === 'compose'}
      composerHeightMode={composerHeightMode}
      overlayPadContentPanel
      footer={<FooterNote sendState={sendState} />}
    />
  );
};
