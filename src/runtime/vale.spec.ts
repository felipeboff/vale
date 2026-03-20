import { describe, it, expect } from "vitest";
import { vale, v } from "./vale";

describe("vale", () => {
  it("vale is createVale instance", () => {
    const result = vale.string().safeParse("hello");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("hello");
  });

  it("v is alias for vale", () => {
    const result = v.number().safeParse(42);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });
});
