import type { DraftArticle, InReviewArticle, PublishedArticle } from './article.js';

export type { Article } from './article.js';
export type Draft = DraftArticle;
export type InReview = InReviewArticle;
export type Published = PublishedArticle;

export * from './articleId.js';
export * from './articleStatus.js';
export * from './create.js';
export * from './delete.js';
export * from './error.js';
export * from './publish.js';
export * from './reject.js';
export * from './resolver.js';
export * from './startReview.js';
export * from './title.js';
export * from './unpublish.js';
