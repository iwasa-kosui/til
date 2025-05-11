import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { ArticlePublished } from '../../../domain/article/publish.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): DomainEventStore<ArticlePublished> => ({
  store: (articlePublished: ArticlePublished) => {
    const article = articlePublished.aggregate;
    return ResultAsync.fromSafePromise(
      db.transaction().execute(async (tx) => {
        await tx
          .updateTable('article')
          .set({
            status: article.status,
            published_at: article.publishedAt,
          })
          .where('id', '=', article.id)
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
      }),
    );
  },
});

export const PostgresArticlePublishedStore = {
  from,
} as const;
