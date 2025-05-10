import { err, ok, type Result } from 'neverthrow';
import type { ApplicationError } from '../../domain/applicationError.js';
import type { Article } from '../../domain/article/article.js';
import type { ArticleId } from '../../domain/article/articleId.js';

type ArticleNotFoundError = ApplicationError<'ArticleNotFound', {
  id: ArticleId;
}>;
const ArticleNotFoundError = {
  from: (detail: ArticleNotFoundError['detail']): ArticleNotFoundError => ({
    type: 'ArticleNotFound',
    message: '記事が見つかりません',
    detail,
  }),
  validate: (id: ArticleId) => (article: Article | undefined): Result<Article, ArticleNotFoundError> => {
    if (!article) {
      return err(ArticleNotFoundError.from({ id }));
    }
    return ok(article);
  },
} as const;

export { ArticleNotFoundError };
