import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import { valeStringParser } from "../../parsers/string";
import type { ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

export const createPatternSchema = (
  code: string,
  pattern: RegExp,
  message?: string,
): ValeSchema<string> =>
  makeVale<string>((input, path) => {
    const output = valeStringParser(input);

    if (output === undefined) {
      return valeSingleIssue(path, code, message ?? defaultMessage(path, code));
    }

    return pattern.test(output)
      ? valeOk(output)
      : valeSingleIssue(path, code, message ?? defaultMessage(path, code));
  });
