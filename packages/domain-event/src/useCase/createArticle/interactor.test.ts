import { err, ok } from 'neverthrow';
import assert from 'node:assert';
import { describe, expect, test, vitest } from 'vitest';
import { Article } from '../../domain/article/article.js';
import type { ArticleCreatedStore } from '../../domain/article/articleCreatedStore.js';
import { ArticleId } from '../../domain/article/articleId.js';
import type { ArticleResolverById } from '../../domain/article/articleResolverById.js';
import type { ArticleResolverByTitle } from '../../domain/article/articleResolverByTitle.js';
import { IdDuplicatedError } from './idDuplicatedError.js';
import { CreateArticleInteractor } from './interactor.js';
import { TitleDuplicatedError } from './titleDuplicatedError.js';

const createMocks = () => {
  const articleResolverById = {
    resolve: vitest.fn<ArticleResolverById['resolve']>(),
  } as const satisfies ArticleResolverById;

  const articleResolverByTitle = {
    resolve: vitest.fn<ArticleResolverByTitle['resolve']>(),
  } as const satisfies ArticleResolverByTitle;

  const articleCreatedStore = {
    store: vitest.fn<ArticleCreatedStore['store']>(),
  } as const satisfies ArticleCreatedStore;

  const generateArticleId = vitest.fn<typeof ArticleId['generate']>();

  return {
    articleResolverById,
    articleResolverByTitle,
    articleCreatedStore,
    generateArticleId,
  };
};

describe('CreateArticleInteractor', () => {
  describe('タイトルが重複している場合', () => {
    const { articleResolverById, articleResolverByTitle, articleCreatedStore } = createMocks();
    const interactor = CreateArticleInteractor.from({
      articleResolverById,
      articleResolverByTitle,
      articleCreatedStore,
    });
    const duplicated = Article.create({ title: '重複タイトル', content: 'コンテンツ' }).aggregate;
    articleResolverByTitle.resolve.mockResolvedValueOnce(duplicated);

    const input = {
      title: '重複タイトル',
      content: 'コンテンツ',
    };
    const result = interactor.run(input);

    test('TitleDuplicatedErrorを返すこと', async () => {
      await expect(result).resolves.toEqual(err(TitleDuplicatedError.from(duplicated)));
    });

    test('記事は保存されないこと', async () => {
      await result;
      expect(articleResolverByTitle.resolve).toHaveBeenCalledWith(input.title);
      expect(articleResolverByTitle.resolve).toHaveBeenCalledTimes(1);

      expect(articleCreatedStore.store).not.toHaveBeenCalled();
    });
  });

  describe('IDが重複している場合', () => {
    const { articleResolverById, articleResolverByTitle, articleCreatedStore, generateArticleId } = createMocks();
    const interactor = CreateArticleInteractor.from({
      articleResolverById,
      articleResolverByTitle,
      articleCreatedStore,
      generateArticleId,
    });
    // IDの重複をテストするために、常に同じIDを生成させる
    const articleId = ArticleId.generate();
    generateArticleId.mockReturnValue(articleId);

    articleResolverByTitle.resolve.mockResolvedValueOnce(undefined);

    const duplicated = Article.create({ title: '他のタイトル', content: 'コンテンツ' }, generateArticleId).aggregate;
    articleResolverById.resolve.mockResolvedValueOnce(duplicated);

    const input = {
      title: 'タイトル',
      content: 'コンテンツ',
    };
    const result = interactor.run(input);

    test('IdDuplicatedErrorを返すこと', async () => {
      await expect(result).resolves.toEqual(err(IdDuplicatedError.from(duplicated)));
    });

    test('記事は保存されないこと', async () => {
      await result;
      expect(articleResolverById.resolve).toHaveBeenCalledWith(articleId);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articleCreatedStore.store).not.toHaveBeenCalled();
    });
  });

  describe('タイトルもIDも重複していない場合', () => {
    const { articleResolverById, articleResolverByTitle, articleCreatedStore } = createMocks();
    const interactor = CreateArticleInteractor.from({
      articleResolverById,
      articleResolverByTitle,
      articleCreatedStore,
    });

    const input = {
      title: 'タイトル',
      content: 'コンテンツ',
    };
    articleResolverByTitle.resolve.mockResolvedValueOnce(undefined);
    articleResolverById.resolve.mockResolvedValueOnce(undefined);
    const result = interactor.run(input);
    test('インタラクターが成功を返すこと', async () => {
      await expect(result).resolves.toEqual(ok({
        articleCreated: expect.objectContaining({
          aggregate: expect.objectContaining({
            title: input.title,
            content: input.content,
          }),
        }),
      }));
    });

    test('記事を保存すること', async () => {
      const res = await result;
      assert(res.isOk());
      expect(articleResolverByTitle.resolve).toHaveBeenCalledWith(input.title);
      expect(articleResolverByTitle.resolve).toHaveBeenCalledTimes(1);

      expect(articleResolverById.resolve).toHaveBeenCalledWith(res.value.articleCreated.aggregate.id);
      expect(articleResolverById.resolve).toHaveBeenCalledTimes(1);

      expect(articleCreatedStore.store).toHaveBeenCalledWith(res.value.articleCreated);
      expect(articleCreatedStore.store).toHaveBeenCalledTimes(1);
    });
  });
});
