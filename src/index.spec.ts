import { describe, expect, it } from 'vitest';

import { v } from './index';

describe('base options', () => {
  it('requires values by default', () => {
    expect(v.string().parse(undefined)).toEqual({ ok: false, violations: [{ field: '', reason: 'required' }] });
  });

  it('rejects null unless nullable', () => {
    expect(v.string().parse(null)).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_type' }] });
    expect(v.string({ nullable: true }).parse(null)).toEqual({ ok: true, data: null });
  });

  it('accepts undefined when optional', () => {
    expect(v.string({ optional: true }).parse(undefined)).toEqual({ ok: true, data: undefined });
  });

  it('parses the default value only when input is undefined', () => {
    expect(v.string({ default: ' x ', trim: true }).parse(undefined)).toEqual({ ok: true, data: 'x' });
    expect(v.string({ default: 'x' }).parse(null).ok).toBe(false);
  });

  it('applies transform and collects refinements', () => {
    const schema = v.number({
      transform: (n) => n * 2,
      refine: [
        { check: (n) => n % 3 === 0, reason: 'multiple_of_3' },
        { check: (n) => n > 10, reason: 'too_small', field: 'value' },
      ],
    });
    expect(schema.parse(3)).toEqual({ ok: false, violations: [{ field: 'value', reason: 'too_small' }] });
    expect(schema.parse(9)).toEqual({ ok: true, data: 18 });
  });
});

describe('string', () => {
  it('coerces primitives and dates', () => {
    expect(v.string().parse(12)).toEqual({ ok: true, data: '12' });
    expect(v.string().parse(true)).toEqual({ ok: true, data: 'true' });
    expect(v.string().parse(10n)).toEqual({ ok: true, data: '10' });
    expect(v.string().parse(new Date(0))).toEqual({ ok: true, data: '1970-01-01T00:00:00.000Z' });
    expect(v.string().parse({})).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_string' }] });
    expect(v.string().parse(Number.NaN).ok).toBe(false);
  });

  it('normalizes and checks length', () => {
    expect(v.string({ trim: true, uppercase: true }).parse(' ab ')).toEqual({ ok: true, data: 'AB' });
    expect(v.string({ minLength: 2, maxLength: 3 }).parse('a').ok).toBe(false);
    expect(v.string({ maxLength: 3 }).parse('abcd')).toEqual({ ok: false, violations: [{ field: '', reason: 'max_length' }] });
  });
});

describe('number', () => {
  it('coerces numeric strings and safe bigints', () => {
    expect(v.number().parse(' 1.5e2 ')).toEqual({ ok: true, data: 150 });
    expect(v.number().parse('.5')).toEqual({ ok: true, data: 0.5 });
    expect(v.number().parse(5n)).toEqual({ ok: true, data: 5 });
    expect(v.number().parse(2n ** 64n).ok).toBe(false);
    expect(v.number().parse('abc')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_number' }] });
    expect(v.number().parse('').ok).toBe(false);
    expect(v.number().parse(Infinity).ok).toBe(false);
  });

  it('checks integer, min and max', () => {
    expect(v.number({ integer: true, min: 2 }).parse(1.5)).toEqual({
      ok: false,
      violations: [
        { field: '', reason: 'invalid_integer' },
        { field: '', reason: 'min' },
      ],
    });
    expect(v.number({ max: 1 }).parse(2).ok).toBe(false);
  });
});

describe('bigint', () => {
  it('coerces integers', () => {
    expect(v.bigint().parse('-12')).toEqual({ ok: true, data: -12n });
    expect(v.bigint().parse(7)).toEqual({ ok: true, data: 7n });
    expect(v.bigint().parse(1.5)).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_bigint' }] });
    expect(v.bigint({ min: 0n, max: 10n }).parse(11n).ok).toBe(false);
  });
});

describe('boolean', () => {
  it('coerces common representations', () => {
    expect(v.boolean().parse('TRUE')).toEqual({ ok: true, data: true });
    expect(v.boolean().parse('0')).toEqual({ ok: true, data: false });
    expect(v.boolean().parse(1)).toEqual({ ok: true, data: true });
    expect(v.boolean().parse(0n)).toEqual({ ok: true, data: false });
    expect(v.boolean().parse('yes')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_boolean' }] });
  });
});

describe('date', () => {
  it('parses ISO dates, Date instances and timestamps', () => {
    expect(v.date().parse('2024-02-29')).toEqual({ ok: true, data: new Date('2024-02-29T00:00:00.000Z') });
    expect(v.date().parse('2024-01-01T10:00:00-03:00')).toEqual({ ok: true, data: new Date('2024-01-01T13:00:00.000Z') });
    expect(v.date().parse(new Date(5))).toEqual({ ok: true, data: new Date(5) });
    expect(v.date().parse(0)).toEqual({ ok: true, data: new Date(0) });
  });

  it('rejects invalid calendar dates and datetimes without offset', () => {
    expect(v.date().parse('2023-02-29')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_date' }] });
    expect(v.date().parse('2024-01-01T10:00').ok).toBe(false);
  });

  it('requires an offset on strings when requireOffset is set', () => {
    const schema = v.date({ requireOffset: true });
    expect(schema.parse('2024-01-01Z').ok).toBe(false);
    expect(schema.parse('2024-01-01').ok).toBe(false);
    expect(schema.parse('2024-01-01T00:00:00Z').ok).toBe(true);
    // Date instances and timestamps are already exact instants, so they pass
    expect(schema.parse(new Date(5))).toEqual({ ok: true, data: new Date(5) });
    expect(schema.parse(0)).toEqual({ ok: true, data: new Date(0) });
  });

  it('checks min and max', () => {
    const schema = v.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') });
    expect(schema.parse('2023-12-31')).toEqual({ ok: false, violations: [{ field: '', reason: 'min' }] });
    expect(schema.parse('2025-01-01')).toEqual({ ok: false, violations: [{ field: '', reason: 'max' }] });
  });
});

describe('formatted strings', () => {
  it('validates emails with trim and lowercase by default', () => {
    expect(v.email().parse(' Jane@Example.com ')).toEqual({ ok: true, data: 'jane@example.com' });
    expect(v.email({ lowercase: false }).parse('Jane@Example.com')).toEqual({ ok: true, data: 'Jane@Example.com' });
    expect(v.email({ trim: false }).parse(' a@b.co').ok).toBe(false);
    expect(v.email().parse(1)).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_email' }] });
  });

  it('lowercases uuid and objectId by default', () => {
    expect(v.uuid().parse('550E8400-E29B-41D4-A716-446655440000')).toEqual({
      ok: true,
      data: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(v.uuid({ lowercase: false }).parse('550E8400-E29B-41D4-A716-446655440000').ok).toBe(true);
    expect(v.objectId().parse('507F1F77BCF86CD799439011')).toEqual({ ok: true, data: '507f1f77bcf86cd799439011' });
    expect(v.objectId().parse('xyz')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_object_id' }] });
  });

  it('allows empty strings only when enabled', () => {
    expect(v.uuid().parse('').ok).toBe(false);
    expect(v.uuid({ empty: true }).parse('  ')).toEqual({ ok: true, data: '' });
  });
});

describe('enum', () => {
  it('accepts listed values only', () => {
    const schema = v.enum({ values: ['a', 1] });
    expect(schema.parse('a')).toEqual({ ok: true, data: 'a' });
    expect(schema.parse(1)).toEqual({ ok: true, data: 1 });
    expect(schema.parse('1')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_enum' }] });
  });

  it('rejects transforms that leave the enum', () => {
    const schema = v.enum({ values: ['a', 'b'], transform: () => 'c' as 'a' });
    expect(schema.parse('a')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_enum' }] });
  });
});

describe('array', () => {
  it('parses items and prefixes item violations with the index', () => {
    expect(v.array(v.number()).parse(['1', 2])).toEqual({ ok: true, data: [1, 2] });
    expect(v.array(v.number()).parse([1, 'x'])).toEqual({ ok: false, violations: [{ field: '1', reason: 'invalid_number' }] });
    expect(v.array(v.number()).parse('x')).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_array' }] });
  });

  it('checks length and runs refinements after items succeed', () => {
    expect(v.array(v.number(), { minLength: 2 }).parse([1])).toEqual({
      ok: false,
      violations: [{ field: '', reason: 'min_length' }],
    });
    const unique = v.array(v.number(), { refine: [{ check: (xs) => new Set(xs).size === xs.length, reason: 'unique' }] });
    expect(unique.parse([1, 1])).toEqual({ ok: false, violations: [{ field: '', reason: 'unique' }] });
  });
});

describe('object', () => {
  type User = { name: string; age?: number; tags: string[]; address: { city: string } };

  const schema = v.object<User>({
    name: v.string(),
    age: v.number({ optional: true }),
    tags: v.array(v.string()),
    address: v.object<User['address']>({ city: v.string() }),
  });

  it('parses known keys and strips unknown keys', () => {
    expect(schema.parse({ name: 'Jane', tags: ['a'], address: { city: 'POA' }, extra: 1 })).toEqual({
      ok: true,
      data: { name: 'Jane', tags: ['a'], address: { city: 'POA' } },
    });
  });

  it('keeps present undefined keys', () => {
    const parsed = schema.parse({ name: 'Jane', age: undefined, tags: [], address: { city: 'POA' } });
    expect(parsed.ok && 'age' in parsed.data).toBe(true);
  });

  it('reports nested paths', () => {
    expect(schema.parse({ tags: [1, {}], address: {} })).toEqual({
      ok: false,
      violations: [
        { field: 'name', reason: 'required' },
        { field: 'tags.1', reason: 'invalid_string' },
        { field: 'address.city', reason: 'required' },
      ],
    });
  });

  it('treats inherited keys as absent', () => {
    const schema = v.object<{ toString: string }>({ toString: v.string() });
    expect(schema.parse({})).toEqual({ ok: false, violations: [{ field: 'toString', reason: 'required' }] });
  });

  it('does not pollute the prototype via __proto__ keys', () => {
    const schema = v.object<{ ['__proto__']: string }>({ ['__proto__']: v.string() });
    const parsed = schema.parse(JSON.parse('{"__proto__":"x"}'));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(Object.getPrototypeOf(parsed.data)).toBe(Object.prototype);
      expect(Object.getOwnPropertyDescriptor(parsed.data, '__proto__')?.value).toBe('x');
    }
  });

  it('rejects non plain objects', () => {
    expect(schema.parse([])).toEqual({ ok: false, violations: [{ field: '', reason: 'invalid_object' }] });
    expect(schema.parse(new Date()).ok).toBe(false);
  });

  it('supports cross-field refinements', () => {
    const range = v.object<{ start: number; end: number }>(
      { start: v.number(), end: v.number() },
      { refine: [{ check: (r) => r.start <= r.end, reason: 'invalid_range', field: 'end' }] }
    );
    expect(range.parse({ start: 2, end: 1 })).toEqual({ ok: false, violations: [{ field: 'end', reason: 'invalid_range' }] });
  });
});
