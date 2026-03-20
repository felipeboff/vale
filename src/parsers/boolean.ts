import { valeStringParser } from "./string";

export const valeBooleanParser = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;

  const input = valeStringParser(value);
  if (input === undefined) return undefined;

  const normalized = input.toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};
