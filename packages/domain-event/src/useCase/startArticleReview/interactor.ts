import { ResultAsync } from 'neverthrow';
import { Article, type DraftArticle } from '../../domain/article/article.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import type { ArticleReviewStartedStore } from '../../domain/article/articleReviewStartedStore.js';
import { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import { ArticleNotFoundError } from './articleNotFoundError.js';
import type { UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';
import type { StartArticleReviewUseCase } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: ArticleResolverById;
  articleReviewStartedStore: ArticleReviewStartedStore;
}>;

const from = ({ articleResolverById, articleReviewStartedStore }: Dependencies): StartArticleReviewUseCase => {
  const run = async ({ id, reviewerId }: UseCaseInput): Promise<UseCaseOutput> => {
    const startReview = (article: DraftArticle): ResultAsync<UseCaseOk, never> => {
      const articleReviewStarted = Article.startReview(article, reviewerId);
      return ResultAsync.fromSafePromise(articleReviewStartedStore.store(articleReviewStarted))
        .map(() => ({ articleReviewStarted }));
    };

    return ResultAsync
      .fromSafePromise(articleResolverById.resolve(id))
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(ArticleInvalidStatusError.validate(id))
      .andThen(startReview);
  };
  return { run };
};

export const StartArticleReviewInteractor = {
  from,
};
