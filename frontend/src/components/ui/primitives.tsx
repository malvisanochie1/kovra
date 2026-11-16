import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

/** Centres page content and caps its width on tablets and desktops. `narrow` suits forms. */
export function Container({ children, className = '', narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <View className={`w-full self-center px-5 md:px-8 ${narrow ? 'max-w-[680px]' : 'max-w-[1240px]'} ${className}`}>{children}</View>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Text className={`font-sora-semibold text-[10px] uppercase tracking-[1.8px] text-gold ${className}`}>{children}</Text>;
}

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, eyebrow, action }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-0.5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Text className="font-sora-semibold text-lg text-snow md:text-2xl" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {action && (
        <PressableScale
          onPress={action.onPress}
          className="h-7 flex-row items-center gap-0.5 rounded-full border border-edge bg-ink-2 pl-3 pr-2"
          accessibilityLabel={action.label}
        >
          <Text className="font-sora-medium text-[11px] text-mist">{action.label}</Text>
          <Icon name="forward" size={12} color={colors.mist} />
        </PressableScale>
      )}
    </View>
  );
}

const badgeTone = {
  gold: 'bg-gold/15 border-gold/30 text-gold',
  azure: 'bg-azure/15 border-azure/30 text-azure',
  success: 'bg-success/15 border-success/30 text-success',
  neutral: 'bg-white/5 border-edge text-mist',
} as const;

export function Badge({ label, tone = 'gold' }: { label: string; tone?: keyof typeof badgeTone }) {
  const [bg, border, text] = badgeTone[tone].split(' ');
  return (
    <View className={`self-start rounded-full border px-2.5 py-1 ${bg} ${border}`}>
      <Text className={`font-sora-semibold text-[10px] uppercase tracking-[1.2px] ${text}`}>{label}</Text>
    </View>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name="star" size={13} color={colors.gold} filled />
      <Text className="font-sora-medium text-xs text-snow">{value.toFixed(1)}</Text>
      {count !== undefined && <Text className="font-sora text-xs text-dim">({count})</Text>}
    </View>
  );
}

interface ChipProps {
  label: string;
  active?: boolean;
  icon?: IconName;
  onPress: () => void;
}

export function Chip({ label, active = false, icon, onPress }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityState={{ selected: active }}
      className={`h-8 flex-row items-center gap-1.5 rounded-full border px-3 md:h-10 md:gap-2 md:px-4 ${active ? 'border-gold bg-gold/15' : 'border-edge bg-ink-2'}`}
    >
      {icon && <Icon name={icon} size={14} color={active ? colors.gold : colors.mist} />}
      <Text className={`font-sora-medium text-xs md:text-sm ${active ? 'text-gold' : 'text-mist'}`}>{label}</Text>
    </PressableScale>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-edge ${className}`} />;
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, body, children }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-8 py-16">
      <View className="mb-2 h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
        <Icon name={icon} size={34} color={colors.gold} strokeWidth={1.5} />
      </View>
      <Text className="text-center font-sora-semibold text-xl text-snow">{title}</Text>
      <Text className="max-w-[320px] text-center font-sora text-sm leading-5 text-mist">{body}</Text>
      {children && <View className="mt-4 w-full max-w-[320px]">{children}</View>}
    </View>
  );
}
