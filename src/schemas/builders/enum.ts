import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import { valeStringParser } from "../../parsers/string";
import type { ValeEnumOptions, ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

const isEnumMember = <T extends string>(
  values: readonly T[],
  value: string,
): value is T => (values as readonly string[]).includes(value);

export const createEnumSchema = <T extends string>(
  options: ValeEnumOptions<T>,
  message?: string,
): ValeSchema<T> => {
  const values: readonly T[] = Array.isArray(options)
    ? options
    : (Object.values(options) as T[]);

  return makeVale<T>((input, path) => {
    const output = valeStringParser(input);

    if (output === undefined) {
      return valeSingleIssue(path, "enum", message ?? defaultMessage(path, "enum"));
    }

    return isEnumMember(values, output)
      ? valeOk(output)
      : valeSingleIssue(path, "enum", message ?? defaultMessage(path, "enum"));
  });
};
