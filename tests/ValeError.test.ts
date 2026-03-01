import { describe, it, expect } from "vitest";
import { ValeError } from "../src/ValeError";

describe("ValeError", () => {
  it("extends Error with message ValeError", () => {
    const err = new ValeError([]);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("ValeError");
  });

  it("stores issues on the instance", () => {
    const issues = [{ path: ["a"], code: "string", message: "invalid" }];
    const err = new ValeError(issues);
    expect(err.issues).toEqual(issues);
  });
});
