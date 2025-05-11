import { err, ok } from 'neverthrow';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { ArticleId } from '../../../domain/article/articleId.js';
import { ArticleStatus } from '../../../domain/article/articleStatus.js';
import { AlreadyPublishedError, Article, ArticleNotFoundError } from '../../../domain/article/index.js';
import { NotInReviewError } from '../../../domain/article/publish.js';
import { Title } from '../../../domain/article/title.js';
import { UserId } from '../../../domain/user/userId.js';
import { PublishArticleInteractor } from '../interactor.js';

const createMocks = () => {
  const articleResolverById = {
    resolve: vi.fn<Article.ResolverById['resolve']>(),
  } as const satisfies Article.ResolverById;

  const articlePublishedStore = {
    store: vi.fn<Article.PublishedStore['store']>(),
  } as const satisfies Article.PublishedStore;

  return {
    articleResolverById,
    articlePublishedStore,
  };
};

describe('PublishArticleInteractor', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

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
    const newDraftArticle = (): Article.Draft => ({
      id: ArticleId.generate(),
      status: ArticleStatus.DRAFT,
      title: Title.unsafeParse('タイトル'),
      content: 'コンテンツ',
    });
    const newPublishedArticle = (): Article.Published => ({
      id: ArticleId.generate(),
      status: ArticleStatus.PUBLISHED,
      title: Title.unsafeParse('タイトル'),
      content: 'コンテンツ',
      reviewerId: UserId.generate(),
      publishedAt: new Date(),
    });

    const draftArticle = newDraftArticle();
    const publishedArticle = newPublishedArticle();
    const deletedArticle = Article.delete(publishedArticle).aggregate;

    describe.each([
      {
        when: 'まだレビューが開始されていない',
        article: draftArticle,
        then: 'NotInReviewError',
        expected: NotInReviewError.from(draftArticle),
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
        const { articleResolverById, articlePublishedStore } = createMocks();
        const interactor = PublishArticleInteractor.from({
          articleResolverById,
          articlePublishedStore,
        });
        const articleId = article.id;
        articleResolverById.resolve.mockResolvedValueOnce(article);
        const result = interactor.run({ id: articleId });

        test(`${then} を返すこと`, async () => {
          await expect(result).resolves.toEqual(
            err(expected),
          );
        });

        test('記事は保存されないこと', async () => {
          await result;
          expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
          expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

          expect(articlePublishedStore.store).not.toHaveBeenCalled();
        });
      },
    );
  });

  describe('記事の公開に成功すべき場合', () => {
    const { articleResolverById, articlePublishedStore } = createMocks();
    const interactor = PublishArticleInteractor.from({
      articleResolverById,
      articlePublishedStore,
    });

    const articleId = ArticleId.generate();
    const inReviewArticle = {
      id: articleId,
      title: Title.unsafeParse('レビュー中の記事'),
      content: '内容',
      status: ArticleStatus.IN_REVIEW,
      reviewerId: UserId.generate(),
    } as const satisfies Article.InReview;

    const publishedArticle = {
      ...inReviewArticle,
      publishedAt: new Date(),
      status: ArticleStatus.PUBLISHED,
    } as const satisfies Article.Published;

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
