import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import { valeStringParser } from "../../parsers/string";
import type { ValeEnumOptions, ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

export const createEnumSchema = <T extends string>(
  options: ValeEnumOptions<T>,
  message?: string,
): ValeSchema<T> => {
  const values = Array.isArray(options) ? [...options] : Object.values(options);

  return makeVale<T>((input, path) => {
    const output = valeStringParser(input);

    if (output === undefined) {
      return valeSingleIssue(path, "enum", message ?? defaultMessage(path, "enum"));
    }

    return values.includes(output as T)
      ? valeOk(output as T)
      : valeSingleIssue(path, "enum", message ?? defaultMessage(path, "enum"));
  });
};
