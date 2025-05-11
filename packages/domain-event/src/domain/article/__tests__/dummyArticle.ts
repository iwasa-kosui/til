import { UserId } from '../../user/userId.js';
import { Article, ArticleId } from '../index.js';

const newDraft = (): Article.Draft => ({
  id: ArticleId.generate(),
  title: Article.Title.unsafeParse('タイトル'),
  content: 'コンテンツ',
  status: Article.ArticleStatus.DRAFT,
});

const newInReview = (): Article.InReview => ({
  id: ArticleId.generate(),
  title: Article.Title.unsafeParse('タイトル'),
  content: 'コンテンツ',
  status: Article.ArticleStatus.IN_REVIEW,
  reviewerId: UserId.generate(),
});

const newPublished = (): Article.Published => ({
  id: ArticleId.generate(),
  title: Article.Title.unsafeParse('タイトル'),
  content: 'コンテンツ',
  status: Article.ArticleStatus.PUBLISHED,
  reviewerId: UserId.generate(),
  publishedAt: new Date(),
});

const DummyArticle = {
  newDraft,
  newInReview,
  newPublished,
} as const;

export { DummyArticle };
