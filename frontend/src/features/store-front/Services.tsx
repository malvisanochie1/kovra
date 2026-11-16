import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { DeviceArt } from '@/features/catalog/DeviceArt';
import { useLoop } from '@/hooks/useLoop';
import { colors } from '@/theme/colors';
import { rise } from '@/theme/entering';

interface Tile {
  title: string;
  detail: string;
  icon: IconName;
  href: Href;
}

const phones: Tile = {
  title: 'All types of phones',
  detail: 'Android & iPhone, new and UK-used',
  icon: 'device',
  href: { pathname: '/explore', params: { category: 'phones' } },
};
const gadgets: Tile = {
  title: 'Solid gadgets',
  detail: 'Audio, watches, power',
  icon: 'headphones',
  href: { pathname: '/explore', params: { category: 'gadgets' } },
};
const used: Tile = {
  title: 'Buy & sell used',
  detail: 'Cash for your phone',
  icon: 'wallet',
  href: { pathname: '/trade/[kind]', params: { kind: 'sell' } },
};

function SmallTile({ tile, index }: { tile: Tile; index: number }) {
  return (
    <Animated.View entering={rise(index)} className="flex-1">
      <PressableScale
        onPress={() => router.push(tile.href)}
        accessibilityLabel={tile.title}
        className="flex-1 justify-between gap-6 rounded-[22px] border border-edge bg-ink-2 p-4"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-ink-3">
          <Icon name={tile.icon} size={20} color={colors.gold} />
        </View>
        <View className="gap-0.5">
          <Text className="font-sora-semibold text-sm text-snow">{tile.title}</Text>
          <Text numberOfLines={1} className="font-sora text-[11px] text-mist">
            {tile.detail}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

/** The large tile: a fan of devices that breathes slowly. */
function PhonesTile() {
  const breathe = useLoop({ duration: 5200, reverse: true });
  const left = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-16 - breathe.value * 4}deg` }, { translateX: -22 - breathe.value * 4 }],
  }));
  const right = useAnimatedStyle(() => ({
    transform: [{ rotate: `${16 + breathe.value * 4}deg` }, { translateX: 22 + breathe.value * 4 }],
  }));

  return (
    <Animated.View entering={rise(0)} className="flex-[1.3]">
      <PressableScale
        onPress={() => router.push(phones.href)}
        accessibilityLabel={phones.title}
        className="flex-1 overflow-hidden rounded-[22px] border border-edge bg-ink-3 p-4"
      >
        <View className="h-28 items-center justify-end">
          <Animated.View style={[{ position: 'absolute', bottom: 0 }, left]}>
            <DeviceArt kind="phone" brand="Samsung" color="#8E9CB0" height={92} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', bottom: 0 }, right]}>
            <DeviceArt kind="phone" brand="Google" color="#2B3A55" height={92} />
          </Animated.View>
          <DeviceArt kind="phone" brand="Apple" color="#D9733B" height={104} />
        </View>
        <View className="mt-4 gap-0.5">
          <Text className="font-sora-semibold text-base text-snow">{phones.title}</Text>
          <Text className="font-sora text-[11px] text-mist">{phones.detail}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

/** The flyer's services as an asymmetric bento grid. */
export function Services() {
  return (
    <View className="flex-row gap-3">
      <PhonesTile />
      <View className="flex-1 gap-3">
        <SmallTile tile={gadgets} index={1} />
        <SmallTile tile={used} index={2} />
      </View>
    </View>
  );
}
