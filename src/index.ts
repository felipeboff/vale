export type {
  ValePath,
  ValeIssue,
  ValeResult,
  ValeJsonObject,
} from "./shared/types/common";
export type {
  ValeSchema,
  InferVale,
} from "./shared/types/schema";

export { valeIsRecord } from "./shared/guards/valeIsRecord";
export { valeOk, valeFail, valeSingleIssue, valeMergeResults } from "./core/result/helpers";
export { makeVale } from "./core/schema/makeVale";
export { valeStringParser } from "./parsers/string";
export { valeNumberParser } from "./parsers/number";
export { valeIntegerParser } from "./parsers/integer";
export { valeBooleanParser } from "./parsers/boolean";
export { valeDateParser } from "./parsers/date";
export { valeEmailRegex } from "./patterns/email";
export { valeUuidRegex } from "./patterns/uuid";
export { valeObjectIdRegex } from "./patterns/objectId";
export { valeDateRegex } from "./patterns/date";
export { createVale } from "./schemas/createVale";
export type { ValeFactory } from "./schemas/types";
export { vale, v } from "./runtime/vale";
export { ValeError } from "./core/errors/ValeError";
export { valeValidate } from "./core/validate/valeValidate";
