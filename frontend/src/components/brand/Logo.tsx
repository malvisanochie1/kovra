import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

/** The Kovra monogram: a gold "K" with a spark, set in a midnight tile. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Kovra">
      <Defs>
        <LinearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F7E3AE" />
          <Stop offset="0.55" stopColor="#E3BF6E" />
          <Stop offset="1" stopColor="#A87C2E" />
        </LinearGradient>
      </Defs>
      <Rect x="1" y="1" width="46" height="46" rx="14" fill="#111933" stroke="url(#logo-gold)" strokeOpacity={0.55} />
      <Path
        d="M17 13.5v21M30.5 13.5 19.5 24l11 10.5"
        stroke="url(#logo-gold)"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M35 9.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" fill="#F4DEA4" />
    </Svg>
  );
}

export function Logo({ size = 40, withWordmark = true }: LogoProps) {
  return (
    <View className="flex-row items-center gap-3">
      <LogoMark size={size} />
      {withWordmark && (
        <Text style={{ fontSize: size * 0.48 }} className="font-sora-bold tracking-[3px] text-snow">
          KOVRA
        </Text>
      )}
    </View>
  );
}
