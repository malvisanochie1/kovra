import type { Product } from '@kovra/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/lib/layout';
import { playDropSound } from '@/lib/sound';
import { useTray } from '@/store/tray';
import { colors } from '@/theme/colors';
import { ProductVisual } from '../catalog/ProductVisual';
import { trayTarget } from './geometry';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Drop {
  id: number;
  from: Rect;
  to: { x: number; y: number };
  product: Product;
  color?: string;
}

interface DropToTrayApi {
  /**
   * Lifts the product off `origin` and pulls it into the Bag Tray. `onLand` runs on
   * arrival, which is when the item is added and the tray plays its catch.
   */
  drop: (origin: HostInstance | null, product: Product, onLand: () => void, color?: string) => void;
}

const DropContext = createContext<DropToTrayApi | null>(null);

/** Lift (0 → 0.18), then a magnetic pull into the tray (0.18 → 1). */
const DURATION_MS = 760;
const LIFT = 0.18;

function OriginPulse({ progress, from }: { progress: SharedValue<number>; from: Rect }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, LIFT, 0.6], [0, 0.9, 0], 'clamp'),
    transform: [{ scale: interpolate(progress.value, [0, 0.6], [0.9, 1.25], 'clamp') }],
  }));
  return (
    <Animated.View
      style={[
        styles.pulse,
        { left: from.x, top: from.y, width: from.width, height: from.height, borderRadius: Math.min(from.width, from.height) / 2 },
        style,
      ]}
    />
  );
}

function DropSprite({ drop, onDone }: { drop: Drop; onDone: (id: number) => void }) {
  const progress = useSharedValue(0);
  const size = Math.min(140, Math.max(drop.from.width, drop.from.height));
  const start = { x: drop.from.x + drop.from.width / 2, y: drop.from.y + drop.from.height / 2 };

  useEffect(() => {
    progress.set(
      withSequence(
        withTiming(LIFT, { duration: DURATION_MS * LIFT, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: DURATION_MS * (1 - LIFT), easing: Easing.in(Easing.cubic) }, (finished) => {
          if (finished) runOnJS(onDone)(drop.id);
        }),
      ),
    );
  }, [drop.id, onDone, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const pull = p <= LIFT ? 0 : (p - LIFT) / (1 - LIFT);
    // A slight sideways swoop so the path curves into the tray rather than sliding straight.
    const swoop = Math.sin(pull * Math.PI) * 26;
    return {
      opacity: p < 0.92 ? 1 : (1 - p) / 0.08,
      transform: [
        { translateX: start.x + (drop.to.x - start.x) * pull + swoop },
        { translateY: start.y - (p <= LIFT ? (p / LIFT) * 10 : 10 * (1 - pull)) + (drop.to.y - start.y) * pull },
        { scale: p <= LIFT ? 1 + (p / LIFT) * 0.06 : 1.06 - pull * 0.86 },
      ],
    };
  });

  return (
    <>
      <OriginPulse progress={progress} from={drop.from} />
      <Animated.View style={[styles.anchor, style]}>
        <View style={[styles.sprite, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }]}>
          <ProductVisual product={drop.product} color={drop.color} height={size * 0.9} />
        </View>
      </Animated.View>
    </>
  );
}

export function DropToTrayProvider({ children }: { children: ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const nextId = useRef(0);
  const landHandlers = useRef(new Map<number, () => void>());
  const geometry = useRef({ layout, bottom: insets.bottom });

  useEffect(() => {
    geometry.current = { layout, bottom: insets.bottom };
  }, [layout, insets.bottom]);

  const drop = useCallback<DropToTrayApi['drop']>((origin, product, onLand, color) => {
    if (!origin) {
      onLand();
      return;
    }
    origin.measureInWindow((x, y, width, height) => {
      const { beginFlight, placement } = useTray.getState();
      beginFlight();
      const id = nextId.current++;
      const to = trayTarget(geometry.current.layout, geometry.current.bottom, placement === 'hidden' ? 'dock' : placement);
      landHandlers.current.set(id, onLand);
      setDrops((current) => [...current, { id, from: { x, y, width, height }, to, product, color }]);
    });
  }, []);

  const handleDone = useCallback((id: number) => {
    landHandlers.current.get(id)?.();
    landHandlers.current.delete(id);
    setDrops((current) => current.filter((d) => d.id !== id));
    playDropSound();
    useTray.getState().land();
  }, []);

  const api = useMemo(() => ({ drop }), [drop]);

  return (
    <DropContext.Provider value={api}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {drops.map((d) => (
          <DropSprite key={d.id} drop={d} onDone={handleDone} />
        ))}
      </View>
    </DropContext.Provider>
  );
}

export function useDropToTray(): DropToTrayApi {
  const api = useContext(DropContext);
  if (!api) throw new Error('useDropToTray must be used inside <DropToTrayProvider>');
  return api;
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: 0, top: 0 },
  sprite: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(17,25,51,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(227,191,110,0.5)',
    shadowColor: colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  pulse: { position: 'absolute', borderWidth: 2, borderColor: colors.gold },
});
