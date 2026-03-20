import type { ValeIssue, ValeSchema } from "./valeTypes";
import { valeIsRecord } from "./valeTypes";
import {
  valeOk,
  valeFail,
  valeSingleIssue,
  valeMergeResults,
} from "./valeResult";
import { makeVale } from "./valeSchema";
import {
  valeStringParser,
  valeNumberParser,
  valeIntegerParser,
  valeBooleanParser,
  valeDateParser,
} from "./valeParsers";
import type { ValePath } from "./valeTypes";
import { valeEmailRegex, valeUuidRegex, valeObjectIdRegex } from "./valeRegex";

function defaultMessage(path: ValePath, code: string): string {
  return path.length
    ? `${String(path[path.length - 1])} is invalid ${code}`
    : `Invalid ${code}`;
}

export const createVale = () => {
  const s = {
    string: (message?: string) =>
      makeVale<string>((input, path) => {
        const out = valeStringParser(input);
        return out === undefined
          ? valeSingleIssue(
              path,
              "string",
              message ?? defaultMessage(path, "string"),
            )
          : valeOk(out);
      }),

    number: (message?: string) =>
      makeVale<number>((input, path) => {
        const out = valeNumberParser(input);
        return out === undefined
          ? valeSingleIssue(
              path,
              "number",
              message ?? defaultMessage(path, "number"),
            )
          : valeOk(out);
      }),

    integer: (message?: string) =>
      makeVale<number>((input, path) => {
        const out = valeIntegerParser(input);
        return out === undefined
          ? valeSingleIssue(
              path,
              "integer",
              message ?? defaultMessage(path, "integer"),
            )
          : valeOk(out);
      }),

    boolean: (message?: string) =>
      makeVale<boolean>((input, path) => {
        const out = valeBooleanParser(input);
        return out === undefined
          ? valeSingleIssue(
              path,
              "boolean",
              message ?? defaultMessage(path, "boolean"),
            )
          : valeOk(out);
      }),

    date: (message?: string) =>
      makeVale<Date>((input, path) => {
        const out = valeDateParser(input);
        return out === undefined
          ? valeSingleIssue(
              path,
              "date",
              message ?? defaultMessage(path, "date"),
            )
          : valeOk(out);
      }),

    email: (message?: string) =>
      makeVale<string>((input, path) => {
        const out = valeStringParser(input);
        if (out === undefined)
          return valeSingleIssue(
            path,
            "email",
            message ?? defaultMessage(path, "email"),
          );
        return valeEmailRegex.test(out)
          ? valeOk(out)
          : valeSingleIssue(
              path,
              "email",
              message ?? defaultMessage(path, "email"),
            );
      }),

    uuid: (message?: string) =>
      makeVale<string>((input, path) => {
        const out = valeStringParser(input);
        if (out === undefined)
          return valeSingleIssue(
            path,
            "uuid",
            message ?? defaultMessage(path, "uuid"),
          );
        return valeUuidRegex.test(out)
          ? valeOk(out)
          : valeSingleIssue(
              path,
              "uuid",
              message ?? defaultMessage(path, "uuid"),
            );
      }),

    objectId: (message?: string) =>
      makeVale<string>((input, path) => {
        const out = valeStringParser(input);
        if (out === undefined)
          return valeSingleIssue(
            path,
            "objectId",
            message ?? defaultMessage(path, "objectId"),
          );
        return valeObjectIdRegex.test(out)
          ? valeOk(out)
          : valeSingleIssue(
              path,
              "objectId",
              message ?? defaultMessage(path, "objectId"),
            );
      }),

    enum: ((
      options: readonly string[] | Record<string, string>,
      message?: string,
    ): ValeSchema<string> => {
      const values = Array.isArray(options)
        ? [...options]
        : (Object.values(options).filter(
            (v): v is string => typeof v === "string",
          ) as string[]);
      return makeVale<string>((input, path) => {
        const out = valeStringParser(input);
        if (out === undefined)
          return valeSingleIssue(
            path,
            "enum",
            message ?? defaultMessage(path, "enum"),
          );
        return values.includes(out)
          ? valeOk(out)
          : valeSingleIssue(
              path,
              "enum",
              message ?? defaultMessage(path, "enum"),
            );
      });
    }) as {
      <T extends string>(
        options: readonly T[],
        message?: string,
      ): ValeSchema<T>;
      <E extends Record<string, string>>(
        options: E,
        message?: string,
      ): ValeSchema<E[keyof E]>;
    },

    object: <T extends Record<string, ValeSchema<unknown>>>(shape: T) =>
      makeVale<{
        [K in keyof T]: T[K] extends ValeSchema<infer U> ? U : never;
      }>((input, path) => {
        if (!valeIsRecord(input))
          return valeSingleIssue(
            path,
            "object",
            defaultMessage(path, "object"),
          );

        const entries = Object.keys(shape).map((k) => {
          const key = k as keyof T;
          const schema = shape[key];
          const res = schema.safeParse((input as Record<string, unknown>)[k], [
            ...path,
            k,
          ]);
          return { key: k as keyof T, res };
        });

        return valeMergeResults<{
          [K in keyof T]: T[K] extends ValeSchema<infer U> ? U : never;
        }>(entries);
      }),

    array: <T>(item: ValeSchema<T>) =>
      makeVale<T[]>((input, path) => {
        if (!Array.isArray(input))
          return valeSingleIssue(path, "array", defaultMessage(path, "array"));

        const issues: ValeIssue[] = [];
        const out: T[] = [];

        input.forEach((v, i) => {
          const r = item.safeParse(v, [...path, i]);
          if (!r.ok) issues.push(...r.issues);
          else out.push(r.value);
        });

        return issues.length ? valeFail(issues) : valeOk(out);
      }),
  };

  return s;
};
