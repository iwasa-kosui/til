import { err, ok, type Result } from 'neverthrow';
import { assertNever } from '../../util/assertNever.js';
import { DomainEvent } from '../domainEvent.js';
import type { UserId } from '../user/userId.js';
import type { Article, ArticleEvent, DraftArticle, InReviewArticle } from './article.js';
import { ArticleStatus } from './articleStatus.js';
import { AlreadyDeletedError, AlreadyInReviewError, AlreadyPublishedError } from './error.js';

/**
 * 記事レビュー開始イベント
 */
export type ArticleReviewStarted = ArticleEvent<'ArticleReviewStarted', {
  reviewerId: string;
}, InReviewArticle>;

export const ArticleReviewStarted = {
  from: (article: DraftArticle, reviewerId: UserId): ArticleReviewStarted =>
    DomainEvent.from('ArticleReviewStarted', { reviewerId }, {
      ...article,
      status: ArticleStatus.IN_REVIEW,
      reviewerId,
    }),
} as const;

/**
 * 記事レビューを開始します。
 *
 * @param article 記事
 * @param reviewerId レビュアーのID
 * @returns 記事レビュー開始イベント
 */
export const startReview = (
  article: Article,
  reviewerId: UserId,
): Result<ArticleReviewStarted, AlreadyInReviewError | AlreadyPublishedError | AlreadyDeletedError> => {
  switch (article.status) {
    case ArticleStatus.DRAFT:
      return ok(ArticleReviewStarted.from(article, reviewerId));
    case ArticleStatus.IN_REVIEW:
      return err(AlreadyInReviewError.from(article));
    case ArticleStatus.PUBLISHED:
      return err(AlreadyPublishedError.from(article));
    case ArticleStatus.DELETED:
      return err(AlreadyDeletedError.from(article));
    default:
      return assertNever(article);
  }
};
