import { Kysely } from 'kysely';
import type { ArticleCreated, ArticlePublished } from '../../../domain/article/article.js';
import type { ArticleCreatedStore } from '../../../domain/article/articleCreatedStore.js';
import type { ArticlePublishedStore } from '../../../domain/article/articlePublishedStore.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): ArticlePublishedStore => {
  return {
    store: async (articlePublished: ArticlePublished) => {
      const article = articlePublished.aggregate;
      await db.transaction().execute(async (tx) => {
        await tx
          .insertInto('article')
          .values({
            id: article.id,
            title: article.title,
            content: article.content,
            status: article.status,
            reviewer_id: article.reviewerId,
            published_at: article.publishedAt,
          })
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articlePublished.eventId,
            event_at: articlePublished.eventAt,
            event_name: articlePublished.eventName,
            payload: articlePublished.payload,
            aggregate: articlePublished.aggregate,
          })
          .execute();
      });
    },
  };
};

export const PostgresArticlePublishedStore = {
  from,
} as const;
