import { describe, it, expect } from "vitest";
import { valeValidate } from "./valeValidate";
import { ValeError } from "../errors/ValeError";
import { createVale } from "../../schemas/createVale";

const vale = createVale();

describe("valeValidate", () => {
  it("returns value when schema parse succeeds", () => {
    const schema = vale.string();
    const result = valeValidate(schema, "hello");
    expect(result).toBe("hello");
  });

  it("throws ValeError with issues when schema parse fails", () => {
    const schema = vale.number();
    expect(() => valeValidate(schema, "not a number")).toThrow(ValeError);

    try {
      valeValidate(schema, "not a number");
    } catch (error) {
      expect(error).toBeInstanceOf(ValeError);
      expect((error as ValeError).issues).toHaveLength(1);
      expect((error as ValeError).issues[0].code).toBe("number");
    }
  });
});
