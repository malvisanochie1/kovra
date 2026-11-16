import type { z } from 'zod';
import { badRequest } from './errors.js';

/** Parses untrusted input, turning schema failures into a 400 with field-level details. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw badRequest(
    'Some fields are missing or invalid',
    result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
  );
}
