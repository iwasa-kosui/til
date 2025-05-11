import { DomainEvent } from '../domainEvent.js';
import type { Article, ArticleEvent, DraftArticle, InReviewArticle, PublishedArticle } from './article.js';
import type { ArticleId } from './articleId.js';

/**
 * 記事削除イベント
 */
export type ArticleDeleted = ArticleEvent<'ArticleDeleted', Article, { id: ArticleId }>;

/**
 * 記事を削除します。
 *
 * @param article
 * @returns 記事削除イベント
 */
export const deleteArticle = (article: Article): ArticleDeleted =>
  DomainEvent.from('ArticleDeleted', article, {
    id: article.id,
  });
