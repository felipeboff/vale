import { describe, it, expect } from "vitest";
import { valeStringParser } from "./string";
import { valeNumberParser } from "./number";
import { valeIntegerParser } from "./integer";
import { valeBooleanParser } from "./boolean";
import { valeDateParser } from "./date";

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

    it("parses true/false strings case-insensitively", () => {
      expect(valeBooleanParser("true")).toBe(true);
      expect(valeBooleanParser("FALSE")).toBe(false);
    });

    it("returns undefined for other strings", () => {
      expect(valeBooleanParser("yes")).toBeUndefined();
    });
  });

  describe("valeDateParser", () => {
    it("accepts valid Date instance", () => {
      const date = new Date("2025-01-01T00:00:00.000Z");
      expect(valeDateParser(date)).toBe(date);
    });

    it("returns undefined for invalid Date instance", () => {
      expect(valeDateParser(new Date("invalid"))).toBeUndefined();
    });

    it("parses YYYY-MM-DD via UTC", () => {
      const result = valeDateParser("2025-03-01");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    });

    it("returns undefined for YYYY-MM-DD overflow that creates invalid date", () => {
      const giantYear = `${"9".repeat(400)}-01-01`;
      expect(valeDateParser(giantYear)).toBeUndefined();
    });

    it("parses generic date string", () => {
      expect(valeDateParser("2025-03-01T10:00:00.000Z")).toBeInstanceOf(Date);
    });

    it("returns undefined for invalid input", () => {
      expect(valeDateParser("not-a-date")).toBeUndefined();
      expect(valeDateParser({})).toBeUndefined();
    });
  });
});
