import type { Product } from '@kovra/shared';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProductVisual } from './ProductVisual';
import { TiltStage } from './TiltStage';

interface FlipViewerProps {
  product: Product;
  color: string;
  height: number;
}

/**
 * The product page's stage. The device can be tilted by dragging, and turned
 * between its back and its screen with a 3D flip.
 */
export function FlipViewer({ product, color, height }: FlipViewerProps) {
  const canFlip = product.art === 'phone';
  const [side, setSide] = useState<'back' | 'front'>('back');
  const [shown, setShown] = useState<'back' | 'front'>('back');
  const turn = useSharedValue(0);

  useEffect(() => {
    if (side === shown) return;
    turn.set(
      withSequence(
        withTiming(90, { duration: 220, easing: Easing.in(Easing.quad) }, () => runOnJS(setShown)(side)),
        withTiming(0, { duration: 320, easing: Easing.out(Easing.back(1.4)) }),
      ),
    );
  }, [side, shown, turn]);

  const flip = useAnimatedStyle(() => ({ transform: [{ perspective: 800 }, { rotateY: `${turn.value}deg` }] }));

  return (
    <View className="items-center gap-4">
      <TiltStage height={height}>
        <Animated.View style={flip}>
          <ProductVisual product={product} color={color} height={height * 0.88} view={shown} />
        </Animated.View>
      </TiltStage>
      {canFlip && (
        <View className="flex-row rounded-xl border border-edge bg-ink-2 p-1">
          {(['back', 'front'] as const).map((value) => (
            <PressableScale
              key={value}
              onPress={() => setSide(value)}
              accessibilityState={{ selected: side === value }}
              className={`rounded-lg px-4 py-2 ${side === value ? 'bg-ink-4' : ''}`}
            >
              <Text className={`font-sora-medium text-xs ${side === value ? 'text-gold' : 'text-mist'}`}>
                {value === 'back' ? 'Back' : 'Screen'}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}
    </View>
  );
}
