import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { ArticleDeleted } from '../../../domain/article/delete.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): DomainEventStore<ArticleDeleted> => ({
  store: (articleDeleted: ArticleDeleted) => {
    const article = articleDeleted.aggregate;
    return ResultAsync.fromSafePromise(
      db.transaction().execute(async (tx) => {
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
      }),
    );
  },
});

export const PostgresArticleDeletedStore = {
  from,
} as const;
