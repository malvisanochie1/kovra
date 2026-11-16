import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { scenes, type SceneName } from '@/lib/scenes';
import { colors } from '@/theme/colors';

interface Tile {
  title: string;
  detail: string;
  icon: IconName;
  href: Href;
  scene: SceneName;
}

const phones: Tile = {
  title: 'All types of phones',
  detail: 'Android & iPhone, new and UK-used',
  icon: 'device',
  scene: 'service-phones',
  href: { pathname: '/explore', params: { category: 'phones' } },
};
const gadgets: Tile = {
  title: 'Solid gadgets',
  detail: 'Audio, watches & power',
  icon: 'headphones',
  scene: 'service-gadgets',
  href: { pathname: '/explore', params: { category: 'gadgets' } },
};
const used: Tile = {
  title: 'Buy & sell used',
  detail: 'Cash for your phone',
  icon: 'wallet',
  scene: 'service-buy-sell',
  href: { pathname: '/trade/[kind]', params: { kind: 'sell' } },
};

/** Darkens the lower part of a photo so the copy on top stays readable. */
function Scrim() {
  return (
    <LinearGradient
      colors={['rgba(5,7,15,0.05)', 'rgba(5,7,15,0.55)', 'rgba(5,7,15,0.94)']}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}

function SmallTile({ tile, index }: { tile: Tile; index: number }) {
  return (
    <Reveal index={index} className="flex-1 md:flex-1">
      <PressableScale
        onPress={() => router.push(tile.href)}
        accessibilityLabel={tile.title}
        className="h-32 justify-between overflow-hidden rounded-[22px] border border-edge bg-ink-2 p-3.5 md:h-auto md:flex-1"
      >
        <Image source={scenes[tile.scene]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <Scrim />
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-ink/70">
          <Icon name={tile.icon} size={16} color={colors.gold} />
        </View>
        <View className="gap-0.5">
          <Text className="font-sora-semibold text-[13px] text-snow">{tile.title}</Text>
          <Text numberOfLines={2} className="font-sora text-[11px] leading-4 text-mist">
            {tile.detail}
          </Text>
        </View>
      </PressableScale>
    </Reveal>
  );
}

/** The large tile, led by a photo of the range. */
function PhonesTile() {
  return (
    <Reveal index={0} className="md:flex-[1.3]">
      <PressableScale
        onPress={() => router.push(phones.href)}
        accessibilityLabel={phones.title}
        className="h-44 justify-end overflow-hidden rounded-[22px] border border-edge bg-ink-3 p-4 md:h-auto md:min-h-[260px] md:flex-1"
      >
        <Image source={scenes[phones.scene]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <Scrim />
        <View className="gap-0.5">
          <Text className="font-sora-semibold text-base text-snow">{phones.title}</Text>
          <Text className="font-sora text-[11px] text-mist">{phones.detail}</Text>
        </View>
      </PressableScale>
    </Reveal>
  );
}

/** The flyer’s services: a wide lead tile over two equal tiles on phones, a bento grid on larger screens. */
export function Services() {
  return (
    <View className="gap-3 md:flex-row">
      <PhonesTile />
      <View className="flex-row gap-3 md:flex-1 md:flex-col">
        <SmallTile tile={gadgets} index={1} />
        <SmallTile tile={used} index={2} />
      </View>
    </View>
  );
}
