import type { Aggregate } from '../aggregate.js';
import type { ArticleId } from './articleId.js';
import type { Title } from './title.js';

export type ArticleBase = Aggregate<ArticleId, {
  title: Title;
  content: string;
}>;
