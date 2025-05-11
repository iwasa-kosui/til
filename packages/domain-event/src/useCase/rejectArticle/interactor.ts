import { ResultAsync } from 'neverthrow';
import { Article } from '../../domain/article/index.js';
import type { UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleRejectedStore: Article.RejectedStore;
  articleResolverById: Article.ResolverById;
}>;

const from = ({ articleRejectedStore, articleResolverById }: Dependencies) => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    ResultAsync.fromSafePromise(articleResolverById.resolve(id))
      .andThen(Article.ArticleNotFoundError.validate(id))
      .andThen(Article.reject)
      .andThrough(articleRejected => ResultAsync.fromSafePromise(articleRejectedStore.store(articleRejected)))
      .map(articleRejected => ({ articleRejected }));

  return { run };
};

export const RejectArticleInteractor = { from };
