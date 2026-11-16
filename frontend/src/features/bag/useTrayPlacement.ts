import { useFocusEffect } from 'expo-router';
import { useCallback, useId } from 'react';
import { useTray, type TrayPlacement } from '@/store/tray';

/** Declares where the Bag Tray docks while the calling screen is focused. */
export function useTrayPlacement(placement: TrayPlacement): void {
  const owner = useId();

  useFocusEffect(
    useCallback(() => {
      useTray.getState().claim(owner, placement);
      return () => useTray.getState().release(owner);
    }, [owner, placement]),
  );
}
