import type { Result } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { AlreadyPublishedError, ArticleNotFoundError } from '../../domain/article/error.js';
import type { ArticlePublished, NotInReviewError } from '../../domain/article/publish.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
}>;

export type UseCaseErr =
  | ArticleNotFoundError
  | NotInReviewError
  | AlreadyPublishedError;

export type UseCaseOk = Readonly<{
  articlePublished: ArticlePublished;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type PublishArticleUseCase = Readonly<{
  run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;
