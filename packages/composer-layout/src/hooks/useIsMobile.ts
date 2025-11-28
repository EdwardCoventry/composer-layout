import { useViewportCategory } from './useViewportCategory';

export function useIsMobile(maxWidth: number = 768) {
  return useViewportCategory(maxWidth).isMobile;
}

