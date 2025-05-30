import { err, ok, type Result } from 'neverthrow';
import type { ApplicationError } from '../applicationError.js';
import type { Article, DraftArticle, InReviewArticle, PublishedArticle } from './article.js';
import type { ArticleId } from './articleId.js';

export type AlreadyInReviewError = ApplicationError<'AlreadyInReview', {
  id: ArticleId;
}>;

export const AlreadyInReviewError = {
  from: (article: InReviewArticle): AlreadyInReviewError => ({
    type: 'AlreadyInReview',
    message: '記事はすでにレビュー中です',
    detail: {
      id: article.id,
    },
  }),
} as const;

export type AlreadyPublishedError = ApplicationError<'AlreadyPublished', {
  id: ArticleId;
}>;

export const AlreadyPublishedError = {
  from: (article: PublishedArticle): AlreadyPublishedError => ({
    type: 'AlreadyPublished',
    message: '記事はすでに公開されています',
    detail: {
      id: article.id,
    },
  }),
} as const;

export type ArticleNotFoundError = ApplicationError<'ArticleNotFound', {
  id: ArticleId;
}>;
export const ArticleNotFoundError = {
  from: (detail: ArticleNotFoundError['detail']): ArticleNotFoundError => ({
    type: 'ArticleNotFound',
    message: '記事が見つかりません',
    detail,
  }),
  validate: (id: ArticleId) => (article: Article | undefined): Result<Article, ArticleNotFoundError> => {
    if (!article) {
      return err(ArticleNotFoundError.from({ id }));
    }
    return ok(article);
  },
} as const;

export type StillDraftError = ApplicationError<'StillDraft', {
  article: DraftArticle;
}>;

export const StillDraftError = {
  from: (article: DraftArticle): StillDraftError => {
    return {
      type: 'StillDraft',
      message: 'この記事はまだ執筆中です',
      detail: {
        article,
      },
    };
  },
} as const;
