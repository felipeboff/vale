import { valeDateRegex } from "../patterns/date";
import { valeStringParser } from "./string";

export const valeDateParser = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const input = valeStringParser(value);
  if (input === undefined) return undefined;

  const match = valeDateRegex.exec(input);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
