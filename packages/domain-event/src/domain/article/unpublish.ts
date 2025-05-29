import type { InReviewArticle, PublishedArticle, Article } from "./article.js";
import { ArticleStatus } from "./articleStatus.js";



/**
 * 記事の公開を取り消します。
 */
export const unpublish = (article: Article): InReviewArticle => {
    switch (article.status) {
        case ArticleStatus.DRAFT:
            throw new Error('Draft article cannot be unpublished');
        case ArticleStatus.IN_REVIEW:
            throw new Error('Already in review');
        case ArticleStatus.PUBLISHED:
            return {
                ...article,
                status: ArticleStatus.IN_REVIEW,
            }
    }
}
