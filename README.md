# Vale

**TypeScript-first runtime validator** with coercion, composable schemas, and path-based error reporting.

Validate and parse unknown input (e.g. from APIs, forms, or config) into typed values. Vale returns a result object instead of throwing, so you can handle validation failures explicitly or use `valeValidate` to throw on error.

## Features

- **Coercion** – Primitives like `number`, `integer`, `boolean`, and `date` accept string input and coerce when valid (e.g. `"42"` → `42`, `"true"` → `true`).
- **Composable schemas** – Build `object`, `array`, nested structures, and combine with `.optional()`, `.nullable()`, `.default()`, `.into()`, and `.guard()`.
- **Path-based errors** – Each issue includes a `path` (e.g. `["author", "age"]`) so you can show field-level errors in UIs or logs.
- **Type inference** – Use `InferVale<typeof schema>` to get the TypeScript type from a schema.
- **No dependencies** – Pure TypeScript/JavaScript, zero runtime deps.

## Installation

```bash
npm install vale
```

## Quick start

```ts
import { vale, type InferVale } from "vale";

const userSchema = vale.object({
  name: vale.string(),
  age: vale.integer(),
  email: vale.email(),
  active: vale.boolean().default(true),
});

type User = InferVale<typeof userSchema>;

const result = userSchema.parse({
  name: "Jane",
  age: 28,
  email: "jane@example.com",
});

if (result.ok) {
  console.log(result.value); // User
} else {
  console.log(result.issues); // { path, code, message }[]
}
```

## Schema types

| Method               | Description                            |
| -------------------- | -------------------------------------- |
| `vale.string()`      | String (no coercion)                   |
| `vale.number()`      | Number (coerces from string)           |
| `vale.integer()`     | Integer (coerces from string)          |
| `vale.boolean()`     | Boolean (coerces `"true"` / `"false"`) |
| `vale.date()`        | Date (coerces from string or number)   |
| `vale.email()`       | String matching email format           |
| `vale.uuid()`        | UUID v4 string                         |
| `vale.objectId()`    | MongoDB-style ObjectId string          |
| `vale.enum([...])`   | One of the given string literals       |
| `vale.object({...})` | Object with specified shape            |
| `vale.array(schema)` | Array of items validated by schema     |

## Modifiers

- **`.optional()`** – `undefined` is valid; output type is `T | undefined`.
- **`.nullable()`** – `null` is valid; output type is `T | null`.
- **`.nullish()`** – `null` or `undefined` accepted.
- **`.default(value)`** – Use `value` when input is `undefined`.
- **`.into(fn)`** – Transform the parsed value (e.g. string → trimmed string).
- **`.guard(predicate, message)`** – Refine with a custom check; invalid values produce an issue with the given message.

## Result type

`schema.parse(input)` returns a **discriminated union**:

```ts
type ValeResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValeIssue[] };

type ValeIssue = {
  path: (string | number)[]; // e.g. ["author", "age"]
  code: string; // e.g. "integer", "email"
  message: string;
};
```

## Throw on failure

Use `valeValidate(schema, input)` to get the value or throw `ValeError` with `issues`:

```ts
import { valeValidate, ValeError } from "vale";

try {
  const user = valeValidate(userSchema, rawInput);
  // user is typed as User
} catch (err) {
  if (err instanceof ValeError) {
    console.log(err.issues);
  }
}
```

## Run the example

```bash
npm run example
```

Runs `examples/usage.ts`, which demonstrates primitives, objects, arrays, enums, optional/default, nested shapes, and error handling.

## Build

```bash
npm run build
```

Output is in `dist/` (ESM with `.d.ts`).

## License

ISC · [Felipe Boff](https://github.com/felipeboff)
