import type { ArticlePublished } from "./article.js";

export type ArticlePublishedStore = Readonly<{
    store: (articlePublished: ArticlePublished) => Promise<void>;
}>
