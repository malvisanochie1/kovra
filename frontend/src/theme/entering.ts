import { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ease, STAGGER_MS } from './motion';

/*
 * Entrance presets. They deliberately use Reanimated's built-in animations without
 * custom initial values: on the web, customised entrances are pinned with absolute
 * positioning once they finish, which breaks layouts that change afterwards.
 */

/** Staggered rise-and-fade used for list items and page sections. */
export const rise = (index = 0) =>
  FadeInDown.duration(560)
    .delay(index * STAGGER_MS)
    .easing(ease);

export const slideIn = (index = 0) =>
  FadeInRight.duration(520)
    .delay(index * STAGGER_MS)
    .easing(ease);

export const fade = (delay = 0) => FadeIn.duration(480).delay(delay).easing(ease);
