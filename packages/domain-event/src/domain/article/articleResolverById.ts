import type { Article } from "./article.js";
import type { ArticleId } from "./articleId.js";

export type ArticleResolverById = Readonly<{
    resolve: (id: ArticleId) => Promise<Article | undefined>;
}>