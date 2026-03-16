import { useViewportKeyboardState } from './useViewportKeyboardState';

export function useKeyboardOpen(threshold: number = 300): boolean {
  return useViewportKeyboardState(threshold).keyboardOpen;
}
