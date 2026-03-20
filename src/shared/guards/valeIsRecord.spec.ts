import { describe, it, expect } from "vitest";
import { valeIsRecord } from "./valeIsRecord";

describe("valeIsRecord", () => {
  it("returns true for plain object", () => {
    expect(valeIsRecord({})).toBe(true);
    expect(valeIsRecord({ a: 1 })).toBe(true);
  });

  it("returns false for null", () => {
    expect(valeIsRecord(null)).toBe(false);
  });

  it("returns false for array", () => {
    expect(valeIsRecord([])).toBe(false);
  });

  it("returns false for non-object types", () => {
    expect(valeIsRecord(undefined)).toBe(false);
    expect(valeIsRecord(1)).toBe(false);
    expect(valeIsRecord("x")).toBe(false);
    expect(valeIsRecord(true)).toBe(false);
  });
});
