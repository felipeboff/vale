import { isNullLike, isUndefinedLike } from "../core/schema/modifiers";

export const valeStringParser = (value: unknown): string | undefined => {
  if (!!isUndefinedLike(value) || !!isNullLike(value)) return undefined;

  const type = typeof value;
  if (type === "object" || type === "function") return undefined;

  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};
