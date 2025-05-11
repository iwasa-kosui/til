import { DomainEvent } from '../domainEvent.js';
import type { ArticleEvent, DraftArticle } from './article.js';
import { ArticleId } from './articleId.js';
import { ArticleStatus } from './articleStatus.js';
import type { Title } from './title.js';

/**
 * 記事作成イベント
 */
export type ArticleCreated = ArticleEvent<'ArticleCreated', {
  title: Title;
  content: string;
}, DraftArticle>;

/**
 * 記事を作成します。
 *
 * @param args 記事のプロパティを指定します。
 * @param generateArticleId テストのために、記事IDを生成する関数を渡すことができます。デフォルトでは、ArticleId.generate()が使用されます。
 */
export const create = (
  args: Omit<DraftArticle, 'id' | 'status'>,
  generateArticleId: () => ArticleId = ArticleId.generate,
): ArticleCreated =>
  DomainEvent.from('ArticleCreated', args, {
    ...args,
    id: generateArticleId(),
    status: ArticleStatus.DRAFT,
  });
