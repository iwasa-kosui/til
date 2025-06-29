import { z } from "zod";
import { ZodTypeFactory } from "../util/zodTypeFactory.js";
import { randomUUID } from "node:crypto";

const brand = Symbol("OrgUnitId");
const zodType = z.string().brand(brand);
const factory = ZodTypeFactory.from(zodType);
const generate = () => factory.unsafeParse(randomUUID());

export type OrgUnitId = z.infer<typeof zodType>;
export const OrgUnitId = {
  ...factory,
  generate,
};