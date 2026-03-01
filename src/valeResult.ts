import type { ValeIssue, ValePath, ValeResult } from "./valeTypes";

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
  const out: Record<string, unknown> = {};

  for (const e of entries) {
    if (!e.res.ok) issues.push(...e.res.issues);
    else out[e.key as string] = e.res.value;
  }

  return issues.length ? valeFail(issues) : valeOk(out as T);
};
