import { describe, it, expect } from "vitest";
import { createVale } from "../src/valeSchemas";

const v = createVale();

describe("createVale", () => {
  describe("string", () => {
    it("parses string", () => {
      const r = v.string().safeParse("hello");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("hello");
    });

    it("fails for non-string with default message", () => {
      const r = v.string().safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues[0].code).toBe("string");
        expect(r.issues[0].message).toContain("string");
      }
    });

    it("uses custom message when provided", () => {
      const r = v.string("Must be text").safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toBe("Must be text");
    });

    it("uses path in default message when path is non-empty", () => {
      const r = v.string().safeParse(null, ["name"]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toContain("name");
    });
  });

  describe("number", () => {
    it("parses number", () => {
      const r = v.number().safeParse(42);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(42);
    });

    it("fails for non-number", () => {
      const r = v.number().safeParse("x");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("number");
    });

    it("uses custom message", () => {
      const r = v.number("Not a number").safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toBe("Not a number");
    });
  });

  describe("integer", () => {
    it("parses integer", () => {
      const r = v.integer().safeParse(42);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(42);
    });

    it("fails for non-integer", () => {
      const r = v.integer().safeParse(3.14);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("integer");
    });
  });

  describe("boolean", () => {
    it("parses boolean", () => {
      expect(
        v.boolean().safeParse(true).ok &&
          (v.boolean().safeParse(true) as { value: boolean }).value,
      ).toBe(true);
      expect(
        v.boolean().safeParse(false).ok &&
          (v.boolean().safeParse(false) as { value: boolean }).value,
      ).toBe(false);
    });

    it("fails for non-boolean", () => {
      const r = v.boolean().safeParse("yes");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("boolean");
    });
  });

  describe("date", () => {
    it("parses date", () => {
      const d = new Date("2025-01-15");
      const r = v.date().safeParse(d);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toEqual(d);
    });

    it("fails for non-date", () => {
      const r = v.date().safeParse("not a date");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("date");
    });
  });

  describe("email", () => {
    it("accepts valid email", () => {
      const r = v.email().safeParse("a@b.co");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("a@b.co");
    });

    it("fails when not a string", () => {
      const r = v.email().safeParse(123);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("email");
    });

    it("fails when input is null or undefined (string parser returns undefined)", () => {
      const r1 = v.email().safeParse(null);
      expect(r1.ok).toBe(false);
      if (!r1.ok) expect(r1.issues[0].code).toBe("email");
      const r2 = v.email().safeParse(undefined);
      expect(r2.ok).toBe(false);
    });

    it("fails when string does not match email regex", () => {
      const r = v.email().safeParse("invalid");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("email");
    });

    it("uses custom message when regex fails", () => {
      const r = v.email("Bad email").safeParse("x");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toBe("Bad email");
    });

    it("uses path in default message when regex fails and path is set", () => {
      const r = v.email().safeParse("invalid-email", ["emailField"]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toContain("emailField");
    });
  });

  describe("uuid", () => {
    it("accepts valid uuid", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const r = v.uuid().safeParse(uuid);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(uuid);
    });

    it("fails when not a string", () => {
      const r = v.uuid().safeParse(123);
      expect(r.ok).toBe(false);
    });

    it("fails when input is null or undefined (string parser returns undefined)", () => {
      const r = v.uuid().safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("uuid");
    });

    it("fails when string does not match uuid regex", () => {
      const r = v.uuid().safeParse("not-a-uuid");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("uuid");
    });

    it("uses custom message when uuid regex fails", () => {
      const r = v.uuid("Invalid UUID").safeParse("x");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toBe("Invalid UUID");
    });

    it("uses path in default message when uuid regex fails and path is set", () => {
      const r = v.uuid().safeParse("not-uuid", ["id"]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toContain("id");
    });
  });

  describe("objectId", () => {
    it("accepts valid 24-char hex", () => {
      const id = "507f1f77bcf86cd799439011";
      const r = v.objectId().safeParse(id);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(id);
    });

    it("fails when not a string", () => {
      const r = v.objectId().safeParse(123);
      expect(r.ok).toBe(false);
    });

    it("fails when input is null or undefined (string parser returns undefined)", () => {
      const r = v.objectId().safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("objectId");
    });

    it("fails when string does not match objectId regex", () => {
      const r = v.objectId().safeParse("short");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("objectId");
    });

    it("uses custom message when objectId regex fails", () => {
      const r = v.objectId("Invalid ID").safeParse("x");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toBe("Invalid ID");
    });

    it("uses path in default message when objectId regex fails and path is set", () => {
      const r = v.objectId().safeParse("badid", ["objectId"]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].message).toContain("objectId");
    });
  });

  describe("enum", () => {
    it("accepts value from array options", () => {
      const schema = v.enum(["a", "b", "c"]);
      const r = schema.safeParse("b");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("b");
    });

    it("fails when value not in array", () => {
      const schema = v.enum(["a", "b", "c"]);
      const r = schema.safeParse("d");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("enum");
    });

    it("accepts value from record options (object)", () => {
      const schema = v.enum({ A: "a", B: "b" });
      const r = schema.safeParse("a");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("a");
    });

    it("fails when value not in record", () => {
      const schema = v.enum({ A: "a", B: "b" });
      const r = schema.safeParse("c");
      expect(r.ok).toBe(false);
    });

    it("filters non-string values when options is a record", () => {
      const schema = v.enum({ A: "a", B: "b", C: 1 } as unknown as Record<
        string,
        string
      >);
      const r = schema.safeParse("a");
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe("a");
      const r2 = schema.safeParse("c");
      expect(r2.ok).toBe(false);
    });

    it("enum with record runs Object.values().filter (object branch)", () => {
      const opts: Record<string, unknown> = { x: "x", y: "y", num: 42 };
      const schema = v.enum(opts as Record<string, string>);
      expect(schema.safeParse("x").ok).toBe(true);
      expect(schema.safeParse("y").ok).toBe(true);
      expect(schema.safeParse("num").ok).toBe(false);
    });

    it("fails when not a string", () => {
      const schema = v.enum(["a", "b"]);
      const r = schema.safeParse(123);
      expect(r.ok).toBe(false);
    });

    it("fails when input is null or undefined (string parser returns undefined)", () => {
      const schema = v.enum(["a", "b"]);
      const r1 = schema.safeParse(null);
      expect(r1.ok).toBe(false);
      if (!r1.ok) expect(r1.issues[0].code).toBe("enum");
      const r2 = schema.safeParse(undefined);
      expect(r2.ok).toBe(false);
    });
  });

  describe("object", () => {
    it("parses object with shape", () => {
      const schema = v.object({ name: v.string(), age: v.number() });
      const r = schema.safeParse({ name: "Alice", age: 30 });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.name).toBe("Alice");
        expect(r.value.age).toBe(30);
      }
    });

    it("fails when input is not a record", () => {
      const schema = v.object({ name: v.string() });
      const r = schema.safeParse(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("object");
    });

    it("fails when field fails", () => {
      const schema = v.object({ name: v.string(), age: v.number() });
      const r = schema.safeParse({ name: "Alice", age: "not a number" });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].path).toContain("age");
    });

    it("accepts extra keys by default (non-strict)", () => {
      const schema = v.object({ name: v.string() });
      const r = schema.safeParse({ name: "Alice", extra: "x" });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toEqual({ name: "Alice" });
    });

    it("rejects extra keys with strict()", () => {
      const schema = v.object({ name: v.string() }).strict();
      const r = schema.safeParse({ name: "Alice", extra: "x" });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues[0].code).toBe("unrecognized_key");
        expect(r.issues[0].path).toEqual(["extra"]);
      }
    });

    it("rejects extra keys with stric() alias", () => {
      const schema = v.object({ name: v.string() }).stric();
      const r = schema.safeParse({ name: "Alice", extra: "x" });
      expect(r.ok).toBe(false);
    });

    it("rejects nested extra keys in objects", () => {
      const schema = v
        .object({ a: v.object({ b: v.string() }) })
        .strict();
      const r = schema.safeParse({ a: { b: "ok", c: "extra" } });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues[0].path).toEqual(["a", "c"]);
        expect(r.issues[0].code).toBe("unrecognized_key");
      }
    });

    it("rejects nested extra keys inside arrays", () => {
      const schema = v
        .object({
          items: v.array(v.object({ name: v.string() })),
        })
        .strict();
      const r = schema.safeParse({
        items: [{ name: "Alice", extra: "x" }],
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues[0].path).toEqual(["items", 0, "extra"]);
        expect(r.issues[0].code).toBe("unrecognized_key");
      }
    });
  });

  describe("array", () => {
    it("parses array of items", () => {
      const schema = v.array(v.number());
      const r = schema.safeParse([1, 2, 3]);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toEqual([1, 2, 3]);
    });

    it("fails when input is not array", () => {
      const schema = v.array(v.number());
      const r = schema.safeParse({});
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].code).toBe("array");
    });

    it("fails when item fails", () => {
      const schema = v.array(v.number());
      const r = schema.safeParse([1, "x", 3]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues[0].path).toContain(1);
    });
  });
});
