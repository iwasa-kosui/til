import { z } from 'zod';
import { ZodTypeFactory } from '../../util/zodTypeFactory.js';

const symbol = Symbol('Title');
const zodType = z.string().brand(symbol);
const factory = ZodTypeFactory.from(zodType);

type Title = z.infer<typeof zodType>;
const Title = {
  ...factory,
} as const;

export { Title };
