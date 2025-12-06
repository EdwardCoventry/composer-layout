import React from 'react';

export type PreferencesShellVariant = 'popup' | 'modal' | 'fullscreen';

export type PreferencesShellInnerProps = {
  variant: PreferencesShellVariant;
  children: React.ReactNode;
  onClose: () => void;
  isEmbed?: boolean;
  ariaLabel?: string;
};

const useEscapeClose = (onClose: () => void) => {
  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
};

const useBodyScrollLock = () => {
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
};

/**
 * Low-level overlay shell that handles:
 * - backdrop
 * - ESC close
 * - body scroll locking
 */
export const PreferencesShell: React.FC<PreferencesShellInnerProps> = ({
  variant,
  children,
  onClose,
  isEmbed,
  ariaLabel = 'Edit preferences',
}) => {
  useEscapeClose(onClose);
  useBodyScrollLock();

  const embedAttr = isEmbed ? 'true' : 'false';

  return (
    <div
      className="assistant-modal"
      data-variant={variant}
      data-embed={embedAttr}
      role="dialog"
      aria-label={ariaLabel}
    >
      <div className="assistant-modal__backdrop" onClick={onClose} />
      <div
        className="assistant-modal__body"
        data-variant={variant}
        data-embed={embedAttr}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...(variant === 'popup' ? { padding: 0 } : {}),
        }}
      >
        {/* Render children directly; callers control scroll frame composition */}
        {children}
      </div>
    </div>
  );
};
