import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { cancelAnimation, Easing, useSharedValue, withDelay, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

interface LoopOptions {
  duration: number;
  /** Ping-pong between 0 and 1 instead of restarting from 0. */
  reverse?: boolean;
  delay?: number;
  easing?: (t: number) => number;
}

const smooth = Easing.inOut(Easing.sin);

/**
 * A shared value that loops from 0 to 1 on the UI thread while its screen is
 * focused, and rests when it isn't, so background screens never compete with the
 * one in view for frames. Pass a stable `easing` (module-level), or the loop
 * restarts on every render.
 */
export function useLoop({ duration, reverse = false, delay = 0, easing = smooth }: LoopOptions): SharedValue<number> {
  const value = useSharedValue(0);
  const focused = useIsFocused();

  useEffect(() => {
    if (!focused) return;
    value.set(withDelay(delay, withRepeat(withTiming(1, { duration, easing }), -1, reverse)));
    return () => cancelAnimation(value);
  }, [delay, duration, easing, focused, reverse, value]);

  return value;
}
