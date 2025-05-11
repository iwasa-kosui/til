import type { Result } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleDeleted } from '../../domain/article/delete.js';
import type { ArticleNotFoundError } from '../../domain/article/error.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
}>;

export type UseCaseErr = ArticleNotFoundError;

export type UseCaseOk = Readonly<{
  articleDeleted: ArticleDeleted;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;
export type DeleteArticleUseCase = (input: UseCaseInput) => Promise<UseCaseOutput>;
