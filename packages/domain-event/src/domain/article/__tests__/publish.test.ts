import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';
import { AlreadyPublishedError, Article, ReviewRequiredError, StillDraftError } from '../index.js';
import { DummyArticle } from './dummyArticle.js';

const draft = DummyArticle.newDraft();
const inReview = DummyArticle.newInReview();
const published = DummyArticle.newPublished();

describe('Article.publish', () => {
  describe.each([
    {
      article: draft,
      when: Article.ArticleStatus.DRAFT,
      then: '失敗',
      expected: err(ReviewRequiredError.from(draft)),
    },
    {
      article: inReview,
      when: Article.ArticleStatus.IN_REVIEW,
      then: '成功',
      expected: ok(expect.objectContaining({
        eventName: 'ArticlePublished',
        payload: {
          publishedAt: expect.any(Date),
        },
        aggregate: {
          ...inReview,
          publishedAt: expect.any(Date),
          status: Article.ArticleStatus.PUBLISHED,
        },
      })),
    },
    {
      article: published,
      when: Article.ArticleStatus.PUBLISHED,
      then: '失敗',
      expected: err(AlreadyPublishedError.from(published)),
    },
  ])('記事の状態が $when の場合', ({ article, then, expected }) => {
    it(`記事の削除が ${then} する`, () => {
      const res = Article.publish(article);
      expect(res).toEqual(expected);
    });
  });
});
