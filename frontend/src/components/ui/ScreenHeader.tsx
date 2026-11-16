import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';

interface ScreenHeaderProps {
  title?: string;
  right?: ReactNode;
  /** Falls back here when there is no screen to go back to, e.g. after a deep link. */
  fallbackHref?: '/' | '/explore' | '/me';
}

export function ScreenHeader({ title, right, fallbackHref = '/' }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(fallbackHref));

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="w-full max-w-[1240px] flex-row items-center gap-3 self-center px-5 pb-3 md:px-8"
    >
      <IconButton icon="back" label="Go back" onPress={goBack} />
      <Text numberOfLines={1} className="flex-1 font-sora-semibold text-lg text-snow" accessibilityRole="header">
        {title}
      </Text>
      {right}
    </View>
  );
}
