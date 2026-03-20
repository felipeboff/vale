import type { ValeSchema } from "../../shared/types/schema";

export const valeValidate = <T>(schema: ValeSchema<T>, input: unknown): T =>
  schema.resolve(input);
