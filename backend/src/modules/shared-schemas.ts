import { z } from 'zod';

/** Nigerian mobile numbers: 080…, 070…, 090…, 081… or +234 / 234 prefixed. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^(?:\+?234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'))
  .transform((value) => `0${value.slice(-10)}`);

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: phoneSchema,
  email: z.email().optional(),
});
