import { makeVale } from "../../core/schema/makeVale";
import { valeFail, valeOk, valeSingleIssue } from "../../core/result/helpers";
import type { ValeIssue } from "../../shared/types/common";
import type { ValeSchema } from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

export const createArraySchema = <T>(item: ValeSchema<T>): ValeSchema<T[]> =>
  makeVale<T[]>((input, path) => {
    if (!Array.isArray(input)) {
      return valeSingleIssue(path, "array", defaultMessage(path, "array"));
    }

    const issues: ValeIssue[] = [];
    const output: T[] = [];

    input.forEach((value, index) => {
      const result = item.probe(value, [...path, index]);

      if (!result.ok) {
        issues.push(...result.issues);
        return;
      }

      output.push(result.value);
    });

    return issues.length ? valeFail(issues) : valeOk(output);
  });
