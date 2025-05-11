import { describe, expect, it } from 'vitest';
import { Article } from '../index.js';
import { DummyArticle } from './dummyArticle.js';

describe('Article.delete', () => {
  describe.each([
    { article: DummyArticle.newDraft(), status: Article.ArticleStatus.DRAFT },
    { article: DummyArticle.newInReview(), status: Article.ArticleStatus.IN_REVIEW },
    { article: DummyArticle.newPublished(), status: Article.ArticleStatus.PUBLISHED },
  ])('記事の状態が $status の場合', ({ article }) => {
    it('記事が削除されること', () => {
      const articleDeleted = Article.delete(article);
      expect(articleDeleted).toEqual(expect.objectContaining({
        eventName: 'ArticleDeleted',
        payload: article,
        aggregate: {
          id: article.id,
        },
      }));
    });
  });
});
