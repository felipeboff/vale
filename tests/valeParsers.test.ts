import { describe, it, expect } from "vitest";
import {
  valeStringParser,
  valeNumberParser,
  valeIntegerParser,
  valeBooleanParser,
  valeDateParser,
} from "../src/valeParsers";

describe("valeParsers", () => {
  describe("valeStringParser", () => {
    it("returns undefined for undefined and null", () => {
      expect(valeStringParser(undefined)).toBeUndefined();
      expect(valeStringParser(null)).toBeUndefined();
    });

    it("returns undefined for object and function", () => {
      expect(valeStringParser({})).toBeUndefined();
      expect(valeStringParser(() => {})).toBeUndefined();
    });

    it("returns undefined for empty trimmed string", () => {
      expect(valeStringParser("")).toBeUndefined();
      expect(valeStringParser("   ")).toBeUndefined();
    });

    it("returns trimmed string for valid input", () => {
      expect(valeStringParser("a")).toBe("a");
      expect(valeStringParser("  a  ")).toBe("a");
      expect(valeStringParser(123)).toBe("123");
    });
  });

  describe("valeNumberParser", () => {
    it("returns finite number as-is", () => {
      expect(valeNumberParser(0)).toBe(0);
      expect(valeNumberParser(42)).toBe(42);
      expect(valeNumberParser(-1.5)).toBe(-1.5);
    });

    it("returns undefined for NaN and Infinity", () => {
      expect(valeNumberParser(Number.NaN)).toBeUndefined();
      expect(valeNumberParser(Number.POSITIVE_INFINITY)).toBeUndefined();
    });

    it("parses numeric string", () => {
      expect(valeNumberParser("42")).toBe(42);
      expect(valeNumberParser("  3.14  ")).toBe(3.14);
    });

    it("returns undefined for non-parsable string", () => {
      expect(valeNumberParser("abc")).toBeUndefined();
      expect(valeNumberParser("")).toBeUndefined();
    });
  });

  describe("valeIntegerParser", () => {
    it("returns integer from number or string", () => {
      expect(valeIntegerParser(42)).toBe(42);
      expect(valeIntegerParser("42")).toBe(42);
    });

    it("returns undefined for non-integer", () => {
      expect(valeIntegerParser(3.14)).toBeUndefined();
      expect(valeIntegerParser("3.14")).toBeUndefined();
    });
  });

  describe("valeBooleanParser", () => {
    it("returns undefined when string parser returns undefined (null, undefined, object)", () => {
      expect(valeBooleanParser(null)).toBeUndefined();
      expect(valeBooleanParser(undefined)).toBeUndefined();
      expect(valeBooleanParser({})).toBeUndefined();
    });

    it("returns boolean as-is", () => {
      expect(valeBooleanParser(true)).toBe(true);
      expect(valeBooleanParser(false)).toBe(false);
    });

    it("parses true/false strings (case insensitive)", () => {
      expect(valeBooleanParser("true")).toBe(true);
      expect(valeBooleanParser("TRUE")).toBe(true);
      expect(valeBooleanParser("false")).toBe(false);
      expect(valeBooleanParser("False")).toBe(false);
      expect(valeBooleanParser("FALSE")).toBe(false);
    });

    it("returns undefined for invalid string", () => {
      expect(valeBooleanParser("yes")).toBeUndefined();
      expect(valeBooleanParser("1")).toBeUndefined();
      expect(valeBooleanParser("nope")).toBeUndefined();
    });
  });

  describe("valeDateParser", () => {
    it("returns undefined when value is not a date and string parser returns undefined", () => {
      expect(valeDateParser(null)).toBeUndefined();
      expect(valeDateParser(undefined)).toBeUndefined();
      expect(valeDateParser({})).toBeUndefined();
    });

    it("returns valid Date instance as-is", () => {
      const d = new Date("2025-01-15");
      expect(valeDateParser(d)).toEqual(d);
    });

    it("returns undefined for invalid Date instance", () => {
      expect(valeDateParser(new Date(Number.NaN))).toBeUndefined();
    });

    it("parses ISO date string (YYYY-MM-DD)", () => {
      const r = valeDateParser("2025-03-01");
      expect(r).toBeInstanceOf(Date);
      expect(r!.getUTCFullYear()).toBe(2025);
      expect(r!.getUTCMonth()).toBe(2);
      expect(r!.getUTCDate()).toBe(1);
    });

    it("returns undefined when ISO date string is out of range (branch: NaN getTime)", () => {
      // Year beyond JS date range => Date.UTC yields invalid date => line 47 returns undefined
      expect(valeDateParser("300000-01-01")).toBeUndefined();
    });

    it("normalizes invalid day in month (e.g. Feb 30) to next month", () => {
      const r = valeDateParser("2025-02-30");
      expect(r).toBeInstanceOf(Date);
      expect(r!.getTime()).toBe(new Date(Date.UTC(2025, 2, 2)).getTime());
    });

    it("falls back to new Date(s) for non-ISO string", () => {
      const r = valeDateParser("March 1, 2025");
      expect(r).toBeInstanceOf(Date);
    });

    it("returns undefined when new Date(s) is invalid", () => {
      expect(valeDateParser("not a date")).toBeUndefined();
    });
  });
});
