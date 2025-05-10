import { ResultAsync } from 'neverthrow';
import { Article, type InReviewArticle } from '../../domain/article/article.js';
import type { ArticlePublishedStore } from '../../domain/article/articlePublishedStore.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import { ArticleNotFoundError } from './articleNotFoundError.js';
import type { PublishArticleUseCase, UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: ArticleResolverById;
  articlePublishedStore: ArticlePublishedStore;
}>;

const from = ({ articleResolverById, articlePublishedStore }: Dependencies): PublishArticleUseCase => {
  const publishArticle = (article: InReviewArticle): ResultAsync<UseCaseOk, never> => {
    const articlePublished = Article.publish(article);
    return ResultAsync
      .fromSafePromise(articlePublishedStore.store(articlePublished))
      .map(() => ({ articlePublished }));
  };

  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    ResultAsync
      .fromSafePromise(articleResolverById.resolve(id))
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(ArticleInvalidStatusError.validate(id))
      .andThen(publishArticle);

  return { run };
};

export const PublishArticleInteractor = {
  from,
};
