/** Client-side checks that mirror the API, so most mistakes are caught before a round trip. */

const PHONE = /^(?:\+?234|0)[789][01]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalisePhone = (value: string) => value.replace(/[\s-]/g, '');

export const isValidPhone = (value: string) => PHONE.test(normalisePhone(value));

export const isValidEmail = (value: string) => EMAIL.test(value.trim());

export type Errors<T extends string> = Partial<Record<T, string>>;
