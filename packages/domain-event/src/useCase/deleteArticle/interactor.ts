import { ResultAsync } from 'neverthrow';
import { Article } from '../../domain/article/index.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import type { UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleDeletedStore: DomainEventStore<Article.ArticleDeleted>;
  articleResolverById: Article.ResolverById;
}>;

const from = ({ articleDeletedStore, articleResolverById }: Dependencies) => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    articleResolverById.resolve(id)
      .andThen(Article.ArticleNotFoundError.validate(id))
      .map(Article.delete)
      .andThrough(articleDeletedStore.store)
      .map(articleDeleted => ({ articleDeleted }));

  return { run };
};

export const DeleteArticleInteractor = { from };
