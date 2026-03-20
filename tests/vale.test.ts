import { describe, it, expect } from "vitest";
import { vale, v } from "../src/vale";

describe("vale", () => {
  it("vale is createVale instance", () => {
    const r = vale.string().safeParse("hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("v is alias for vale", () => {
    const r = v.number().safeParse(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });
});
