import { Kysely } from 'kysely';
import { ResultAsync } from 'neverthrow';
import type { Article } from '../../../domain/article/index.js';
import type { DB } from '../db.js';
import { ArticleRow } from './articleRow.js';

const from = (db: Kysely<DB>): Article.ResolverByTitle => ({
  resolve: (title) =>
    ResultAsync.fromSafePromise(
      db
        .selectFrom('article')
        .selectAll()
        .where('title', '=', title)
        .executeTakeFirst(),
    ).map((article) => {
      if (!article) {
        return undefined;
      }
      const row = ArticleRow.unsafeParse(article);
      return ArticleRow.toEntity(row);
    }),
});

export const PostgresArticleResolverByTitle = {
  from,
} as const;
