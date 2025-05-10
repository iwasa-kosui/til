import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ZodTypeFactory } from '../../util/zodTypeFactory.js';

const symbol = Symbol('ArticleId');
const zodType = z.string().uuid().brand(symbol);
const factory = ZodTypeFactory.from(zodType);
const generate = (): ArticleId => factory.unsafeParse(randomUUID());

type ArticleId = z.infer<typeof zodType>;
const ArticleId = {
  ...factory,
  generate,
} as const;

export { ArticleId };
