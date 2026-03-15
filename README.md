# Vale

TypeScript-first runtime validator with coercion, composable schemas, and path-based error reporting.

Validate and parse unknown input (for example APIs, forms, or config) into typed values. Vale returns a result object instead of throwing so validation failures can be handled explicitly. When needed you can use `valeValidate` to throw on failure.

## Features

- Coercion  
  Primitives like number, integer, boolean, and date accept string input and coerce when valid.  
  `"42"` becomes `42`, `"true"` becomes `true`.

- Composable schemas  
  Build object, array, and nested structures. Combine with `.optional()`, `.nullable()`, `.default()`, `.into()`, and `.guard()`.

- Path-based errors  
  Each issue includes a path such as `["author", "age"]`. This makes it easy to show field errors in UI or logs.

- Type inference  
  Use `InferVale<typeof schema>` to derive the TypeScript type from a schema.

- No dependencies  
  Pure TypeScript / JavaScript with zero runtime dependencies.

---

# Installation

npm

```bash
npm i @felipe.boff/vale
```
yarn
```bash
yarn add @felipe.boff/vale
```
pnpm
```bash
pnpm add @felipe.boff/vale
```

---

Quick start
```ts
import { vale, type InferVale } from "@felipe.boff/vale"

const userSchema = vale.object({
  name: vale.string(),
  age: vale.integer(),
  email: vale.email(),
  active: vale.boolean().default(true),
})

type User = InferVale<typeof userSchema>

const result = userSchema.parse({
  name: "Jane",
  age: 28,
  email: "jane@example.com",
})

if (result.ok) {
  console.log(result.value)
} else {
  console.log(result.issues)
}
```

---

Schema types

Method	Description
```ts
vale.string()	String
vale.number()	Number (coerces from string)
vale.integer()	Integer (coerces from string)
vale.boolean()	Boolean (coerces "true" / "false")
vale.date()	Date (coerces from string or number)
vale.email()	String matching email format
vale.uuid()	UUID v4 string
vale.objectId()	MongoDB-style ObjectId string
vale.enum([...])	One of the given string literals
vale.object({...})	Object with specified shape
vale.array(schema)	Array of validated items
```


---

Modifiers

Schemas can be extended with modifiers.
```ts
.optional()
undefined is accepted. Output type becomes T | undefined.

.nullable()
null is accepted. Output type becomes T | null.

.nullish()
null or undefined accepted.

.default(value)
Use value when input is undefined.

.into(fn)
Transform parsed value.

vale.string().into((v) => v.trim())

.guard(predicate, message)
Custom validation refinement.

vale.number().guard((n) => n > 0, "Must be positive")
```

---

Nested schemas

Schemas can be composed.
```ts
const addressSchema = vale.object({
  city: vale.string(),
  zip: vale.string(),
})

const userSchema = vale.object({
  name: vale.string(),
  address: addressSchema,
})
```
---

Result type
```ts
schema.parse(input) returns a discriminated union.

type ValeResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValeIssue[] }

type ValeIssue = {
  path: (string | number)[]
  code: string
  message: string
}
```
Example issue
```JSON
{
  path: ["age"],
  code: "integer",
  message: "Expected integer"
}
```

---

Throw on failure

Use valeValidate to throw a ValeError.
```ts
import { valeValidate, ValeError } from "@felipe.boff/vale"

try {
  const user = valeValidate(userSchema, rawInput)
  console.log(user)
} catch (err) {
  if (err instanceof ValeError) {
    console.log(err.issues)
  }
}
```

---

License

ISC
Felipe Boff