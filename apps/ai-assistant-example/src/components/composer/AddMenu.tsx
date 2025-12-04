import React from 'react';
import type {AssistantMode} from '../types';
import {CameraIcon, GalleryIcon} from './icons';
import {FullscreenAddMenu} from './add-menu/Fullscreen';
import {SheetAddMenu} from './add-menu/Sheet';
import {ContextAddMenu} from './add-menu/Context';

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

export const AddMenu: React.FC<AddMenuProps> = ({
                                                    open,
                                                    variant,
                                                    anchorRef,
                                                    modes,
                                                    onClose,
                                                    onSelectMode,
                                                    onPickCamera,
                                                    onPickGallery
                                                }) => {
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const moreRowRef = React.useRef<HTMLDivElement | null>(null);
    const [hoverActive, setHoverActive] = React.useState(false);
    const [submenuPinned, setSubmenuPinned] = React.useState(false);
    const [contextPlacement, setContextPlacement] = React.useState<{
        bottom: number;
        right: number;
        width: number;
        maxHeight: number;
    }>({bottom: 24, right: 16, width: 380, maxHeight: 520});
    const [shouldRender, setShouldRender] = React.useState(open);

    React.useEffect(() => {
        if (open) {
            setShouldRender(true);
        } else {
            const t = setTimeout(() => setShouldRender(false), 150);
            return () => clearTimeout(t);
        }
    }, [open]);
    React.useEffect(() => {
        if (!open) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    React.useEffect(() => {
        if (!shouldRender) {
            setHoverActive(false);
            setSubmenuPinned(false);
        }
    }, [shouldRender]);
    React.useEffect(() => {
        if (!open || variant !== 'context') {
            setContextPlacement((p) => ({...p, maxHeight: 0}));
            return;
        }
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
            setContextPlacement({bottom, right, width, maxHeight});
        };
        const f = window.requestAnimationFrame(compute);
        const relayout = () => compute();
        window.addEventListener('resize', relayout);
        window.addEventListener('scroll', relayout, true);
        return () => {
            window.cancelAnimationFrame(f);
            window.removeEventListener('resize', relayout);
            window.removeEventListener('scroll', relayout, true);
        };
    }, [open, variant, anchorRef]);

    if (!shouldRender) return null;

    const primaryItems = [
        {
            key: 'camera', label: 'Take a photo', subLabel: 'Use your camera', icon: <CameraIcon/>, action: () => {
                onPickCamera();
                onClose();
            }
        },
        {
            key: 'gallery',
            label: 'Choose from gallery',
            subLabel: 'Choose from files',
            icon: <GalleryIcon/>,
            action: () => {
                onPickGallery();
                onClose();
            }
        }
    ];
    const quickModeItems = modes.map((m) => ({
        key: m.key,
        label: m.tagLine,
        subLabel: m.description || m.heroSubtitle,
        icon: m.emoji,
        action: () => {
            onSelectMode(m.key);
            onClose();
        }
    }));
    const orderedQuickModes = ['vision', 'plan', 'brainstorm', 'rewrite', 'organize', 'random'];
    const filteredQuickModes = orderedQuickModes.map((key) => quickModeItems.find((i) => i.key === key)).filter((i): i is NonNullable<typeof i> => i !== undefined);
    const contextMainModes = filteredQuickModes.slice(0, 3);
    const contextMoreModes = filteredQuickModes.slice(3);
    // Gap between the More row and the submenu when opened to the left
    // not sure exactly where this value is offset from
    //
    const submenuGap = 24;

    const RowWrap: React.FC<{ children: React.ReactNode }> = ({children}) => (
        variant === 'context' ? <div className="assistant-add__row-wrap">{children}</div> : <>{children}</>
    );

    const renderRow = (item: {
        key: string;
        label: string;
        subLabel?: string;
        icon: React.ReactNode;
        action: () => void
    }, kind: 'primary' | 'mode') => (
        <RowWrap>
            <button key={item.key} type="button" className="assistant-add__row" data-kind={kind} onClick={item.action}>
                <span className="assistant-add__row-icon" aria-hidden>{item.icon}</span>
                <span className="assistant-add__row-text">
          <span className="assistant-add__row-title">{item.label}</span>
                    {item.subLabel ? <span className="assistant-add__row-sub">{item.subLabel}</span> : null}
        </span>
            </button>
        </RowWrap>
    );

    const handleMoreMouseLeave: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const next = e.relatedTarget as Node | null;
        const container = moreRowRef.current;
        if (!container || !next || !container.contains(next)) {
            // Only clear hover; keep pinned state
            setHoverActive(false);
        }
    };

    const renderMoreRow = () => (
        <RowWrap>
            <div
                ref={moreRowRef}
                className="assistant-add__more-container"
                onMouseEnter={() => setHoverActive(true)}
                onMouseLeave={handleMoreMouseLeave}
                style={{position: 'relative'}}
            >
                <div
                    className="assistant-add__row assistant-add__row--more"
                    data-kind="mode"
                    onClick={() => setSubmenuPinned((v) => !v)}
                    role="button"
                    aria-expanded={hoverActive || submenuPinned}
                    aria-haspopup="menu"
                    tabIndex={0}
                >
                    <span className="assistant-add__row-icon assistant-add__row-icon--more" aria-hidden>···</span>
                    <span className="assistant-add__row-text"><span className="assistant-add__row-title">More</span></span>
                    <span className="assistant-add__row-arrow" aria-hidden>›</span>
                </div>
                {(hoverActive || submenuPinned) && (
                    <>
                        {/* Buffer on the LEFT side to bridge the small gap when submenu opens entirely to the left */}
                        <div
                            className="assistant-add__submenu-buffer"
                            aria-hidden
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: -submenuGap,
                                width: submenuGap,
                                height: '100%',
                                pointerEvents: 'auto'
                            }}
                        />
                        <div
                            className="assistant-add__submenu"
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: `calc(100% - var(--assistant-add-pad-x) + var(--border-width) + ${submenuGap}px)`
                            }}
                        >
                            {contextMoreModes.map((item) => (
                                <button key={item.key} type="button" className="assistant-add__row" data-kind="mode"
                                        onClick={item.action}>
                                    <span className="assistant-add__row-icon" aria-hidden>{item.icon}</span>
                                    <span className="assistant-add__row-text"><span
                                        className="assistant-add__row-title">{item.label}</span></span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </RowWrap>
    );

    const content = (
        <div className="assistant-add__content" ref={panelRef}>
            <div className="assistant-add__list assistant-add__list--primary">
                {primaryItems.map((item) => renderRow(item, 'primary'))}
            </div>
            <div className="assistant-add__section">
                <div className="assistant-add__label">QUICK MODES</div>
                {variant === 'fullscreen' ? (
                    <div
                        className="assistant-add__quick-grid">{filteredQuickModes.map((item) => renderRow(item, 'mode'))}</div>
                ) : variant === 'context' ? (
                    <div className="assistant-add__list">
                        {contextMainModes.map((item) => renderRow(item, 'mode'))}
                        {contextMoreModes.length > 0 && renderMoreRow()}
                    </div>
                ) : (
                    <div
                        className="assistant-add__list">{filteredQuickModes.map((item) => renderRow(item, 'mode'))}</div>
                )}
            </div>
            {variant === 'sheet' && <div className="assistant-add__bottom-line"/>}
        </div>
    );

    if (variant === 'fullscreen') {
        return <FullscreenAddMenu content={content} onClose={onClose}/>;
    }

    if (variant === 'sheet') {
        return <SheetAddMenu open={open} content={content} onClose={onClose}/>;
    }

    const style: React.CSSProperties = {
        bottom: `${contextPlacement.bottom}px`,
        right: `${contextPlacement.right}px`,
        width: `${contextPlacement.width}px`,
        maxHeight: contextPlacement.maxHeight || undefined
    };
    return <ContextAddMenu content={content} onClose={onClose} style={style}/>;
};
