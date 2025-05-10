import type { Result } from 'neverthrow';
import type { ArticleCreated } from '../../domain/article/article.js';
import type { IdDuplicatedError } from './idDuplicatedError.js';
import type { TitleDuplicatedError } from './titleDuplicatedError.js';

export type UseCaseInput = Readonly<{
  title: string;
  content: string;
}>;

export type UseCaseErr = IdDuplicatedError | TitleDuplicatedError;

export type UseCaseOk = Readonly<{
  articleCreated: ArticleCreated;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type CreateArticleUseCase = Readonly<{
  run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;
