import { err, ok, Result, ResultAsync } from "neverthrow";
import type { ApplicationError } from "../domain/applicationError.js";
import { Article, type ArticleCreated } from "../domain/article/article.js";
import type { ArticleResolverById } from "../domain/article/articleResolverById.js";
import type { ArticleResolverByTitle } from "../domain/article/articleResolverByTitle.js";
import type { ArticleCreatedStore } from "../domain/article/articleCreatedStore.js";
import type { ArticleId } from "../domain/article/articleId.js";

type UseCaseInput = Readonly<{
    title: string;
    content: string;
}>;

type IdDuplicatedError = ApplicationError<'IdDuplicated', {
    duplicated: Article;
}>
const IdDuplicatedError = {
    from: (duplicated: Article): IdDuplicatedError => ({
        type: 'IdDuplicated',
        message: '記事のIDが重複しています',
        detail: {
            duplicated,
        },
    }),
} as const;

type TitleDuplicatedError = ApplicationError<'TitleDuplicated', {
    duplicated: Article;
}>

const TitleDuplicatedError = {
    from: (duplicated: Article): TitleDuplicatedError => ({
        type: 'TitleDuplicated',
        message: '記事のタイトルが重複しています',
        detail: {
            duplicated,
        },
    }),
} as const;

type UseCaseErr = IdDuplicatedError | TitleDuplicatedError;

type UseCaseOk = Readonly<{
    articleCreated: ArticleCreated;
}>;

type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

type Dependencies = Readonly<{
    articleResolverById: ArticleResolverById,
    articleResolverByTitle: ArticleResolverByTitle,
    articleCreatedStore: ArticleCreatedStore,
}>

type CreateArticleUseCase = Readonly<{
    run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;

const from = ({ articleResolverById, articleResolverByTitle, articleCreatedStore }: Dependencies): CreateArticleUseCase => {
    const run = async (input: UseCaseInput): Promise<UseCaseOutput> => {
        const articleByTitle = await articleResolverByTitle.resolve(input.title);
        if (articleByTitle) {
            return err(TitleDuplicatedError.from(articleByTitle));
        }

        const articleCreated = Article.create(input);
        const articleById = await articleResolverById.resolve(articleCreated.aggregate.id);
        if (articleById) {
            return err(IdDuplicatedError.from(articleById));
        }

        await articleCreatedStore.store(articleCreated)
        return ok({ articleCreated })
    }

    return { run };
}

export const CreateArticleUseCase = {
    from,
}