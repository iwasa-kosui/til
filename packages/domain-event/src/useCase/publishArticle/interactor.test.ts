import { err, ok } from 'neverthrow';
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi, vitest } from 'vitest';
import { Article, type InReviewArticle, type PublishedArticle } from '../../domain/article/article.js';
import { ArticleId } from '../../domain/article/articleId.js';
import type { ArticlePublishedStore } from '../../domain/article/articlePublishedStore.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import { ArticleInvalidStatusError } from './articleInvalidStatusError.js';
import { ArticleNotFoundError } from './articleNotFoundError.js';
import { PublishArticleInteractor } from './interactor.js';

const createMocks = () => {
  const articleResolverById = {
    resolve: vi.fn<ArticleResolverById['resolve']>(),
  } as const satisfies ArticleResolverById;

  const articlePublishedStore = {
    store: vi.fn<ArticlePublishedStore['store']>(),
  } as const satisfies ArticlePublishedStore;

  return {
    articleResolverById,
    articlePublishedStore,
  };
};

describe('PublishArticleInteractor', () => {
  describe('記事が存在しない場合', () => {
    const { articleResolverById, articlePublishedStore } = createMocks();
    const interactor = PublishArticleInteractor.from({
      articleResolverById,
      articlePublishedStore,
    });

    const articleId = ArticleId.generate();
    articleResolverById.resolve.mockResolvedValueOnce(undefined);

    const input = { id: articleId };
    const result = interactor.run(input);

    test('ArticleNotFoundErrorを返すこと', async () => {
      await expect(result).resolves.toEqual(err(ArticleNotFoundError.from({ id: articleId })));
    });

    test('記事は保存されないこと', async () => {
      await result;
      expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articlePublishedStore.store).not.toHaveBeenCalled();
    });
  });

  describe('記事のステータスが無効である場合', () => {
    const { articleResolverById, articlePublishedStore } = createMocks();
    const interactor = PublishArticleInteractor.from({
      articleResolverById,
      articlePublishedStore,
    });

    const articleId = ArticleId.generate();
    // ステータスが無効な記事（InReviewでない）
    const invalidArticle = Article.create({ title: 'タイトル', content: 'コンテンツ' }).aggregate;
    articleResolverById.resolve.mockResolvedValueOnce(invalidArticle);

    const input = { id: articleId };
    const result = interactor.run(input);

    test('ArticleInvalidStatusErrorを返すこと', async () => {
      await expect(result).resolves.toEqual(
        err(ArticleInvalidStatusError.from({ id: articleId, status: invalidArticle.status })),
      );
    });

    test('記事は保存されないこと', async () => {
      await result;
      expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articlePublishedStore.store).not.toHaveBeenCalled();
    });
  });

  describe('記事の公開に成功すべき場合', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });
    const { articleResolverById, articlePublishedStore } = createMocks();
    const interactor = PublishArticleInteractor.from({
      articleResolverById,
      articlePublishedStore,
    });

    const articleId = ArticleId.generate();
    const inReviewArticle = {
      id: articleId,
      title: 'レビュー中の記事',
      content: '内容',
      status: 'InReview',
      reviewerId: randomUUID(),
    } as const satisfies InReviewArticle;

    const publishedArticle = {
      ...inReviewArticle,
      publishedAt: new Date(),
      status: 'Published',
    } as const satisfies PublishedArticle;

    articleResolverById.resolve.mockResolvedValueOnce(inReviewArticle);
    articlePublishedStore.store.mockResolvedValueOnce();

    const input = { id: articleId };
    const result = interactor.run(input);

    test('公開された記事を返すこと', async () => {
      await expect(result).resolves.toEqual(ok({
        articlePublished: expect.objectContaining({
          aggregate: publishedArticle,
        }),
      }));
    });

    test('記事が保存されること', async () => {
      await result;
      expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
      expect(articlePublishedStore.store).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregate: publishedArticle,
        }),
      );
    });
  });
});
