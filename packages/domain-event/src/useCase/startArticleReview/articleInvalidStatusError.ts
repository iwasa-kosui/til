import { err, ok, type Result } from 'neverthrow';
import type { ApplicationError } from '../../domain/applicationError.js';
import type { Article, DraftArticle } from '../../domain/article/article.js';
import type { ArticleId } from '../../domain/article/articleId.js';

type ArticleInvalidStatusError = ApplicationError<'ArticleInvalidStatus', {
  id: ArticleId;
  status: Omit<Article['status'], 'Draft'>;
}>;

const ArticleInvalidStatusError = {
  from: (detail: ArticleInvalidStatusError['detail']): ArticleInvalidStatusError => ({
    type: 'ArticleInvalidStatus',
    message: '記事の状態が不正です',
    detail,
  }),
  validate: (id: ArticleId) => (article: Article): Result<DraftArticle, ArticleInvalidStatusError> => {
    if (article.status !== 'Draft') {
      return err(ArticleInvalidStatusError.from({ id, status: article.status }));
    }
    return ok(article);
  },
} as const;

export { ArticleInvalidStatusError };
