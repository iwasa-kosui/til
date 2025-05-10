import { z } from 'zod';
import type { Article } from '../../../domain/article/article.js';
import { ArticleId } from '../../../domain/article/articleId.js';
import { assertNever } from '../../../util/assertNever.js';
import { ZodTypeFactory } from '../../../util/zodTypeFactory.js';

const baseZodType = z.object({
  id: ArticleId.zodType,
  title: z.string(),
  content: z.string(),
});

const draftZodType = baseZodType.extend({
  status: z.literal('Draft'),
});
const inReviewZodType = baseZodType.extend({
  status: z.literal('InReview'),
  reviewer_id: z.string(),
});
const publishedZodType = baseZodType.extend({
  status: z.literal('Published'),
  reviewer_id: z.string(),
  published_at: z.date(),
});
const articleZodType = z.discriminatedUnion('status', [
  draftZodType,
  inReviewZodType,
  publishedZodType,
]);

export type ArticleRow = z.infer<typeof articleZodType>;

const fromEntity = (article: Article): ArticleRow => {
  const { id, title, content } = article;
  switch (article.status) {
    case 'Draft':
      return {
        id,
        title,
        content,
        status: 'Draft',
      };
    case 'InReview':
      return {
        id,
        title,
        content,
        status: 'InReview',
        reviewer_id: article.reviewerId,
      };
    case 'Published':
      return {
        id,
        title,
        content,
        status: 'Published',
        reviewer_id: article.reviewerId,
        published_at: article.publishedAt,
      };

    default:
      return assertNever(article);
  }
};

const toEntity = (articleRow: ArticleRow): Article => {
  const { id, title, content } = articleRow;
  switch (articleRow.status) {
    case 'Draft':
      return {
        id,
        title,
        content,
        status: 'Draft',
      };
    case 'InReview':
      return {
        id,
        title,
        content,
        status: 'InReview',
        reviewerId: articleRow.reviewer_id,
      };
    case 'Published':
      return {
        id,
        title,
        content,
        status: 'Published',
        reviewerId: articleRow.reviewer_id,
        publishedAt: articleRow.published_at,
      };
    default:
      return assertNever(articleRow);
  }
};

export const ArticleRow = {
  ...ZodTypeFactory.from(articleZodType),
  fromEntity,
  toEntity,
} as const;
