import type {
  ValeJsonObject,
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "./common";

/** Metadata tracked at the type level for object field optional/required inference. */
export type ValeSchemaMeta = {
  optional?: true;
  nullable?: true;
  nullish?: true;
  default?: true;
  locked?: true;
};

export interface ValeSchema<
  TOutput = unknown,
  TMeta extends ValeSchemaMeta = ValeSchemaMeta,
> {
  resolve(input: unknown, path?: ValePath): TOutput;
  probe(input: unknown, path?: ValePath): ValeResult<TOutput>;

  optional(): ValeSchema<TOutput | undefined, TMeta & { optional: true }>;
  nullable(): ValeSchema<TOutput | null, TMeta & { nullable: true }>;
  default(
    value: ValeNonNullish<TOutput>,
  ): ValeSchema<ValeNonNullish<TOutput>, TMeta & { default: true }>;
  into<U>(fn: (value: TOutput) => U): ValeSchema<U, TMeta>;
  guard(
    guard: (value: TOutput) => boolean,
    message: string,
  ): ValeSchema<TOutput, TMeta>;
  nullish(): ValeSchema<
    TOutput | null | undefined,
    TMeta & { nullish: true }
  >;
  lock(): ValeSchema<TOutput, TMeta & { locked: true }>;
}

/** Phantom helper for advanced consumers building custom schema utilities. */
export type ValeSchemaDef<
  TOutput,
  TMeta extends ValeSchemaMeta = ValeSchemaMeta,
> = {
  readonly _output?: TOutput;
  readonly _meta?: TMeta;
};

export type InferValeOutput<S> = S extends ValeSchema<infer O, infer _M>
  ? O
  : never;

export type InferVale<S> = InferValeOutput<S>;

export type ValeShape = Record<string, ValeSchema<unknown, ValeSchemaMeta>>;

export type InferFieldOutput<S> = S extends ValeSchema<infer O, infer _M>
  ? O
  : never;

/** Keys that may be omitted from input (optional, nullish, or default). */
export type IsOptionalKey<S> = S extends ValeSchema<unknown, infer M>
  ? M extends { optional: true }
    ? true
    : M extends { nullish: true }
      ? true
      : M extends { default: true }
        ? true
        : false
  : false;

export type RequiredKeys<T extends ValeShape> = {
  [K in keyof T]: IsOptionalKey<T[K]> extends true ? never : K;
}[keyof T];

export type OptionalKeys<T extends ValeShape> = {
  [K in keyof T]: IsOptionalKey<T[K]> extends true ? K : never;
}[keyof T];

export type ValeObjectOutput<T extends ValeShape> = {
  [K in RequiredKeys<T>]: InferFieldOutput<T[K]>;
} & {
  [K in OptionalKeys<T>]?: InferFieldOutput<T[K]>;
};

export type ValeLooseObjectOutput<T extends ValeShape> = ValeObjectOutput<T> &
  Record<string, unknown>;

export type ValeEnumOptions<T extends string> =
  | readonly T[]
  | Record<string, T>;

export type { ValeJsonObject };
