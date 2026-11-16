import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { scenes, type SceneName } from '@/lib/scenes';

const tiles: { category: string; label: string; scene: SceneName }[] = [
  { category: 'audio', label: 'Audio', scene: 'category-audio' },
  { category: 'wearables', label: 'Wearables', scene: 'category-wearables' },
  { category: 'power', label: 'Power', scene: 'category-power' },
];

/** Three photo tiles that open Explore on a gadget category. */
export function CategoryTiles() {
  return (
    <View className="flex-row gap-2.5">
      {tiles.map((tile, index) => (
        <Reveal index={index} key={tile.category} className="flex-1">
          <PressableScale
            onPress={() => router.push({ pathname: '/explore', params: { category: tile.category } })}
            accessibilityLabel={`Shop ${tile.label}`}
            className="h-28 justify-end overflow-hidden rounded-[18px] border border-edge bg-ink-2 p-2.5 md:h-40"
          >
            <Image source={scenes[tile.scene]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            <LinearGradient colors={['rgba(5,7,15,0)', 'rgba(5,7,15,0.9)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
            <Text className="font-sora-semibold text-xs text-snow">{tile.label}</Text>
          </PressableScale>
        </Reveal>
      ))}
    </View>
  );
}
