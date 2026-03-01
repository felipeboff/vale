import { valeDateRegex } from "./valeRegex";

export const valeStringParser = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const t = typeof value;
  if (t === "object" || t === "function") return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};

export const valeNumberParser = (value: unknown): number | undefined => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  const s = valeStringParser(value);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export const valeIntegerParser = (value: unknown): number | undefined => {
  const n = valeNumberParser(value);
  return n !== undefined && Number.isInteger(n) ? n : undefined;
};

export const valeBooleanParser = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  const s = valeStringParser(value);
  if (s === undefined) return undefined;
  const normalized = s.toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

export const valeDateParser = (value: unknown): Date | undefined => {
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value;
  const s = valeStringParser(value);
  if (s === undefined) return undefined;

  const m = valeDateRegex.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return Number.isNaN(dt.getTime()) ? undefined : dt;
  }

  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
};
