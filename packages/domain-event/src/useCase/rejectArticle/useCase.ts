import type { Result } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { AlreadyPublishedError, ArticleNotFoundError } from '../../domain/article/error.js';
import type { ArticleRejected, StillDraftError } from '../../domain/article/reject.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
}>;

export type UseCaseErr = ArticleNotFoundError | StillDraftError | AlreadyPublishedError;

export type UseCaseOk = Readonly<{
  articleRejected: ArticleRejected;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;
export type RejectArticleUseCase = (input: UseCaseInput) => Promise<UseCaseOutput>;
