import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LogoMark } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Container, SectionHeader } from '@/components/ui/primitives';
import { ScrollShell } from '@/components/ui/ScrollShell';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ProductRail } from '@/features/catalog/ProductCollections';
import { BrandSwitcher } from '@/features/store-front/BrandSwitcher';
import { Coverage } from '@/features/store-front/Coverage';
import { Promises } from '@/features/store-front/Promises';
import { Services } from '@/features/store-front/Services';
import { Spotlight } from '@/features/store-front/Spotlight';
import { TradeEstimator } from '@/features/store-front/TradeEstimator';
import { chatOnWhatsApp } from '@/lib/contact';
import { useCatalog } from '@/store/catalog';
import { useSession } from '@/store/session';
import { colors } from '@/theme/colors';
import { rise } from '@/theme/entering';

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Store() {
  useTrayPlacement('dock');
  const products = useCatalog((s) => s.products);
  const name = useSession((s) => s.profile?.name.split(' ')[0]);

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
        <Animated.View entering={rise(0)} className="flex-row items-center gap-3">
          <LogoMark size={42} />
          <View className="flex-1">
            <Text className="font-sora text-xs text-mist">{greeting()}</Text>
            <Text numberOfLines={1} className="font-sora-semibold text-lg text-snow">
              {name ? `${name}, welcome back` : 'Welcome to Kovra'}
            </Text>
          </View>
          {chat}
        </Animated.View>

        <Animated.View entering={rise(1)}>
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
        </Animated.View>

        <Animated.View entering={rise(2)}>
          <Spotlight products={sets.spotlight} />
        </Animated.View>

        <View className="gap-3 md:flex-row">
          <View className="md:flex-1">
            <Services />
          </View>
          <View className="md:flex-1">
            <TradeEstimator />
          </View>
        </View>
      </Container>

      <View className="my-8">
        <Promises />
      </View>

      <Container className="gap-10">
        <View>
          <SectionHeader eyebrow="Moving fast" title="Trending now" action={{ label: 'All', onPress: () => router.push('/explore') }} />
          <ProductRail products={sets.trending} />
        </View>

        <BrandSwitcher products={products} />

        <View>
          <SectionHeader
            eyebrow="Tested · 30-day warranty"
            title="UK-used, priced right"
            action={{ label: 'All', onPress: () => router.push({ pathname: '/explore', params: { condition: 'uk-used' } }) }}
          />
          <ProductRail products={sets.used} />
        </View>

        <View>
          <SectionHeader
            eyebrow="Accessories & more"
            title="Solid gadgets"
            action={{ label: 'All', onPress: () => router.push({ pathname: '/explore', params: { category: 'gadgets' } }) }}
          />
          <ProductRail products={sets.gadgets} />
        </View>

        <Coverage />

        <Text className="text-center font-sora text-xs text-dim">Kovra · Reliable · Trusted · Affordable</Text>
      </Container>
    </ScrollShell>
  );
}
