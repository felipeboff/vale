export type ValePath = (string | number)[];

export type ValeIssue = {
  path: ValePath;
  code: string;
  message: string;
};

export type ValeResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValeIssue[] };

export type ValeSchema<T> = {
  parse(input: unknown, path?: ValePath): ValeResult<T>;
  optional(): ValeSchema<T | undefined>;
  nullable(): ValeSchema<T | null>;
  default(value: T): ValeSchema<T>;
  into<U>(fn: (v: T) => U): ValeSchema<U>;
  guard(guard: (v: T) => boolean, message: string): ValeSchema<T>;
  nullish(): ValeSchema<T | null | undefined>;
};

export type ValeJsonObject = Record<string, unknown>;

export type InferVale<S> = S extends ValeSchema<infer T> ? T : never;

export const valeIsRecord = (v: unknown): v is ValeJsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);
