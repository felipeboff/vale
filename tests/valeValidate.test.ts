import { describe, it, expect } from "vitest";
import { valeValidate, ValeError } from "../src/index";
import { createVale } from "../src/valeSchemas";

const v = createVale();

describe("valeValidate", () => {
  it("returns value when schema parse succeeds", () => {
    const schema = v.string();
    const result = valeValidate(schema, "hello");
    expect(result).toBe("hello");
  });

  it("throws ValeError with issues when schema parse fails", () => {
    const schema = v.number();
    expect(() => valeValidate(schema, "not a number")).toThrow(ValeError);
    try {
      valeValidate(schema, "not a number");
    } catch (err) {
      expect(err).toBeInstanceOf(ValeError);
      expect((err as ValeError).issues).toHaveLength(1);
      expect((err as ValeError).issues[0].code).toBe("number");
    }
  });
});
