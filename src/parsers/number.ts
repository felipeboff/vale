import { valeStringParser } from "./string";

export const valeNumberParser = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const input = valeStringParser(value);
  if (input === undefined) return undefined;

  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : undefined;
};
