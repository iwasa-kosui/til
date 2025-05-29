import type { Result } from 'neverthrow';
import type { ArticleId } from '../../domain/article/articleId.js';
import type { AlreadyInReviewError, ArticleNotFoundError, StillDraftError } from '../../domain/article/error.js';
import type { ArticleUnpublished } from '../../domain/article/unpublish.js';

export type UseCaseInput = Readonly<{
    id: ArticleId;
}>;

export type UseCaseErr =
    | ArticleNotFoundError
    | AlreadyInReviewError
    | StillDraftError;

export type UseCaseOk = Readonly<{
    articleUnpublished: ArticleUnpublished;
}>;

export type UseCaseOutput = Result<UseCaseOk, UseCaseErr>;

export type UnpublishArticleUseCase = Readonly<{
    run: (input: UseCaseInput) => Promise<UseCaseOutput>;
}>;