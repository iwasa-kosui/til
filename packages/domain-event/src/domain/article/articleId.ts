import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const zodType = z.string().uuid().brand('ArticleId');

export type ArticleId = z.infer<typeof zodType>;
export const ArticleId = {
  zodType,
  generate: (): ArticleId => zodType.parse(randomUUID()),
} as const;
