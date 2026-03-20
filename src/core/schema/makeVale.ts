import type {
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "../../shared/types/common";
import type { ValeSchema } from "../../shared/types/schema";
import {
  createDefaultParser,
  createGuardParser,
  createIntoParser,
  createLockParser,
  createNullableParser,
  createNullishParser,
  createOptionalParser,
  parseOrThrow,
} from "./modifiers";

export const makeVale = <T>(
  baseParse: (input: unknown, path: ValePath) => ValeResult<T>,
): ValeSchema<T> => {
  const probe = (input: unknown, path: ValePath = []): ValeResult<T> =>
    baseParse(input, path);
  const resolve = parseOrThrow(probe);

  return {
    resolve,
    probe,

    optional() {
      return makeVale<T | undefined>(createOptionalParser(probe));
    },

    nullable() {
      return makeVale<T | null>(createNullableParser(probe));
    },

    nullish() {
      return makeVale<T | null | undefined>(createNullishParser(probe));
    },

    default(value: ValeNonNullish<T>) {
      return makeVale<ValeNonNullish<T>>(createDefaultParser(probe, value));
    },

    into<U>(fn: (value: T) => U) {
      return makeVale<U>(createIntoParser(probe, fn));
    },

    guard(guard: (value: T) => boolean, message: string) {
      return makeVale<T>(createGuardParser(probe, guard, message));
    },

    lock() {
      return makeVale<T>(createLockParser(probe));
    },
  };
};
