import type { FulfilmentMethod, Naira } from './types';

export interface DeliveryZone {
  id: 'lagos' | 'south-west' | 'south' | 'north';
  label: string;
  fee: Naira;
  eta: string;
}

export const deliveryZones: Record<DeliveryZone['id'], DeliveryZone> = {
  lagos: { id: 'lagos', label: 'Lagos', fee: 3_500, eta: 'Same day' },
  'south-west': { id: 'south-west', label: 'South West', fee: 5_000, eta: '1–2 days' },
  south: { id: 'south', label: 'South & Middle Belt', fee: 7_500, eta: '2–3 days' },
  north: { id: 'north', label: 'North', fee: 9_000, eta: '3–4 days' },
};

/** All 36 states plus the FCT, mapped to a delivery zone. */
export const nigerianStates: ReadonlyArray<{ name: string; zone: DeliveryZone['id'] }> = [
  { name: 'Abia', zone: 'south' },
  { name: 'Abuja (FCT)', zone: 'south' },
  { name: 'Adamawa', zone: 'north' },
  { name: 'Akwa Ibom', zone: 'south' },
  { name: 'Anambra', zone: 'south' },
  { name: 'Bauchi', zone: 'north' },
  { name: 'Bayelsa', zone: 'south' },
  { name: 'Benue', zone: 'south' },
  { name: 'Borno', zone: 'north' },
  { name: 'Cross River', zone: 'south' },
  { name: 'Delta', zone: 'south' },
  { name: 'Ebonyi', zone: 'south' },
  { name: 'Edo', zone: 'south' },
  { name: 'Ekiti', zone: 'south-west' },
  { name: 'Enugu', zone: 'south' },
  { name: 'Gombe', zone: 'north' },
  { name: 'Imo', zone: 'south' },
  { name: 'Jigawa', zone: 'north' },
  { name: 'Kaduna', zone: 'north' },
  { name: 'Kano', zone: 'north' },
  { name: 'Katsina', zone: 'north' },
  { name: 'Kebbi', zone: 'north' },
  { name: 'Kogi', zone: 'south' },
  { name: 'Kwara', zone: 'south-west' },
  { name: 'Lagos', zone: 'lagos' },
  { name: 'Nasarawa', zone: 'south' },
  { name: 'Niger', zone: 'north' },
  { name: 'Ogun', zone: 'south-west' },
  { name: 'Ondo', zone: 'south-west' },
  { name: 'Osun', zone: 'south-west' },
  { name: 'Oyo', zone: 'south-west' },
  { name: 'Plateau', zone: 'south' },
  { name: 'Rivers', zone: 'south' },
  { name: 'Sokoto', zone: 'north' },
  { name: 'Taraba', zone: 'north' },
  { name: 'Yobe', zone: 'north' },
  { name: 'Zamfara', zone: 'north' },
];

/** Orders at or above this subtotal ship free anywhere in Nigeria. */
export const FREE_DELIVERY_THRESHOLD: Naira = 1_000_000;

export function zoneForState(state: string): DeliveryZone {
  const match = nigerianStates.find((s) => s.name === state);
  return deliveryZones[match?.zone ?? 'north'];
}

export function deliveryFeeFor(fulfilment: FulfilmentMethod, state: string | undefined, subtotal: Naira): Naira {
  if (fulfilment === 'pickup' || subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return zoneForState(state ?? '').fee;
}
