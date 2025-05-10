import type { Result } from 'neverthrow';
import type { ArticleReviewStarted } from '../../domain/article/article.js';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import type { ArticleNotFoundError } from './articleNotFoundError.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
  reviewerId: string;
}>;

export type UseCaseErr = ArticleNotFoundError | ArticleInvalidStatusError;

export type UseCaseOk = Readonly<{
  articleReviewStarted: ArticleReviewStarted;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type StartArticleReviewUseCase = Readonly<{
  run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;
