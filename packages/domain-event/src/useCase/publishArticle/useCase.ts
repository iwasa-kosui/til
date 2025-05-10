import type { Result } from 'neverthrow';
import type { ArticlePublished } from '../../domain/article/article.js';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import type { ArticleNotFoundError } from './articleNotFoundError.js';

export type UseCaseInput = Readonly<{
  id: ArticleId;
}>;

export type UseCaseErr = ArticleNotFoundError | ArticleInvalidStatusError;

export type UseCaseOk = Readonly<{
  articlePublished: ArticlePublished;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type PublishArticleUseCase = Readonly<{
  run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;
