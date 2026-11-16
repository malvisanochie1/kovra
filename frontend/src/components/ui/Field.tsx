import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { timing } from '@/theme/motion';
import { Icon, type IconName } from './Icon';

interface FieldProps extends TextInputProps {
  label: string;
  icon?: IconName;
  error?: string;
  hint?: string;
}

/** Text input whose border warms to gold on focus and turns red on error. */
export const Field = forwardRef<TextInputInstance, FieldProps>(function Field(
  { label, icon, error, hint, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  const frame = useAnimatedStyle(() => ({
    borderColor: error ? colors.danger : interpolateColor(focus.value, [0, 1], ['rgba(255,255,255,0.10)', colors.gold]),
  }));

  return (
    <View className="gap-2">
      <Text className="font-sora-medium text-xs text-mist">{label}</Text>
      <Animated.View style={frame} className="h-14 flex-row items-center gap-3 rounded-2xl border bg-ink-2 px-4">
        {icon && <Icon name={icon} size={18} color={focused ? colors.gold : colors.dim} />}
        <TextInput
          ref={ref}
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={colors.dim}
          selectionColor={colors.gold}
          cursorColor={colors.gold}
          onFocus={(event) => {
            setFocused(true);
            focus.set(withTiming(1, timing.fast));
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            focus.set(withTiming(0, timing.fast));
            onBlur?.(event);
          }}
          className="h-full flex-1 font-sora text-[15px] text-snow outline-none"
        />
      </Animated.View>
      {(error || hint) && <Text className={`font-sora text-xs ${error ? 'text-danger' : 'text-dim'}`}>{error ?? hint}</Text>}
    </View>
  );
});
