import type { ValeJsonObject } from "../types/common";

export const valeIsRecord = (value: unknown): value is ValeJsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);
