import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, useWindowDimensions, View, type HostInstance } from 'react-native';
import { withUniwind } from 'uniwind';

type Listener = (scrollY: number) => void;

export interface ScrollBus {
  /** Latest scroll offset of the page. */
  current: () => number;
  subscribe: (listener: Listener) => () => void;
}

/** Scroll position of the page a ScrollReveal lives in. Provided by ScrollShell. */
export const ScrollContext = createContext<ScrollBus | null>(null);

/** Creates the bus a scrolling page uses to tell its sections where it is. */
export function createScrollBus(): ScrollBus & { publish: (scrollY: number) => void } {
  let latest = 0;
  const listeners = new Set<Listener>();
  return {
    current: () => latest,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish: (scrollY) => {
      latest = scrollY;
      listeners.forEach((listener) => listener(scrollY));
    },
  };
}

/** The browser has no native animation module; it runs the same animation in JS. */
const nativeDriver = Platform.OS !== 'web';
const easing = Easing.bezier(0.22, 1, 0.36, 1);

/** React Native's Animated.View with Tailwind `className` support. */
const AnimatedView = withUniwind(Animated.View);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * A section that rises into place the first time it scrolls into view. Sections
 * already on screen play the entrance straight away. The animation itself runs on
 * the native driver; JavaScript only decides *when* it starts.
 *
 * Fails open: if the section can't be measured, it is simply shown.
 */
export function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  const bus = useContext(ScrollContext);
  const { height } = useWindowDimensions();
  const ref = useRef<HostInstance>(null);
  const [progress] = useState(() => new Animated.Value(0));
  const [top, setTop] = useState<number | null>(null);
  // Without a scrolling page to watch, there's nothing to wait for.
  const [shown, setShown] = useState(bus === null);

  useEffect(() => {
    if (shown) {
      Animated.timing(progress, { toValue: 1, duration: 560, easing, useNativeDriver: nativeDriver }).start();
      return;
    }
    if (!bus || top === null) return;
    const check = (scrollY: number) => {
      if (scrollY + height > top + 40) setShown(true);
    };
    check(bus.current());
    return bus.subscribe(check);
  }, [bus, height, progress, shown, top]);

  // Never leave a section hidden because measuring failed.
  useEffect(() => {
    const fallback = setTimeout(() => top === null && setShown(true), 1200);
    return () => clearTimeout(fallback);
  }, [top]);

  const offset = progress.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] });

  return (
    <AnimatedView className={className} style={{ opacity: progress, transform: [{ translateY: offset }, { scale }] }}>
      <View
        ref={ref}
        collapsable={false}
        onLayout={() =>
          ref.current?.measureInWindow((_x, y) => {
            // Window position plus the current scroll offset gives the position within the page.
            setTop(y + (bus?.current() ?? 0));
          })
        }
      >
        {children}
      </View>
    </AnimatedView>
  );
}
