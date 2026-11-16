import type { BatteryBand, DeviceGrade, Naira, SwapQuote, TradeDevice, TradeModel, TradeQuote } from './types';

/**
 * Devices the store buys or accepts in a swap. `baseValue` is the offer for a
 * flawless unit at the lowest storage tier; everything else is adjusted from it.
 */
export const tradeModels: TradeModel[] = [
  model('iphone-16-pro-max', 'iPhone 16 Pro Max', 'Apple', 'ios', 1_150_000, ['256GB', '512GB', '1TB'], 120_000),
  model('iphone-16-pro', 'iPhone 16 Pro', 'Apple', 'ios', 980_000, ['128GB', '256GB', '512GB'], 90_000),
  model('iphone-16', 'iPhone 16', 'Apple', 'ios', 720_000, ['128GB', '256GB'], 70_000),
  model('iphone-15-pro-max', 'iPhone 15 Pro Max', 'Apple', 'ios', 900_000, ['256GB', '512GB', '1TB'], 90_000),
  model('iphone-15-pro', 'iPhone 15 Pro', 'Apple', 'ios', 760_000, ['128GB', '256GB', '512GB'], 70_000),
  model('iphone-15', 'iPhone 15', 'Apple', 'ios', 560_000, ['128GB', '256GB'], 50_000),
  model('iphone-14-pro-max', 'iPhone 14 Pro Max', 'Apple', 'ios', 680_000, ['128GB', '256GB', '512GB'], 60_000),
  model('iphone-14', 'iPhone 14', 'Apple', 'ios', 430_000, ['128GB', '256GB'], 40_000),
  model('iphone-13-pro-max', 'iPhone 13 Pro Max', 'Apple', 'ios', 520_000, ['128GB', '256GB', '512GB'], 50_000),
  model('iphone-13', 'iPhone 13', 'Apple', 'ios', 340_000, ['128GB', '256GB'], 35_000),
  model('iphone-12', 'iPhone 12', 'Apple', 'ios', 240_000, ['64GB', '128GB'], 25_000),
  model('iphone-11', 'iPhone 11', 'Apple', 'ios', 180_000, ['64GB', '128GB'], 20_000),
  model('galaxy-s24-ultra', 'Galaxy S24 Ultra', 'Samsung', 'android', 820_000, ['256GB', '512GB'], 80_000),
  model('galaxy-s24', 'Galaxy S24', 'Samsung', 'android', 450_000, ['128GB', '256GB'], 40_000),
  model('galaxy-s23-ultra', 'Galaxy S23 Ultra', 'Samsung', 'android', 560_000, ['256GB', '512GB'], 50_000),
  model('galaxy-z-flip6', 'Galaxy Z Flip6', 'Samsung', 'android', 520_000, ['256GB', '512GB'], 50_000),
  model('galaxy-a55', 'Galaxy A55', 'Samsung', 'android', 250_000, ['128GB', '256GB'], 25_000),
  model('pixel-9-pro', 'Pixel 9 Pro', 'Google', 'android', 620_000, ['128GB', '256GB'], 50_000),
  model('pixel-8', 'Pixel 8', 'Google', 'android', 330_000, ['128GB', '256GB'], 30_000),
  model('tecno-camon-30', 'Camon 30 Pro', 'Tecno', 'android', 190_000, ['256GB'], 0),
  model('infinix-note-40', 'Note 40 Pro', 'Infinix', 'android', 160_000, ['256GB'], 0),
  model('redmi-note-13', 'Redmi Note 13 Pro', 'Xiaomi', 'android', 170_000, ['256GB'], 0),
];

function model(
  id: string,
  name: string,
  brand: string,
  platform: TradeModel['platform'],
  baseValue: Naira,
  tiers: string[],
  stepValue: Naira,
): TradeModel {
  return { id, name, brand, platform, baseValue, storage: tiers.map((label, i) => ({ label, priceDelta: i * stepValue })) };
}

export const gradeLabels: Record<DeviceGrade, { title: string; detail: string }> = {
  flawless: { title: 'Flawless', detail: 'No scratches, looks brand new' },
  good: { title: 'Good', detail: 'Light signs of use, no cracks' },
  fair: { title: 'Fair', detail: 'Visible scratches or dents' },
  cracked: { title: 'Cracked', detail: 'Cracked screen or back glass' },
};

export const batteryLabels: Record<BatteryBand, string> = {
  'above-90': '90% and above',
  '80-90': '80% – 89%',
  'below-80': 'Below 80%',
};

const GRADE_FACTOR: Record<DeviceGrade, number> = { flawless: 1, good: 0.86, fair: 0.68, cracked: 0.42 };
const BATTERY_FACTOR: Record<BatteryBand, number> = { 'above-90': 1, '80-90': 0.95, 'below-80': 0.86 };
const BOX_BONUS = 1.03;
/** Final offers are confirmed after inspection, so quotes are a ±4% range. */
const SPREAD = 0.04;

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export const findTradeModel = (id: string) => tradeModels.find((m) => m.id === id);

export function quoteTrade(device: TradeDevice): TradeQuote | null {
  const m = findTradeModel(device.modelId);
  if (!m) return null;
  const storageDelta = m.storage.find((s) => s.label === device.storage)?.priceDelta ?? 0;
  const raw = (m.baseValue + storageDelta) * GRADE_FACTOR[device.grade] * BATTERY_FACTOR[device.battery] * (device.hasBox ? BOX_BONUS : 1);
  const offer = roundTo(raw, 5_000);
  return { offer, low: roundTo(offer * (1 - SPREAD), 5_000), high: roundTo(offer * (1 + SPREAD), 5_000) };
}

export function quoteSwap(device: TradeDevice, targetPrice: Naira): SwapQuote | null {
  const quote = quoteTrade(device);
  if (!quote) return null;
  return { ...quote, targetPrice, topUp: Math.max(0, targetPrice - quote.offer) };
}
