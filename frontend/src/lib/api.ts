import { API_URL } from '@/config/env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
}

/** Typed JSON client for the Kovra API. Unwraps `{ data }` and throws `ApiError` otherwise. */
export async function api<T>(path: string, { method = 'GET', body, token, timeoutMs = 12_000 }: RequestOptions = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, 'offline', 'The app is not connected to a server');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const error = payload?.error;
      throw new ApiError(response.status, error?.code ?? 'http_error', error?.message ?? 'Request failed', error?.details);
    }
    return payload.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'network', 'We couldn’t reach the store. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}
