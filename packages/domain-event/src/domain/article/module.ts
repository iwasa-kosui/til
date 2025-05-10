import type { DeletedArticle, DraftArticle, InReviewArticle, PublishedArticle } from './article.js';
import { create } from './create.js';
import { deleteArticle } from './delete.js';
import { publish } from './publish.js';
import type {
  ArticleCreatedStore,
  ArticlePublishedStore,
  ArticleResolverById,
  ArticleResolverByTitle,
  ArticleReviewStartedStore,
} from './repository.js';
import { startReview } from './startReview.js';

export { create, deleteArticle as delete, publish, startReview };

export type { Article } from './article.js';
export type Draft = DraftArticle;
export type InReview = InReviewArticle;
export type Published = PublishedArticle;
export type Deleted = DeletedArticle;

export * from './articleId.js';
export * from './articleStatus.js';
export * from './error.js';
export * from './title.js';

export type ResolverById = ArticleResolverById;
export type ResolverByTitle = ArticleResolverByTitle;
export type CreatedStore = ArticleCreatedStore;
export type ReviewStartedStore = ArticleReviewStartedStore;
export type PublishedStore = ArticlePublishedStore;
