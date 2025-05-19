import { Module } from '@nestjs/common';
import { ArticleController } from './adaptor/controller/article';
import { FindArticleUseCaseModule } from './useCase/findArticle/asTask';

@Module({
  imports: [
    FindArticleUseCaseModule
  ],
  controllers: [ArticleController],
})
export class AppModule { }
