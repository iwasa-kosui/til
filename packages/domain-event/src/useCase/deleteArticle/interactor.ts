import { ResultAsync } from 'neverthrow';
import { Article } from '../../domain/article/index.js';
import type { UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleDeletedStore: Article.DeletedStore;
  articleResolverById: Article.ResolverById;
}>;

const from = ({ articleDeletedStore, articleResolverById }: Dependencies) => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    ResultAsync.fromSafePromise(articleResolverById.resolve(id))
      .andThen(Article.ArticleNotFoundError.validate(id))
      .map(Article.delete)
      .andThrough(articleDeleted => ResultAsync.fromSafePromise(articleDeletedStore.store(articleDeleted)))
      .map(articleDeleted => ({ articleDeleted }));

  return { run };
};

export const DeleteArticleInteractor = { from };
