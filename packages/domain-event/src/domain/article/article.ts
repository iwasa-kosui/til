import type { Aggregate } from '../aggregate.js';
import type { DomainEvent } from '../domainEvent.js';
import type { UserId } from '../user/userId.js';
import type { ArticleId } from './articleId.js';
import type { ArticleStatus } from './articleStatus.js';
import type { Title } from './title.js';

type ArticleBase = Aggregate<ArticleId, {
  title: Title;
  content: string;
}>;

/**
 * 執筆中の記事
 */
export type DraftArticle =
  & ArticleBase
  & Readonly<{
    status: typeof ArticleStatus['DRAFT'];
  }>;

/**
 * レビュー中の記事
 */
export type InReviewArticle =
  & ArticleBase
  & Readonly<{
    status: typeof ArticleStatus['IN_REVIEW'];
    reviewerId: UserId;
  }>;

/**
 * 公開済みの記事
 */
export type PublishedArticle =
  & ArticleBase
  & Readonly<{
    status: typeof ArticleStatus['PUBLISHED'];
    reviewerId: UserId;
    publishedAt: Date;
  }>;

export type Article = DraftArticle | InReviewArticle | PublishedArticle;

export type ArticleEvent<TEventName, TPayload, TArticle extends Article | Pick<Article, 'id'>> = DomainEvent<
  TEventName,
  TPayload,
  TArticle
>;
