import type { Article } from './article.js';
import type { ArticleId } from './articleId.js';
import type { ArticleCreated } from './create.js';
import type { ArticleDeleted } from './delete.js';
import type { ArticlePublished } from './publish.js';
import type { ArticleRejected } from './reject.js';
import type { ArticleReviewStarted } from './startReview.js';
import type { Title } from './title.js';

export type CreatedStore = Readonly<{
  store: (articleCreated: ArticleCreated) => Promise<void>;
}>;

export type ReviewStartedStore = Readonly<{
  store: (articleReviewStarted: ArticleReviewStarted) => Promise<void>;
}>;

export type PublishedStore = Readonly<{
  store: (articlePublished: ArticlePublished) => Promise<void>;
}>;

export type ResolverById = Readonly<{
  resolve: (id: ArticleId) => Promise<Article | undefined>;
}>;

export type ResolverByTitle = Readonly<{
  resolve: (title: Title) => Promise<Article | undefined>;
}>;

export type DeletedStore = Readonly<{
  store: (articleDeleted: ArticleDeleted) => Promise<void>;
}>;

export type RejectedStore = Readonly<{
  store: (articleRejected: ArticleRejected) => Promise<void>;
}>;
