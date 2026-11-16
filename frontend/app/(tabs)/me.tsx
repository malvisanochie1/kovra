import { business, formatNaira, orderStatusLabels } from '@kovra/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Container, SectionHeader } from '@/components/ui/primitives';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { callStore, chatOnWhatsApp } from '@/lib/contact';
import { useHistory } from '@/store/history';
import { useSession } from '@/store/session';
import { useVault } from '@/store/vault';
import { colors, gradients } from '@/theme/colors';
import { rise } from '@/theme/entering';

function Row({ icon, title, detail, onPress }: { icon: IconName; title: string; detail?: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} pressedScale={0.98} className="flex-row items-center gap-4 px-4 py-4" accessibilityLabel={title}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-ink-3">
        <Icon name={icon} size={18} color={colors.gold} />
      </View>
      <View className="flex-1">
        <Text className="font-sora-medium text-[15px] text-snow">{title}</Text>
        {detail && <Text className="font-sora text-xs text-mist">{detail}</Text>}
      </View>
      <Icon name="forward" size={16} color={colors.dim} />
    </PressableScale>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center gap-0.5 py-4">
      <Text className="font-sora-bold text-xl text-snow">{value}</Text>
      <Text className="font-sora text-[11px] text-mist">{label}</Text>
    </View>
  );
}

export default function Me() {
  useTrayPlacement('dock');
  const { profile, signOut, fingerprint } = useSession();
  const orders = useHistory((s) => s.orders);
  const trades = useHistory((s) => s.trades);
  const vaulted = useVault((s) => s.ids.length);
  const initials = profile?.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollShell title="Me">
      <Container narrow className="gap-7">
        <Animated.View entering={rise(0)} className="overflow-hidden rounded-[28px] border border-edge bg-ink-2">
          <View className="flex-row items-center gap-4 p-5">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-[20px]">
              <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              {initials ? (
                <Text className="font-sora-bold text-xl text-ink">{initials}</Text>
              ) : (
                <Icon name="user" size={28} color={colors.ink} />
              )}
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-sora-semibold text-lg text-snow">{profile?.name ?? 'Guest'}</Text>
              <Text className="font-sora text-sm text-mist">
                {profile ? `@${profile.username} · ${profile.phone}` : 'Sign in to sync orders and use fingerprint sign-in'}
              </Text>
            </View>
          </View>
          <View className="flex-row border-t border-edge">
            <Stat value={orders.length} label="Orders" />
            <View className="w-px bg-edge" />
            <Stat value={vaulted} label="In Vault" />
            <View className="w-px bg-edge" />
            <Stat value={trades.length} label="Trades" />
          </View>
          {!profile && (
            <View className="px-5 pb-5">
              <Button label="Sign in or create account" size="md" onPress={() => router.push('/auth')} />
            </View>
          )}
        </Animated.View>

        <View>
          <SectionHeader title="Orders" />
          {orders.length === 0 ? (
            <Text className="font-sora text-sm text-mist">No orders yet. They’ll appear here with live tracking.</Text>
          ) : (
            <View className="gap-2.5">
              {orders.slice(0, 6).map((order, index) => (
                <Animated.View key={order.id} entering={rise(index)}>
                  <PressableScale
                    onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
                    pressedScale={0.98}
                    className="flex-row items-center gap-4 rounded-2xl border border-edge bg-ink-2 px-4 py-3.5"
                  >
                    <View className="flex-1 gap-0.5">
                      <Text className="font-sora-semibold text-sm text-snow">{order.reference}</Text>
                      <Text className="font-sora text-xs text-mist">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} ·{' '}
                        {orderStatusLabels[order.status]}
                      </Text>
                    </View>
                    <Text className="font-sora-semibold text-sm text-gold">{formatNaira(order.total)}</Text>
                    <Icon name="forward" size={16} color={colors.dim} />
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {profile && (
          <View>
            <SectionHeader title="Security" />
            <View className="overflow-hidden rounded-[22px] border border-edge bg-ink-2">
              <Row
                icon="fingerprint"
                title="Fingerprint sign-in"
                detail={fingerprint?.username === profile.username ? 'On for this phone' : 'Off · password required to turn on'}
                onPress={() => router.push('/security')}
              />
            </View>
          </View>
        )}

        <View>
          <SectionHeader title="Store" />
          <View className="overflow-hidden rounded-[22px] border border-edge bg-ink-2">
            <Row icon="chat" title="Chat on WhatsApp" detail="Fastest way to reach us" onPress={() => chatOnWhatsApp()} />
            <View className="ml-[72px] h-px bg-edge" />
            <Row icon="phone" title="Call the store" detail={business.phone} onPress={callStore} />
            <View className="ml-[72px] h-px bg-edge" />
            <Row icon="swap" title="Sell or swap a phone" detail="Instant trade-in estimate" onPress={() => router.push('/trade')} />
          </View>
        </View>

        <View className="gap-3 rounded-[22px] border border-edge bg-ink-2 p-5">
          {[
            ['shield', `${business.warrantyDays}-day warranty on UK-used devices`],
            ['truck', 'Nationwide delivery · same day in Lagos'],
            ['check', 'Every device tested before it leaves us'],
          ].map(([icon, text]) => (
            <View key={text} className="flex-row items-center gap-3">
              <Icon name={icon as IconName} size={18} color={colors.gold} />
              <Text className="flex-1 font-sora text-sm text-snow">{text}</Text>
            </View>
          ))}
        </View>

        {profile && <Button label="Sign out" variant="ghost" icon="logout" onPress={signOut} />}
        <Text className="text-center font-sora text-xs text-dim">Kovra · {business.tagline}</Text>
      </Container>
    </ScrollShell>
  );
}
