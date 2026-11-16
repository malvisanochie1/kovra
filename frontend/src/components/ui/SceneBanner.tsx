import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { scenes, type SceneName } from '@/lib/scenes';

interface SceneBannerProps {
  scene: SceneName;
  height: number;
  /** Content laid over the bottom of the photo. */
  children?: ReactNode;
  className?: string;
}

/** A rounded mood photo with a soft fade at the bottom for any copy laid over it. */
export function SceneBanner({ scene, height, children, className = '' }: SceneBannerProps) {
  return (
    <View style={{ height }} className={`justify-end overflow-hidden rounded-[22px] border border-edge bg-ink-2 ${className}`}>
      <Image source={scenes[scene]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      {children && (
        <>
          <LinearGradient
            colors={['rgba(5,7,15,0)', 'rgba(5,7,15,0.6)', 'rgba(5,7,15,0.95)']}
            locations={[0.2, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View className="p-4">{children}</View>
        </>
      )}
    </View>
  );
}
