import { ValeError } from "../errors/ValeError";
import { valeSingleIssue } from "../result/helpers";
import { applyStrictValidation } from "./strict";
import type {
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "../../shared/types/common";
import type { ValeSchema } from "../../shared/types/schema";

export const makeVale = <T>(
  baseParse: (input: unknown, path: ValePath) => ValeResult<T>,
): ValeSchema<T> => {
  const safeParse = (input: unknown, path: ValePath = []): ValeResult<T> =>
    baseParse(input, path);

  const parse = (input: unknown, path: ValePath = []): T => {
    const result = safeParse(input, path);
    if (result.ok) return result.value;
    throw new ValeError(result.issues);
  };

  return {
    parse,
    safeParse,

    optional() {
      return makeVale<T | undefined>((input, path) => {
        if (input === undefined || input === "") {
          return { ok: true, value: undefined };
        }

        return safeParse(input, path);
      });
    },

    nullable() {
      return makeVale<T | null>((input, path) => {
        if (input === null || input === "null") {
          return { ok: true, value: null };
        }

        return safeParse(input, path);
      });
    },

    nullish() {
      return makeVale<T | null | undefined>((input, path) => {
        if (input === undefined || input === "") {
          return { ok: true, value: undefined };
        }

        if (input === null || input === "null") {
          return { ok: true, value: null };
        }

        return safeParse(input, path);
      });
    },

    default(value: ValeNonNullish<T>) {
      return makeVale<ValeNonNullish<T>>((input, path) => {
        if (
          input === undefined ||
          input === null ||
          input === "" ||
          input === "null"
        ) {
          return { ok: true, value };
        }

        return safeParse(input, path) as ValeResult<ValeNonNullish<T>>;
      });
    },

    into<U>(fn: (value: T) => U) {
      return makeVale<U>((input, path) => {
        const result = safeParse(input, path);
        return result.ok ? { ok: true, value: fn(result.value) } : result;
      });
    },

    guard(guard: (value: T) => boolean, message: string) {
      return makeVale<T>((input, path) => {
        const result = safeParse(input, path);
        if (!result.ok) return result;

        return guard(result.value)
          ? result
          : valeSingleIssue(path, "refine", message);
      });
    },

    strict() {
      return makeVale<T>((input, path) =>
        applyStrictValidation(input, safeParse(input, path), path),
      );
    },
  };
};
