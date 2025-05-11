import type { Result } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { AlreadyInReviewError, AlreadyPublishedError, ArticleNotFoundError } from '../../domain/article/error.js';
import type { ArticleReviewStarted } from '../../domain/article/startReview.js';
import type { UserId } from '../../domain/user/userId.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
  reviewerId: UserId;
}>;

export type UseCaseErr = ArticleNotFoundError | AlreadyInReviewError | AlreadyPublishedError;

export type UseCaseOk = Readonly<{
  articleReviewStarted: ArticleReviewStarted;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type StartArticleReviewUseCase = Readonly<{
  run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;
