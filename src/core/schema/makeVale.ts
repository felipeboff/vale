import type {
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "../../shared/types/common";
import type {
  ValeSchema,
  ValeSchemaMeta,
} from "../../shared/types/schema";
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

export const makeVale = <TOutput, TMeta extends ValeSchemaMeta = {}>(
  baseParse: (input: unknown, path: ValePath) => ValeResult<TOutput>,
): ValeSchema<TOutput, TMeta> => {
  const probe = (input: unknown, path: ValePath = []): ValeResult<TOutput> =>
    baseParse(input, path);
  const resolve = parseOrThrow(probe);

  return {
    resolve,
    probe,

    optional() {
      return makeVale<TOutput | undefined, TMeta & { optional: true }>(
        createOptionalParser(probe),
      );
    },

    nullable() {
      return makeVale<TOutput | null, TMeta & { nullable: true }>(
        createNullableParser(probe),
      );
    },

    nullish() {
      return makeVale<
        TOutput | null | undefined,
        TMeta & { nullish: true }
      >(createNullishParser(probe));
    },

    default(value: ValeNonNullish<TOutput>) {
      return makeVale<ValeNonNullish<TOutput>, TMeta & { default: true }>(
        createDefaultParser(probe, value),
      );
    },

    into<U>(fn: (value: TOutput) => U) {
      return makeVale<U, TMeta>(createIntoParser(probe, fn));
    },

    guard(guard: (value: TOutput) => boolean, message: string) {
      return makeVale<TOutput, TMeta>(createGuardParser(probe, guard, message));
    },

    lock() {
      return makeVale<TOutput, TMeta & { locked: true }>(
        createLockParser(probe),
      );
    },
  };
};
