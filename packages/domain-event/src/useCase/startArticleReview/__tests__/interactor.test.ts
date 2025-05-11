import { err, ok, okAsync } from 'neverthrow';
import assert from 'node:assert';
import { describe, expect, test, vitest } from 'vitest';
import { ArticleId } from '../../../domain/article/articleId.js';
import {
  AlreadyInReviewError,
  AlreadyPublishedError,
  Article,
  ArticleNotFoundError,
  ArticleStatus,
} from '../../../domain/article/index.js';
import { Title } from '../../../domain/article/title.js';
import type { DomainEventStore } from '../../../domain/domainEvent.js';
import { UserId } from '../../../domain/user/userId.js';
import { StartArticleReviewInteractor } from '../interactor.js';

const createMocks = () => {
  const articleResolverById = {
    resolve: vitest.fn<Article.ResolverById['resolve']>(),
  } as const satisfies Article.ResolverById;

  const articleReviewStartedStore = {
    store: vitest.fn<DomainEventStore<Article.ArticleReviewStarted>['store']>(),
  } as const satisfies DomainEventStore<Article.ArticleReviewStarted>;

  return {
    articleResolverById,
    articleReviewStartedStore,
  };
};

describe('StartArticleReviewInteractor', () => {
  const newDraftArticle = (): Article.Draft => ({
    id: ArticleId.generate(),
    status: ArticleStatus.DRAFT,
    title: Title.unsafeParse('タイトル'),
    content: 'コンテンツ',
  });
  const newInReviewArticle = (): Article.InReview => ({
    id: ArticleId.generate(),
    status: ArticleStatus.IN_REVIEW,
    title: Title.unsafeParse('タイトル'),
    content: 'コンテンツ',
    reviewerId: UserId.generate(),
  });
  const newPublishedArticle = (): Article.Published => ({
    id: ArticleId.generate(),
    status: ArticleStatus.PUBLISHED,
    title: Title.unsafeParse('タイトル'),
    content: 'コンテンツ',
    reviewerId: UserId.generate(),
    publishedAt: new Date(),
  });

  describe('記事が存在しない場合', () => {
    const { articleResolverById, articleReviewStartedStore } = createMocks();
    const interactor = StartArticleReviewInteractor.from({
      articleResolverById,
      articleReviewStartedStore,
    });

    const articleId = ArticleId.generate();
    articleResolverById.resolve.mockReturnValueOnce(okAsync(undefined));

    const result = interactor.run({ id: articleId, reviewerId: UserId.generate() });

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

  const inReviewArticle = newInReviewArticle();
  const publishedArticle = newPublishedArticle();
  const deletedArticle = Article.delete(publishedArticle).aggregate;

  describe.each([
    {
      when: '既にレビュー中',
      article: inReviewArticle,
      then: 'AlreadyInReviewError',
      expected: AlreadyInReviewError.from(inReviewArticle),
    },
    {
      when: '既に公開済み',
      article: publishedArticle,
      then: 'AlreadyPublishedError',
      expected: AlreadyPublishedError.from(publishedArticle),
    },
  ])(
    '記事が $when の場合',
    ({ article, expected, then }) => {
      const { articleResolverById, articleReviewStartedStore } = createMocks();
      const interactor = StartArticleReviewInteractor.from({
        articleResolverById,
        articleReviewStartedStore,
      });
      const articleId = article.id;
      articleResolverById.resolve.mockReturnValueOnce(okAsync(article));
      const result = interactor.run({ id: articleId, reviewerId: UserId.generate() });

      test(`${then} を返すこと`, async () => {
        await expect(result).resolves.toEqual(
          err(expected),
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
    const reviewerId = UserId.generate();

    articleResolverById.resolve.mockReturnValueOnce(okAsync(article));
    articleReviewStartedStore.store.mockReturnValueOnce(okAsync(undefined));
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
