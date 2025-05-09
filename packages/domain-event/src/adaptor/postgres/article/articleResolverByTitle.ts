import { Kysely } from "kysely"
import type { DB } from "../db.js"
import { ArticleRow } from "./articleRow.js"
import type { ArticleResolverByTitle } from "../../../domain/article/articleResolverByTitle.js"

const from = (db: Kysely<DB>): ArticleResolverByTitle => {
    return {
        resolve: async (title) => {
            const article = await db
                .selectFrom('article')
                .selectAll()
                .where('title', '=', title)
                .executeTakeFirst()
            if (!article) {
                return undefined
            }
            const row = ArticleRow.unsafeParse(article)
            return ArticleRow.toEntity(row)
        },
    }
}

export const PostgresArticleResolverByTitle = {
    from,
} as const