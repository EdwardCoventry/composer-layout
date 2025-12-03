import React from 'react';
import type { AssistantMode } from '../types';
import Sheet from 'react-modal-sheet';
import { CameraIcon, GalleryIcon } from './icons';

export type AddMenuVariant = 'context' | 'sheet' | 'fullscreen';

export type AddMenuProps = {
  open: boolean;
  variant: AddMenuVariant;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  modes: AssistantMode[];
  onClose: () => void;
  onSelectMode: (modeKey: string) => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
};

export const AddMenu: React.FC<AddMenuProps> = ({ open, variant, anchorRef, modes, onClose, onSelectMode, onPickCamera, onPickGallery }) => {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const moreRowRef = React.useRef<HTMLDivElement | null>(null);
  const [submenuOpen, setSubmenuOpen] = React.useState(false);
  const [contextPlacement, setContextPlacement] = React.useState<{ bottom: number; right: number; width: number; maxHeight: number; }>({ bottom: 24, right: 16, width: 380, maxHeight: 520 });
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(open);

  React.useEffect(() => {
    if (open) { setShouldRender(true); requestAnimationFrame(() => setIsVisible(true)); }
    else { setIsVisible(false); const t = setTimeout(() => setShouldRender(false), 150); return () => clearTimeout(t); }
  }, [open]);

  React.useEffect(() => { if (!open) return undefined; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [open, onClose]);
  React.useEffect(() => { if (!open) setSubmenuOpen(false); }, [open]);

  React.useEffect(() => {
    if (!open || variant !== 'context') { setContextPlacement((p) => ({ ...p, maxHeight: 0 })); return; }
    const compute = () => {
      const rect = anchorRef?.current?.getBoundingClientRect();
      const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
      if (!vw || !vh) return;
      const gutter = 16;
      const targetWidth = Math.min(420, Math.max(340, vw * 0.42));
      const width = Math.min(targetWidth, vw - gutter * 2);
      const right = rect ? Math.max(gutter, vw - rect.right) : gutter;
      const gap = 10;
      const bottom = rect ? Math.max(gutter, vh - rect.top + gap) : 24;
      const maxHeight = Math.max(340, Math.min(640, vh - bottom - gutter));
      setContextPlacement({ bottom, right, width, maxHeight });
    };
    const f = window.requestAnimationFrame(compute);
    const relayout = () => compute();
    window.addEventListener('resize', relayout);
    window.addEventListener('scroll', relayout, true);
    return () => { window.cancelAnimationFrame(f); window.removeEventListener('resize', relayout); window.removeEventListener('scroll', relayout, true); };
  }, [open, variant, anchorRef]);

  if (!shouldRender) return null;

  const primaryItems = [
    { key: 'camera', label: 'Take a photo', subLabel: 'Use your camera', icon: <CameraIcon />, action: () => { onPickCamera(); onClose(); } },
    { key: 'gallery', label: 'Choose from gallery', subLabel: 'Choose from files', icon: <GalleryIcon />, action: () => { onPickGallery(); onClose(); } }
  ];
  const quickModeItems = modes.map((m) => ({ key: m.key, label: m.tagLine, subLabel: m.description || m.heroSubtitle, icon: m.emoji, action: () => { onSelectMode(m.key); onClose(); } }));
  const orderedQuickModes = ['vision', 'plan', 'brainstorm', 'rewrite', 'organize', 'random'];
  const filteredQuickModes = orderedQuickModes.map((key) => quickModeItems.find((i) => i.key === key)).filter((i): i is NonNullable<typeof i> => i !== undefined);
  const contextMainModes = filteredQuickModes.slice(0, 3);
  const contextMoreModes = filteredQuickModes.slice(3);

  const renderRow = (item: { key: string; label: string; subLabel?: string; icon: React.ReactNode; action: () => void }, kind: 'primary' | 'mode') => (
    <button key={item.key} type="button" className="assistant-add__row" data-kind={kind} onClick={item.action}>
      <span className="assistant-add__row-icon" aria-hidden>{item.icon}</span>
      <span className="assistant-add__row-text">
        <span className="assistant-add__row-title">{item.label}</span>
        {item.subLabel ? <span className="assistant-add__row-sub">{item.subLabel}</span> : null}
      </span>
    </button>
  );

  const renderMoreRow = () => (
    <div ref={moreRowRef} className="assistant-add__row assistant-add__row--more" data-kind="mode" onMouseEnter={() => setSubmenuOpen(true)} onMouseLeave={() => setSubmenuOpen(false)}>
      <span className="assistant-add__row-icon assistant-add__row-icon--more" aria-hidden>···</span>
      <span className="assistant-add__row-text"><span className="assistant-add__row-title">More</span></span>
      <span className="assistant-add__row-arrow" aria-hidden>›</span>
      {submenuOpen && (
        <div className="assistant-add__submenu">
          {contextMoreModes.map((item) => (
            <button key={item.key} type="button" className="assistant-add__row" data-kind="mode" onClick={item.action}>
              <span className="assistant-add__row-icon" aria-hidden>{item.icon}</span>
              <span className="assistant-add__row-text"><span className="assistant-add__row-title">{item.label}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const content = (
    <div className="assistant-add__content" ref={panelRef}>
      <div className="assistant-add__list assistant-add__list--primary">
        {primaryItems.map((item) => renderRow(item, 'primary'))}
      </div>
      <div className="assistant-add__section">
        <div className="assistant-add__label">QUICK MODES</div>
        {variant === 'fullscreen' ? (
          <div className="assistant-add__quick-grid">{filteredQuickModes.map((item) => renderRow(item, 'mode'))}</div>
        ) : variant === 'context' ? (
          <div className="assistant-add__list">
            {contextMainModes.map((item) => renderRow(item, 'mode'))}
            {contextMoreModes.length > 0 && renderMoreRow()}
          </div>
        ) : (
          <div className="assistant-add__list">{filteredQuickModes.map((item) => renderRow(item, 'mode'))}</div>
        )}
      </div>
      {variant === 'sheet' && <div className="assistant-add__bottom-line" />}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="assistant-add-overlay" data-variant="fullscreen" role="dialog" aria-label="Add to request" aria-modal="true">
        <div className="assistant-add__fullscreen">
          <div className="assistant-add__fullscreen-header">
            <div className="assistant-add__fullscreen-titles">
              <div className="assistant-section__label">Add to request</div>
              <div className="assistant-add__fullscreen-title">Choose an option</div>
            </div>
            <button type="button" className="assistant-modal__close" onClick={onClose} aria-label="Close add options">×</button>
          </div>
          <div className="assistant-add__fullscreen-body">{content}</div>
        </div>
      </div>
    );
  }

  if (variant === 'sheet') {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const peek = Math.round(vh * 0.2);
    const snapPoints = [vh, peek, 0];

    return (
      <Sheet isOpen={open} onClose={onClose} snapPoints={snapPoints} initialSnap={1} detent="full-height">
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content // @ts-expect-error v1 supports boolean disableDrag, newer versions support callback
            disableDrag={(state: { scrollPosition: 'top' | 'middle' | 'bottom' }) => state.scrollPosition !== 'top'}
          >
            <div className="assistant-add__body assistant-add__body--sheet">{content}</div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    );
  }

  return (
    <div className="assistant-add-overlay" data-variant="context" role="dialog" aria-label="Add to request" aria-modal="true" onClick={onClose}>
      <div className="assistant-add__panel" onClick={(e) => e.stopPropagation()} role="presentation" style={{ bottom: `${contextPlacement.bottom}px`, right: `${contextPlacement.right}px`, width: `${contextPlacement.width}px`, maxHeight: contextPlacement.maxHeight || undefined }}>
        {content}
      </div>
    </div>
  );
};

