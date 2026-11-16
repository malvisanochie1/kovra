/**
 * Mood images used around the app: service tiles, the trade hub, delivery, empty
 * states and category tiles. 4:3 WebP at 960×720.
 */
export const scenes = {
  'intro-hero': require('../../assets/scenes/intro-hero.webp'),
  'service-phones': require('../../assets/scenes/service-phones.webp'),
  'service-gadgets': require('../../assets/scenes/service-gadgets.webp'),
  'service-buy-sell': require('../../assets/scenes/service-buy-sell.webp'),
  'service-swap': require('../../assets/scenes/service-swap.webp'),
  'trade-sell': require('../../assets/scenes/trade-sell.webp'),
  'trade-swap': require('../../assets/scenes/trade-swap.webp'),
  'trade-inspection': require('../../assets/scenes/trade-inspection.webp'),
  'delivery-nationwide': require('../../assets/scenes/delivery-nationwide.webp'),
  'warranty-tested': require('../../assets/scenes/warranty-tested.webp'),
  'empty-bag': require('../../assets/scenes/empty-bag.webp'),
  'category-audio': require('../../assets/scenes/category-audio.webp'),
  'category-wearables': require('../../assets/scenes/category-wearables.webp'),
  'category-power': require('../../assets/scenes/category-power.webp'),
} as const satisfies Record<string, number>;

export type SceneName = keyof typeof scenes;
