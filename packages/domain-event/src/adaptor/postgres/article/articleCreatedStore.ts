import { Kysely } from 'kysely';
import { okAsync, ResultAsync } from 'neverthrow';
import type { ArticleCreated } from '../../../domain/article/create.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import type { DB } from '../db.js';

const from = (db: Kysely<DB>): DomainEventStore<ArticleCreated> => ({
  store: (articleCreated: ArticleCreated) => {
    const article = articleCreated.aggregate;
    return ResultAsync.fromSafePromise(
      db.transaction().execute(async (tx) => {
        await tx
          .insertInto('article')
          .values({
            id: article.id,
            title: article.title,
            content: article.content,
            status: article.status,
          })
          .execute();
        await tx
          .insertInto('domain_event')
          .values({
            event_id: articleCreated.eventId,
            event_at: articleCreated.eventAt,
            event_name: articleCreated.eventName,
            payload: articleCreated.payload,
            aggregate: articleCreated.aggregate,
          })
          .execute();
      }),
    );
  },
});

export const PostgresArticleCreatedStore = {
  from,
} as const;
