import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { z } from 'zod';
import { PostgresArticleCreatedStore } from './adaptor/postgres/article/articleCreatedStore.js';
import { PostgresArticleDeletedStore } from './adaptor/postgres/article/articleDeletedStore.js';
import { PostgresArticlePublishedStore } from './adaptor/postgres/article/articlePublishedStore.js';
import { PostgresArticleRejectedStore } from './adaptor/postgres/article/articleRejectedStore.js';
import { PostgresArticleResolverById } from './adaptor/postgres/article/articleResolverById.js';
import { PostgresArticleResolverByTitle } from './adaptor/postgres/article/articleResolverByTitle.js';
import { PostgresArticleReviewStartedStore } from './adaptor/postgres/article/articleReviewStartedStore.js';
import { PostgresArticleUnpublishedStore } from './adaptor/postgres/article/articleUnpublishedStore.js';
import type { DB } from './adaptor/postgres/db.js';
import { ArticleId } from './domain/article/articleId.js';
import { Title } from './domain/article/title.js';
import { UserId } from './domain/user/userId.js';
import { CreateArticleInteractor } from './useCase/createArticle/interactor.js';
import { DeleteArticleInteractor } from './useCase/deleteArticle/interactor.js';
import { PublishArticleInteractor } from './useCase/publishArticle/interactor.js';
import { RejectArticleInteractor } from './useCase/rejectArticle/interactor.js';
import { StartArticleReviewInteractor } from './useCase/startArticleReview/interactor.js';
import { UnpublishArticleInteractor } from './useCase/unpublishArticle/interactor.js';
import { assertNever } from './util/assertNever.js';

const app = new Hono();

const dialect = new PostgresDialect({
  pool: new Pool({
    database: 'test',
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    max: 10,
  }),
});

const db = new Kysely<DB>({
  dialect,
});

app.post(
  '/articles/create',
  zValidator(
    'form',
    z.object({
      title: Title.zodType,
      content: z.string(),
    }),
  ),
  async (c) => {
    const useCase = CreateArticleInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articleResolverByTitle: PostgresArticleResolverByTitle.from(db),
      articleCreatedStore: PostgresArticleCreatedStore.from(db),
    });

    const res = await useCase.run({
      title: c.req.valid('form').title,
      content: c.req.valid('form').content,
    });

    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'IdDuplicated':
          return c.json(err, 400);
        case 'TitleDuplicated':
          return c.json(err, 400);
        default:
          return assertNever(err);
      }
    }

    return c.json(
      {
        article: res.value.articleCreated.aggregate,
      },
      201,
    );
  },
);

app.post(
  '/articles/start-review',
  zValidator(
    'form',
    z.object({
      id: ArticleId.zodType,
      reviewer_id: UserId.zodType,
    }),
  ),
  async (c) => {
    const useCase = StartArticleReviewInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articleReviewStartedStore: PostgresArticleReviewStartedStore.from(db),
    });

    const res = await useCase.run({
      id: c.req.valid('form').id,
      reviewerId: c.req.valid('form').reviewer_id,
    });

    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'ArticleNotFound':
          return c.json(err, 404);
        case 'AlreadyInReview':
        case 'AlreadyPublished':
          return c.json(err, 400);
        default:
          return assertNever(err);
      }
    }

    return c.json(
      {
        article: res.value.articleReviewStarted.aggregate,
      },
      201,
    );
  },
);

app.post(
  '/articles/publish',
  zValidator(
    'form',
    z.object({
      id: ArticleId.zodType,
    }),
  ),
  async (c) => {
    const useCase = PublishArticleInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articlePublishedStore: PostgresArticlePublishedStore.from(db),
    });

    const res = await useCase.run({
      id: c.req.valid('form').id,
    });

    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'ArticleNotFound':
          return c.json(err, 404);
        case 'ReviewRequired':
        case 'AlreadyPublished':
          return c.json(err, 400);
        default:
          return assertNever(err);
      }
    }

    return c.json(
      {
        article: res.value.articlePublished.aggregate,
      },
      201,
    );
  },
);

app.post(
  '/articles/delete',
  zValidator(
    'form',
    z.object({
      id: ArticleId.zodType,
    }),
  ),
  async (c) => {
    const useCase = DeleteArticleInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articleDeletedStore: PostgresArticleDeletedStore.from(db),
    });

    const res = await useCase.run({
      id: c.req.valid('form').id,
    });

    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'ArticleNotFound':
          return c.json(err, 404);
        default:
          return assertNever(err.type);
      }
    }

    return c.json(
      {
        article: res.value.articleDeleted.aggregate,
      },
      200,
    );
  },
);

app.post(
  '/articles/reject',
  zValidator(
    'form',
    z.object({
      id: ArticleId.zodType,
    }),
  ),
  async (c) => {
    const useCase = RejectArticleInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articleRejectedStore: PostgresArticleRejectedStore.from(db),
    });
    const res = await useCase.run({
      id: c.req.valid('form').id,
    });
    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'ArticleNotFound':
          return c.json(err, 404);
        case 'StillDraft':
        case 'AlreadyPublished':
          return c.json(err, 400);
        default:
          return assertNever(err);
      }
    }
    return c.json(
      {
        article: res.value.articleRejected.aggregate,
      },
      200,
    );
  },
);

app.post(
  '/articles/unpublish',
  zValidator(
    'form',
    z.object({
      id: ArticleId.zodType,
    }),
  ),
  async (c) => {
    const useCase = UnpublishArticleInteractor.from({
      articleResolverById: PostgresArticleResolverById.from(db),
      articleUnpublishedStore: PostgresArticleUnpublishedStore.from(db),
    });

    const res = await useCase.run({
      id: c.req.valid('form').id,
    });

    if (res.isErr()) {
      const err = res.error;
      switch (err.type) {
        case 'ArticleNotFound':
          return c.json(err, 404);
        case 'StillDraft':
        case 'AlreadyInReview':
          return c.json(err, 400);
        default:
          return assertNever(err);
      }
    }

    return c.json(
      {
        article: res.value.articleUnpublished.aggregate,
      },
      201,
    );
  },
);

export default app;
