import type {
  AssistantAnswer,
  AssistantHistoryEntry,
  AssistantImage,
  AssistantMode,
  AssistantPreferences
} from '../components/types';

export const DEFAULT_HERO = {
  title: 'What can I help with?',
  subtitle: 'Type your request or choose a starting point.'
};

export const ASSISTANT_MODES: AssistantMode[] = [
  {
    key: 'direct',
    label: 'Quick answer',
    emoji: '💡',
    tagLine: 'Ask me anything',
    heroTitle: 'What do you want to know?',
    heroSubtitle: 'Type your request or choose a starting point.',
    placeholder: 'Draft an email asking for a deadline extension...',
    requiresText: true,
    requiresImages: false,
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
    description: 'No required input; sends a playful starter.'
  }
];

export const ASSISTANT_HISTORY_ENTRIES: AssistantHistoryEntry[] = [
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

export function buildAnswer(mode: AssistantMode, text: string, prefs: AssistantPreferences, images: AssistantImage[]): AssistantAnswer {
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

export function readFileAsImage(file: File, source: 'upload' | 'camera'): Promise<AssistantImage> {
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
