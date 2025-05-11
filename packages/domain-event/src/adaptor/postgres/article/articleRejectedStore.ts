import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { ArticleRejected } from '../../../domain/article/reject.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): DomainEventStore<ArticleRejected> => ({
  store: (articleRejected: ArticleRejected) => {
    const article = articleRejected.aggregate;
    return ResultAsync.fromSafePromise(
      db.transaction().execute(async (tx) => {
        await tx
          .updateTable('article')
          .set({
            status: article.status,
            reviewer_id: null,
          })
          .where('id', '=', article.id)
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articleRejected.eventId,
            event_at: articleRejected.eventAt,
            event_name: articleRejected.eventName,
            payload: articleRejected.payload,
            aggregate: articleRejected.aggregate,
          })
          .execute();
      }),
    );
  },
});

export const PostgresArticleRejectedStore = {
  from,
} as const;
