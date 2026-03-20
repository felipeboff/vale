/**
 * Vale – usage examples
 *
 * Run with: npx tsx examples/usage.ts
 */

import {
  vale,
  valeValidate,
  ValeError,
  type InferVale,
  type ValeResult,
} from "../src";

// ---------------------------------------------------------------------------
// Primitives (with coercion)
// ---------------------------------------------------------------------------

const stringResult = vale.string().parse("hello");
console.log("string:", stringResult); // "hello"

const numberResult = vale.number().parse("42");
console.log("number (coerced):", numberResult); // 42

const booleanResult = vale.boolean().parse("true");
console.log("boolean (coerced):", booleanResult); // true

// ---------------------------------------------------------------------------
// Object schema
// ---------------------------------------------------------------------------

const userSchema = vale.object({
  name: vale.string(),
  age: vale.integer(),
  email: vale.email(),
  active: vale.boolean().default(true),
});

type User = InferVale<typeof userSchema>;

const userInput = {
  name: "Jane",
  age: 28,
  email: "jane@example.com",
  // active omitted – will use default
};

const user = userSchema.parse(userInput);
console.log("user:", user);
// { name: "Jane", age: 28, email: "jane@example.com", active: true }

const strictUserSchema = userSchema.strict();
const strictUserProbe = strictUserSchema.safeParse({ ...userInput, extra: "x" });
console.log("strict (extra key):", strictUserProbe);

// ---------------------------------------------------------------------------
// Array and optional
// ---------------------------------------------------------------------------

const tagsSchema = vale.array(vale.string());
const tags = tagsSchema.parse(["a", "b", "c"]);
console.log("array:", tags); // ["a", "b", "c"]

const optionalName = vale.string().optional();
console.log("optional (present):", optionalName.parse("Alice")); // "Alice"
console.log("optional (absent):", optionalName.parse(undefined)); // undefined

// ---------------------------------------------------------------------------
// Enum
// ---------------------------------------------------------------------------

const roleSchema = vale.enum(["admin", "user", "guest"]);
console.log("enum:", roleSchema.parse("admin")); // "admin"
const roleInvalid = roleSchema.safeParse("superuser");
console.log("enum (invalid):", roleInvalid); // { ok: false, issues: [...] }

// ---------------------------------------------------------------------------
// valeValidate – throw on failure
// ---------------------------------------------------------------------------

try {
  const user = valeValidate(userSchema, {
    name: "Bob",
    age: "thirty", // invalid
    email: "bob@example.com",
  });
  console.log("validated user:", user);
} catch (err) {
  if (err instanceof ValeError) {
    console.log("ValeError issues:", err.issues);
    // e.g. [{ path: ["age"], code: "integer", message: "age is invalid integer" }]
  }
}

// ---------------------------------------------------------------------------
// Handling result manually
// ---------------------------------------------------------------------------

function validateAndLog<T>(result: ValeResult<T>, label: string): void {
  if (result.ok) {
    console.log(`${label}:`, result.value);
  } else {
    console.log(`${label} failed:`, result.issues);
  }
}

validateAndLog(vale.email().safeParse("invalid"), "email");
validateAndLog(
  vale.uuid().safeParse("550e8400-e29b-41d4-a716-446655440000"),
  "uuid",
);

// ---------------------------------------------------------------------------
// Nested object and array
// ---------------------------------------------------------------------------

const postSchema = vale.object({
  title: vale.string(),
  tags: vale.array(vale.string()),
  author: vale.object({
    name: vale.string(),
    role: vale.enum(["admin", "user"]),
  }),
});

type Post = InferVale<typeof postSchema>;

const post = postSchema.parse({
  title: "Hello Vale",
  tags: ["validation", "typescript"],
  author: { name: "Dev", role: "admin" },
});

console.log("post:", post);
