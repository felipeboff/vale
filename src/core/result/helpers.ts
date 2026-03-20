import type { ValeIssue, ValePath, ValeResult } from "../../shared/types/common";

export const valeOk = <T>(value: T): ValeResult<T> => ({ ok: true, value });

export const valeFail = (issues: ValeIssue[]): ValeResult<never> => ({
  ok: false,
  issues,
});

export const valeSingleIssue = (
  path: ValePath,
  code: string,
  message: string,
): ValeResult<never> => valeFail([{ path, code, message }]);

export const valeMergeResults = <T extends Record<string, unknown>>(
  entries: { key: keyof T; res: ValeResult<unknown> }[],
): ValeResult<T> => {
  const issues: ValeIssue[] = [];
  const output: Record<string, unknown> = {};

  for (const entry of entries) {
    if (!entry.res.ok) {
      issues.push(...entry.res.issues);
      continue;
    }

    output[entry.key as string] = entry.res.value;
  }

  return issues.length ? valeFail(issues) : valeOk(output as T);
};
