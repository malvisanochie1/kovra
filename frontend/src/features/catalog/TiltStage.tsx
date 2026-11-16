import { useMemo, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { useLoop } from '@/hooks/useLoop';
import { spring } from '@/theme/motion';

interface TiltStageProps {
  children: ReactNode;
  height: number;
  /** Maximum tilt in degrees while dragging. */
  maxTilt?: number;
}

/**
 * Presents a device on a lit pedestal. It hovers gently on its own, and tilts in
 * 3D under the customer's finger, springing back flat on release. Built on
 * PanResponder so no gesture library is needed.
 */
export function TiltStage({ children, height, maxTilt = 22 }: TiltStageProps) {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const hover = useLoop({ duration: 4400, reverse: true });
  const ring = useLoop({ duration: 9000, easing: Easing.linear });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_e, g) => {
          tiltY.set(Math.max(-maxTilt, Math.min(maxTilt, g.dx / 6)));
          tiltX.set(Math.max(-maxTilt, Math.min(maxTilt, -g.dy / 8)));
        },
        onPanResponderRelease: () => {
          tiltX.set(withSpring(0, spring.calm));
          tiltY.set(withSpring(0, spring.calm));
        },
        onPanResponderTerminate: () => {
          tiltX.set(withSpring(0, spring.calm));
          tiltY.set(withSpring(0, spring.calm));
        },
      }),
    [maxTilt, tiltX, tiltY],
  );

  const device = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { translateY: (hover.value - 0.5) * 12 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
    ],
  }));
  const shadow = useAnimatedStyle(() => ({
    opacity: 0.55 - (hover.value - 0.5) * 0.2,
    transform: [{ translateX: tiltY.value * 1.2 }, { scaleX: 1 - (hover.value - 0.5) * 0.12 }],
  }));
  // A spark that orbits the pedestal's rim.
  const spark = useAnimatedProps(() => ({
    cx: 100 + Math.cos(ring.value * Math.PI * 2) * 92,
    cy: 30 + Math.sin(ring.value * Math.PI * 2) * 22,
  }));

  return (
    <View {...responder.panHandlers} style={{ height }} className="items-center justify-center">
      <Svg width={height * 0.9} height={height * 0.27} viewBox="0 0 200 60" style={[styles.pedestal, { bottom: -height * 0.06 }]}>
        <Ellipse cx="100" cy="30" rx="92" ry="22" fill="rgba(227,191,110,0.06)" stroke="rgba(227,191,110,0.35)" strokeWidth={1} />
        <Ellipse cx="100" cy="30" rx="64" ry="14" fill="none" stroke="rgba(91,124,255,0.25)" strokeWidth={1} />
        <AnimatedCircle animatedProps={spark} r={2.6} fill="#F4DEA4" />
      </Svg>
      <Animated.View style={[styles.shadow, { width: height * 0.42, bottom: height * 0.02 }, shadow]} />
      <Animated.View style={device}>{children}</Animated.View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  pedestal: { position: 'absolute' },
  shadow: { position: 'absolute', height: 16, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.6)' },
});
