import type { Article } from './article.js';
import type { ArticleId } from './articleId.js';
import type { ArticleCreated } from './create.js';
import type { ArticleDeleted } from './delete.js';
import type { ArticlePublished } from './publish.js';
import type { ArticleRejected } from './reject.js';
import type { ArticleReviewStarted } from './startReview.js';
import type { Title } from './title.js';

export type ArticleCreatedStore = Readonly<{
  store: (articleCreated: ArticleCreated) => Promise<void>;
}>;

export type ArticleReviewStartedStore = Readonly<{
  store: (articleReviewStarted: ArticleReviewStarted) => Promise<void>;
}>;

export type ArticlePublishedStore = Readonly<{
  store: (articlePublished: ArticlePublished) => Promise<void>;
}>;

export type ArticleResolverById = Readonly<{
  resolve: (id: ArticleId) => Promise<Article | undefined>;
}>;

export type ArticleResolverByTitle = Readonly<{
  resolve: (title: Title) => Promise<Article | undefined>;
}>;

export type ArticleDeletedStore = Readonly<{
  store: (articleDeleted: ArticleDeleted) => Promise<void>;
}>;

export type ArticleRejectedStore = Readonly<{
  store: (articleRejected: ArticleRejected) => Promise<void>;
}>;
