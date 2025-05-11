import { z } from 'zod';
import { ZodTypeEnumFactory } from '../../util/zodTypeFactory.js';

const enumLike = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  PUBLISHED: 'PUBLISHED',
} as const;

const factory = ZodTypeEnumFactory.from(enumLike);
export type ArticleStatus = z.infer<typeof factory.zodType>;
export const ArticleStatus = {
  ...factory,
} as const;
