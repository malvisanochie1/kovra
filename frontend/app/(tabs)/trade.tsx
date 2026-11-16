import { findTradeModel, formatNaira, gradeLabels, type DeviceGrade } from '@kovra/shared';
import { Text, View } from 'react-native';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { Badge, Container, SectionHeader } from '@/components/ui/primitives';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { HowItWorks } from '@/features/trade/HowItWorks';
import { ModeCards } from '@/features/trade/ModeCards';
import { useHistory } from '@/store/history';

const gradeTone: Record<DeviceGrade, string> = {
  flawless: 'border-success/40',
  good: 'border-gold/40',
  fair: 'border-azure/40',
  cracked: 'border-danger/40',
};

export default function Trade() {
  useTrayPlacement('dock');
  const trades = useHistory((s) => s.trades);

  return (
    <ScrollShell title="Trade">
      <Container className="gap-6">
        <Reveal index={0} className="gap-2">
          <Text className="font-sora-semibold text-[11px] uppercase tracking-[2px] text-gold">Buy · Sell · Swap</Text>
          <Text className="font-sora-bold text-[30px] leading-9 text-snow" accessibilityRole="header">
            Your old phone{'\n'}is worth more here.
          </Text>
          <Text className="font-sora text-sm leading-6 text-mist">
            Sell it for cash or swap it towards your next device. Swapping is always allowed.
          </Text>
        </Reveal>

        <ModeCards />

        <ScrollReveal className="gap-6 md:flex-row">
          <View className="md:flex-1">
            <HowItWorks />
          </View>

          <View className="gap-3 md:flex-1">
            <SectionHeader eyebrow="Be honest, get paid fast" title="How we grade" />
            {(Object.keys(gradeLabels) as DeviceGrade[]).map((grade, index) => (
              <Reveal
                index={index}
                key={grade}
                className={`flex-row items-center gap-4 rounded-2xl border bg-ink-2 px-4 py-3.5 ${gradeTone[grade]}`}
              >
                <View className="flex-1">
                  <Text className="font-sora-semibold text-[15px] text-snow">{gradeLabels[grade].title}</Text>
                  <Text className="font-sora text-xs text-mist">{gradeLabels[grade].detail}</Text>
                </View>
              </Reveal>
            ))}
          </View>
        </ScrollReveal>

        {trades.length > 0 && (
          <ScrollReveal className="gap-3">
            <SectionHeader eyebrow="On this device" title="Your requests" />
            {trades.slice(0, 5).map((trade) => (
              <View key={trade.id} className="flex-row items-center justify-between rounded-2xl border border-edge bg-ink-2 px-4 py-3.5">
                <View className="gap-0.5">
                  <Text className="font-sora-semibold text-sm text-snow">{findTradeModel(trade.device.modelId)?.name ?? 'Device'}</Text>
                  <Text className="font-sora text-xs text-mist">
                    {trade.reference} · offer {formatNaira(trade.quote.offer)}
                  </Text>
                </View>
                <Badge label={trade.kind === 'swap' ? 'Swap' : 'Sell'} tone={trade.kind === 'swap' ? 'gold' : 'success'} />
              </View>
            ))}
          </ScrollReveal>
        )}
      </Container>
    </ScrollShell>
  );
}
