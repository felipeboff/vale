import type {
  ValeEnumOptions,
  ValeLooseObjectOutput,
  ValeObjectOutput,
  ValeSchema,
  ValeSchemaMeta,
  ValeShape,
} from "../shared/types/schema";

export type ValeStringSchema<
  TOutput = string,
  TMeta extends ValeSchemaMeta = ValeSchemaMeta,
> = ValeSchema<TOutput, TMeta> & {
  cpf(message?: string): ValeStringSchema<string, TMeta>;
  cnpj(message?: string): ValeStringSchema<string, TMeta>;
  cpfCnpj(message?: string): ValeStringSchema<string, TMeta>;
  optional(): ValeStringSchema<
    TOutput | undefined,
    TMeta & { optional: true }
  >;
  nullable(): ValeStringSchema<TOutput | null, TMeta & { nullable: true }>;
  nullish(): ValeStringSchema<
    TOutput | null | undefined,
    TMeta & { nullish: true }
  >;
  default(
    value: Exclude<TOutput, null | undefined>,
  ): ValeStringSchema<
    Exclude<TOutput, null | undefined>,
    TMeta & { default: true }
  >;
  into<U>(fn: (value: TOutput) => U): ValeSchema<U, TMeta>;
  guard(
    guard: (value: TOutput) => boolean,
    message: string,
  ): ValeStringSchema<TOutput, TMeta>;
  lock(): ValeStringSchema<TOutput, TMeta & { locked: true }>;
};

export type ValeFactory = {
  string(message?: string): ValeStringSchema;
  number(message?: string): ValeSchema<number>;
  integer(message?: string): ValeSchema<number>;
  boolean(message?: string): ValeSchema<boolean>;
  date(message?: string): ValeSchema<Date>;
  email(message?: string): ValeSchema<string>;
  uuid(message?: string): ValeSchema<string>;
  objectId(message?: string): ValeSchema<string>;
  enum<T extends string>(
    options: ValeEnumOptions<T>,
    message?: string,
  ): ValeSchema<T>;
  object<T extends ValeShape>(shape: T): ValeSchema<ValeObjectOutput<T>>;
  strictObject<T extends ValeShape>(
    shape: T,
  ): ValeSchema<ValeObjectOutput<T>>;
  looseObject<T extends ValeShape>(
    shape: T,
  ): ValeSchema<ValeLooseObjectOutput<T>>;
  passthrough(): ValeSchema<Record<string, unknown>>;
  array<T>(item: ValeSchema<T>): ValeSchema<T[]>;
};
