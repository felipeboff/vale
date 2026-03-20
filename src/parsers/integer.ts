import { valeNumberParser } from "./number";

export const valeIntegerParser = (value: unknown): number | undefined => {
  const parsed = valeNumberParser(value);
  return parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined;
};
