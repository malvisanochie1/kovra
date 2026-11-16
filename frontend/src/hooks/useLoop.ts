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
 * A shared value that loops from 0 to 1 forever on the UI thread.
 * Pass a stable `easing` (module-level), or the loop restarts on every render.
 */
export function useLoop({ duration, reverse = false, delay = 0, easing = smooth }: LoopOptions): SharedValue<number> {
  const value = useSharedValue(0);

  useEffect(() => {
    value.set(withDelay(delay, withRepeat(withTiming(1, { duration, easing }), -1, reverse)));
    return () => cancelAnimation(value);
  }, [delay, duration, easing, reverse, value]);

  return value;
}
