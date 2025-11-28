import { useCallback, useEffect, useRef } from 'react';
import { useKeyboardOpen } from './useKeyboardOpen';

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
   * Optional override for the keyboard open threshold (pixel diff on visualViewport).
   */
  keyboardThreshold?: number;
  /**
   * If true (default), blur the active element when the user tries to open options while the keyboard is up.
   */
  blurOnOptionsOpen?: boolean;
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
    blurOnOptionsOpen = true
  } = config;

  const keyboardOpen = useKeyboardOpen(keyboardThreshold);
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

  return { keyboardOpen, dismissKeyboard, prepareToOpenOptions };
}
