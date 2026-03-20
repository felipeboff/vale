import { valeFail } from "../result/helpers";
import { valeIsRecord } from "../../shared/guards/valeIsRecord";
import type { ValeIssue, ValePath, ValeResult } from "../../shared/types/common";

const collectLockIssues = (
  inputValue: unknown,
  outputValue: unknown,
  currentPath: ValePath,
  issues: ValeIssue[],
): void => {
  if (valeIsRecord(inputValue) && valeIsRecord(outputValue)) {
    const inputKeys = Object.keys(inputValue);
    const outputKeys = new Set(Object.keys(outputValue));

    for (const key of inputKeys) {
      if (!outputKeys.has(key)) {
        issues.push({
          path: [...currentPath, key],
          code: "unrecognized_key",
          message: `unrecognized key "${key}"`,
        });
        continue;
      }

      collectLockIssues(
        inputValue[key],
        outputValue[key],
        [...currentPath, key],
        issues,
      );
    }

    return;
  }

  if (Array.isArray(inputValue) && Array.isArray(outputValue)) {
    const length = Math.min(inputValue.length, outputValue.length);

    for (let index = 0; index < length; index += 1) {
      collectLockIssues(
        inputValue[index],
        outputValue[index],
        [...currentPath, index],
        issues,
      );
    }
  }
};

export const applyLockValidation = <T>(
  input: unknown,
  result: ValeResult<T>,
  path: ValePath,
): ValeResult<T> => {
  if (!result.ok) return result;

  const issues: ValeIssue[] = [];
  collectLockIssues(input, result.value, path, issues);

  return issues.length ? valeFail(issues) : result;
};
