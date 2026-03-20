import { describe, it, expect } from "vitest";
import {
  valeValidate,
  ValeError,
  vale,
  createVale,
  makeVale,
  valeOk,
  valeFail,
  valeSingleIssue,
  valeMergeResults,
  valeIsRecord,
  valeStringParser,
  valeNumberParser,
  valeIntegerParser,
  valeBooleanParser,
  valeDateParser,
  valeEmailRegex,
  valeUuidRegex,
  valeObjectIdRegex,
  valeDateRegex,
} from "./index";

describe("index exports", () => {
  it("re-exports valeValidate and ValeError", () => {
    const v = createVale();
    expect(valeValidate(v.string(), "x")).toBe("x");
    expect(() => valeValidate(v.number(), "x")).toThrow(ValeError);
  });

  it("re-exports vale and createVale", () => {
    expect(vale.string().probe("a").ok).toBe(true);
    expect(createVale().number().probe(1).ok).toBe(true);
  });

  it("re-exports makeVale and result helpers", () => {
    const schema = makeVale<number>((input) =>
      typeof input === "number" ? valeOk(input) : valeFail([]),
    );

    expect(schema.probe(1).ok).toBe(true);
    expect(valeSingleIssue([], "x", "y").ok).toBe(false);
    expect(valeMergeResults([{ key: "a", res: valeOk(1) }]).ok).toBe(true);
  });

  it("re-exports valeIsRecord and parsers", () => {
    expect(valeIsRecord({})).toBe(true);
    expect(valeStringParser("x")).toBe("x");
    expect(valeNumberParser(1)).toBe(1);
    expect(valeIntegerParser(2)).toBe(2);
    expect(valeBooleanParser(true)).toBe(true);
    expect(valeDateParser("2025-01-01")).toBeInstanceOf(Date);
  });

  it("re-exports regexes", () => {
    expect(valeEmailRegex.test("a@b.co")).toBe(true);
    expect(valeUuidRegex.test("550e8400-e29b-41d4-a716-446655440000")).toBe(
      true,
    );
    expect(valeObjectIdRegex.test("507f1f77bcf86cd799439011")).toBe(true);
    expect(valeDateRegex.test("2025-01-01")).toBe(true);
  });
});
