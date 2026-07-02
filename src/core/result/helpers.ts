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

type MergeEntry<K extends PropertyKey, V> = { key: K; res: ValeResult<V> };

export type MergeOutput<
  Entries extends readonly MergeEntry<PropertyKey, unknown>[],
> = {
  [E in Entries[number] as E["key"]]: Extract<
    Entries[number],
    { key: E["key"] }
  > extends { res: ValeResult<infer V> }
    ? V
    : never;
};

export const valeMergeResults = <
  const Entries extends readonly MergeEntry<PropertyKey, unknown>[],
>(
  entries: Entries,
): ValeResult<MergeOutput<Entries>> => {
  const issues: ValeIssue[] = [];
  const output: Record<PropertyKey, unknown> = {};

  for (const entry of entries) {
    if (!entry.res.ok) {
      issues.push(...entry.res.issues);
      continue;
    }

    output[entry.key] = entry.res.value;
  }

  return issues.length
    ? valeFail(issues)
    : valeOk(output as MergeOutput<Entries>);
};
