import type { ValePath, ValeResult, ValeSchema } from "./valeTypes";
import { valeSingleIssue } from "./valeResult";

export const makeVale = <T>(
  baseParse: (input: unknown, path: ValePath) => ValeResult<T>,
): ValeSchema<T> => {
  const parse = (input: unknown, path: ValePath = []): ValeResult<T> =>
    baseParse(input, path);

  const api: ValeSchema<T> = {
    parse,

    optional() {
      return makeVale<T | undefined>((input, path) => {
        if (input === undefined) return { ok: true, value: undefined };
        return parse(input, path);
      });
    },

    nullable() {
      return makeVale<T | null>((input, path) => {
        if (input === null) return { ok: true, value: null };
        return parse(input, path);
      });
    },

    nullish() {
      return makeVale<T | null | undefined>((input, path) => {
        if (input === undefined || input === null)
          return { ok: true, value: input as null | undefined };
        return parse(input, path);
      });
    },

    default(value: T) {
      return makeVale<T>((input, path) => {
        if (input === undefined) return { ok: true, value };
        return parse(input, path);
      });
    },

    into<U>(fn: (v: T) => U) {
      return makeVale<U>((input, path) => {
        const r = parse(input, path);
        return r.ok ? { ok: true, value: fn(r.value) } : r;
      });
    },

    guard(guard: (v: T) => boolean, message: string) {
      return makeVale<T>((input, path) => {
        const r = parse(input, path);
        if (!r.ok) return r;
        return guard(r.value) ? r : valeSingleIssue(path, "refine", message);
      });
    },
  };

  return api;
};
