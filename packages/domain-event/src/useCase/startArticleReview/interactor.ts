import { Article, ArticleNotFoundError } from '../../domain/article/index.js';
import type { ArticleReviewStarted } from '../../domain/article/startReview.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import type { UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';
import type { StartArticleReviewUseCase } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articleReviewStartedStore: DomainEventStore<ArticleReviewStarted>;
}>;

const from = ({ articleResolverById, articleReviewStartedStore }: Dependencies): StartArticleReviewUseCase => {
  const run = async ({ id, reviewerId }: UseCaseInput): Promise<UseCaseOutput> =>
    articleResolverById.resolve(id)
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(article => Article.startReview(article, reviewerId))
      .andThrough(articleReviewStartedStore.store)
      .map((articleReviewStarted) => ({ articleReviewStarted }));
  return { run };
};

export const StartArticleReviewInteractor = {
  from,
};
