import type { ResultAsync } from 'neverthrow';
import type { Article } from './article.js';
import type { ArticleId } from './articleId.js';
import type { Title } from './title.js';

export type ResolverById = Readonly<{
  resolve: (id: ArticleId) => ResultAsync<Article | undefined, never>;
}>;

export type ResolverByTitle = Readonly<{
  resolve: (title: Title) => ResultAsync<Article | undefined, never>;
}>;
