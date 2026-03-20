import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import type { ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

type ValeParser<T> = (input: unknown) => T | undefined;

export const createCoercionSchema = <T>(
  code: string,
  parser: ValeParser<T>,
  message?: string,
): ValeSchema<T> =>
  makeVale<T>((input, path) => {
    const output = parser(input);

    return output === undefined
      ? valeSingleIssue(path, code, message ?? defaultMessage(path, code))
      : valeOk(output);
  });
