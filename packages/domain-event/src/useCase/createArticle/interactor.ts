import { err, ok } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import { Article } from '../../domain/article/index.js';
import { IdDuplicatedError } from './idDuplicatedError.js';
import { TitleDuplicatedError } from './titleDuplicatedError.js';
import type { CreateArticleUseCase, UseCaseInput, UseCaseOutput } from './useCase.js';

type Dependencies = Readonly<{
  articleResolverById: Article.ResolverById;
  articleResolverByTitle: Article.ResolverByTitle;
  articleCreatedStore: Article.CreatedStore;
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
