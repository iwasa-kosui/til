import { DomainEvent } from '../domainEvent.js';
import type {
  Article,
  ArticleEvent,
  DeletedArticle,
  DraftArticle,
  InReviewArticle,
  PublishedArticle,
} from './article.js';
import { ArticleStatus } from './articleStatus.js';

/**
 * 記事削除イベント
 */
export type ArticleDeleted = ArticleEvent<'ArticleDeleted', Article, DeletedArticle>;

/**
 * 記事を削除します。
 *
 * @param article
 * @returns 記事削除イベント
 */
export const deleteArticle = (article: DraftArticle | InReviewArticle | PublishedArticle): ArticleDeleted =>
  DomainEvent.from('ArticleDeleted', article, {
    ...article,
    status: ArticleStatus.DELETED,
  });
