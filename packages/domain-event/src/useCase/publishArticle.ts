import { err, ok, Result, ResultAsync } from "neverthrow";
import type { ApplicationError } from "../domain/applicationError.js";
import { Article, type ArticlePublished, type InReviewArticle } from "../domain/article/article.js";
import type { ArticleResolverById } from "../domain/article/articleResolverById.js";
import type { ArticlePublishedStore } from "../domain/article/articlePublishedStore.js";
import type { ArticleId } from "../domain/article/articleId.js";

type UseCaseInput = Readonly<{
    id: ArticleId;
}>;

type ArticleNotFoundError = ApplicationError<'ArticleNotFound', {
    id: ArticleId;
}>
const ArticleNotFoundError = {
    from: (detail: ArticleNotFoundError['detail']): ArticleNotFoundError => ({
        type: 'ArticleNotFound',
        message: '記事が見つかりません',
        detail,
    }),
    validate: (id: ArticleId) => (article: Article | undefined): Result<Article, ArticleNotFoundError> => {
        if (!article) {
            return err(ArticleNotFoundError.from({ id }));
        }
        return ok(article);
    }
} as const;

type ArticleInvalidStatusError = ApplicationError<'ArticleInvalidStatus', {
    id: ArticleId;
    status: Omit<Article['status'], 'InReview'>;
}>
const ArticleInvalidStatusError = {
    from: (detail: ArticleInvalidStatusError['detail']): ArticleInvalidStatusError => ({
        type: 'ArticleInvalidStatus',
        message: '記事の状態が不正です',
        detail,
    }),
    validate: (id: ArticleId) => (article: Article): Result<InReviewArticle, ArticleInvalidStatusError> => {
        if (article.status !== 'InReview') {
            return err(ArticleInvalidStatusError.from({ id, status: article.status }));
        }
        return ok(article as InReviewArticle);
    }
} as const;

type UseCaseErr = ArticleNotFoundError | ArticleInvalidStatusError;

type UseCaseOk = Readonly<{
    articlePublished: ArticlePublished;
}>;

type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

type Dependencies = Readonly<{
    articleResolverById: ArticleResolverById,
    articlePublishedStore: ArticlePublishedStore,
}>

type PublishArticleUseCase = Readonly<{
    run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;

const from = ({ articleResolverById, articlePublishedStore }: Dependencies): PublishArticleUseCase => {
    const publishArticle = (article: InReviewArticle): ResultAsync<UseCaseOk, never> => {
        const articlePublished = Article.publish(article);
        return ResultAsync
            .fromSafePromise(articlePublishedStore.store(articlePublished))
            .map(() => ({ articlePublished }))
    }

    const run = async ({ id }: UseCaseInput): Promise<UseCaseOutput> =>
        ResultAsync
            .fromSafePromise(articleResolverById.resolve(id))
            .andThen(ArticleNotFoundError.validate(id))
            .andThen(ArticleInvalidStatusError.validate(id))
            .andThen(publishArticle);

    return { run };
}

export const PublishArticleUseCase = {
    from,
}