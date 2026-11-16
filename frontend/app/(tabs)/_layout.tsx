import { Tabs } from 'expo-router/tabs';
import { useLayout } from '@/lib/layout';
import { Dock } from '@/navigation/Dock';
import { depthTransition } from '@/navigation/transitions';
import { colors } from '@/theme/colors';

export default function DockLayout() {
  const { rail } = useLayout();

  return (
    <Tabs
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{
        headerShown: false,
        // Sections mount on first visit, so app start only renders the store.
        lazy: true,
        tabBarPosition: rail ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: colors.ink },
        ...depthTransition,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="trade" />
      <Tabs.Screen name="vault" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
