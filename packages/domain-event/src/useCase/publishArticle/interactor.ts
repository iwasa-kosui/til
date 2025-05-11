import { ResultAsync } from 'neverthrow';
import { Article, ArticleNotFoundError } from '../../domain/article/index.js';
import type { ArticlePublished } from '../../domain/article/publish.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import type { PublishArticleUseCase, UseCaseInput, UseCaseOk, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articlePublishedStore: DomainEventStore<ArticlePublished>;
}>;

const from = ({ articleResolverById, articlePublishedStore }: Dependencies): PublishArticleUseCase => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    articleResolverById.resolve(id)
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(Article.publish)
      .andThrough(articlePublishedStore.store)
      .map((articlePublished) => ({ articlePublished }));

  return { run };
};

export const PublishArticleInteractor = {
  from,
};
