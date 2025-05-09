import type { ArticleReviewStarted } from "./article.js";

export type ArticleReviewStartedStore = Readonly<{
    store: (articleReviewStarted: ArticleReviewStarted) => Promise<void>;
}>
