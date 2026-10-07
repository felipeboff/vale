import { array } from './schemas/array';
import { bigint } from './schemas/bigint';
import { boolean } from './schemas/boolean';
import { date } from './schemas/date';
import { enumValue } from './schemas/enum';
import { email, objectId, uuid } from './schemas/format';
import { number } from './schemas/number';
import { object } from './schemas/object';
import { string } from './schemas/string';

export type * from './types';
export type { ArrayOptions } from './schemas/array';
export type { BigIntOptions } from './schemas/bigint';
export type { BooleanOptions } from './schemas/boolean';
export type { DateOptions } from './schemas/date';
export type { EnumOptions } from './schemas/enum';
export type { EmailOptions, FormatOptions, ObjectIdOptions, UuidOptions } from './schemas/format';
export type { NumberOptions } from './schemas/number';
export type { ObjectOptions } from './schemas/object';
export type { StringOptions } from './schemas/string';

export { array, bigint, boolean, date, email, enumValue, number, object, objectId, string, uuid };

export const v = {
  string,
  number,
  bigint,
  boolean,
  date,
  email,
  uuid,
  objectId,
  enum: enumValue,
  array,
  object,
};
