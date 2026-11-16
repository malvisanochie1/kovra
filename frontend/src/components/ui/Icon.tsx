import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

/**
 * Hand-tuned 24×24 line icons drawn with SVG. Shipping our own set keeps the app
 * free of icon-font packages, which would add hundreds of kilobytes.
 */
const glyphs = {
  home: <Path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" />,
  grid: (
    <>
      <Rect x="4" y="4" width="6.5" height="6.5" rx="1.8" />
      <Rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" />
      <Rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" />
      <Rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" />
    </>
  ),
  swap: <Path d="M7 4 4 7l3 3M4 7h12.5a3.5 3.5 0 0 1 0 7H15M17 20l3-3-3-3M20 17H7.5a3.5 3.5 0 0 1 0-7H9" />,
  bag: (
    <>
      <Path d="M5.5 8h13l-1 11.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3L5.5 8Z" />
      <Path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8.5" r="3.8" />
      <Path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 4 4" />
    </>
  ),
  heart: <Path d="M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" />,
  bookmark: <Path d="M7 3.8h10a1.2 1.2 0 0 1 1.2 1.2v15.2L12 16.4l-6.2 3.8V5A1.2 1.2 0 0 1 7 3.8Z" />,
  compass: (
    <>
      <Circle cx="12" cy="12" r="8.2" />
      <Path d="m14.9 9.1-1.7 4.1-4.1 1.7 1.7-4.1 4.1-1.7Z" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  close: <Path d="m6 6 12 12M18 6 6 18" />,
  back: <Path d="M15 5 8 12l7 7" />,
  forward: <Path d="m9 5 7 7-7 7" />,
  down: <Path d="m6 9 6 6 6-6" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  phone: (
    <Path d="M6.6 4h2.6l1.4 4-1.9 1.3a10.5 10.5 0 0 0 6 6l1.3-1.9 4 1.4v2.6A1.6 1.6 0 0 1 18.4 19 14.6 14.6 0 0 1 5 5.6 1.6 1.6 0 0 1 6.6 4Z" />
  ),
  chat: (
    <>
      <Path d="M4.5 19.5 5.6 16A7.8 7.8 0 1 1 8.4 18.6l-3.9.9Z" />
      <Path d="M8.8 11.8h.01M12 11.8h.01M15.2 11.8h.01" strokeWidth={2.4} />
    </>
  ),
  truck: (
    <>
      <Path d="M3.5 6.5h10v9h-10zM13.5 9.5h3.6l3.4 3.4v2.6h-7" />
      <Circle cx="7.5" cy="17.5" r="1.8" />
      <Circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3.5 5 6v5.5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-2.5Z" />
      <Path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  sparkle: (
    <Path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5ZM18.5 15.5c.3 1.9.9 2.5 2.8 2.8-1.9.3-2.5.9-2.8 2.8-.3-1.9-.9-2.5-2.8-2.8 1.9-.3 2.5-.9 2.8-2.8Z" />
  ),
  star: <Path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z" />,
  battery: (
    <>
      <Rect x="3.5" y="7.5" width="15" height="9" rx="2.2" />
      <Path d="M21 10.5v3M6.5 10.5v3M9.5 10.5v3" />
    </>
  ),
  box: (
    <>
      <Path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" />
      <Path d="M4 7.5 12 11l8-3.5M12 11v9" />
    </>
  ),
  trash: <Path d="M5 7h14M10 7V5h4v2M7 7l.8 12.2a1 1 0 0 0 1 .8h6.4a1 1 0 0 0 1-.8L17 7" />,
  check: <Path d="m5 12.5 4.5 4.5L19 7.5" />,
  pin: (
    <>
      <Path d="M12 20.5s-6.5-5.6-6.5-10.8a6.5 6.5 0 0 1 13 0c0 5.2-6.5 10.8-6.5 10.8Z" />
      <Circle cx="12" cy="9.8" r="2.4" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  wallet: (
    <>
      <Path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3" />
      <Rect x="4" y="8" width="16" height="11" rx="2.5" />
      <Circle cx="16" cy="13.5" r="1.2" />
    </>
  ),
  store: (
    <>
      <Path d="M4.5 9.5 6 4.5h12l1.5 5a2.6 2.6 0 0 1-5 .8 2.6 2.6 0 0 1-5 0 2.6 2.6 0 0 1-5-.8Z" />
      <Path d="M6 12v7.5h12V12M10 19.5v-4.5h4v4.5" />
    </>
  ),
  bolt: <Path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12l1-7Z" />,
  headphones: (
    <>
      <Path d="M4.5 16v-3.5a7.5 7.5 0 0 1 15 0V16" />
      <Rect x="4" y="14" width="4" height="6" rx="1.6" />
      <Rect x="16" y="14" width="4" height="6" rx="1.6" />
    </>
  ),
  watch: (
    <>
      <Rect x="6.5" y="7" width="11" height="10" rx="3" />
      <Path d="M9 7 9.6 3.5h4.8L15 7M9 17l.6 3.5h4.8L15 17M12 10v2.3l1.5 1" />
    </>
  ),
  plug: <Path d="M9 3.5V8M15 3.5V8M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8ZM12 16.5v4" />,
  device: (
    <>
      <Rect x="6.5" y="3" width="11" height="18" rx="2.8" />
      <Path d="M10.5 18h3" />
    </>
  ),
  tag: (
    <>
      <Path d="M4 4h7.2l8.8 8.8-7.2 7.2L4 11.2V4Z" />
      <Circle cx="8.3" cy="8.3" r="1.4" />
    </>
  ),
  receipt: <Path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17ZM9 8h6M9 11.5h6M9 15h3.5" />,
  logout: <Path d="M14 5h4.5v14H14M10 8l-4 4 4 4M6 12h9" />,
  info: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 11v5M12 8v.1" />
    </>
  ),
  mail: (
    <>
      <Rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <Path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
  lock: (
    <>
      <Rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  fingerprint: (
    <>
      <Path d="M7.5 17.5c-.8-1.5-1.2-3.2-1.2-5A5.7 5.7 0 0 1 12 6.8a5.7 5.7 0 0 1 5.7 5.7c0 .9 0 1.7-.2 2.5" />
      <Path d="M9.8 19c-.8-1.7-1.3-3.7-1.3-5.8a3.5 3.5 0 0 1 7 0c0 2.2-.4 4.2-1.2 6" />
      <Path d="M12 20.2c-.8-2-1.2-4.4-1.2-6.9a1.2 1.2 0 0 1 2.4 0" />
      <Path d="M4.6 9.5A8.3 8.3 0 0 1 12 4.2c2.8 0 5.3 1.4 6.8 3.5" />
    </>
  ),
  refresh: <Path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />,
} as const;

export type IconName = keyof typeof glyphs;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Fills the shape with the stroke colour, e.g. a saved heart. */
  filled?: boolean;
}

function IconBase({ name, size = 22, color = colors.snow, strokeWidth = 1.7, filled = false }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyphs[name]}
    </Svg>
  );
}

export const Icon = memo(IconBase);
