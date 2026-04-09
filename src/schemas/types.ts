import type {
  ValeEnumOptions,
  ValeObjectOutput,
  ValeSchema,
  ValeShape,
} from "../shared/types/schema";

export type ValeStringSchema = ValeSchema<string> & {
  cpf(message?: string): ValeSchema<string>;
  cnpj(message?: string): ValeSchema<string>;
  cpfCnpj(message?: string): ValeSchema<string>;
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
  enum<T extends string>(options: ValeEnumOptions<T>, message?: string): ValeSchema<T>;
  object<T extends ValeShape>(shape: T): ValeSchema<ValeObjectOutput<T>>;
  array<T>(item: ValeSchema<T>): ValeSchema<T[]>;
};
