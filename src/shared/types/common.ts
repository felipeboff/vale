export type ValePath = Array<string | number>;

export type ValeIssue = {
  path: ValePath;
  code: string;
  message: string;
};

export type ValeResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValeIssue[] };

export type ValeNonNullish<T> = Exclude<T, null | undefined>;

export type ValeJsonObject = Record<string, unknown>;
