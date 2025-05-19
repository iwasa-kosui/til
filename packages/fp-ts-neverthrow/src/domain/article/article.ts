import { ArticleId } from "./articleId";

type Article = Readonly<{
  articleId: ArticleId;
  title: string;
  content: string;
}>;

const Article = {
  create: ({ title, content }: Omit<Article, "articleId">): Article => {
    return {
      articleId: ArticleId.generate(),
      title,
      content,
    };
  }
} as const;

export { Article };