import { describe, it, expect } from "vitest";
import { makeVale } from "./makeVale";
import { valeOk, valeFail } from "../result/helpers";
import { ValeError } from "../errors/ValeError";

describe("makeVale", () => {
  it("parse delegates to baseParse with path", () => {
    const schema = makeVale<number>((input, path) => {
      expect(path).toEqual([]);
      return valeOk(Number(input));
    });

    const result = schema.safeParse("42");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it("parse throws ValeError on validation failure", () => {
    const schema = makeVale<number>(() =>
      valeFail([{ path: [], code: "x", message: "y" }]),
    );

    expect(() => schema.parse(0)).toThrow(ValeError);

    try {
      schema.parse(0);
    } catch (error) {
      const err = error as ValeError;
      expect(err.issues).toHaveLength(1);
      expect(err.issues[0].code).toBe("x");
    }
  });

  it("parse passes path to baseParse", () => {
    const schema = makeVale<number>((_, path) => valeOk(path.length));
    const result = schema.safeParse(0, ["a", 1]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(2);
  });

  describe("optional", () => {
    it("returns undefined for undefined", () => {
      const schema = makeVale<string>((input) =>
        input === "" ? valeFail([]) : valeOk(String(input)),
      ).optional();

      const result = schema.safeParse(undefined);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeUndefined();
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) => valeOk(String(input))).optional();
      const result = schema.safeParse("x");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("x");
    });
  });

  describe("nullable", () => {
    it("returns null for null", () => {
      const schema = makeVale<string>(() => valeFail([])).nullable();
      const result = schema.safeParse(null);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeNull();
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) => valeOk(String(input))).nullable();
      const result = schema.safeParse("x");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("x");
    });
  });

  describe("nullish", () => {
    it("returns undefined for undefined", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const result = schema.safeParse(undefined);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const result = schema.safeParse("");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeUndefined();
    });

    it("returns null for null", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const result = schema.safeParse(null);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeNull();
    });

    it('returns null for string "null"', () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const result = schema.safeParse("null");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeNull();
    });
  });

  describe("default", () => {
    it("uses default for undefined", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).default(7);
      const result = schema.safeParse(undefined);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(7);
    });

    it("parses provided value", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).default(7);
      const result = schema.safeParse("3");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(3);
    });
  });

  describe("into", () => {
    it("transforms parsed value", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).into(
        (value) => value * 2,
      );

      const result = schema.safeParse("4");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(8);
    });
  });

  describe("guard", () => {
    it("passes when guard returns true", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).guard(
        (value) => value > 0,
        "Must be positive",
      );

      const result = schema.safeParse(1);
      expect(result.ok).toBe(true);
    });

    it("fails when guard returns false", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).guard(
        (value) => value > 0,
        "Must be positive",
      );

      const result = schema.safeParse(0, ["count"]);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("refine");
        expect(result.issues[0].message).toBe("Must be positive");
        expect(result.issues[0].path).toEqual(["count"]);
      }
    });
  });

  describe("strict", () => {
    it("passes when parsed object has no extra keys", () => {
      const schema = makeVale<{ a: number }>((input) =>
        typeof input === "object" && input !== null && "a" in input
          ? valeOk({ a: Number((input as { a: unknown }).a) })
          : valeFail([]),
      ).strict();

      const result = schema.safeParse({ a: 1 });
      expect(result.ok).toBe(true);
    });

    it("fails when input object contains extra keys", () => {
      const schema = makeVale<{ a: number }>(() => valeOk({ a: 1 })).strict();
      const result = schema.safeParse({ a: 1, b: 2 });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("unrecognized_key");
        expect(result.issues[0].path).toEqual(["b"]);
      }
    });

    it("checks nested extra keys", () => {
      const schema = makeVale<{ a: { b: number } }>(() =>
        valeOk({ a: { b: 1 } }),
      ).strict();

      const result = schema.safeParse({ a: { b: 1, c: 2 } });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].path).toEqual(["a", "c"]);
    });
  });
});
