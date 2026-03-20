import { describe, it, expect } from "vitest";
import { ValeError } from "./ValeError";

describe("ValeError", () => {
  it("extends Error with message ValeError", () => {
    const error = new ValeError([]);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("ValeError");
  });

  it("stores issues on the instance", () => {
    const issues = [{ path: ["a"], code: "string", message: "invalid" }];
    const error = new ValeError(issues);
    expect(error.issues).toEqual(issues);
  });
});
