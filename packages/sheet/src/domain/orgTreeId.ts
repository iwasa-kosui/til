import { z } from "zod";
import { ZodTypeFactory } from "../util/zodTypeFactory.js";
import { randomUUID } from "node:crypto";

const brand = Symbol("OrgTreeId");
const zodType = z.string().brand(brand);
const factory = ZodTypeFactory.from(zodType);
const generate = () => factory.unsafeParse(randomUUID())
export type OrgTreeId = z.infer<typeof zodType>;
export const OrgTreeId = {
  ...factory,
  generate,
} as const;