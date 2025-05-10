import { Kysely } from 'kysely';
import type { Article } from '../../../domain/article/index.js';
import type { DB } from '../db.js';
import { ArticleRow } from './articleRow.js';

const from = (db: Kysely<DB>): Article.ResolverById => {
  return {
    resolve: async (id) => {
      const article = await db
        .selectFrom('article')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      if (!article) {
        return undefined;
      }
      const row = ArticleRow.unsafeParse(article);
      return ArticleRow.toEntity(row);
    },
  };
};

export const PostgresArticleResolverById = {
  from,
} as const;
