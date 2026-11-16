import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { scenes } from '@/lib/scenes';
import { colors } from '@/theme/colors';

const modes = [
  {
    kind: 'sell',
    eyebrow: 'Cash out',
    title: 'Sell for cash',
    body: 'Instant offer for your used phone. Paid by transfer once it’s checked.',
    scene: scenes['trade-sell'],
    accent: 'text-success',
  },
  {
    kind: 'swap',
    eyebrow: 'Trade up',
    title: 'Swap & upgrade',
    body: 'Trade your phone towards a new or UK-used one. Pay only the difference.',
    scene: scenes['trade-swap'],
    accent: 'text-gold',
  },
] as const;

/** The two ways to trade, each led by its own photo. */
export function ModeCards() {
  return (
    <View className="gap-3 md:flex-row">
      {modes.map(({ kind, eyebrow, title, body, scene, accent }, index) => (
        <Reveal index={index + 1} key={kind} className="md:flex-1">
          <PressableScale
            onPress={() => router.push({ pathname: '/trade/[kind]', params: { kind } })}
            accessibilityLabel={title}
            className="flex-row items-center gap-3 overflow-hidden rounded-[22px] border border-edge bg-ink-2 p-3"
          >
            <Image source={scene} style={{ width: 92, height: 92, borderRadius: 16 }} contentFit="cover" transition={200} />
            <View className="flex-1 gap-1 py-1">
              <Text className={`font-sora-semibold text-[10px] uppercase tracking-[1.8px] ${accent}`}>{eyebrow}</Text>
              <Text className="font-sora-semibold text-base text-snow md:text-lg">{title}</Text>
              <Text className="font-sora text-xs leading-[18px] text-mist">{body}</Text>
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-full border border-edge bg-ink-3">
              <Icon name="arrow" size={14} color={colors.gold} />
            </View>
          </PressableScale>
        </Reveal>
      ))}
    </View>
  );
}
