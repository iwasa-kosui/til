import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';
import { AlreadyInReviewError, Article, ReviewRequiredError, StillDraftError } from '../index.js';
import { DummyArticle } from './dummyArticle.js';

const draft = DummyArticle.newDraft();
const inReview = DummyArticle.newInReview();
const published = DummyArticle.newPublished();

describe('Article.unpublish', () => {
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
      then: '失敗',
      expected: err(AlreadyInReviewError.from(inReview)),
    },
    {
      article: published,
      when: Article.ArticleStatus.PUBLISHED,
      then: '成功',
      expected: ok(expect.objectContaining({
        eventName: 'ArticleUnpublished',
        payload: {},
        aggregate: {
          ...published,
          status: Article.ArticleStatus.IN_REVIEW,
        },
      })),
    },
  ])('記事の状態が $when の場合', ({ article, then, expected }) => {
    it(`記事の公開取り消しが ${then} する`, () => {
      const res = Article.unpublish(article);
      expect(res).toEqual(expected);
    });
  });
});
