import type { Result } from 'neverthrow';
import type { ArticleCreated } from '../../domain/article/create.js';
import type { Title } from '../../domain/article/title.js';
import type { IdDuplicatedError } from './idDuplicatedError.js';
import type { TitleDuplicatedError } from './titleDuplicatedError.js';

export type UseCaseInput = Readonly<{
  title: Title;
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
