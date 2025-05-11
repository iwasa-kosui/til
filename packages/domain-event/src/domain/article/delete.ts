import { DomainEvent } from '../domainEvent.js';
import type { Article, ArticleEvent, DraftArticle, InReviewArticle, PublishedArticle } from './article.js';
import type { ArticleId } from './articleId.js';

/**
 * 記事削除イベント
 */
type ArticleDeleted = ArticleEvent<'ArticleDeleted', Article, { id: ArticleId }>;
const ArticleDeleted = {
  from: (article: Article): ArticleDeleted =>
    DomainEvent.from('ArticleDeleted', article, {
      id: article.id,
    }),
} as const;

/**
 * 記事を削除します。
 */
const deleteArticle = (article: Article): ArticleDeleted => ArticleDeleted.from(article);

export { ArticleDeleted, deleteArticle as delete };
