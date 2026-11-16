import type { BottomTabNavigationOptions } from 'expo-router/tabs';

/**
 * Sections change with a sense of depth: the incoming page rises from slightly
 * behind while the outgoing one drifts forward and dissolves.
 */
export const depthTransition: Pick<BottomTabNavigationOptions, 'sceneStyleInterpolator' | 'transitionSpec'> = {
  transitionSpec: {
    animation: 'timing',
    config: { duration: 340 },
  },
  sceneStyleInterpolator: ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, -0.5, 0, 0.5, 1], outputRange: [0, 0, 1, 0, 0] }),
      transform: [{ scale: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.06, 1, 0.94] }) }],
    },
  }),
};
