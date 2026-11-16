/** Store identity and contact details used across the API and the app. */
export const business = {
  name: 'Kovra',
  tagline: 'Your priority is our top tier.',
  promise: ['Reliable', 'Trusted', 'Affordable'] as const,
  phone: '09036045091',
  /** E.164 without the plus sign, as WhatsApp click-to-chat expects. */
  whatsapp: '2349036045091',
  warrantyDays: 30,
} as const;

export const orderStatusFlow = ['placed', 'confirmed', 'packed', 'in-transit', 'delivered'] as const;

export const orderStatusLabels: Record<(typeof orderStatusFlow)[number] | 'cancelled', string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed & sealed',
  'in-transit': 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Short human-friendly reference, e.g. `KV-7Q4M2`. Ambiguous characters are excluded. */
export function createReference(prefix = 'KV'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${code}`;
}
