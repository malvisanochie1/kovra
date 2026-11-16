import { findProduct, findTradeModel, unitPrice, type TradeDevice, type TradeKind, type TradeRequest } from '@kovra/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Container } from '@/components/ui/primitives';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { StepProgress } from '@/features/trade/StepProgress';
import { ConditionStep, DeviceStep, OfferStep, StepTitle, TargetStep } from '@/features/trade/steps';
import { ApiError } from '@/lib/api';
import { chatOnWhatsApp, tradeMessage } from '@/lib/contact';
import { isValidPhone, normalisePhone, type Errors } from '@/lib/validation';
import { quoteFor, submitTrade } from '@/services/trade';
import { useCatalog } from '@/store/catalog';
import { useHistory } from '@/store/history';
import { useSession } from '@/store/session';
import { colors } from '@/theme/colors';

type Step = 'device' | 'condition' | 'target' | 'offer';

export default function TradeWizard() {
  useTrayPlacement('hidden');
  const params = useLocalSearchParams<{ kind: string; model?: string; target?: string }>();
  const kind: TradeKind = params.kind === 'swap' ? 'swap' : 'sell';
  const insets = useSafeAreaInsets();
  const profile = useSession((s) => s.profile);
  const token = useSession((s) => s.token);
  const saveTrade = useHistory((s) => s.saveTrade);
  const phones = useCatalog((s) => s.products).filter((p) => p.category === 'phones');

  const initialModel = params.model ? findTradeModel(params.model) : undefined;
  const steps: Step[] = kind === 'swap' ? ['device', 'condition', 'target', 'offer'] : ['device', 'condition', 'offer'];
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<TradeDevice>({
    modelId: initialModel?.id ?? '',
    storage: initialModel?.storage[0]?.label ?? '',
    grade: 'good',
    battery: 'above-90',
    hasBox: false,
  });
  const [targetId, setTargetId] = useState<string | null>(params.target ?? null);
  const [contact, setContact] = useState({ name: profile?.name ?? '', phone: profile?.phone ?? '' });
  const [errors, setErrors] = useState<Errors<'name' | 'phone' | 'form'>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<TradeRequest | null>(null);

  const model = findTradeModel(device.modelId);
  const target = targetId ? findProduct(targetId) : undefined;
  const quote = useMemo(
    () => (model ? quoteFor({ device, targetPrice: kind === 'swap' && target ? unitPrice(target) : undefined }) : null),
    [device, kind, model, target],
  );

  const current = steps[step]!;
  const canContinue = current === 'device' ? Boolean(model) : current === 'target' ? Boolean(target) : true;
  const title = kind === 'swap' ? 'Swap & upgrade' : 'Sell your phone';

  const back = () => (step > 0 ? setStep(step - 1) : router.back());

  const submit = async () => {
    const next: Errors<'name' | 'phone'> = {};
    if (contact.name.trim().length < 2) next.name = 'Enter your full name';
    if (!isValidPhone(contact.phone)) next.phone = 'Enter a valid Nigerian phone number';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const request = await submitTrade(
        {
          kind,
          device,
          customer: { name: contact.name.trim(), phone: normalisePhone(contact.phone) },
          ...(kind === 'swap' && targetId && { targetProductId: targetId }),
        },
        target ? unitPrice(target) : undefined,
        token,
      );
      saveTrade(request);
      setDone(request);
    } catch (error) {
      setErrors({ form: error instanceof ApiError ? error.message : 'We couldn’t send your request. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  if (done && model) {
    return (
      <View style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }} className="flex-1 bg-ink px-6">
        <View className="w-full max-w-[460px] flex-1 justify-center gap-6 self-center">
          <Reveal className="h-20 w-20 items-center justify-center rounded-[24px] bg-gold/15">
            <Icon name="check" size={40} color={colors.gold} strokeWidth={2.2} />
          </Reveal>
          <StepTitle
            title="Request received"
            body={`Reference ${done.reference}. We’ll confirm your offer on ${contact.phone} shortly. You can also message us now to arrange a quick check.`}
          />
          <Button label="Message us on WhatsApp" icon="chat" shine onPress={() => chatOnWhatsApp(tradeMessage(done, model.name))} />
          <Button label="Back to Trade" variant="ghost" onPress={() => router.replace('/(tabs)/trade')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-ink">
      <ScreenHeader title={title} right={<Text className="font-sora-medium text-xs text-mist">{`${step + 1} of ${steps.length}`}</Text>} />
      <Container narrow className="pb-4">
        <StepProgress total={steps.length} current={step} />
      </Container>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <Container narrow>
          <Reveal key={current} from="right" distance={32}>
            {current === 'device' && (
              <DeviceStep
                modelId={device.modelId || null}
                onSelect={(m) => setDevice((d) => ({ ...d, modelId: m.id, storage: m.storage[0]!.label }))}
              />
            )}
            {current === 'condition' && model && (
              <ConditionStep model={model} device={device} onChange={(patch) => setDevice((d) => ({ ...d, ...patch }))} />
            )}
            {current === 'target' && <TargetStep phones={phones} targetId={targetId} onSelect={setTargetId} />}
            {current === 'offer' && model && quote && (
              <OfferStep
                quote={quote}
                model={model}
                target={target}
                contact={contact}
                errors={errors}
                onContact={(patch) => {
                  setContact((c) => ({ ...c, ...patch }));
                  setErrors({});
                }}
              />
            )}
          </Reveal>
        </Container>
      </ScrollView>

      <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="border-t border-edge bg-ink-2 pt-4">
        <Container narrow className="flex-row gap-3">
          <View className="w-28">
            <Button label="Back" variant="glass" onPress={back} />
          </View>
          <View className="flex-1">
            {current === 'offer' ? (
              <Button label={kind === 'swap' ? 'Request swap' : 'Request offer'} shine loading={busy} onPress={submit} />
            ) : (
              <Button label="Continue" trailingIcon="arrow" disabled={!canContinue} onPress={() => setStep(step + 1)} />
            )}
          </View>
        </Container>
      </View>
    </KeyboardAvoidingView>
  );
}
