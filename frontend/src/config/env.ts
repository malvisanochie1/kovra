/**
 * Base URL of the Kovra API. When it is not set the app runs entirely on the
 * bundled catalogue and keeps orders on the device, which is ideal for demos.
 */
export const API_URL: string | null = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || null;

export const isOnline = API_URL !== null;
