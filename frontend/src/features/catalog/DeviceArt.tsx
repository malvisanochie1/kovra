import type { ArtKind } from '@kovra/shared';
import { memo, useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { shade, withAlpha } from '@/lib/color';

/**
 * Vector product renders. They give every product a crisp, on-brand visual at any
 * size until real photography is added, and weigh almost nothing.
 */

interface DeviceArtProps {
  kind: ArtKind;
  color: string;
  brand?: string;
  /** Rendered height in points. Width follows the artwork's aspect ratio. */
  height: number;
  view?: 'back' | 'front';
}

export const artAspect = (kind: ArtKind) => (kind === 'phone' || kind === 'phone-fold' || kind === 'case' ? 0.5 : 1);

function Lens({ cx, cy, r, gid }: { cx: number; cy: number; r: number; gid: string }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#0B0D12" stroke="#3A3F4B" strokeWidth={2.5} />
      <Circle cx={cx} cy={cy} r={r * 0.62} fill={`url(#${gid}-lens)`} />
      <Circle cx={cx - r * 0.24} cy={cy - r * 0.28} r={r * 0.17} fill="#FFFFFF" opacity={0.55} />
    </G>
  );
}

function Defaults({ gid, color }: { gid: string; color: string }) {
  return (
    <Defs>
      <LinearGradient id={`${gid}-rim`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={shade(color, 0.5)} />
        <Stop offset="0.5" stopColor={shade(color, -0.1)} />
        <Stop offset="1" stopColor={shade(color, -0.45)} />
      </LinearGradient>
      <LinearGradient id={`${gid}-body`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={shade(color, 0.2)} />
        <Stop offset="0.55" stopColor={color} />
        <Stop offset="1" stopColor={shade(color, -0.28)} />
      </LinearGradient>
      <LinearGradient id={`${gid}-gloss`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
        <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient id={`${gid}-screen`} x1="0" y1="0" x2="0.6" y2="1">
        <Stop offset="0" stopColor={shade(color, 0.15)} />
        <Stop offset="0.45" stopColor="#1A2448" />
        <Stop offset="1" stopColor="#05070F" />
      </LinearGradient>
      <RadialGradient id={`${gid}-lens`} cx="0.4" cy="0.35" r="0.7">
        <Stop offset="0" stopColor="#2B3D6B" />
        <Stop offset="1" stopColor="#04060A" />
      </RadialGradient>
      <RadialGradient id={`${gid}-glow`} cx="0.5" cy="0.35" r="0.6">
        <Stop offset="0" stopColor="#E3BF6E" stopOpacity={0.55} />
        <Stop offset="1" stopColor="#E3BF6E" stopOpacity={0} />
      </RadialGradient>
    </Defs>
  );
}

function PhoneCamera({ brand, color, gid }: { brand?: string; color: string; gid: string }) {
  switch (brand) {
    case 'Apple':
      return (
        <G>
          <Rect x={22} y={20} width={88} height={92} rx={26} fill={shade(color, -0.08)} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
          <Lens cx={46} cy={44} r={17} gid={gid} />
          <Lens cx={46} cy={88} r={17} gid={gid} />
          <Lens cx={86} cy={66} r={17} gid={gid} />
          <Circle cx={86} cy={34} r={5} fill="#F5E9C8" opacity={0.85} />
          <Circle cx={86} cy={98} r={2.5} fill="#0B0D12" />
        </G>
      );
    case 'Samsung':
      return (
        <G>
          <Lens cx={40} cy={46} r={15} gid={gid} />
          <Lens cx={40} cy={88} r={15} gid={gid} />
          <Lens cx={40} cy={130} r={15} gid={gid} />
          <Circle cx={70} cy={46} r={4.5} fill="#F5E9C8" opacity={0.85} />
        </G>
      );
    case 'Google':
      return (
        <G>
          <Rect x={10} y={58} width={180} height={48} rx={24} fill="#15171C" />
          <Lens cx={56} cy={82} r={15} gid={gid} />
          <Lens cx={94} cy={82} r={15} gid={gid} />
          <Circle cx={140} cy={82} r={5} fill="#F5E9C8" opacity={0.85} />
        </G>
      );
    default:
      return (
        <G>
          <Circle cx={66} cy={72} r={48} fill={shade(color, -0.12)} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
          <Lens cx={46} cy={56} r={14} gid={gid} />
          <Lens cx={86} cy={56} r={14} gid={gid} />
          <Lens cx={46} cy={92} r={14} gid={gid} />
          <Circle cx={86} cy={92} r={6} fill="#F5E9C8" opacity={0.8} />
        </G>
      );
  }
}

function Phone({ color, brand, view, gid }: { color: string; brand?: string; view: 'back' | 'front'; gid: string }) {
  return (
    <G>
      <Rect x={6} y={4} width={188} height={392} rx={38} fill={`url(#${gid}-rim)`} />
      {view === 'front' ? (
        <G>
          <Rect x={10} y={8} width={180} height={384} rx={34} fill="#050608" />
          <Rect x={16} y={14} width={168} height={372} rx={29} fill={`url(#${gid}-screen)`} />
          <Circle cx={100} cy={150} r={120} fill={`url(#${gid}-glow)`} />
          <Rect x={76} y={26} width={48} height={14} rx={7} fill="#000000" />
          <Rect x={70} y={368} width={60} height={4} rx={2} fill="rgba(255,255,255,0.5)" />
        </G>
      ) : (
        <G>
          <Rect x={10} y={8} width={180} height={384} rx={34} fill={`url(#${gid}-body)`} />
          <PhoneCamera brand={brand} color={color} gid={gid} />
        </G>
      )}
      <Rect x={10} y={8} width={180} height={384} rx={34} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Fold({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={6} y={4} width={188} height={392} rx={38} fill={`url(#${gid}-rim)`} />
      <Rect x={10} y={8} width={180} height={384} rx={34} fill={`url(#${gid}-body)`} />
      <Rect x={20} y={20} width={160} height={164} rx={26} fill="#050608" />
      <Rect x={24} y={24} width={152} height={156} rx={23} fill={`url(#${gid}-screen)`} />
      <Lens cx={50} cy={150} r={13} gid={gid} />
      <Lens cx={86} cy={150} r={13} gid={gid} />
      <Rect x={10} y={196} width={180} height={8} fill={shade(color, -0.35)} />
      <Rect x={10} y={8} width={180} height={384} rx={34} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Buds({ color, gid }: { color: string; gid: string }) {
  const shell = shade(color, -0.12);
  return (
    <G>
      <Rect x={70} y={34} width={18} height={60} rx={9} fill={shell} />
      <Rect x={112} y={34} width={18} height={60} rx={9} fill={shell} />
      <Circle cx={79} cy={40} r={20} fill={color} stroke={shade(color, -0.25)} strokeWidth={2} />
      <Circle cx={121} cy={40} r={20} fill={color} stroke={shade(color, -0.25)} strokeWidth={2} />
      <Circle cx={79} cy={40} r={8} fill={shade(color, -0.45)} />
      <Circle cx={121} cy={40} r={8} fill={shade(color, -0.45)} />
      <Rect x={36} y={78} width={128} height={96} rx={42} fill={`url(#${gid}-body)`} stroke={shade(color, -0.25)} strokeWidth={2} />
      <Path d="M38 108h124" stroke={shade(color, -0.3)} strokeWidth={2} />
      <Circle cx={100} cy={140} r={3.5} fill="#3FD69A" />
      <Rect x={36} y={78} width={128} height={96} rx={42} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Watch({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={70} y={6} width={60} height={56} rx={12} fill={shade(color, -0.2)} />
      <Rect x={70} y={138} width={60} height={56} rx={12} fill={shade(color, -0.2)} />
      <Rect x={48} y={40} width={104} height={120} rx={34} fill={`url(#${gid}-rim)`} />
      <Rect x={56} y={48} width={88} height={104} rx={28} fill="#050608" />
      <Circle cx={100} cy={100} r={28} fill="none" stroke="#1A2448" strokeWidth={7} />
      <Path d="M100 72a28 28 0 0 1 26.6 36.6" fill="none" stroke="#E3BF6E" strokeWidth={7} strokeLinecap="round" />
      <Path d="M100 82a18 18 0 1 1-15 8" fill="none" stroke="#5B7CFF" strokeWidth={5} strokeLinecap="round" />
      <Rect x={150} y={84} width={8} height={24} rx={4} fill={shade(color, 0.2)} />
      <Rect x={48} y={40} width={104} height={120} rx={34} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Speaker({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={16} y={58} width={168} height={84} rx={42} fill={`url(#${gid}-body)`} />
      {Array.from({ length: 9 }, (_, i) => (
        <Path key={i} d={`M${52 + i * 12} 70v60`} stroke={shade(color, -0.32)} strokeWidth={4} strokeLinecap="round" />
      ))}
      <Rect x={16} y={58} width={28} height={84} rx={14} fill={shade(color, -0.35)} />
      <Rect x={156} y={58} width={28} height={84} rx={14} fill={shade(color, -0.35)} />
      <Rect x={84} y={92} width={32} height={16} rx={8} fill={withAlpha('#FFFFFF', 0.85)} />
      <Rect x={16} y={58} width={168} height={84} rx={42} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Charger({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={78} y={26} width={11} height={34} rx={3} fill="#C9CDD4" />
      <Rect x={111} y={26} width={11} height={34} rx={3} fill="#C9CDD4" />
      <Rect x={52} y={54} width={96} height={112} rx={26} fill={`url(#${gid}-body)`} />
      <Rect x={84} y={92} width={32} height={10} rx={5} fill="#05070F" />
      <Rect x={84} y={110} width={32} height={10} rx={5} fill="#05070F" />
      <Rect x={80} y={128} width={40} height={14} rx={3} fill="#05070F" />
      <Rect x={52} y={54} width={96} height={112} rx={26} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function PowerBank({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={50} y={20} width={100} height={160} rx={26} fill={`url(#${gid}-body)`} />
      <Rect x={84} y={14} width={32} height={10} rx={4} fill={shade(color, -0.4)} />
      {[0, 1, 2, 3].map((i) => (
        <Circle key={i} cx={79 + i * 14} cy={156} r={4} fill={i < 3 ? '#3FD69A' : withAlpha('#FFFFFF', 0.25)} />
      ))}
      <Rect x={50} y={20} width={100} height={160} rx={26} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function Case({ color, gid }: { color: string; gid: string }) {
  return (
    <G>
      <Rect x={6} y={4} width={188} height={392} rx={40} fill={withAlpha(color, 0.35)} stroke={withAlpha('#FFFFFF', 0.5)} strokeWidth={3} />
      <Rect x={22} y={20} width={92} height={96} rx={28} fill="rgba(5,7,15,0.55)" stroke={withAlpha('#FFFFFF', 0.4)} strokeWidth={2} />
      <Circle cx={100} cy={230} r={48} fill="none" stroke={withAlpha('#FFFFFF', 0.55)} strokeWidth={5} />
      <Rect x={6} y={4} width={188} height={392} rx={40} fill={`url(#${gid}-gloss)`} />
    </G>
  );
}

function DeviceArtBase({ kind, color, brand, height, view = 'back' }: DeviceArtProps) {
  const gid = `d${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const tall = artAspect(kind) === 0.5;

  return (
    <Svg width={height * artAspect(kind)} height={height} viewBox={tall ? '0 0 200 400' : '0 0 200 200'}>
      <Defaults gid={gid} color={color} />
      {kind === 'phone' && <Phone color={color} brand={brand} view={view} gid={gid} />}
      {kind === 'phone-fold' && <Fold color={color} gid={gid} />}
      {kind === 'buds' && <Buds color={color} gid={gid} />}
      {kind === 'watch' && <Watch color={color} gid={gid} />}
      {kind === 'speaker' && <Speaker color={color} gid={gid} />}
      {kind === 'charger' && <Charger color={color} gid={gid} />}
      {kind === 'powerbank' && <PowerBank color={color} gid={gid} />}
      {kind === 'case' && <Case color={color} gid={gid} />}
    </Svg>
  );
}

export const DeviceArt = memo(DeviceArtBase);
