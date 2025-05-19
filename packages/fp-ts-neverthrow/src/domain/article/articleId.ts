import { z } from "zod";
import { ZodTypeFactory } from "../../util/zodTypeFactory";

const zodType = z.string().uuid().brand("ArticleId");
type ArticleId = z.infer<typeof zodType>;

const factory = ZodTypeFactory.from(zodType);
const ArticleId = {
  zodType,
  ...factory,
  generate: () => factory.unsafeParse(crypto.randomUUID()),
} as const;

export { ArticleId }