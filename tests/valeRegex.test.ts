import { describe, it, expect } from "vitest";
import {
  valeEmailRegex,
  valeUuidRegex,
  valeObjectIdRegex,
  valeDateRegex,
} from "../src/valeRegex";

describe("valeRegex", () => {
  it("valeEmailRegex matches valid emails", () => {
    expect(valeEmailRegex.test("a@b.co")).toBe(true);
    expect(valeEmailRegex.test("user@example.com")).toBe(true);
    expect(valeEmailRegex.test("invalid")).toBe(false);
  });

  it("valeUuidRegex matches valid UUIDs", () => {
    expect(valeUuidRegex.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(valeUuidRegex.test("not-a-uuid")).toBe(false);
  });

  it("valeObjectIdRegex matches 24 hex chars", () => {
    expect(valeObjectIdRegex.test("507f1f77bcf86cd799439011")).toBe(true);
    expect(valeObjectIdRegex.test("short")).toBe(false);
  });

  it("valeDateRegex matches YYYY-MM-DD and captures groups", () => {
    const m = valeDateRegex.exec("2025-03-01");
    expect(m).not.toBeNull();
    expect(m![1]).toBe("2025");
    expect(m![2]).toBe("03");
    expect(m![3]).toBe("01");
  });
});
