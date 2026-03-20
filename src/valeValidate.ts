import type { ValeSchema } from "./valeTypes";

export const valeValidate = <T>(schema: ValeSchema<T>, input: unknown): T =>
  schema.parse(input);
