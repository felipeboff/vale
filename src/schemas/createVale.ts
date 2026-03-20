import {
  valeStringParser,
} from "../parsers/string";
import { valeNumberParser } from "../parsers/number";
import { valeIntegerParser } from "../parsers/integer";
import { valeBooleanParser } from "../parsers/boolean";
import { valeDateParser } from "../parsers/date";
import { valeEmailRegex } from "../patterns/email";
import { valeObjectIdRegex } from "../patterns/objectId";
import { valeUuidRegex } from "../patterns/uuid";
import type { ValeFactory } from "./types";
import { createArraySchema } from "./builders/array";
import { createCoercionSchema } from "./builders/coercion";
import { createEnumSchema } from "./builders/enum";
import { createObjectSchema } from "./builders/object";
import { createPatternSchema } from "./builders/pattern";

export const createVale = (): ValeFactory => ({
  string: (message) => createCoercionSchema("string", valeStringParser, message),
  number: (message) => createCoercionSchema("number", valeNumberParser, message),
  integer: (message) =>
    createCoercionSchema("integer", valeIntegerParser, message),
  boolean: (message) =>
    createCoercionSchema("boolean", valeBooleanParser, message),
  date: (message) => createCoercionSchema("date", valeDateParser, message),
  email: (message) => createPatternSchema("email", valeEmailRegex, message),
  uuid: (message) => createPatternSchema("uuid", valeUuidRegex, message),
  objectId: (message) =>
    createPatternSchema("objectId", valeObjectIdRegex, message),
  enum: (options, message) => createEnumSchema(options, message),
  object: (shape) => createObjectSchema(shape),
  array: (item) => createArraySchema(item),
});
