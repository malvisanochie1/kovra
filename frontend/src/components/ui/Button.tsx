import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '@/theme/colors';
import { Icon, type IconName } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Sheen } from './Sheen';

type Variant = 'gold' | 'glass' | 'ghost';
type Size = 'md' | 'lg';

interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  /** Animated light sweep across gold buttons, for the one primary action on a screen. */
  shine?: boolean;
}

const container: Record<Variant, string> = {
  gold: '',
  glass: 'bg-ink-3 border border-edge-strong',
  ghost: 'bg-transparent',
};

const textColor: Record<Variant, string> = { gold: colors.ink, glass: colors.snow, ghost: colors.gold };

export function Button({
  label,
  variant = 'gold',
  size = 'lg',
  icon,
  trailingIcon,
  loading = false,
  shine = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const height = size === 'lg' ? 'h-14' : 'h-11';
  const color = textColor[variant];

  return (
    <PressableScale
      {...props}
      disabled={disabled || loading}
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${height} rounded-full overflow-hidden ${container[variant]} ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      {variant === 'gold' && (
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      {variant === 'gold' && shine && !disabled && <Sheen />}
      <View className="flex-1 flex-row items-center justify-center gap-2 px-6">
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <>
            {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} color={color} strokeWidth={2} />}
            <Text
              style={{ color }}
              className={`font-sora-semibold ${size === 'lg' ? 'text-base' : 'text-sm'} tracking-tight`}
              numberOfLines={1}
            >
              {label}
            </Text>
            {trailingIcon && <Icon name={trailingIcon} size={18} color={color} strokeWidth={2} />}
          </>
        )}
      </View>
    </PressableScale>
  );
}
