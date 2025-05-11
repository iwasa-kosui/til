import { ResultAsync } from 'neverthrow';
import { Article } from '../../domain/article/index.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import type { UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleRejectedStore: DomainEventStore<Article.ArticleRejected>;
  articleResolverById: Article.ResolverById;
}>;

const from = ({ articleRejectedStore, articleResolverById }: Dependencies) => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    articleResolverById.resolve(id)
      .andThen(Article.ArticleNotFoundError.validate(id))
      .andThen(Article.reject)
      .andThrough(articleRejectedStore.store)
      .map(articleRejected => ({ articleRejected }));

  return { run };
};

export const RejectArticleInteractor = { from };
