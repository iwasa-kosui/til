import { Kysely } from "kysely"
import type { DB } from "../db.js"
import type { ArticleReviewStarted } from "../../../domain/article/article.js"
import type { ArticleReviewStartedStore } from "../../../domain/article/articleReviewStartedStore.js"

const from = (db: Kysely<DB>): ArticleReviewStartedStore => {
    return {
        store: async (articleReviewStarted: ArticleReviewStarted) => {
            const article = articleReviewStarted.aggregate;
            await db.transaction().execute(async (tx) => {
                await tx
                    .insertInto('article')
                    .values({
                        id: article.id,
                        title: article.title,
                        content: article.content,
                        status: article.status,
                        reviewer_id: article.reviewerId,
                    })
                    .execute()
                await tx
                    .insertInto('domain_event')
                    .values({
                        event_id: articleReviewStarted.eventId,
                        event_at: articleReviewStarted.eventAt,
                        event_name: articleReviewStarted.eventName,
                        payload: articleReviewStarted.payload,
                        aggregate: articleReviewStarted.aggregate,
                    })
                    .execute()
            })
        },
    }

}

export const PostgresArticleReviewStartedStore = {
    from,
} as const;
