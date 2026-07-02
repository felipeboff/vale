import { describe, expectTypeOf, it } from "vitest";

import {
  vale,
  valeValidate,
  type InferVale,
  type ValeObjectOutput,
} from "../../src/index.js";

describe("InferVale object schemas", () => {
  const userSchema = vale.object({
    name: vale.string(),
    age: vale.integer(),
    email: vale.email(),
    active: vale.boolean().default(true),
  });

  it("infers required object fields", () => {
    type User = InferVale<typeof userSchema>;

    expectTypeOf<User>().toEqualTypeOf<{
      name: string;
      age: number;
      email: string;
      active: boolean;
    }>();
  });

  it("marks optional and default fields as optional keys", () => {
    const optionalSchema = vale.object({
      name: vale.string(),
      nickname: vale.string().optional(),
    });

    type OptionalUser = InferVale<typeof optionalSchema>;

    expectTypeOf<OptionalUser>().toEqualTypeOf<{
      name: string;
      nickname?: string | undefined;
    }>();
  });

  it("preserves field types through lock", () => {
    const lockedSchema = userSchema.lock();

    expectTypeOf<InferVale<typeof lockedSchema>>().toEqualTypeOf<
      InferVale<typeof userSchema>
    >();
    expectTypeOf<InferVale<typeof lockedSchema>>().not.toEqualTypeOf<
      Record<string, unknown>
    >();
  });

  it("infers strictObject output", () => {
    const strictSchema = vale.strictObject({
      id: vale.objectId(),
      label: vale.string(),
    });

    expectTypeOf<InferVale<typeof strictSchema>>().toEqualTypeOf<{
      id: string;
      label: string;
    }>();
  });

  it("infers nested object and array fields", () => {
    const postSchema = vale.object({
      title: vale.string(),
      tags: vale.array(vale.string()),
      author: vale.object({
        name: vale.string(),
        role: vale.enum(["admin", "user"] as const),
      }),
    });

    type Post = InferVale<typeof postSchema>;

    expectTypeOf<Post>().toEqualTypeOf<{
      title: string;
      tags: string[];
      author: {
        name: string;
        role: "admin" | "user";
      };
    }>();
  });
});

describe("InferVale utility schemas", () => {
  it("types passthrough as Record<string, unknown>", () => {
    const schema = vale.passthrough();

    expectTypeOf<InferVale<typeof schema>>().toEqualTypeOf<
      Record<string, unknown>
    >();
  });

  it("types looseObject as known fields plus index signature", () => {
    const schema = vale.looseObject({
      name: vale.string(),
    });

    type Loose = InferVale<typeof schema>;

    expectTypeOf<Loose>().toMatchTypeOf<{ name: string }>();
    expectTypeOf<Loose>().toMatchTypeOf<Record<string, unknown>>();
  });
});

describe("InferVale string chains", () => {
  it("preserves ValeStringSchema through optional", () => {
    const schema = vale.string().cpf().optional();

    expectTypeOf<InferVale<typeof schema>>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(schema.cpf).toBeFunction();
    expectTypeOf(schema.cnpj).toBeFunction();
  });

  it("allows cpf before optional in chain", () => {
    const schema = vale.string().cpf().optional();

    expectTypeOf(schema).toMatchTypeOf<{
      cpf: (message?: string) => unknown;
      optional: () => unknown;
    }>();
  });
});

describe("valeValidate return types", () => {
  it("returns inferred schema output", () => {
    const schema = vale.object({
      id: vale.objectId(),
      count: vale.number(),
    });

    const validated = valeValidate(schema, { id: "507f1f77bcf86cd799439011", count: 1 });

    expectTypeOf(validated).toEqualTypeOf<{
      id: string;
      count: number;
    }>();
  });
});

describe("ValeObjectOutput helper type", () => {
  it("matches InferVale for object schemas", () => {
    const shape = {
      a: vale.string(),
      b: vale.number().optional(),
    } as const;

    const schema = vale.object(shape);

    type FromInfer = InferVale<typeof schema>;
    type FromHelper = ValeObjectOutput<typeof shape>;

    expectTypeOf<FromInfer>().toEqualTypeOf<FromHelper>();
  });
});
