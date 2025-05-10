import { ResultAsync } from 'neverthrow';
import { Article, ArticleNotFoundError } from '../../domain/article/index.js';
import type { ArticlePublished } from '../../domain/article/publish.js';
import type { PublishArticleUseCase, UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articlePublishedStore: Article.PublishedStore;
}>;

const from = ({ articleResolverById, articlePublishedStore }: Dependencies): PublishArticleUseCase => {
  const store = (articlePublished: ArticlePublished): ResultAsync<UseCaseOk, never> =>
    ResultAsync.fromSafePromise(articlePublishedStore.store(articlePublished))
      .map(() => ({ articlePublished }));

  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    ResultAsync
      .fromSafePromise(articleResolverById.resolve(id))
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(Article.publish)
      .andThen(store);

  return { run };
};

export const PublishArticleInteractor = {
  from,
};
