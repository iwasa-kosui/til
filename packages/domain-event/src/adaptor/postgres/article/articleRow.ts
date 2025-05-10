import { z } from 'zod';
import type { Article } from '../../../domain/article/article.js';
import { ArticleId } from '../../../domain/article/articleId.js';
import { ArticleStatus } from '../../../domain/article/articleStatus.js';
import { Title } from '../../../domain/article/title.js';
import { UserId } from '../../../domain/user/userId.js';
import { assertNever } from '../../../util/assertNever.js';
import { ZodTypeFactory } from '../../../util/zodTypeFactory.js';

const baseZodType = z.object({
  id: ArticleId.zodType,
  title: Title.zodType,
  content: z.string(),
});

const draftZodType = baseZodType.extend({
  status: z.literal(ArticleStatus.DRAFT),
});
const inReviewZodType = baseZodType.extend({
  status: z.literal(ArticleStatus.IN_REVIEW),
  reviewer_id: UserId.zodType,
});
const publishedZodType = baseZodType.extend({
  status: z.literal(ArticleStatus.PUBLISHED),
  reviewer_id: UserId.zodType,
  published_at: z.date(),
});
const deletedZodType = baseZodType.extend({
  status: z.literal(ArticleStatus.DELETED),
  reviewer_id: UserId.zodType.optional(),
  published_at: z.date().optional(),
});
const articleZodType = z.discriminatedUnion('status', [
  draftZodType,
  inReviewZodType,
  publishedZodType,
  deletedZodType,
]);

export type ArticleRow = z.infer<typeof articleZodType>;

const fromEntity = (article: Article): ArticleRow => {
  const { id, title, content } = article;
  switch (article.status) {
    case ArticleStatus.DRAFT:
      return {
        id,
        title,
        content,
        status: ArticleStatus.DRAFT,
      };
    case ArticleStatus.IN_REVIEW:
      return {
        id,
        title,
        content,
        status: ArticleStatus.IN_REVIEW,
        reviewer_id: article.reviewerId,
      };
    case ArticleStatus.PUBLISHED:
      return {
        id,
        title,
        content,
        status: ArticleStatus.PUBLISHED,
        reviewer_id: article.reviewerId,
        published_at: article.publishedAt,
      };
    case ArticleStatus.DELETED:
      return {
        id,
        title,
        content,
        status: ArticleStatus.DELETED,
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
    case ArticleStatus.DRAFT:
      return {
        id,
        title,
        content,
        status: ArticleStatus.DRAFT,
      };
    case ArticleStatus.IN_REVIEW:
      return {
        id,
        title,
        content,
        status: ArticleStatus.IN_REVIEW,
        reviewerId: articleRow.reviewer_id,
      };
    case ArticleStatus.PUBLISHED:
      return {
        id,
        title,
        content,
        status: ArticleStatus.PUBLISHED,
        reviewerId: articleRow.reviewer_id,
        publishedAt: articleRow.published_at,
      };
    case ArticleStatus.DELETED:
      return {
        id,
        title,
        content,
        status: ArticleStatus.DELETED,
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
