export type SendState = 'idle' | 'sending' | 'sent';

export type AssistantMode = {
  key: string;
  label: string;
  emoji: string;
  tagLine: string;
  heroTitle: string;
  heroSubtitle: string;
  placeholder: string;
  requiresText: boolean;
  requiresImages: boolean;
  allowsImages: boolean;
  description: string;
};

export type AssistantPreferences = {
  tone: 'Friendly' | 'Neutral' | 'Direct';
  detail: 'Brief' | 'Balanced' | 'Deep';
  includeSources: boolean;
};

export type AssistantImage = {
  id: string;
  url: string;
  name: string;
  source: 'upload' | 'camera';
};

export type AssistantAnswer = {
  title: string;
  summary: string;
  bullets: string[];
  highlight: string;
};

export type AssistantHistoryEntry = {
  id: string;
  title: string;
  prompt: string;
  modeKey?: AssistantMode['key'];
  timestamp: string;
  typeLabel?: string;
  groupLabel?: string;
};
