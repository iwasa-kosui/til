import type { ArticleCreated } from './article.js';

export type ArticleCreatedStore = Readonly<{
  store: (articleCreated: ArticleCreated) => Promise<void>;
}>;
