export type ValePath = (string | number)[];

export type ValeIssue = {
  path: ValePath;
  code: string;
  message: string;
};

export type ValeResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValeIssue[] };

export type ValeNonNullish<T> = Exclude<T, null | undefined>;

export type ValeSchema<T> = {
  parse(input: unknown, path?: ValePath): T;
  safeParse(input: unknown, path?: ValePath): ValeResult<T>;

  optional(): ValeSchema<T | undefined>;
  nullable(): ValeSchema<T | null>;
  default(value: ValeNonNullish<T>): ValeSchema<ValeNonNullish<T>>;
  into<U>(fn: (v: T) => U): ValeSchema<U>;
  guard(guard: (v: T) => boolean, message: string): ValeSchema<T>;
  nullish(): ValeSchema<T | null | undefined>;

  strict(): ValeSchema<T>;
};

export type ValeJsonObject = Record<string, unknown>;

export type InferVale<S> = S extends ValeSchema<infer T> ? T : never;

export const valeIsRecord = (v: unknown): v is ValeJsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);
