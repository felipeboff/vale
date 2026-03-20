import type {
  ValeJsonObject,
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "./common";

export type ValeSchema<T> = {
  parse(input: unknown, path?: ValePath): T;
  safeParse(input: unknown, path?: ValePath): ValeResult<T>;

  optional(): ValeSchema<T | undefined>;
  nullable(): ValeSchema<T | null>;
  default(value: ValeNonNullish<T>): ValeSchema<ValeNonNullish<T>>;
  into<U>(fn: (value: T) => U): ValeSchema<U>;
  guard(guard: (value: T) => boolean, message: string): ValeSchema<T>;
  nullish(): ValeSchema<T | null | undefined>;

  strict(): ValeSchema<T>;
};

export type InferVale<S> = S extends ValeSchema<infer T> ? T : never;

export type ValeShape = Record<string, ValeSchema<unknown>>;

export type ValeObjectOutput<T extends ValeShape> = {
  [K in keyof T]: T[K] extends ValeSchema<infer U> ? U : never;
};

export type ValeEnumOptions<T extends string> = readonly T[] | Record<string, T>;

export type { ValeJsonObject };
