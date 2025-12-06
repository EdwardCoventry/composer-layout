import React from 'react';
import { useSafeTimeout } from './useSafeTimeout';

export function useToast(durationMs = 2200) {
  const [toast, setToast] = React.useState('');
  const { setTimeout } = useSafeTimeout();

  const showToast = React.useCallback(
    (message: string) => {
      setToast(message);
      setTimeout(() => setToast(''), durationMs);
    },
    [durationMs, setTimeout],
  );

  return { toast, showToast };
}

