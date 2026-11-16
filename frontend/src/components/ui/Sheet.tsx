import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spring, timing } from '@/theme/motion';
import { IconButton } from './IconButton';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet on phones, centred dialog on wide screens. Glides in and fades the backdrop. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Mount as soon as the sheet is asked to open; unmount only after it has animated out.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.set(withSpring(1, spring.glide));
    } else if (mounted) {
      progress.set(
        withTiming(0, timing.fast, (finished) => {
          if (finished) runOnJS(setMounted)(false);
        }),
      );
    }
  }, [visible, mounted, progress]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panel = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.6),
    transform: [{ translateY: (1 - progress.value) * 80 }],
  }));

  return (
    <Modal transparent visible={mounted} onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} className="bg-black/70">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <View pointerEvents="box-none" className="flex-1 justify-end md:items-center md:justify-center">
        <Animated.View
          style={[panel, { paddingBottom: Math.max(insets.bottom, 16) }]}
          className="max-h-[80%] w-full rounded-t-[32px] border border-edge bg-ink-2 md:max-w-[520px] md:rounded-[32px]"
        >
          <View className="flex-row items-center justify-between px-6 pb-2 pt-5">
            <Text className="font-sora-semibold text-lg text-snow">{title}</Text>
            <IconButton icon="close" label="Close" size={38} onPress={onClose} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
