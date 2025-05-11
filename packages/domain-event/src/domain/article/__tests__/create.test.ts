import { describe, expect, it } from 'vitest';
import { Article, ArticleId, ArticleStatus, Title } from '../index.js';

describe('Article.create', () => {
  it('記事が作成されること', () => {
    const articleCreated = Article.create({
      title: Title.unsafeParse('タイトル'),
      content: 'コンテンツ',
    });
    expect(articleCreated).toEqual(expect.objectContaining({
      eventName: 'ArticleCreated',
      payload: {
        title: 'タイトル',
        content: 'コンテンツ',
      },
      aggregate: {
        title: 'タイトル',
        content: 'コンテンツ',
        id: expect.any(String),
        status: ArticleStatus.DRAFT,
      },
    }));
  });

  it('記事IDジェネレータを渡すと、指定したIDで記事が作成されること', () => {
    const fixed = ArticleId.generate();
    const events = Array.from({ length: 10 }).map(() =>
      Article.create(
        {
          title: Title.unsafeParse('タイトル'),
          content: 'コンテンツ',
        },
        () => fixed,
      )
    );
    expect(events).toEqual(
      Array.from({ length: 10 }).map(() =>
        expect.objectContaining({
          eventName: 'ArticleCreated',
          aggregate: expect.objectContaining({
            id: fixed,
          }),
        })
      ),
    );
  });
});
