import { Kysely } from "kysely";
import * as T from "fp-ts/Task";
import { DB } from "../db";
import { ArticleId } from "../../../domain/article/articleId";
import { Article } from "../../../domain/article/article";
import { ResultAsync } from "neverthrow";
import { KyselyService } from "../kysely/kysely.service";
import { Inject, Injectable, Module, Provider } from "@nestjs/common";
import { AsResultAsync, AsTask } from "../../../util/promise";
import { KyselyModule } from "../kysely/kysely.module";

type ArticleResolver = Readonly<{
  resolve: (articleId: ArticleId) => Promise<Article | undefined>;
}>

const ArticleResolver = {
  from: (db: Kysely<DB>): ArticleResolver => {
    const resolve = async (articleId: ArticleId): Promise<Article | undefined> => {
      const article = await db
        .selectFrom("article")
        .selectAll()
        .where("id", "=", articleId)
        .executeTakeFirst();

      if (!article) {
        return undefined
      }

      return {
        articleId: ArticleId.unsafeParse(article.id),
        title: article.title,
        content: article.content,
      };
    };

    return { resolve };
  },
  asTask: (db: Kysely<DB>): AsTask<ArticleResolver> => {
    const original = ArticleResolver.from(db);
    return {
      resolve: (articleId: ArticleId): T.Task<Article> => () => original.resolve(articleId)
    };
  },
  asResultAsync: (db: Kysely<DB>): AsResultAsync<ArticleResolver> => {
    const original = ArticleResolver.from(db);
    return {
      resolve: (articleId: ArticleId): ResultAsync<Article, never> =>
        ResultAsync.fromSafePromise(original.resolve(articleId)),
    };
  },
} as const

@Injectable()
export class ArticleResolverService {
  resolver: AsTask<ArticleResolver>;

  constructor(
    @Inject(KyselyService.provider.provide)
    private readonly kyselyService: KyselyService
  ) {
    this.resolver = ArticleResolver.asTask(this.kyselyService.client);
  }

  resolve(articleId: ArticleId): T.Task<Article> {
    return this.resolver.resolve(articleId);
  }
}


@Module({
  imports: [
    KyselyModule,
  ],
  providers: [
    ArticleResolverService
  ],
  exports: [
    ArticleResolverService
  ],
})
class ArticleResolverModule { }

export { ArticleResolver, ArticleResolverModule };