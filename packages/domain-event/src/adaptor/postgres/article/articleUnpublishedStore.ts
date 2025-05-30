import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { ArticleUnpublished } from '../../../domain/article/unpublish.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): DomainEventStore<ArticleUnpublished> => ({
  store: (articleUnpublished: ArticleUnpublished) => {
    const article = articleUnpublished.aggregate;
    return ResultAsync.fromSafePromise(
      db.transaction().execute(async (tx) => {
        await tx
          .updateTable('article')
          .set({
            status: article.status,
            published_at: null, // TODO: published_atをnullにするかどうかは要検討
          })
          .where('id', '=', article.id)
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articleUnpublished.eventId,
            event_at: articleUnpublished.eventAt,
            event_name: articleUnpublished.eventName,
            payload: articleUnpublished.payload,
            aggregate: articleUnpublished.aggregate,
          })
          .execute();
      }),
    );
  },
});

export const PostgresArticleUnpublishedStore = {
  from,
} as const;
