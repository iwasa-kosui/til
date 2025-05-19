import { Controller, Get, Inject, Param } from "@nestjs/common";
import { FindArticleUseCase, FindArticleUseCaseService } from "../../useCase/findArticle/asTask";
import { ArticleId } from "../../domain/article/articleId";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

@Controller('articles')
export class ArticleController {
  constructor(
    @Inject(FindArticleUseCaseService)
    private findArticleUseCase: FindArticleUseCase) {
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return pipe(
      id,
      ArticleId.unsafeParse,
      this.findArticleUseCase.find,
      TE.map((article) => ({ article }))
    )()
  }
}