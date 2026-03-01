import type { ValeSchema } from "./valeTypes";
import { ValeError } from "./ValeError";

export const valeValidate = <T>(schema: ValeSchema<T>, input: unknown): T => {
  const res = schema.parse(input);
  if (res.ok) return res.value;

  throw new ValeError(res.issues);
};
