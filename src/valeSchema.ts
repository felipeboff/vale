import type {
  ValeNonNullish,
  ValePath,
  ValeResult,
  ValeSchema,
} from "./valeTypes";
import { ValeError } from "./ValeError";
import { valeIsRecord, type ValeIssue } from "./valeTypes";
import { valeSingleIssue } from "./valeResult";

export const makeVale = <T>(
  baseParse: (input: unknown, path: ValePath) => ValeResult<T>,
): ValeSchema<T> => {
  const safeParse = (input: unknown, path: ValePath = []): ValeResult<T> =>
    baseParse(input, path);

  const parse = (input: unknown, path: ValePath = []): T => {
    const r = safeParse(input, path);
    if (r.ok) return r.value;
    throw new ValeError(r.issues);
  };

  const api: ValeSchema<T> = {
    parse,
    safeParse,

    optional() {
      return makeVale<T | undefined>((input, path) => {
        if (input === undefined || input === "")
          return { ok: true, value: undefined };
        return safeParse(input, path);
      });
    },

    nullable() {
      return makeVale<T | null>((input, path) => {
        if (input === null || input === "null")
          return { ok: true, value: null };
        return safeParse(input, path);
      });
    },

    nullish() {
      return makeVale<T | null | undefined>((input, path) => {
        if (input === undefined || input === "")
          return { ok: true, value: undefined };
        if (input === null || input === "null")
          return { ok: true, value: null };
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
        )
          return { ok: true, value };
        return safeParse(input, path) as ValeResult<ValeNonNullish<T>>;
      });
    },

    into<U>(fn: (v: T) => U) {
      return makeVale<U>((input, path) => {
        const r = safeParse(input, path);
        return r.ok ? { ok: true, value: fn(r.value) } : r;
      });
    },

    guard(guard: (v: T) => boolean, message: string) {
      return makeVale<T>((input, path) => {
        const r = safeParse(input, path);
        if (!r.ok) return r;
        return guard(r.value) ? r : valeSingleIssue(path, "refine", message);
      });
    },

    strict() {
      return makeVale<T>((input, path) => {
        const r = safeParse(input, path);
        if (!r.ok) return r;

        const issues: ValeIssue[] = [];

        const deepStrict = (
          inputValue: unknown,
          outputValue: unknown,
          currentPath: ValePath,
        ) => {
          if (valeIsRecord(inputValue) && valeIsRecord(outputValue)) {
            const inputKeys = Object.keys(inputValue);
            const outKeys = new Set(Object.keys(outputValue));

            const extraKeys = inputKeys.filter((k) => !outKeys.has(k));
            for (const k of extraKeys) {
              issues.push({
                path: [...currentPath, k],
                code: "unrecognized_key",
                message: `unrecognized key "${k}"`,
              });
            }

            for (const k of inputKeys) {
              if (!outKeys.has(k)) continue;
              deepStrict(
                (inputValue as Record<string, unknown>)[k],
                (outputValue as Record<string, unknown>)[k],
                [...currentPath, k],
              );
            }

            return;
          }

          if (Array.isArray(inputValue) && Array.isArray(outputValue)) {
            const len = Math.min(inputValue.length, outputValue.length);
            for (let i = 0; i < len; i++) {
              deepStrict(inputValue[i], outputValue[i], [...currentPath, i]);
            }
            return;
          }
        };

        deepStrict(input, r.value, path);

        return issues.length ? { ok: false, issues } : r;
      });
    },
  };

  return api;
};
