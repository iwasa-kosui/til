import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';
import { AlreadyPublishedError, Article, StillDraftError } from '../index.js';
import { DummyArticle } from './dummyArticle.js';

const draft = DummyArticle.newDraft();
const inReview = DummyArticle.newInReview();
const published = DummyArticle.newPublished();

describe('Article.reject', () => {
  describe.each([
    {
      article: draft,
      when: Article.ArticleStatus.DRAFT,
      then: '失敗',
      expected: err(StillDraftError.from(draft)),
    },
    {
      article: inReview,
      when: Article.ArticleStatus.IN_REVIEW,
      then: '成功',
      expected: ok(expect.objectContaining({
        eventName: 'ArticleRejected',
        payload: {
          id: inReview.id,
        },
        aggregate: {
          ...inReview,
          reviewerId: undefined,
          status: Article.ArticleStatus.DRAFT,
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
    it(`記事の差し戻しが ${then} する`, () => {
      const res = Article.reject(article);
      expect(res).toEqual(expected);
    });
  });
});
