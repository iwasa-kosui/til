import type { Aggregate } from "../aggregate.js";
import { ArticleId } from "./articleId.js";
import { DomainEvent } from "../domainEvent.js";

type ArticleBase = Aggregate<ArticleId, {
    title: string;
    content: string;
}>;

export type DraftArticle =
    & ArticleBase
    & Readonly<{
        status: "Draft";
    }>;

export type InReviewArticle =
    & ArticleBase
    & Readonly<{
        status: "InReview";
        reviewerId: string;
    }>;

export type PublishedArticle =
    & ArticleBase
    & Readonly<{
        status: "Published";
        reviewerId: string;
        publishedAt: Date;
    }>;

export type Article = DraftArticle | InReviewArticle | PublishedArticle;

type ArticleEvent<TEventName, TPayload, TArticle extends Article | Pick<Article, 'id'>> = DomainEvent<TEventName, TPayload, TArticle>;

export type ArticleCreated = ArticleEvent<"ArticleCreated", {
    title: string;
    content: string;
}, DraftArticle>;

export type ArticleReviewStarted = ArticleEvent<"ArticleReviewStarted", {
    reviewerId: string;
}, InReviewArticle>;

export type ArticlePublished = ArticleEvent<"ArticlePublished", {
    publishedAt: Date;
}, PublishedArticle>;

export type ArticleDeleted = ArticleEvent<"ArticleDeleted", { id: ArticleId }, Pick<Article, 'id'>>;

const create = (args: Omit<DraftArticle, "id" | "status">): ArticleCreated =>
    DomainEvent.from("ArticleCreated", args, {
        ...args,
        id: ArticleId.generate(),
        status: "Draft",
    })

const startReview = (article: DraftArticle, reviewerId: string): ArticleReviewStarted =>
    DomainEvent.from("ArticleReviewStarted", { reviewerId }, {
        ...article,
        id: article.id,
        status: "InReview",
        reviewerId,
    })

const publish = (article: InReviewArticle): ArticlePublished => {
    const publishedAt = new Date()
    return DomainEvent.from("ArticlePublished", { publishedAt }, {
        ...article,
        id: article.id,
        status: "Published",
        publishedAt
    })
}

const deleteArticle = (article: Article): ArticleDeleted =>
    DomainEvent.from("ArticleDeleted", { id: article.id }, {
        id: article.id,
    })

export const Article = {
    create,
    startReview,
    publish,
    delete: deleteArticle,
} as const;