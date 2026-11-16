import { colors } from '@/theme/colors';
import { Icon, type IconName } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';

interface IconButtonProps extends Omit<PressableScaleProps, 'children'> {
  icon: IconName;
  label: string;
  size?: number;
  color?: string;
}

export function IconButton({ icon, label, size = 40, color = colors.snow, className = '', ...props }: IconButtonProps) {
  return (
    <PressableScale
      {...props}
      accessibilityLabel={label}
      hitSlop={6}
      pressedScale={0.9}
      style={{ width: size, height: size }}
      className={`items-center justify-center rounded-full bg-ink-3/80 border border-edge ${className}`}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={color} />
    </PressableScale>
  );
}
