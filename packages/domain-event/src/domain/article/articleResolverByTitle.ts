import type { Article } from "./article.js";

export type ArticleResolverByTitle = Readonly<{
    resolve: (title: string) => Promise<Article | undefined>;
}>;