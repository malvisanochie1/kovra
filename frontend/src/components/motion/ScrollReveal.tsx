import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useWindowDimensions, View, type HostInstance } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { ease } from '@/theme/motion';

/** Scroll position of the page a ScrollReveal lives in. Provided by ScrollShell. */
export const ScrollContext = createContext<SharedValue<number> | null>(null);

/** How far into the viewport (in points) a section travels while it fades in. */
const REVEAL_SPAN = 140;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sections rise into place as they scroll into view, driven entirely on the UI
 * thread from the page's scroll position. Sections already on screen play a short
 * entrance on mount. Once revealed, a section stays revealed.
 *
 * Fails open: until the section has been measured it is fully visible.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const scrollY = useContext(ScrollContext);
  const { height } = useWindowDimensions();
  const ref = useRef<HostInstance>(null);
  const top = useSharedValue(-1);
  const mounted = useSharedValue(0);
  const revealed = useSharedValue(0);

  useEffect(() => {
    mounted.set(withDelay(60, withTiming(1, { duration: 560, easing: ease })));
  }, [mounted]);

  useAnimatedReaction(
    () => {
      if (top.get() < 0 || !scrollY) return 1;
      const visible = scrollY.get() + height - top.get() - 24;
      return Math.max(0, Math.min(1, visible / REVEAL_SPAN));
    },
    (progress) => {
      if (progress > revealed.get()) revealed.set(progress);
    },
    [height, scrollY],
  );

  const style = useAnimatedStyle(() => {
    const p = Math.min(mounted.get(), revealed.get());
    return { opacity: p, transform: [{ translateY: (1 - p) * 28 }, { scale: 0.97 + p * 0.03 }] };
  });

  return (
    <Animated.View style={style} className={className}>
      <View
        ref={ref}
        collapsable={false}
        onLayout={() =>
          ref.current?.measureInWindow((_x, y) => {
            // Window position plus the current scroll offset gives the position in the page.
            if (y || scrollY?.get()) top.set(y + (scrollY?.get() ?? 0));
          })
        }
      >
        {children}
      </View>
    </Animated.View>
  );
}
