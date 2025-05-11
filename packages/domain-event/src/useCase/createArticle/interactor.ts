import { err, ok } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import { Article, type ArticleCreated, Title } from '../../domain/article/index.js';
import type { DomainEventStore } from '../../domain/domainEvent.js';
import { IdDuplicatedError } from './idDuplicatedError.js';
import { TitleDuplicatedError } from './titleDuplicatedError.js';
import type { CreateArticleUseCase, UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articleResolverByTitle: Article.ResolverByTitle;
  articleCreatedStore: DomainEventStore<Article.ArticleCreated>;
  generateArticleId?: () => ArticleId;
}>;

const from = (
  { articleResolverById, articleResolverByTitle, articleCreatedStore, generateArticleId }: Dependencies,
): CreateArticleUseCase => {
  const errorIfTitleDuplicated = (title: Title) =>
    articleResolverByTitle.resolve(title)
      .andThrough(articleByTitle => articleByTitle ? err(TitleDuplicatedError.from(articleByTitle)) : ok(undefined));

  const errorIfIdDuplicated = (articleCreated: ArticleCreated) =>
    articleResolverById.resolve(articleCreated.aggregate.id)
      .andThrough(articleById => articleById ? err(IdDuplicatedError.from(articleById)) : ok(undefined));

  const run = async (input: UseCaseInput): Promise<UseCaseOutput> =>
    errorIfTitleDuplicated(input.title)
      .map(() => Article.create(input, generateArticleId))
      .andThrough(errorIfIdDuplicated)
      .andThrough(articleCreatedStore.store)
      .map(articleCreated => ({ articleCreated }));

  return { run };
};

export const CreateArticleInteractor = {
  from,
};
