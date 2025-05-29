import { err, ok, type Result } from 'neverthrow';
import { assertNever } from '../../util/assertNever.js';
import { DomainEvent } from '../domainEvent.js';
import type { Article, ArticleEvent, InReviewArticle, PublishedArticle } from './article.js';
import { ArticleStatus } from './articleStatus.js';
import { AlreadyInReviewError, StillDraftError } from './error.js';

/**
 * 記事公開取消イベント
 */
export type ArticleUnpublished = ArticleEvent<'ArticleUnpublished', {}, InReviewArticle>;

export const ArticleUnpublished = {
  from: (article: PublishedArticle): ArticleUnpublished =>
    DomainEvent.from('ArticleUnpublished', {}, {
      ...article,
      status: ArticleStatus.IN_REVIEW,
    }),
} as const;

/**
 * 記事の公開を取り消します。
 */
export const unpublish = (article: Article): Result<ArticleUnpublished, StillDraftError | AlreadyInReviewError> => {
  switch (article.status) {
    case ArticleStatus.DRAFT:
      return err(StillDraftError.from(article));
    case ArticleStatus.IN_REVIEW:
      return err(AlreadyInReviewError.from(article));
    case ArticleStatus.PUBLISHED:
      return ok(ArticleUnpublished.from(article));
    default:
      return assertNever(article);
  }
};
