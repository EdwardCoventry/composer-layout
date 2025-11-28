import { useViewportCategory } from './useViewportCategory';

// Deprecated: kept for backward compatibility; uses innerWidth logic.
export function useIsMobile(maxWidth: number = 768) {
  return useViewportCategory(maxWidth).isMobile;
}
