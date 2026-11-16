import { deliveryFeeFor, formatNaira, unitPrice, zoneForState, type FulfilmentMethod, type PaymentMethod } from '@kovra/shared';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Container, Divider } from '@/components/ui/primitives';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { StatePicker } from '@/features/checkout/StatePicker';
import { OptionCard } from '@/components/ui/OptionCard';
import { ApiError } from '@/lib/api';
import { isValidEmail, isValidPhone, normalisePhone, type Errors } from '@/lib/validation';
import { placeOrder } from '@/services/orders';
import { useCart, useCartSubtotal } from '@/store/cart';
import { useCatalog } from '@/store/catalog';
import { useHistory } from '@/store/history';
import { useSession } from '@/store/session';

type FieldName = 'name' | 'phone' | 'email' | 'state' | 'city' | 'street' | 'form';

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-gold/15">
          <Text className="font-sora-bold text-xs text-gold">{step}</Text>
        </View>
        <Text className="font-sora-semibold text-lg text-snow">{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function Checkout() {
  useTrayPlacement('hidden');
  const insets = useSafeAreaInsets();
  const { profile, token, lastCustomer, rememberCustomer } = useSession();
  const known = profile ?? lastCustomer;
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const byId = useCatalog((s) => s.byId);
  const subtotal = useCartSubtotal();
  const saveOrder = useHistory((s) => s.saveOrder);

  const [form, setForm] = useState({
    name: known?.name ?? '',
    phone: known?.phone ?? '',
    email: known?.email ?? '',
    state: '',
    city: '',
    street: '',
    landmark: '',
    note: '',
  });
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>('delivery');
  const [payment, setPayment] = useState<PaymentMethod>('transfer');
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const delivering = fulfilment === 'delivery';
  const fee = deliveryFeeFor(fulfilment, form.state || undefined, subtotal);
  const zone = form.state ? zoneForState(form.state) : null;
  // Cash on delivery is offered where our own riders deliver: Lagos, or paying at the store.
  const canPayOnDelivery = !delivering || form.state === 'Lagos';
  const paymentMethod = payment === 'pay-on-delivery' && !canPayOnDelivery ? 'transfer' : payment;

  const validate = () => {
    const next: Errors<FieldName> = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid Nigerian phone number';
    if (form.email && !isValidEmail(form.email)) next.email = 'That email doesn’t look right';
    if (delivering) {
      if (!form.state) next.state = 'Choose your state';
      if (form.city.trim().length < 2) next.city = 'Enter your city or area';
      if (form.street.trim().length < 4) next.street = 'Enter your street address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const customer = { name: form.name.trim(), phone: normalisePhone(form.phone), ...(form.email.trim() && { email: form.email.trim() }) };
    try {
      const order = await placeOrder(
        {
          customer,
          lines: lines.map(({ productId, quantity, color, storage }) => ({ productId, quantity, color, storage })),
          fulfilment,
          payment: paymentMethod,
          ...(delivering && {
            address: {
              state: form.state,
              city: form.city.trim(),
              street: form.street.trim(),
              ...(form.landmark.trim() && { landmark: form.landmark.trim() }),
            },
          }),
          ...(form.note.trim() && { note: form.note.trim() }),
        },
        token,
      );
      rememberCustomer(customer);
      saveOrder(order);
      clearCart();
      router.replace({ pathname: '/order/[id]', params: { id: order.id, placed: '1' } });
    } catch (error) {
      setErrors({ form: error instanceof ApiError ? error.message : 'We couldn’t place your order. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-ink">
      <ScreenHeader title="Checkout" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <Container narrow className="gap-9">
          <Section step={1} title="Your details">
            <Field
              label="Full name"
              icon="user"
              placeholder="Ada Obi"
              value={form.name}
              onChangeText={set('name')}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              label="Phone number"
              icon="phone"
              placeholder="0803 123 4567"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={set('phone')}
              error={errors.phone}
              autoComplete="tel"
            />
            <Field
              label="Email (optional)"
              icon="mail"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
            />
          </Section>

          <Section step={2} title="Delivery">
            <Segmented
              options={[
                { value: 'delivery', label: 'Deliver to me' },
                { value: 'pickup', label: 'Pick up in store' },
              ]}
              value={fulfilment}
              onChange={setFulfilment}
            />
            {delivering ? (
              <Animated.View key="delivery" entering={FadeInDown.duration(280)} exiting={FadeOutUp.duration(160)} className="gap-4">
                <StatePicker value={form.state} error={errors.state} onChange={set('state')} />
                <Field
                  label="City or area"
                  icon="pin"
                  placeholder="Ikeja"
                  value={form.city}
                  onChangeText={set('city')}
                  error={errors.city}
                />
                <Field
                  label="Street address"
                  icon="store"
                  placeholder="12 Allen Avenue"
                  value={form.street}
                  onChangeText={set('street')}
                  error={errors.street}
                />
                <Field
                  label="Landmark (optional)"
                  icon="info"
                  placeholder="Opposite the filling station"
                  value={form.landmark}
                  onChangeText={set('landmark')}
                />
              </Animated.View>
            ) : (
              <Animated.Text key="pickup" entering={FadeInDown.duration(280)} className="font-sora text-sm leading-6 text-mist">
                We’ll message you when your order is ready to collect. Bring your order reference.
              </Animated.Text>
            )}
          </Section>

          <Section step={3} title="Payment">
            <OptionCard
              title="Bank transfer"
              detail="We send our account details on WhatsApp once we confirm your order."
              selected={paymentMethod === 'transfer'}
              onPress={() => setPayment('transfer')}
            />
            <OptionCard
              title={delivering ? 'Pay on delivery' : 'Pay in store'}
              detail={canPayOnDelivery ? 'Card or transfer when your order arrives.' : 'Available for Lagos deliveries and store pickup.'}
              selected={paymentMethod === 'pay-on-delivery'}
              onPress={() => canPayOnDelivery && setPayment('pay-on-delivery')}
            />
          </Section>

          <Section step={4} title="Summary">
            <View className="gap-3 rounded-[22px] border border-edge bg-ink-2 p-5">
              {lines.map((line) => {
                const product = byId[line.productId];
                if (!product) return null;
                return (
                  <View key={line.key} className="flex-row justify-between gap-4">
                    <Text numberOfLines={1} className="flex-1 font-sora text-sm text-mist">
                      {line.quantity} × {product.name}
                      {line.storage ? ` (${line.storage})` : ''}
                    </Text>
                    <Text className="font-sora-medium text-sm text-snow">
                      {formatNaira(unitPrice(product, line.storage) * line.quantity)}
                    </Text>
                  </View>
                );
              })}
              <Divider className="my-1" />
              <View className="flex-row justify-between">
                <Text className="font-sora text-sm text-mist">Delivery{zone && delivering ? ` · ${zone.eta}` : ''}</Text>
                <Text className="font-sora-medium text-sm text-snow">
                  {delivering && !form.state ? 'Choose a state' : fee === 0 ? 'Free' : formatNaira(fee)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-sora-semibold text-base text-snow">Total</Text>
                <Text className="font-sora-bold text-2xl text-gold">{formatNaira(subtotal + fee)}</Text>
              </View>
            </View>
            <Field
              label="Note for the store (optional)"
              icon="chat"
              placeholder="Anything we should know?"
              value={form.note}
              onChangeText={set('note')}
            />
          </Section>
        </Container>
      </ScrollView>

      <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="border-t border-edge bg-ink-2 pt-4">
        <Container narrow className="gap-2">
          {errors.form && <Text className="font-sora text-sm text-danger">{errors.form}</Text>}
          <Button
            label={`Place order · ${formatNaira(subtotal + fee)}`}
            shine
            loading={busy}
            disabled={lines.length === 0}
            onPress={submit}
          />
        </Container>
      </View>
    </KeyboardAvoidingView>
  );
}
