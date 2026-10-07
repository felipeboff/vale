/**
 * Vale – usage examples
 *
 * Run with: pnpm example
 */

import { v } from "../src";

type User = {
  name: string;
  age: number;
  email: string;
  document: string;
  role: "admin" | "user";
  active: boolean;
  tags: string[];
};

const userSchema = v.object<User>({
  name: v.string({ trim: true, minLength: 1 }),
  age: v.number({ integer: true, min: 0 }),
  email: v.email(),
  document: v.cpfCnpj(),
  role: v.enum({ values: ["admin", "user"] }),
  active: v.boolean({ default: true }),
  tags: v.array(v.string(), { maxLength: 5 }),
});

console.log(
  userSchema.parse({
    name: " Jane ",
    age: "28",
    email: "Jane@Example.com",
    document: "39053344705",
    role: "admin",
    tags: ["a", "b"],
  }),
);
// { ok: true, data: { name: "Jane", age: 28, email: "jane@example.com", document: "390.533.447-05", role: "admin", active: true, tags: ["a", "b"] } }

console.log(userSchema.parse({ name: "", age: "x", email: "nope", role: "guest", tags: [1, {}] }));
// { ok: false, violations: [{ field: "name", reason: "min_length" }, { field: "age", reason: "invalid_number" }, ...] }

const rangeSchema = v.object<{ start: Date; end: Date }>(
  { start: v.date(), end: v.date() },
  { refine: [{ check: (r) => r.start <= r.end, reason: "invalid_range", field: "end" }] },
);

console.log(rangeSchema.parse({ start: "2024-02-01", end: "2024-01-01" }));
// { ok: false, violations: [{ field: "end", reason: "invalid_range" }] }
