import { orderStatusFlow, orderStatusLabels, type OrderStatus } from '@kovra/shared';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useLoop } from '@/hooks/useLoop';
import { colors } from '@/theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const stageIcons: Record<(typeof orderStatusFlow)[number], IconName> = {
  placed: 'receipt',
  confirmed: 'check',
  packed: 'box',
  'in-transit': 'truck',
  delivered: 'pin',
};

/** The ring spans 300° so the start and end don't meet; it opens at the bottom. */
const SWEEP = 300;
const START = 120; // degrees, measured clockwise from the positive x-axis

const toPoint = (fraction: number, radius: number, centre: number) => {
  const angle = ((START + SWEEP * fraction) * Math.PI) / 180;
  return { x: centre + Math.cos(angle) * radius, y: centre + Math.sin(angle) * radius };
};

interface JourneyRingProps {
  status: OrderStatus;
  size: number;
  caption: string;
}

/**
 * Order progress as a ring of five stages. The gold arc fills to the current stage
 * and a beacon pulses on it; finished stages show a check.
 */
export function JourneyRing({ status, size, caption }: JourneyRingProps) {
  const index = Math.max(0, orderStatusFlow.indexOf(status as (typeof orderStatusFlow)[number]));
  const target = index / (orderStatusFlow.length - 1);
  const fill = useSharedValue(0);
  const pulse = useLoop({ duration: 1600, easing: Easing.out(Easing.quad) });

  const centre = size / 2;
  const radius = size / 2 - 28;
  const arcLength = (2 * Math.PI * radius * SWEEP) / 360;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    fill.set(withDelay(250, withTiming(target, { duration: 1300, easing: Easing.inOut(Easing.cubic) })));
  }, [fill, target]);

  const progressProps = useAnimatedProps(() => ({ strokeDasharray: `${arcLength * fill.value} ${circumference}` }));
  const beacon = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - pulse.value), transform: [{ scale: 1 + pulse.value * 0.9 }] }));
  const current = toPoint(target, radius, centre);
  const cancelled = status === 'cancelled';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: `${START}deg` }] }}>
        <Defs>
          <LinearGradient id="journey" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.goldSoft} />
            <Stop offset="1" stopColor={colors.goldDeep} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={centre}
          cy={centre}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {!cancelled && (
          <AnimatedCircle
            cx={centre}
            cy={centre}
            r={radius}
            stroke="url(#journey)"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            animatedProps={progressProps}
          />
        )}
      </Svg>

      {orderStatusFlow.map((stage, i) => {
        const point = toPoint(i / (orderStatusFlow.length - 1), radius, centre);
        const done = !cancelled && i <= index;
        return (
          <View
            key={stage}
            style={{ position: 'absolute', left: point.x - 18, top: point.y - 18 }}
            className={`h-9 w-9 items-center justify-center rounded-xl border ${done ? 'border-gold bg-gold' : 'border-edge-strong bg-ink-2'}`}
            accessibilityLabel={`${orderStatusLabels[stage]}${done ? ', done' : ''}`}
          >
            <Icon name={i < index && done ? 'check' : stageIcons[stage]} size={16} color={done ? colors.ink : colors.dim} strokeWidth={2} />
          </View>
        );
      })}

      {!cancelled && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: current.x - 18,
              top: current.y - 18,
              width: 36,
              height: 36,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.gold,
            },
            beacon,
          ]}
        />
      )}

      <View className="items-center gap-1 px-10">
        <Text className="font-sora-medium text-[11px] uppercase tracking-[2px] text-gold">
          {cancelled ? 'Order' : `Stage ${index + 1} of 5`}
        </Text>
        <Text className="text-center font-sora-bold text-2xl text-snow">{orderStatusLabels[status]}</Text>
        <Text className="text-center font-sora text-xs text-mist">{caption}</Text>
      </View>
    </View>
  );
}
