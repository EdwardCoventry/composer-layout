import { useCallback, useEffect, useRef } from 'react';
import { useKeyboardOpen } from './useKeyboardOpen';
import { useIsMobile } from './useIsMobile';

export interface KeyboardOptionsSyncConfig {
  /**
   * Whether the options / accessories tray is currently open.
   */
  isOptionsOpen: boolean;
  /**
   * Called when the keyboard opens and the options should be hidden.
   */
  onRequestCloseOptions: () => void;
  /**
   * Optional override for the keyboard open threshold (minimum keyboard height).
   */
  keyboardThreshold?: number;
  /**
   * If true (default), blur the active element when the user tries to open options while the keyboard is up.
   */
  blurOnOptionsOpen?: boolean;
  /**
   * If true (default), focusing an input while on mobile will close options for more room.
   */
  closeOptionsOnInputFocus?: boolean;
  /**
   * Optional override for the mobile breakpoint (px) when applying focus-close behavior.
   */
  mobileMaxWidth?: number;
}

function blurActiveElement() {
  if (typeof document === 'undefined') return;
  const el = document.activeElement as HTMLElement | null;
  if (el && typeof el.blur === 'function') {
    el.blur();
  }
}

/**
 * Helper hook to keep an options tray and the on-screen keyboard in sync.
 *
 * - When the keyboard opens, it calls `onRequestCloseOptions` if options are visible.
 * - When you intend to open options, call `prepareToOpenOptions()` to blur any active field.
 */
export function useKeyboardOptionsSync(config: KeyboardOptionsSyncConfig) {
  const {
    isOptionsOpen,
    onRequestCloseOptions,
    keyboardThreshold,
    blurOnOptionsOpen = true,
    closeOptionsOnInputFocus = true,
    mobileMaxWidth
  } = config;

  const keyboardOpen = useKeyboardOpen(keyboardThreshold);
  const isMobile = useIsMobile(mobileMaxWidth);
  const prevKeyboardOpen = useRef<boolean>(false);

  useEffect(() => {
    // Collapse options only on transitions to keyboard open to avoid fighting with explicit blurs.
    if (keyboardOpen && !prevKeyboardOpen.current && isOptionsOpen) {
      onRequestCloseOptions();
    }
    prevKeyboardOpen.current = keyboardOpen;
  }, [keyboardOpen, isOptionsOpen, onRequestCloseOptions]);

  const dismissKeyboard = useCallback(() => {
    blurActiveElement();
  }, []);

  const prepareToOpenOptions = useCallback(() => {
    if (!blurOnOptionsOpen) return;
    if (keyboardOpen) {
      dismissKeyboard();
    }
  }, [blurOnOptionsOpen, dismissKeyboard, keyboardOpen]);

  const handleInputFocus = useCallback(() => {
    if (!closeOptionsOnInputFocus) return;
    if (isMobile && isOptionsOpen) {
      onRequestCloseOptions();
    }
  }, [closeOptionsOnInputFocus, isMobile, isOptionsOpen, onRequestCloseOptions]);

  return { keyboardOpen, dismissKeyboard, prepareToOpenOptions, handleInputFocus };
}
