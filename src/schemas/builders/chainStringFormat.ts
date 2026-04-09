import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import type { ValePath } from "../../shared/types/common";
import type { ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

export const chainStringFormat = (
  base: ValeSchema<string>,
  formatter: (value: string) => string | null,
  code: string,
  message?: string,
): ValeSchema<string> =>
  makeVale<string>((input, path: ValePath) => {
    const result = base.probe(input, path);

    if (!result.ok) {
      return result;
    }

    const formatted = formatter(result.value);

    if (formatted === null) {
      return valeSingleIssue(
        path,
        code,
        message ?? defaultMessage(path, code),
      );
    }

    return valeOk(formatted);
  });
