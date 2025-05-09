import { Kysely } from "kysely"
import type { DB } from "../db.js"
import type { ArticleCreated } from "../../../domain/article/article.js"
import type { ArticleCreatedStore } from "../../../domain/article/articleCreatedStore.js"

const from = (db: Kysely<DB>): ArticleCreatedStore => {
    return {
        store: async (articleCreated: ArticleCreated) => {
            const article = articleCreated.aggregate;
            await db.transaction().execute(async (tx) => {
                await tx
                    .insertInto('article')
                    .values({
                        id: article.id,
                        title: article.title,
                        content: article.content,
                        status: article.status,
                    })
                    .execute()
                await tx
                    .insertInto('domain_event')
                    .values({
                        event_id: articleCreated.eventId,
                        event_at: articleCreated.eventAt,
                        event_name: articleCreated.eventName,
                        payload: articleCreated.payload,
                        aggregate: articleCreated.aggregate,
                    })
                    .execute()
            })
        },
    }

}

export const PostgresArticleCreatedStore = {
    from,
} as const;
