import { business, formatNaira, zoneForState, type Order } from '@kovra/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora } from '@/components/brand/Aurora';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Container, Divider, EmptyState } from '@/components/ui/primitives';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { JourneyRing } from '@/features/orders/JourneyRing';
import { callStore, chatOnWhatsApp, orderMessage } from '@/lib/contact';
import { useLayout } from '@/lib/layout';
import { fetchOrder } from '@/services/orders';
import { useHistory } from '@/store/history';
import { colors } from '@/theme/colors';
import { rise } from '@/theme/entering';

function caption(order: Order): string {
  if (order.status === 'delivered') return 'Enjoy your new device';
  if (order.status === 'cancelled') return 'This order was cancelled';
  if (order.fulfilment === 'pickup') return 'Ready for pickup once packed';
  if (!order.address) return 'On its way soon';
  const eta = zoneForState(order.address.state).eta;
  return eta === 'Same day' ? 'Arrives today' : `Arrives in ${eta}`;
}

export default function OrderScreen() {
  useTrayPlacement('hidden');
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const order = useHistory((s) => s.orders.find((o) => o.id === id));
  const saveOrder = useHistory((s) => s.saveOrder);
  const insets = useSafeAreaInsets();
  const { isTablet } = useLayout();
  const justPlaced = placed === '1';

  // Pull the latest status from the store's server whenever the page opens.
  useEffect(() => {
    if (!id) return;
    void fetchOrder(id).then((latest) => latest && saveOrder(latest));
  }, [id, saveOrder]);

  if (!order) {
    return (
      <View className="flex-1 bg-ink">
        <ScreenHeader title="Order" />
        <EmptyState icon="receipt" title="Order not found" body="We couldn’t find this order on this device." />
      </View>
    );
  }

  const exit = () => router.replace('/(tabs)');

  return (
    <View className="flex-1 bg-ink">
      <ScreenHeader title={justPlaced ? '' : `Order ${order.reference}`} fallbackHref="/me" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Container narrow className="gap-8">
          {justPlaced && (
            <Animated.View entering={ZoomIn.springify().damping(14)} className="items-center gap-2">
              <View className="flex-row items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2">
                <Icon name="sparkle" size={14} color={colors.gold} filled />
                <Text className="font-sora-semibold text-sm text-gold">Order confirmed · {order.reference}</Text>
              </View>
              <Text className="text-center font-sora text-sm text-mist">
                Thank you, {order.customer.name.split(' ')[0]}. We’ve got it from here.
              </Text>
            </Animated.View>
          )}

          <Animated.View entering={rise(1)} className="items-center overflow-hidden rounded-[32px] border border-edge bg-ink-2 py-6">
            <Aurora variant="page" />
            <JourneyRing status={order.status} size={isTablet ? 340 : 300} caption={caption(order)} />
          </Animated.View>

          {order.payment === 'transfer' && order.status === 'placed' && (
            <Animated.View entering={rise(2)} className="gap-4 rounded-[24px] border border-gold/30 bg-gold/5 p-5">
              <View className="flex-row items-center gap-3">
                <Icon name="wallet" size={20} color={colors.gold} />
                <Text className="flex-1 font-sora-semibold text-[15px] text-snow">Next: confirm and pay by transfer</Text>
              </View>
              <Text className="font-sora text-sm leading-6 text-mist">
                Send us your order on WhatsApp and we’ll reply with our account details. Your order is packed as soon as payment lands.
              </Text>
              <Button label="Confirm on WhatsApp" icon="chat" shine onPress={() => chatOnWhatsApp(orderMessage(order))} />
            </Animated.View>
          )}

          <Animated.View entering={rise(3)} className="gap-3 rounded-[24px] border border-edge bg-ink-2 p-5">
            {order.lines.map((line) => (
              <View key={`${line.productId}-${line.color}-${line.storage}`} className="flex-row justify-between gap-4">
                <Text className="flex-1 font-sora text-sm text-mist">
                  {line.quantity} × {line.name}
                  {line.storage ? ` (${line.storage})` : ''}
                </Text>
                <Text className="font-sora-medium text-sm text-snow">{formatNaira(line.unitPrice * line.quantity)}</Text>
              </View>
            ))}
            <Divider className="my-1" />
            <View className="flex-row justify-between">
              <Text className="font-sora text-sm text-mist">Delivery</Text>
              <Text className="font-sora-medium text-sm text-snow">{order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-sora-semibold text-base text-snow">Total</Text>
              <Text className="font-sora-bold text-xl text-gold">{formatNaira(order.total)}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={rise(4)} className="gap-2 rounded-[24px] border border-edge bg-ink-2 p-5">
            <Text className="font-sora-semibold text-[15px] text-snow">
              {order.fulfilment === 'delivery' ? 'Delivering to' : 'Store pickup'}
            </Text>
            <Text className="font-sora text-sm leading-6 text-mist">
              {order.address
                ? `${order.address.street}, ${order.address.city}, ${order.address.state}${order.address.landmark ? ` (${order.address.landmark})` : ''}`
                : 'We’ll message you when it’s ready to collect.'}
            </Text>
            <Text className="font-sora text-sm text-mist">
              {order.customer.name} · {order.customer.phone}
            </Text>
          </Animated.View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Call store" icon="phone" variant="glass" size="md" onPress={callStore} />
            </View>
            <View className="flex-1">
              <Button label="Keep shopping" size="md" onPress={exit} />
            </View>
          </View>
          <Text className="text-center font-sora text-xs text-dim">Questions? {business.phone}</Text>
        </Container>
      </ScrollView>
    </View>
  );
}
