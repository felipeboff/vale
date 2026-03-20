import { describe, it, expect } from "vitest";
import { createVale } from "./createVale";

const vale = createVale();

describe("createVale", () => {
  describe("string", () => {
    it("parses string", () => {
      const result = vale.string().probe("hello");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("hello");
    });

    it("fails for non-string with default message", () => {
      const result = vale.string().probe(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0].code).toBe("string");
        expect(result.issues[0].message).toContain("string");
      }
    });

    it("uses custom message when provided", () => {
      const result = vale.string("Must be text").probe(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toBe("Must be text");
    });

    it("uses path in default message when path is non-empty", () => {
      const result = vale.string().probe(null, ["name"]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toContain("name");
    });
  });

  describe("number", () => {
    it("parses number", () => {
      const result = vale.number().probe(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });

    it("fails for non-number", () => {
      const result = vale.number().probe("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("number");
    });

    it("uses custom message", () => {
      const result = vale.number("Not a number").probe(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].message).toBe("Not a number");
    });
  });

  describe("integer", () => {
    it("parses integer", () => {
      const result = vale.integer().probe(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });

    it("fails for non-integer", () => {
      const result = vale.integer().probe(3.14);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("integer");
    });
  });

  describe("boolean", () => {
    it("parses boolean", () => {
      expect(
        vale.boolean().probe(true).ok &&
          (vale.boolean().probe(true) as { value: boolean }).value,
      ).toBe(true);
      expect(
        vale.boolean().probe(false).ok &&
          (vale.boolean().probe(false) as { value: boolean }).value,
      ).toBe(false);
    });

    it("fails for invalid boolean", () => {
      const result = vale.boolean().probe("yes");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("boolean");
    });
  });

  describe("date", () => {
    it("parses date", () => {
      const result = vale.date().probe("2025-01-01");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeInstanceOf(Date);
    });

    it("fails for invalid date", () => {
      const result = vale.date().probe("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("date");
    });
  });

  describe("email", () => {
    it("accepts valid email", () => {
      const result = vale.email().probe("a@b.co");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = vale.email().probe("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("email");
    });

    it("rejects null-like input before regex test", () => {
      const result = vale.email().probe(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("email");
    });
  });

  describe("uuid", () => {
    it("accepts valid uuid", () => {
      const result = vale.uuid().probe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid uuid", () => {
      const result = vale.uuid().probe("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("uuid");
    });
  });

  describe("objectId", () => {
    it("accepts valid objectId", () => {
      const result = vale.objectId().probe("507f1f77bcf86cd799439011");
      expect(result.ok).toBe(true);
    });

    it("rejects invalid objectId", () => {
      const result = vale.objectId().probe("invalid");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("objectId");
    });
  });

  describe("enum", () => {
    it("accepts array enum", () => {
      const result = vale.enum(["a", "b"] as const).probe("a");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("a");
    });

    it("accepts object enum", () => {
      const result = vale
        .enum({ Admin: "admin", User: "user" } as const)
        .probe("user");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("user");
    });

    it("rejects invalid enum value", () => {
      const result = vale.enum(["a", "b"] as const).probe("c");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("enum");
    });

    it("rejects undefined-like input before inclusion check", () => {
      const result = vale.enum(["a", "b"] as const).probe(null);
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

      const result = schema.probe({ name: "Ada", age: "42" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual({ name: "Ada", age: 42 });
    });

    it("rejects non-object", () => {
      const schema = vale.object({ name: vale.string() });
      const result = schema.probe(null);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("object");
    });

    it("collects nested issues", () => {
      const schema = vale.object({
        user: vale.object({
          age: vale.integer(),
        }),
      });

      const result = schema.probe({ user: { age: "abc" } });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].path).toEqual(["user", "age"]);
    });
  });

  describe("array", () => {
    it("parses array items", () => {
      const schema = vale.array(vale.integer());
      const result = schema.probe([1, "2", 3]);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([1, 2, 3]);
    });

    it("rejects non-array", () => {
      const schema = vale.array(vale.string());
      const result = schema.probe("x");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].code).toBe("array");
    });

    it("collects item issues with index path", () => {
      const schema = vale.array(vale.integer());
      const result = schema.probe([1, "x"]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0].path).toEqual([1]);
    });
  });
});
