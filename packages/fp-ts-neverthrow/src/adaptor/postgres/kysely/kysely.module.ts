import { Module } from "@nestjs/common";
import { KyselyService } from "./kysely.service";

@Module({
  providers: [KyselyService.provider],
  exports: [KyselyService.provider],
})
export class KyselyModule { }