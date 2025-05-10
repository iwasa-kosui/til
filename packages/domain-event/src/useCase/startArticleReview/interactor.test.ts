import { err, ok } from 'neverthrow';
import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { describe, expect, test, vitest } from 'vitest';
import { Article } from '../../domain/article/article.js';
import { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import type { ArticleReviewStartedStore } from '../../domain/article/articleReviewStartedStore.js';
import { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import { ArticleNotFoundError } from './articleNotFoundError.js';
import { StartArticleReviewInteractor } from './interactor.js';

const createMocks = () => {
  const articleResolverById = {
    resolve: vitest.fn<ArticleResolverById['resolve']>(),
  } as const satisfies ArticleResolverById;

  const articleReviewStartedStore = {
    store: vitest.fn<ArticleReviewStartedStore['store']>(),
  } as const satisfies ArticleReviewStartedStore;

  return {
    articleResolverById,
    articleReviewStartedStore,
  };
};

describe('StartArticleReviewInteractor', () => {
  const newDraftArticle = () => Article.create({ title: 'タイトル', content: 'コンテンツ' }).aggregate;
  const newInReviewArticle = () => Article.startReview(newDraftArticle(), randomUUID()).aggregate;
  const newPublishedArticle = () => Article.publish(newInReviewArticle()).aggregate;

  describe('記事が存在しない場合', () => {
    const { articleResolverById, articleReviewStartedStore } = createMocks();
    const interactor = StartArticleReviewInteractor.from({
      articleResolverById,
      articleReviewStartedStore,
    });

    const articleId = ArticleId.generate();
    articleResolverById.resolve.mockResolvedValueOnce(undefined);

    const result = interactor.run({ id: articleId, reviewerId: randomUUID() });

    test('ArticleNotFoundErrorを返すこと', async () => {
      await expect(result).resolves.toEqual(err(ArticleNotFoundError.from({ id: articleId })));
    });

    test('記事は保存されないこと', async () => {
      await result;
      expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articleReviewStartedStore.store).not.toHaveBeenCalled();
    });
  });

  describe.each([
    {
      when: '既にレビュー中',
      article: newInReviewArticle(),
    },
    {
      when: '既に公開済み',
      article: newPublishedArticle(),
    },
  ])(
    '記事が $when の場合',
    ({ article }) => {
      const { articleResolverById, articleReviewStartedStore } = createMocks();
      const interactor = StartArticleReviewInteractor.from({
        articleResolverById,
        articleReviewStartedStore,
      });
      const articleId = article.id;
      articleResolverById.resolve.mockResolvedValueOnce(article);
      const result = interactor.run({ id: articleId, reviewerId: randomUUID() });

      test('ArticleInvalidStatusErrorを返すこと', async () => {
        await expect(result).resolves.toEqual(
          err(ArticleInvalidStatusError.from({ id: articleId, status: article.status })),
        );
      });

      test('記事は保存されないこと', async () => {
        await result;
        expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
        expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

        expect(articleReviewStartedStore.store).not.toHaveBeenCalled();
      });
    },
  );

  describe('記事のレビュー開始に成功する場合', () => {
    const { articleResolverById, articleReviewStartedStore } = createMocks();
    const interactor = StartArticleReviewInteractor.from({
      articleResolverById,
      articleReviewStartedStore,
    });

    const article = newDraftArticle();
    const reviewerId = randomUUID();

    articleResolverById.resolve.mockResolvedValueOnce(article);
    articleReviewStartedStore.store.mockResolvedValueOnce();
    const result = interactor.run({ id: article.id, reviewerId });

    test('レビュー中の記事を返すこと', async () => {
      await expect(result).resolves.toEqual(
        ok({
          articleReviewStarted: expect.objectContaining({
            aggregate: expect.objectContaining({ id: article.id }),
          }),
        }),
      );
    });

    test('記事が保存されること', async () => {
      const res = await result;
      assert(res.isOk());

      expect(articleResolverById.resolve).toHaveBeenCalledWith(article.id);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articleReviewStartedStore.store).toHaveBeenCalledWith(expect.objectContaining({
        aggregate: expect.objectContaining({ id: article.id }),
      }));
      expect(articleReviewStartedStore.store).toHaveBeenCalledTimes(1);
    });
  });
});
