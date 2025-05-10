import { Kysely } from 'kysely';
import type { Article } from '../../../domain/article/index.js';
import type { DB } from '../db.js';
import { ArticleRow } from './articleRow.js';

const from = (db: Kysely<DB>): Article.ResolverByTitle => {
  return {
    resolve: async (title) => {
      const article = await db
        .selectFrom('article')
        .selectAll()
        .where('title', '=', title)
        .executeTakeFirst();
      if (!article) {
        return undefined;
      }
      const row = ArticleRow.unsafeParse(article);
      return ArticleRow.toEntity(row);
    },
  };
};

export const PostgresArticleResolverByTitle = {
  from,
} as const;
