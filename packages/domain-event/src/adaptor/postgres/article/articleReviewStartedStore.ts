import { Kysely } from 'kysely';
import type { Article } from '../../../domain/article/index.js';
import type { ArticleReviewStarted } from '../../../domain/article/startReview.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): Article.ReviewStartedStore => {
  return {
    store: async (articleReviewStarted: ArticleReviewStarted) => {
      const article = articleReviewStarted.aggregate;
      await db.transaction().execute(async (tx) => {
        await tx
          .updateTable('article')
          .set({
            status: article.status,
            reviewer_id: article.reviewerId,
          })
          .where('id', '=', article.id)
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articleReviewStarted.eventId,
            event_at: articleReviewStarted.eventAt,
            event_name: articleReviewStarted.eventName,
            payload: articleReviewStarted.payload,
            aggregate: articleReviewStarted.aggregate,
          })
          .execute();
      });
    },
  };
};

export const PostgresArticleReviewStartedStore = {
  from,
} as const;
