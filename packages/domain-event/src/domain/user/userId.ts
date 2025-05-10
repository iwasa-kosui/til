import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ZodTypeFactory } from '../../util/zodTypeFactory.js';

const zodType = z.string().uuid().brand('UserId');
const factory = ZodTypeFactory.from(zodType);
const generate = (): UserId => factory.unsafeParse(randomUUID());

type UserId = z.infer<typeof zodType>;

const UserId = {
  ...factory,
  generate,
} as const;

export { UserId };
