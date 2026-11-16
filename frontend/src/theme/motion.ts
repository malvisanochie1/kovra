import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/**
 * One motion language for the whole app: calm springs with no overshoot wobble,
 * and a single ease-out curve. Durations are short so nothing ever feels slow.
 */
export const spring = {
  /** Default for movement: settles quickly without bouncing. */
  calm: { damping: 22, stiffness: 180, mass: 1 } satisfies WithSpringConfig,
  /** Press feedback and small pops: a hint of life, nothing more. */
  soft: { damping: 15, stiffness: 260, mass: 0.8 } satisfies WithSpringConfig,
  /** Large surfaces such as sheets and page slides. */
  glide: { damping: 26, stiffness: 140, mass: 1 } satisfies WithSpringConfig,
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const timing = {
  fast: { duration: 180, easing: ease } satisfies WithTimingConfig,
  base: { duration: 320, easing: ease } satisfies WithTimingConfig,
  slow: { duration: 620, easing: ease } satisfies WithTimingConfig,
};

/** Delay between items in a staggered list entrance. */
export const STAGGER_MS = 55;
