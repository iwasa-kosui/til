import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { Article } from '../../../domain/article/index.js';
import type { DB } from '../db.js';
import { ArticleRow } from './articleRow.js';

const from = (db: Kysely<DB>): Article.ResolverById => ({
  resolve: (id) =>
    ResultAsync.fromSafePromise(
      db
        .selectFrom('article')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst(),
    ).map((article) => {
      if (!article) {
        return undefined;
      }
      const row = ArticleRow.unsafeParse(article);
      return ArticleRow.toEntity(row);
    }),
});

export const PostgresArticleResolverById = {
  from,
} as const;
