import { ResultAsync } from 'neverthrow';
import { Article, ArticleNotFoundError } from '../../domain/article/index.js';
import type { ArticleReviewStarted } from '../../domain/article/startReview.js';
import type { UseCaseErr, UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';
import type { StartArticleReviewUseCase } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articleReviewStartedStore: Article.ReviewStartedStore;
}>;

const from = ({ articleResolverById, articleReviewStartedStore }: Dependencies): StartArticleReviewUseCase => {
  const run = async ({ id, reviewerId }: UseCaseInput): Promise<UseCaseOutput> => {
    const store = (articleReviewStarted: ArticleReviewStarted): ResultAsync<UseCaseOk, never> =>
      ResultAsync.fromSafePromise(articleReviewStartedStore.store(articleReviewStarted))
        .map(() => ({ articleReviewStarted }));

    return ResultAsync
      .fromSafePromise(articleResolverById.resolve(id))
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(article => Article.startReview(article, reviewerId))
      .andThen(store);
  };
  return { run };
};

export const StartArticleReviewInteractor = {
  from,
};
