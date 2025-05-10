import type { ApplicationError } from '../../domain/applicationError.js';
import type { Article } from '../../domain/article/article.js';

type IdDuplicatedError = ApplicationError<'IdDuplicated', {
  duplicated: Article;
}>;
const IdDuplicatedError = {
  from: (duplicated: Article): IdDuplicatedError => ({
    type: 'IdDuplicated',
    message: '記事のIDが重複しています',
    detail: {
      duplicated,
    },
  }),
} as const;

export { IdDuplicatedError };
