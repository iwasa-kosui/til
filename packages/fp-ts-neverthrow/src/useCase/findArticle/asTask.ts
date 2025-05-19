import * as TE from "fp-ts/TaskEither";
import { ArticleResolver, ArticleResolverModule, ArticleResolverService } from "../../adaptor/postgres/article/articleResolver";
import { ArticleId } from "../../domain/article/articleId";
import { AsResultAsync, AsTask } from "../../util/promise";
import { Article } from "../../domain/article/article";
import { pipe } from "fp-ts/function";
import { Inject, Injectable, Module, Provider } from "@nestjs/common";

type FindArticleUseCase = Readonly<{
  find: (articleId: ArticleId) => TE.TaskEither<Error, Article>;
}>;

const FindArticleUseCase = {
  from: (
    resolver: AsTask<ArticleResolver>,
  ): FindArticleUseCase => {
    return {
      find: (articleId: ArticleId) => {
        return pipe(
          articleId,
          resolver.resolve,
          TE.fromTask,
        )
      }
    } as const
  },
}

@Injectable()
class FindArticleUseCaseService {
  private readonly useCase: FindArticleUseCase;
  constructor(
    @Inject(ArticleResolverService)
    articleResolver: ArticleResolverService,
  ) {
    this.useCase = FindArticleUseCase.from(articleResolver.resolver);
  }

  find(articleId: ArticleId): TE.TaskEither<Error, Article> {
    return this.useCase.find(articleId);
  }
}


@Module({
  imports: [ArticleResolverModule],
  providers: [FindArticleUseCaseService],
  exports: [FindArticleUseCaseService],
})
class FindArticleUseCaseModule { }

export { FindArticleUseCase, FindArticleUseCaseService, FindArticleUseCaseModule };