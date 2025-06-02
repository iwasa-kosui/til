import { Article, ArticleNotFoundError } from '../../domain/article/index.js';
import type { ArticleUnpublished } from '../../domain/article/unpublish.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import type { UnpublishArticleUseCase, UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articleUnpublishedStore: DomainEventStore<ArticleUnpublished>;
}>;

const from = ({ articleResolverById, articleUnpublishedStore }: Dependencies): UnpublishArticleUseCase => {
  const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
    articleResolverById.resolve(id)
      .andThen(ArticleNotFoundError.validate(id))
      .andThen(Article.unpublish)
      .andThrough(articleUnpublishedStore.store)
      .map((articleUnpublished) => ({ articleUnpublished }));

  return { run };
};

export const UnpublishArticleInteractor = {
  from,
};
