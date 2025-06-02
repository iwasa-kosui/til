import { err, ok, type Result } from 'neverthrow';
import { assertNever } from '../../util/assertNever.js';
import { DomainEvent } from '../domainEvent.js';
import type { Article, ArticleEvent, DraftArticle, InReviewArticle } from './article.js';
import type { ArticleId } from './articleId.js';
import { ArticleStatus } from './articleStatus.js';
import { AlreadyPublishedError, StillDraftError } from './error.js';

type ArticleRejected = ArticleEvent<'ArticleRejected', {
  id: ArticleId;
}, DraftArticle>;

/**
 * 記事差し戻しイベント
 */
const ArticleRejected = {
  from: (article: InReviewArticle): ArticleRejected => {
    return DomainEvent.from('ArticleRejected', {
      id: article.id,
    }, {
      ...article,
      reviewerId: undefined,
      status: ArticleStatus.DRAFT,
    });
  },
} as const;

const reject = (article: Article): Result<ArticleRejected, StillDraftError | AlreadyPublishedError> => {
  switch (article.status) {
    case ArticleStatus.IN_REVIEW:
      return ok(ArticleRejected.from(article));
    case ArticleStatus.PUBLISHED:
      return err(AlreadyPublishedError.from(article));
    case ArticleStatus.DRAFT:
      return err(StillDraftError.from(article));
    default:
      return assertNever(article);
  }
};

export { ArticleRejected, reject };
