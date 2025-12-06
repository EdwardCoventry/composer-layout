import React from 'react';
import { useSafeTimeout } from 'ui/hooks/useSafeTimeout';
import type {
  AssistantAnswer,
  AssistantHistoryEntry,
  AssistantImage,
  AssistantMode,
  AssistantPreferences,
  SendState
} from '../components/types';
import {
  ASSISTANT_HISTORY_ENTRIES,
  ASSISTANT_MODES,
  DEFAULT_HERO,
  buildAnswer,
  readFileAsImage
} from './assistantData';

const DEFAULT_PREFERENCES: AssistantPreferences = {
  tone: 'Friendly',
  detail: 'Balanced',
  includeSources: true,
  toneNotes: '',
  detailNotes: '',
  allergies: { tags: [], notes: '' },
  dietary: { tags: [], notes: '' },
  personalization: { tags: [], notes: '' },
  servings: { value: null, notes: '' }
};

type UseAssistantExperienceResult = {
  heroTitle: string;
  heroSubtitle: string;
  modes: AssistantMode[];
  historyItems: AssistantHistoryEntry[];
  selectedModeKey: string;
  selectedMode: AssistantMode | null;
  effectiveMode: AssistantMode;
  text: string;
  images: AssistantImage[];
  preferences: AssistantPreferences;
  stage: 'compose' | 'answer';
  sendState: SendState;
  answer: AssistantAnswer | null;
  error: string;
  setText: (value: string) => void;
  updatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  setStage: (stage: 'compose' | 'answer') => void;
  setSendState: (state: SendState) => void;
  setError: (value: string) => void;
  clearMode: () => void;
  handleModeSelect: (modeKey: string) => void;
  handleFilesSelected: (files: FileList | File[], source: 'camera' | 'upload') => Promise<void>;
  handleRemoveImage: (id: string) => void;
  handleStart: () => void;
  handleRestart: () => void;
  handleSelectHistoryEntry: (entry: AssistantHistoryEntry) => void;
};

export function useAssistantExperience(): UseAssistantExperienceResult {
  const [selectedModeKey, setSelectedModeKey] = React.useState<string>('');
  const [text, setText] = React.useState('');
  const [images, setImages] = React.useState<AssistantImage[]>([]);
  const [preferences, setPreferences] = React.useState<AssistantPreferences>(DEFAULT_PREFERENCES);
  const [stage, setStage] = React.useState<'compose' | 'answer'>('compose');
  const [sendState, setSendState] = React.useState<SendState>('idle');
  const [answer, setAnswer] = React.useState<AssistantAnswer | null>(null);
  const [error, setError] = React.useState('');
  const selectedMode = React.useMemo(
    () => ASSISTANT_MODES.find((mode) => mode.key === selectedModeKey) ?? null,
    [selectedModeKey]
  );
  const effectiveMode = selectedMode ?? ASSISTANT_MODES[0];
  const { setTimeout: setSendTimeout, clearTimeout: clearSendTimeout } = useSafeTimeout();

  const resetForCompose = React.useCallback(() => {
    setStage('compose');
    setSendState('idle');
    setAnswer(null);
    setError('');
  }, []);

  const heroTitle = selectedMode ? selectedMode.heroTitle : DEFAULT_HERO.title;
  const heroSubtitle = selectedMode ? selectedMode.heroSubtitle : DEFAULT_HERO.subtitle;

  const handleModeSelect = React.useCallback(
    (modeKey: string) => {
      const willSelect = selectedModeKey === modeKey ? '' : modeKey;
      setSelectedModeKey(willSelect);
      resetForCompose();
    },
    [resetForCompose, selectedModeKey]
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
    if (sendState === 'sending' || sendState === 'sent') return;
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
    clearSendTimeout();
    setSendTimeout(() => {
      setSendState('sent');
      setSendTimeout(() => {
        setAnswer(buildAnswer(selectedMode ?? effectiveMode, trimmed, preferences, images));
        setStage('answer');
      }, 2000);
    }, 2000);
  }, [effectiveMode, images, preferences, selectedMode, sendState, text, clearSendTimeout, setSendTimeout]);

  const handleRestart = React.useCallback(() => {
    resetForCompose();
  }, [resetForCompose]);

  const handleSelectHistoryEntry = React.useCallback((entry: AssistantHistoryEntry) => {
    resetForCompose();
    setImages([]);
    setSelectedModeKey(entry.modeKey ?? '');
    setText(entry.prompt);
  }, [resetForCompose]);

  const updatePreferences = React.useCallback((prefs: Partial<AssistantPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  }, []);

  const clearMode = React.useCallback(() => setSelectedModeKey(''), []);

  return {
    heroTitle,
    heroSubtitle,
    modes: ASSISTANT_MODES,
    historyItems: ASSISTANT_HISTORY_ENTRIES,
    selectedModeKey,
    selectedMode,
    effectiveMode,
    text,
    images,
    preferences,
    stage,
    sendState,
    answer,
    error,
    setText,
    updatePreferences,
    setStage,
    setSendState,
    setError,
    clearMode,
    handleModeSelect,
    handleFilesSelected,
    handleRemoveImage,
    handleStart,
    handleRestart,
    handleSelectHistoryEntry
  };
}
