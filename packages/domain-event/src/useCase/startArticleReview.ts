import { err, ok, Result, ResultAsync } from "neverthrow";
import type { ApplicationError } from "../domain/applicationError.js";
import { Article, type ArticleReviewStarted, type DraftArticle } from "../domain/article/article.js";
import type { ArticleResolverById } from "../domain/article/articleResolverById.js";
import type { ArticleId } from "../domain/article/articleId.js";
import type { ArticleReviewStartedStore } from "../domain/article/articleReviewStartedStore.js";

type UseCaseInput = Readonly<{
    id: ArticleId;
    reviewerId: string;
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
    status: Omit<Article['status'], 'Draft'>;
}>
const ArticleInvalidStatusError = {
    from: (detail: ArticleInvalidStatusError['detail']): ArticleInvalidStatusError => ({
        type: 'ArticleInvalidStatus',
        message: '記事の状態が不正です',
        detail,
    }),
    validate: (id: ArticleId) => (article: Article): Result<DraftArticle, ArticleInvalidStatusError> => {
        if (article.status !== 'Draft') {
            return err(ArticleInvalidStatusError.from({ id, status: article.status }));
        }
        return ok(article);
    }
} as const;

type UseCaseErr = ArticleNotFoundError | ArticleInvalidStatusError;

type UseCaseOk = Readonly<{
    articleReviewStarted: ArticleReviewStarted;
}>;

type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

type Dependencies = Readonly<{
    articleResolverById: ArticleResolverById,
    articleReviewStartedStore: ArticleReviewStartedStore,
}>

type PublishArticleUseCase = Readonly<{
    run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;

const from = ({ articleResolverById, articleReviewStartedStore }: Dependencies): PublishArticleUseCase => {
    const run = async ({ id, reviewerId }: UseCaseInput): Promise<UseCaseOutput> => {
        const publishArticle = (article: DraftArticle): ResultAsync<UseCaseOk, never> => {
            const articleReviewStarted = Article.startReview(article, reviewerId);
            return ResultAsync.fromSafePromise(articleReviewStartedStore.store(articleReviewStarted))
                .map(() => ({ articleReviewStarted }))
        }

        return ResultAsync
            .fromSafePromise(articleResolverById.resolve(id))
            .andThen(ArticleNotFoundError.validate(id))
            .andThen(ArticleInvalidStatusError.validate(id))
            .andThen(publishArticle);
    }
    return { run };
}

export const StartArticleReviewUseCase = {
    from,
}