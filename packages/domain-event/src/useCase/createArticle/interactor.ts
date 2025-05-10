import { err, ok, ResultAsync } from 'neverthrow';
import { Article } from '../../domain/article/article.js';
import type { ArticleCreatedStore } from '../../domain/article/articleCreatedStore.js';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import type { ArticleResolverByTitle } from '../../domain/article/articleResolverByTitle.js';
import { IdDuplicatedError } from './idDuplicatedError.js';
import { TitleDuplicatedError } from './titleDuplicatedError.js';
import type { CreateArticleUseCase, UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: ArticleResolverById;
  articleResolverByTitle: ArticleResolverByTitle;
  articleCreatedStore: ArticleCreatedStore;
  generateArticleId?: () => ArticleId;
}>;

const from = (
  { articleResolverById, articleResolverByTitle, articleCreatedStore, generateArticleId }: Dependencies,
): CreateArticleUseCase => {
  const run = async (input: UseCaseInput): Promise<UseCaseOutput> => {
    const articleByTitle = await articleResolverByTitle.resolve(input.title);
    if (articleByTitle) {
      return err(TitleDuplicatedError.from(articleByTitle));
    }

    const articleCreated = Article.create(input, generateArticleId);
    const articleById = await articleResolverById.resolve(articleCreated.aggregate.id);
    if (articleById) {
      return err(IdDuplicatedError.from(articleById));
    }

    await articleCreatedStore.store(articleCreated);
    return ok({ articleCreated });
  };

  return { run };
};

export const CreateArticleInteractor = {
  from,
};
