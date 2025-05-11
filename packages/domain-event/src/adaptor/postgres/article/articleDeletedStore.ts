import { Kysely } from 'kysely';
import type { ArticleDeleted } from '../../../domain/article/delete.js';
import type { Article } from '../../../domain/article/index.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): Article.DeletedStore => {
  return {
    store: async (articleDeleted: ArticleDeleted) => {
      const article = articleDeleted.aggregate;
      await db.transaction().execute(async (tx) => {
        await tx
          .deleteFrom('article')
          .where('id', '=', article.id)
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articleDeleted.eventId,
            event_at: articleDeleted.eventAt,
            event_name: articleDeleted.eventName,
            payload: articleDeleted.payload,
            aggregate: articleDeleted.aggregate,
          })
          .execute();
      });
    },
  };
};

export const PostgresArticleDeletedStore = {
  from,
} as const;
