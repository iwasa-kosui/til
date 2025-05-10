import type { ApplicationError } from '../../domain/applicationError.js';
import type { Article } from '../../domain/article/article.js';

type TitleDuplicatedError = ApplicationError<'TitleDuplicated', {
  duplicated: Article;
}>;

const TitleDuplicatedError = {
  from: (duplicated: Article): TitleDuplicatedError => ({
    type: 'TitleDuplicated',
    message: '記事のタイトルが重複しています',
    detail: {
      duplicated,
    },
  }),
} as const;

export { TitleDuplicatedError };
