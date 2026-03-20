import { describe, it, expect } from "vitest";
import { makeVale } from "../src/valeSchema";
import { valeOk, valeFail } from "../src/valeResult";
import { ValeError } from "../src/ValeError";

describe("makeVale", () => {
  it("parse delegates to baseParse with path", () => {
    const schema = makeVale<number>((input, path) => {
      expect(path).toEqual([]);
      return valeOk(Number(input));
    });
    const r = schema.safeParse("42");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("parse throws ValeError on validation failure", () => {
    const schema = makeVale<number>(() =>
      valeFail([{ path: [], code: "x", message: "y" }]),
    );

    expect(() => schema.parse(0)).toThrow(ValeError);

    try {
      schema.parse(0);
    } catch (err) {
      const e = err as ValeError;
      expect(e.issues).toHaveLength(1);
      expect(e.issues[0].code).toBe("x");
    }
  });

  it("parse passes path to baseParse", () => {
    const schema = makeVale<number>((_, path) => valeOk(path.length));
    const r = schema.safeParse(0, ["a", 1]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(2);
  });

  describe("optional", () => {
    it("returns undefined for undefined", () => {
      const schema = makeVale<string>((input) =>
        input === "" ? valeFail([]) : valeOk(String(input)),
      ).optional();
      const r = schema.safeParse(undefined);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeUndefined();
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) =>
        valeOk(String(input)),
      ).optional();
      const r = schema.safeParse("x");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("x");
    });
  });

  describe("nullable", () => {
    it("returns null for null", () => {
      const schema = makeVale<string>(() => valeFail([])).nullable();
      const r = schema.safeParse(null);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeNull();
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) =>
        valeOk(String(input)),
      ).nullable();
      const r = schema.safeParse("x");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("x");
    });
  });

  describe("nullish", () => {
    it("returns undefined for undefined", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const r = schema.safeParse(undefined);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const r = schema.safeParse("");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeUndefined();
    });

    it('returns null for string "null"', () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const r = schema.safeParse("null");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeNull();
    });

    it("returns null for null", () => {
      const schema = makeVale<string>(() => valeFail([])).nullish();
      const r = schema.safeParse(null);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBeNull();
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) =>
        valeOk(String(input)),
      ).nullish();
      const r = schema.safeParse("x");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("x");
    });
  });

  describe("default", () => {
    it("returns default for undefined", () => {
      const schema = makeVale<string>(() => valeFail([])).default("default");
      const r = schema.safeParse(undefined);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("default");
    });

    it("returns default for empty string", () => {
      const schema = makeVale<string>(() => valeFail([])).default("default");
      const r = schema.safeParse("");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("default");
    });

    it('returns default for string "null"', () => {
      const schema = makeVale<string>(() => valeFail([])).default("default");
      const r = schema.safeParse("null");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("default");
    });

    it("returns default for null", () => {
      const schema = makeVale<string>(() => valeFail([])).default("default");
      const r = schema.safeParse(null);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("default");
    });

    it("parses value otherwise", () => {
      const schema = makeVale<string>((input) => valeOk(String(input))).default(
        "default",
      );
      const r = schema.safeParse("x");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("x");
    });
  });

  describe("into", () => {
    it("transforms value when parse succeeds", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).into(
        (n) => n * 2,
      );
      const r = schema.safeParse("5");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(10);
    });

    it("propagates failure", () => {
      const schema = makeVale<number>(() =>
        valeFail([{ path: [], code: "x", message: "y" }]),
      ).into((n) => n * 2);
      const r = schema.safeParse(0);
      expect(r.ok).toBe(false);
    });
  });

  describe("guard", () => {
    it("returns value when guard passes", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).guard(
        (n) => n > 0,
        "must be positive",
      );
      const r = schema.safeParse("5");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(5);
    });

    it("returns single issue when guard fails", () => {
      const schema = makeVale<number>((input) => valeOk(Number(input))).guard(
        (n) => n > 0,
        "must be positive",
      );
      const r = schema.safeParse("0");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues).toHaveLength(1);
        expect(r.issues[0].code).toBe("refine");
        expect(r.issues[0].message).toBe("must be positive");
      }
    });

    it("propagates parse failure", () => {
      const schema = makeVale<number>(() =>
        valeFail([{ path: ["x"], code: "a", message: "b" }]),
      ).guard(() => true, "msg");
      const r = schema.safeParse(0);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("a");
    });
  });
});
