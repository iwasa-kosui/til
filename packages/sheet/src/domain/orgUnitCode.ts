import { z } from "zod";
import { ZodTypeFactory } from "../util/zodTypeFactory.js";

const brand = Symbol("OrgUnitCode");
const zodType = z.string().brand(brand);
const factory = ZodTypeFactory.from(zodType);
export type OrgUnitCode = z.infer<typeof zodType>;
export const OrgUnitCode = {
  ...factory,
};