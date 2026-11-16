import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { LogoMark } from '@/components/brand/Logo';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { Container, SectionHeader } from '@/components/ui/primitives';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ProductRail } from '@/features/catalog/ProductCollections';
import { BrandSwitcher } from '@/features/store-front/BrandSwitcher';
import { CategoryTiles } from '@/features/store-front/CategoryTiles';
import { Coverage } from '@/features/store-front/Coverage';
import { Promises } from '@/features/store-front/Promises';
import { Services } from '@/features/store-front/Services';
import { Spotlight } from '@/features/store-front/Spotlight';
import { TradeEstimator } from '@/features/store-front/TradeEstimator';
import { WarrantyNote } from '@/features/store-front/WarrantyNote';
import { useAfterFirstPaint } from '@/hooks/useAfterFirstPaint';
import { chatOnWhatsApp } from '@/lib/contact';
import { useCatalog } from '@/store/catalog';
import { useSession } from '@/store/session';
import { colors } from '@/theme/colors';

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Store() {
  useTrayPlacement('dock');
  const products = useCatalog((s) => s.products);
  const name = useSession((s) => s.profile?.name.split(' ')[0]);
  // Everything below the spotlight renders right after the first frame, so the store opens instantly.
  const ready = useAfterFirstPaint();

  // Once the store has settled, quietly prepare the other sections so switching is instant.
  useEffect(() => {
    if (!ready) return;
    const sections = ['/explore', '/trade', '/vault', '/me'] as const;
    const timers = sections.map((href, i) => setTimeout(() => router.prefetch(href), 1500 + i * 600));
    return () => timers.forEach(clearTimeout);
  }, [ready]);

  const sets = useMemo(
    () => ({
      spotlight: products.filter((p) => p.featured).slice(0, 5),
      trending: products.filter((p) => p.badge === 'hot' || p.badge === 'new'),
      used: products.filter((p) => p.condition === 'uk-used'),
      gadgets: products.filter((p) => p.category !== 'phones'),
    }),
    [products],
  );

  const chat = <IconButton icon="chat" label="Chat with the store on WhatsApp" onPress={() => chatOnWhatsApp()} />;

  return (
    <ScrollShell title="Kovra" right={chat}>
      <Container className="gap-5">
        <Reveal index={0} className="flex-row items-center gap-3">
          <LogoMark size={42} />
          <View className="flex-1">
            <Text className="font-sora text-xs text-mist">{greeting()}</Text>
            <Text numberOfLines={1} className="font-sora-semibold text-lg text-snow">
              {name ? `${name}, welcome back` : 'Welcome to Kovra'}
            </Text>
          </View>
          {chat}
        </Reveal>

        <Reveal index={1}>
          <PressableScale
            onPress={() => router.push({ pathname: '/explore', params: { focus: '1' } })}
            pressedScale={0.98}
            accessibilityLabel="Search phones and gadgets"
            className="h-14 flex-row items-center gap-3 rounded-2xl border border-edge bg-ink-2 px-4"
          >
            <Icon name="search" size={20} color={colors.dim} />
            <Text className="flex-1 font-sora text-[15px] text-dim">Search phones & gadgets</Text>
            <View className="rounded-lg border border-edge px-2 py-1">
              <Text className="font-sora-medium text-[10px] text-mist">{products.length} items</Text>
            </View>
          </PressableScale>
        </Reveal>

        <Reveal index={2}>
          <Spotlight products={sets.spotlight} />
        </Reveal>

        {ready && (
          <ScrollReveal className="gap-3 md:flex-row">
            <View className="md:flex-1">
              <Services />
            </View>
            <View className="md:flex-1">
              <TradeEstimator />
            </View>
          </ScrollReveal>
        )}
      </Container>

      {ready && (
        <>
          <ScrollReveal className="my-8">
            <Promises />
          </ScrollReveal>

          <Container className="gap-10">
            <ScrollReveal>
              <SectionHeader eyebrow="Moving fast" title="Trending now" action={{ label: 'All', onPress: () => router.push('/explore') }} />
              <ProductRail products={sets.trending} />
            </ScrollReveal>

            <ScrollReveal>
              <BrandSwitcher products={products} />
            </ScrollReveal>

            <ScrollReveal>
              <SectionHeader
                eyebrow="Tested · 30-day warranty"
                title="UK-used, priced right"
                action={{ label: 'All', onPress: () => router.push({ pathname: '/explore', params: { condition: 'uk-used' } }) }}
              />
              <WarrantyNote />
              <ProductRail products={sets.used} />
            </ScrollReveal>

            <ScrollReveal>
              <SectionHeader
                eyebrow="Accessories & more"
                title="Solid gadgets"
                action={{ label: 'All', onPress: () => router.push({ pathname: '/explore', params: { category: 'gadgets' } }) }}
              />
              <CategoryTiles />
              <View className="h-4" />
              <ProductRail products={sets.gadgets} />
            </ScrollReveal>

            <ScrollReveal>
              <Coverage />
            </ScrollReveal>

            <Text className="text-center font-sora text-xs text-dim">Kovra · Reliable · Trusted · Affordable</Text>
          </Container>
        </>
      )}
    </ScrollShell>
  );
}
