import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { DOCK_HEIGHT, RAIL_WIDTH, useLayout } from '@/lib/layout';
import { colors, gradients } from '@/theme/colors';
import { spring } from '@/theme/motion';

const items: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Store', icon: 'store' },
  explore: { label: 'Explore', icon: 'compass' },
  trade: { label: 'Trade', icon: 'swap' },
  vault: { label: 'Vault', icon: 'bookmark' },
  me: { label: 'Me', icon: 'user' },
};

const CENTER = 'trade';
const RAIL_ITEM = 72;

/** The raised gold Trade key at the heart of the dock. It turns half a revolution when selected. */
function TradeKey({ focused, onPress, compact }: { focused: boolean; onPress: () => void; compact?: boolean }) {
  const spin = useSharedValue(focused ? 180 : 0);
  useEffect(() => {
    spin.set(withSpring(focused ? 180 : 0, spring.calm));
  }, [focused, spin]);
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const size = compact ? 52 : 60;

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.9}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel="Trade: sell or swap your phone"
      style={[styles.key, { width: size, height: size }, !compact && styles.raised]}
    >
      <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={icon}>
        <Icon name="swap" size={26} color={colors.ink} strokeWidth={2.1} />
      </Animated.View>
    </PressableScale>
  );
}

function DockItem({ name, focused, onPress, vertical }: { name: string; focused: boolean; onPress: () => void; vertical: boolean }) {
  const item = items[name]!;
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.set(withSpring(focused ? 1 : 0, spring.calm));
  }, [focused, lift]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value * 2 }, { scale: 1 + lift.value * 0.06 }] }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={item.label}
      style={vertical ? { height: RAIL_ITEM } : styles.flex}
      className="items-center justify-center gap-1"
    >
      <Animated.View style={style} className="items-center gap-1">
        <Icon name={item.icon} size={22} color={focused ? colors.gold : colors.mist} strokeWidth={focused ? 2 : 1.7} />
        <Text className={`font-sora-medium text-[10px] ${focused ? 'text-gold' : 'text-dim'}`}>{item.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * A floating dock on phones (with a raised Trade key) and a slim rail on tablets
 * and desktops. A short gold marker slides to whichever section is active.
 */
export function Dock({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { rail } = useLayout();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const segment = width / state.routes.length;
  const activeName = state.routes[state.index]?.name;

  // The marker glides to the active section, stretching while it travels and
  // settling back to a dot, like a drop of liquid gold.
  const target = rail ? state.index * RAIL_ITEM + RAIL_ITEM / 2 - 14 : state.index * segment + segment / 2 - 9;
  const position = useSharedValue(target);
  const stretch = useSharedValue(1);
  const visible = useSharedValue(activeName === CENTER ? 0 : 1);

  useEffect(() => {
    position.set(withSpring(target, spring.calm));
    stretch.set(withSequence(withTiming(2.2, { duration: 140 }), withSpring(1, spring.calm)));
    visible.set(withSpring(activeName === CENTER ? 0 : 1, spring.calm));
  }, [activeName, position, stretch, target, visible]);

  const marker = useAnimatedStyle(() => {
    const s = stretch.get();
    return rail
      ? { opacity: visible.get(), height: 28 * s, transform: [{ translateY: position.get() - (28 * s - 28) / 2 }] }
      : { opacity: visible.get(), width: 18 * s, transform: [{ translateX: position.get() - (18 * s - 18) / 2 }] };
  });

  const press = (index: number) => {
    const route = state.routes[index]!;
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (state.index !== index && !event.defaultPrevented) navigateToTab(route.key);
  };

  const content = state.routes.map((route, index) =>
    route.name === CENTER ? (
      <View key={route.key} style={rail ? { height: RAIL_ITEM + 8 } : styles.flex} className="items-center justify-center">
        <TradeKey focused={state.index === index} onPress={() => press(index)} compact={rail} />
      </View>
    ) : (
      <DockItem key={route.key} name={route.name} vertical={rail} focused={state.index === index} onPress={() => press(index)} />
    ),
  );

  if (rail) {
    return (
      <View style={{ width: RAIL_WIDTH, paddingTop: insets.top + 24 }} className="items-center border-r border-edge bg-ink-2">
        <LogoMark size={44} />
        <View className="mt-10 w-full">
          <Animated.View style={[styles.railMarker, marker]} />
          {content}
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={[styles.floating, { bottom: Math.max(insets.bottom, 12) }]}>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={styles.dock}
        className="w-full max-w-[520px] flex-row self-center rounded-[26px] border border-edge-strong bg-ink-2"
      >
        {width > 0 && <Animated.View style={[styles.marker, marker]} />}
        {content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  floating: { position: 'absolute', left: 16, right: 16 },
  dock: {
    height: DOCK_HEIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  marker: { position: 'absolute', bottom: 7, left: 0, width: 18, height: 3, borderRadius: 2, backgroundColor: colors.gold },
  railMarker: { position: 'absolute', left: 0, top: 0, width: 3, height: 28, borderRadius: 2, backgroundColor: colors.gold },
  key: { borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  raised: {
    marginTop: -26,
    borderWidth: 4,
    borderColor: colors.ink,
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
});
