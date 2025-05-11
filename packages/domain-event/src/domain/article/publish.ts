import { err, ok, type Result } from 'neverthrow';
import { assertNever } from '../../util/assertNever.js';
import type { ApplicationError } from '../applicationError.js';
import { DomainEvent } from '../domainEvent.js';
import type { Article, ArticleEvent, DraftArticle, InReviewArticle, PublishedArticle } from './article.js';
import type { ArticleId } from './articleId.js';
import { ArticleStatus } from './articleStatus.js';
import { AlreadyPublishedError } from './error.js';

/**
 * 記事公開イベント
 */
export type ArticlePublished = ArticleEvent<'ArticlePublished', {
  publishedAt: Date;
}, PublishedArticle>;

export const ArticlePublished = {
  from: (article: InReviewArticle, publishedAt: Date): ArticlePublished =>
    DomainEvent.from('ArticlePublished', { publishedAt }, {
      ...article,
      status: ArticleStatus.PUBLISHED,
      publishedAt,
    }),
} as const;

export type ReviewRequiredError = ApplicationError<'ReviewRequired', {
  id: ArticleId;
}>;

export const ReviewRequiredError = {
  from: (article: DraftArticle): ReviewRequiredError => ({
    type: 'ReviewRequired',
    message: '記事を公開するにはレビューが必要です',
    detail: {
      id: article.id,
    },
  }),
} as const;

/**
 * 記事を公開します。
 */
export const publish = (
  article: Article,
): Result<ArticlePublished, ReviewRequiredError | AlreadyPublishedError> => {
  const publishedAt = new Date();
  switch (article.status) {
    case ArticleStatus.DRAFT:
      return err(ReviewRequiredError.from(article));
    case ArticleStatus.IN_REVIEW:
      return ok(ArticlePublished.from(article, publishedAt));
    case ArticleStatus.PUBLISHED:
      return err(AlreadyPublishedError.from(article));
    default:
      return assertNever(article);
  }
};
