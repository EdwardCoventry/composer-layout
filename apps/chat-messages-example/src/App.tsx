import React from 'react';
import { LayoutFrame, type ComposerHeightMode, type HeaderBehavior } from 'composer-layout';
import { useApplyColorSchemeTheme } from 'ui/hooks/useApplyColorSchemeTheme';
import threadData from './data/thread.json';

type ChatMessage = {
  id: string;
  author: 'assistant' | 'user';
  timestamp: string;
  text: string;
  label?: string;
};

type ThreadData = {
  title: string;
  subtitle: string;
  draftTag: string;
  draftPlaceholder: string;
  messages: ChatMessage[];
  history: HistoryItem[];
};

type HistoryItem = {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
};

type ChatRoute = 'home' | 'embed';
type HeaderModePresetId = 'sticky' | 'floating' | 'snap' | 'collapsed' | 'collapsed-floating';

const HEADER_MODE_PRESETS: Array<{
  id: HeaderModePresetId;
  label: string;
  description: string;
  behavior: HeaderBehavior;
}> = [
  {
    id: 'sticky',
    label: 'Sticky',
    description: 'Default pinned header',
    behavior: { pinned: true }
  },
  {
    id: 'floating',
    label: 'Floating',
    description: 'Scrolls away, reappears on reverse scroll',
    behavior: { pinned: false, floating: true }
  },
  {
    id: 'snap',
    label: 'Snap',
    description: 'Floating header that snaps fully back',
    behavior: { pinned: false, floating: true, snap: true }
  },
  {
    id: 'collapsed',
    label: 'Collapsed',
    description: 'Pinned header that collapses to a sliver',
    behavior: { pinned: true, collapsedHeight: 64 }
  },
  {
    id: 'collapsed-floating',
    label: 'Sliver float',
    description: 'Collapsed pinned header that floats back open',
    behavior: { pinned: true, floating: true, collapsedHeight: 64 }
  }
];

const thread = threadData as ThreadData;

function getRouteFromPath(pathname: string): ChatRoute {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized.endsWith('/embed') ? 'embed' : 'home';
}

function getHomePath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (!normalized.endsWith('/embed')) {
    return normalized === '/' ? '/' : `${normalized}/`;
  }

  const next = normalized.slice(0, -'/embed'.length);
  return next || '/';
}

function getEmbedPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized.endsWith('/embed')) return normalized;
  return normalized === '/' ? '/embed' : `${normalized}/embed`;
}

function BrandMark() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4.5 6.25h11m-11 3.75h11m-11 3.75h7.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 4.5v11M4.5 10h11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M3.5 9.8 16.25 3.75l-3.55 12.5-2.75-3.9-4.1-2.55 10.4-6.05L3.5 9.8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
    </svg>
  );
}

function ChatHeader({
  title,
  subtitle,
  historyOpen,
  onToggleHistory,
  selectedHeaderMode,
  onSelectHeaderMode,
  showHeaderModes,
}: Pick<ThreadData, 'title' | 'subtitle'> & {
  historyOpen: boolean;
  onToggleHistory: () => void;
  selectedHeaderMode: HeaderModePresetId;
  onSelectHeaderMode: (mode: HeaderModePresetId) => void;
  showHeaderModes: boolean;
}) {
  return (
    <div className="chat-wireframe-header">
      <div className="chat-wireframe-header__inner">
        <div className="chat-wireframe-header__brand">
          <span className="chat-wireframe-header__mark">
            <BrandMark />
          </span>
          <div className="chat-wireframe-header__text">
            <span className="chat-wireframe-header__title">{title}</span>
            <span className="chat-wireframe-header__subtitle">{subtitle}</span>
          </div>
        </div>
        <div className="chat-wireframe-header__actions" aria-label="Chat actions">
          <button type="button" className="chat-wireframe-header__button">New chat</button>
          <button
            type="button"
            className="chat-wireframe-header__button"
            aria-pressed={historyOpen}
            data-active={historyOpen}
            onClick={onToggleHistory}
          >
            History
          </button>
        </div>
      </div>
      {showHeaderModes ? (
        <div className="chat-wireframe-header__mode-strip">
          <div className="chat-wireframe-header__mode-strip-inner">
            <span className="chat-wireframe-header__mode-label">Header mode</span>
            <div className="chat-wireframe-header__mode-list" role="group" aria-label="Header scroll behavior">
              {HEADER_MODE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="chat-wireframe-header__mode-button"
                  data-active={preset.id === selectedHeaderMode}
                  data-testid={`header-mode-${preset.id}`}
                  onClick={() => onSelectHeaderMode(preset.id)}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChatTranscript({ messages }: Pick<ThreadData, 'messages'>) {
  return (
    <div className="chat-thread">
      <div className="chat-thread__inner">
        {messages.map((message) => (
          <article key={message.id} className={`chat-thread__message chat-thread__message--${message.author}`}>
            {message.author === 'assistant' ? (
              <div className="chat-thread__avatar" aria-hidden="true">
                <BrandMark />
              </div>
            ) : null}
            <div className="chat-thread__bubble">
              <div className="chat-thread__meta">
                <span>{message.label ?? (message.author === 'assistant' ? 'AI chat' : 'You')}</span>
                <span>{message.timestamp}</span>
              </div>
              <p>{message.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ChatComposer({ draftTag, draftPlaceholder }: Pick<ThreadData, 'draftTag' | 'draftPlaceholder'>) {
  return (
    <div className="chat-wireframe-composer">
      <div className="chat-wireframe-composer__inner">
        <div className="chat-wireframe-composer__shell">
          <div className="chat-wireframe-composer__tag-row">
            <span className="chat-wireframe-composer__tag">{draftTag}</span>
          </div>
          <label className="chat-wireframe-composer__field" htmlFor="chat-wireframe-input">
            <span className="chat-wireframe-composer__label">Message</span>
            <textarea
              id="chat-wireframe-input"
              className="chat-wireframe-composer__input"
              placeholder={draftPlaceholder}
              defaultValue=""
              rows={3}
            />
          </label>
          <div className="chat-wireframe-composer__footer">
            <button type="button" className="chat-wireframe-composer__icon-button" aria-label="Open tools">
              <PlusIcon />
            </button>
            <button type="button" className="chat-wireframe-composer__send">
              <SendIcon />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatFooter({ embedHref, onNavigate }: { embedHref: string; onNavigate: (route: ChatRoute) => void }) {
  return (
    <div className="chat-footer">
      <a
        href="https://edwardcoventry.com"
        target="_blank"
        rel="noreferrer"
        className="chat-footer__link"
      >
        <span>edwardcoventry.com</span>
        <span className="chat-footer__link-arrow">↗</span>
      </a>
      <a
        href={embedHref}
        className="chat-footer__embed-link"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('embed');
        }}
      >
        <span>Embed</span>
        <span className="chat-footer__link-arrow">↗</span>
      </a>
    </div>
  );
}

function HistoryPanel({
  open,
  items,
  activeId,
  onClose,
  onSelect,
}: {
  open: boolean;
  items: HistoryItem[];
  activeId: string;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
}) {
  if (!open) return null;

  return (
    <div className="chat-history" role="dialog" aria-modal="true" aria-label="Chat history">
      <button type="button" className="chat-history__backdrop" onClick={onClose} aria-label="Close history" />
      <div className="chat-history__panel">
        <div className="chat-history__header">
          <div>
            <p className="chat-history__eyebrow">AI chat</p>
            <h2 className="chat-history__title">History</h2>
          </div>
          <button type="button" className="chat-history__close" onClick={onClose} aria-label="Close history">
            ×
          </button>
        </div>
        <div className="chat-history__list" role="list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chat-history__item"
              data-active={item.id === activeId}
              onClick={() => onSelect(item)}
            >
              <span className="chat-history__item-title">{item.title}</span>
              <span className="chat-history__item-preview">{item.preview}</span>
              <span className="chat-history__item-meta">{item.timestamp}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useApplyColorSchemeTheme();
  const [route, setRoute] = React.useState<ChatRoute>(() => {
    if (typeof window === 'undefined') return 'home';
    return getRouteFromPath(window.location.pathname);
  });
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = React.useState(() => thread.history[0]?.id ?? '');
  const [headerMode, setHeaderMode] = React.useState<HeaderModePresetId>('sticky');

  const composerHeightMode = React.useMemo<ComposerHeightMode>(() => ({ type: 'content', maxFraction: 0.4 }), []);
  const selectedHistory = React.useMemo(
    () => thread.history.find((item) => item.id === selectedHistoryId) ?? thread.history[0],
    [selectedHistoryId]
  );
  const selectedHeaderPreset = React.useMemo(
    () => HEADER_MODE_PRESETS.find((preset) => preset.id === headerMode) ?? HEADER_MODE_PRESETS[0],
    [headerMode]
  );
  const embedHref = typeof window === 'undefined' ? '/embed' : getEmbedPath(window.location.pathname);

  React.useEffect(() => {
    if (!historyOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHistoryOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyOpen]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handlePop = () => {
      setRoute(getRouteFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = React.useCallback((next: ChatRoute) => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    const nextPath = next === 'embed' ? getEmbedPath(currentPath) : getHomePath(currentPath);

    window.history.pushState({}, '', nextPath);
    setRoute(next);
    setHistoryOpen(false);
  }, []);

  const header = (
    <ChatHeader
      title={thread.title}
      subtitle={
        route === 'embed'
          ? 'Embedded AI chat layout'
          : `${selectedHistory?.title ?? thread.subtitle} · ${selectedHeaderPreset.description}`
      }
      historyOpen={historyOpen}
      onToggleHistory={() => setHistoryOpen((current) => !current)}
      selectedHeaderMode={headerMode}
      onSelectHeaderMode={setHeaderMode}
      showHeaderModes={route === 'home'}
    />
  );

  const contentPanel = (
    <>
      <ChatTranscript messages={thread.messages} />
      <HistoryPanel
        open={historyOpen}
        items={thread.history}
        activeId={selectedHistoryId}
        onClose={() => setHistoryOpen(false)}
        onSelect={(item) => {
          setSelectedHistoryId(item.id);
          setHistoryOpen(false);
        }}
      />
    </>
  );

  const composerPanel = <ChatComposer draftTag={thread.draftTag} draftPlaceholder={thread.draftPlaceholder} />;

  if (route === 'embed') {
    return (
      <div className="chat-messages-root chat-messages-root--embed">
        <div className="chat-embed-shell">
          <LayoutFrame
            header={header}
            contentPanel={contentPanel}
            composerPanel={composerPanel}
            showComposerPanel
            composerHeightMode={composerHeightMode}
            overlayPadContentPanel
          />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages-root">
      <LayoutFrame
        header={header}
        contentPanel={contentPanel}
        composerPanel={composerPanel}
        footer={<ChatFooter embedHref={embedHref} onNavigate={navigate} />}
        showComposerPanel
        composerHeightMode={composerHeightMode}
        contentPanelMode="chat-message"
        overlayPadContentPanel
        headerBehavior={selectedHeaderPreset.behavior}
      />
    </div>
  );
}
