import { describe, expectTypeOf, it } from 'vitest';

import { type Schema, v } from './index';

type User = { name: string; age?: number; deletedAt: Date | null; tags: string[] };

describe('object types', () => {
  it('outputs the given generic', () => {
    const schema = v.object<User>({
      name: v.string(),
      age: v.number({ optional: true }),
      deletedAt: v.date({ nullable: true }),
      tags: v.array(v.string()),
    });
    expectTypeOf(schema).toEqualTypeOf<Schema<User>>();
  });

  it('infers the type from the shape when the generic is omitted', () => {
    const schema = v.object({ name: v.string(), age: v.number() });
    expectTypeOf(schema).toEqualTypeOf<Schema<{ name: string; age: number }>>();
  });

  it('checks field schemas against the generic', () => {
    v.object<User>({
      // @ts-expect-error wrong field schema
      name: v.number(),
      age: v.number(),
      deletedAt: v.date(),
      tags: v.array(v.string()),
    });
    // @ts-expect-error missing field
    v.object<User>({ name: v.string(), age: v.number(), deletedAt: v.date() });
    v.object<User>({
      name: v.string(),
      age: v.number(),
      deletedAt: v.date(),
      tags: v.array(v.string()),
      // @ts-expect-error unknown field
      extra: v.string(),
    });
  });
});

describe('other schema types', () => {
  it('infers enum values', () => {
    expectTypeOf(v.enum({ values: ['admin', 'user'] })).toEqualTypeOf<Schema<'admin' | 'user'>>();
  });

  it('infers array items', () => {
    expectTypeOf(v.array(v.number())).toEqualTypeOf<Schema<number[]>>();
  });
});
