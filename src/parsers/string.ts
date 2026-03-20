export const valeStringParser = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;

  const type = typeof value;
  if (type === "object" || type === "function") return undefined;

  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};
