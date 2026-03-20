import { describe, it, expect } from "vitest";
import { createVale } from "./createVale";

const vale = createVale();

describe("createVale", () => {
  describe("string", () => {
    it("parses string", () => {
      const result = vale.string().safeParse("hello");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("hello");
    });

    it("fails for non-string with default message", () => {
      const result = vale.string().safeParse(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("string");
        expect(result.issues[0].message).toContain("string");
      }
    });

    it("uses custom message when provided", () => {
      const result = vale.string("Must be text").safeParse(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toBe("Must be text");
    });

    it("uses path in default message when path is non-empty", () => {
      const result = vale.string().safeParse(null, ["name"]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toContain("name");
    });
  });

  describe("number", () => {
    it("parses number", () => {
      const result = vale.number().safeParse(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });

    it("fails for non-number", () => {
      const result = vale.number().safeParse("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("number");
    });

    it("uses custom message", () => {
      const result = vale.number("Not a number").safeParse(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toBe("Not a number");
    });
  });

  describe("integer", () => {
    it("parses integer", () => {
      const result = vale.integer().safeParse(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });

    it("fails for non-integer", () => {
      const result = vale.integer().safeParse(3.14);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("integer");
    });
  });

  describe("boolean", () => {
    it("parses boolean", () => {
      expect(
        vale.boolean().safeParse(true).ok &&
          (vale.boolean().safeParse(true) as { value: boolean }).value,
      ).toBe(true);
      expect(
        vale.boolean().safeParse(false).ok &&
          (vale.boolean().safeParse(false) as { value: boolean }).value,
      ).toBe(false);
    });

    it("fails for invalid boolean", () => {
      const result = vale.boolean().safeParse("yes");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("boolean");
    });
  });

  describe("date", () => {
    it("parses date", () => {
      const result = vale.date().safeParse("2025-01-01");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeInstanceOf(Date);
    });

    it("fails for invalid date", () => {
      const result = vale.date().safeParse("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("date");
    });
  });

  describe("email", () => {
    it("accepts valid email", () => {
      const result = vale.email().safeParse("a@b.co");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = vale.email().safeParse("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("email");
    });
  });

  describe("uuid", () => {
    it("accepts valid uuid", () => {
      const result = vale.uuid().safeParse("550e8400-e29b-41d4-a716-446655440000");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid uuid", () => {
      const result = vale.uuid().safeParse("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("uuid");
    });
  });

  describe("objectId", () => {
    it("accepts valid objectId", () => {
      const result = vale.objectId().safeParse("507f1f77bcf86cd799439011");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid objectId", () => {
      const result = vale.objectId().safeParse("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("objectId");
    });
  });

  describe("enum", () => {
    it("accepts array enum", () => {
      const result = vale.enum(["a", "b"] as const).safeParse("a");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("a");
    });

    it("accepts object enum", () => {
      const result = vale
        .enum({ Admin: "admin", User: "user" } as const)
        .safeParse("user");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("user");
    });

    it("rejects invalid enum value", () => {
      const result = vale.enum(["a", "b"] as const).safeParse("c");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("enum");
    });
  });

  describe("object", () => {
    it("parses object shape", () => {
      const schema = vale.object({
        name: vale.string(),
        age: vale.number(),
      });

      const result = schema.safeParse({ name: "Ada", age: "42" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual({ name: "Ada", age: 42 });
    });

    it("rejects non-object", () => {
      const schema = vale.object({ name: vale.string() });
      const result = schema.safeParse(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("object");
    });

    it("collects nested issues", () => {
      const schema = vale.object({
        user: vale.object({
          age: vale.integer(),
        }),
      });

      const result = schema.safeParse({ user: { age: "abc" } });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].path).toEqual(["user", "age"]);
    });
  });

  describe("array", () => {
    it("parses array items", () => {
      const schema = vale.array(vale.integer());
      const result = schema.safeParse([1, "2", 3]);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([1, 2, 3]);
    });

    it("rejects non-array", () => {
      const schema = vale.array(vale.string());
      const result = schema.safeParse("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("array");
    });

    it("collects item issues with index path", () => {
      const schema = vale.array(vale.integer());
      const result = schema.safeParse([1, "x"]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].path).toEqual([1]);
    });
  });
});
