import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { useInVault, useVault } from '@/store/vault';
import { colors } from '@/theme/colors';
import { spring } from '@/theme/motion';

interface VaultButtonProps {
  productId: string;
  size?: number;
}

/**
 * Locks a product into the Vault. The bookmark flips over to gold, a seal ring
 * stamps down around it and a small "Vaulted" tag drifts up and away.
 */
export function VaultButton({ productId, size = 38 }: VaultButtonProps) {
  const kept = useInVault(productId);
  const toggle = useVault((s) => s.toggle);
  const [face, setFace] = useState(kept);
  const flip = useSharedValue(0);
  const seal = useSharedValue(0);
  const tag = useSharedValue(0);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Flip to edge-on, swap the face, then flip back flat.
    flip.set(
      withSequence(
        withTiming(90, { duration: 140, easing: Easing.in(Easing.quad) }, () => runOnJS(setFace)(kept)),
        withSpring(0, spring.soft),
      ),
    );
    if (kept) {
      seal.set(0);
      seal.set(withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
      tag.set(0);
      tag.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    }
  }, [kept, flip, seal, tag]);

  const icon = useAnimatedStyle(() => ({ transform: [{ perspective: 300 }, { rotateY: `${flip.value}deg` }] }));
  const sealStyle = useAnimatedStyle(() => ({
    opacity: seal.value <= 0 || seal.value >= 1 ? 0 : 1 - seal.value,
    transform: [{ scale: 1.7 - seal.value * 0.7 }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tag.value <= 0 || tag.value >= 1 ? 0 : tag.value < 0.2 ? tag.value / 0.2 : 1 - (tag.value - 0.2) / 0.8,
    transform: [{ translateY: -size * 0.7 - tag.value * 18 }],
  }));

  return (
    <PressableScale
      onPress={() => toggle(productId)}
      pressedScale={0.88}
      hitSlop={8}
      accessibilityLabel={kept ? 'Remove from Vault' : 'Save to Vault'}
      accessibilityState={{ selected: kept }}
      style={{ width: size, height: size }}
      className={`items-center justify-center rounded-xl border ${face ? 'border-gold/60 bg-gold/15' : 'border-edge bg-ink/70'}`}
    >
      <Animated.View pointerEvents="none" style={[styles.seal, { width: size, height: size }, sealStyle]} />
      <Animated.View pointerEvents="none" style={[styles.tag, tagStyle]}>
        <Text className="font-sora-semibold text-[10px] text-ink">Vaulted</Text>
      </Animated.View>
      <Animated.View style={icon}>
        <Icon name="bookmark" size={size * 0.46} color={face ? colors.gold : colors.snow} filled={face} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  seal: { position: 'absolute', borderRadius: 14, borderWidth: 2, borderColor: colors.gold },
  tag: { position: 'absolute', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.gold },
});
