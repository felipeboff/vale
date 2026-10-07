# Vale

TypeScript-first runtime validator with coercion, composable schemas, and path-based violations.

Vale parses unknown input (APIs, forms, query strings, config) into typed values. `parse` never throws: it returns a result object so failures are handled explicitly.

## Installation

```bash
npm i @felipe.boff/vale
# or
pnpm add @felipe.boff/vale
```

## Quick start

```ts
import { v } from "@felipe.boff/vale";

type User = { name: string; age: number; email: string; active: boolean };

const userSchema = v.object<User>({
  name: v.string({ trim: true, minLength: 1 }),
  age: v.number({ integer: true, min: 0 }),
  email: v.email(),
  active: v.boolean({ default: true }),
});

const result = userSchema.parse({ name: "Jane", age: "28", email: "jane@example.com" });

if (result.ok) {
  result.data; // { name: "Jane", age: 28, email: "jane@example.com", active: true }
} else {
  result.violations; // [{ field: "age", reason: "invalid_number" }]
}
```

## Result

```ts
type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; violations: Violation[] };

type Violation = {
  field: string; // dot path, e.g. "address.city" or "tags.0"; "" for the root value
  reason: ViolationReason; // e.g. "required", "invalid_number", "min_length" or a custom reason
};
```

## Schemas

| Schema | Accepts |
| --- | --- |
| `v.string(options?)` | strings; coerces finite numbers, booleans, bigints and valid dates (ISO) |
| `v.number(options?)` | finite numbers; numeric strings; safe bigints |
| `v.bigint(options?)` | bigints; safe integers; integer strings |
| `v.boolean(options?)` | booleans; `1`/`0`; `"true"`/`"false"`/`"1"`/`"0"` (case-insensitive) |
| `v.date(options?)` | valid `Date`s; timestamps; `YYYY-MM-DD` and ISO date-times with `Z` or an offset |
| `v.email(options?)` | email strings (trimmed and lowercased by default) |
| `v.uuid(options?)` | UUID strings (trimmed and lowercased by default) |
| `v.objectId(options?)` | 24-char hex strings (trimmed and lowercased by default) |
| `v.cpf(options?)` | valid CPF strings, with or without mask; outputs `000.000.000-00` |
| `v.cnpj(options?)` | valid CNPJ strings (numeric or alphanumeric), with or without mask; outputs `00.000.000/0000-00` |
| `v.cpfCnpj(options?)` | a valid CPF or CNPJ, formatted as above |
| `v.enum({ values })` | one of `values` (strings or numbers) |
| `v.array(item, options?)` | arrays whose items match `item` |
| `v.object<T>(shape, options?)` | plain objects; unknown keys are stripped |

## Options

Every schema accepts the base options:

| Option | Description |
| --- | --- |
| `optional` | accept `undefined` |
| `nullable` | accept `null` |
| `default` | value parsed in place of `undefined` |
| `transform` | `(value: T) => T`, applied after coercion and before checks |
| `refine` | `{ check, reason, field? }[]`, custom checks producing violations |

Schema-specific options:

- `string`: `trim`, `lowercase`, `uppercase`, `minLength`, `maxLength`
- `number`: `integer`, `min`, `max`
- `bigint`: `min`, `max`
- `date`: `min`, `max`, `requireOffset` (string input must carry `Z` or an offset; `Date`s and timestamps still pass)
- `email` / `uuid` / `objectId`: `trim`, `lowercase`, `empty` (accept `""`)
- `cpf` / `cnpj` / `cpfCnpj`: `empty` (accept `""`)
- `array`: `minLength`, `maxLength`

## Types

`v.object<T>(shape)` takes the output type as a generic and checks each field schema against it. The shape must have exactly the keys of `T`:

```ts
type User = { name: string; age?: number };

v.object<User>({ name: v.string(), age: v.number({ optional: true }) }); // ok
v.object<User>({ name: v.number(), age: v.number() }); // type error: name is not a number schema
v.object<User>({ name: v.string() }); // type error: age is missing
```

Without the generic, the type is inferred from the shape (all fields required and non-null):

```ts
const schema = v.object({ name: v.string() }); // Schema<{ name: string }>
```

Other schemas have a fixed type (`v.string()` is `Schema<string>`, `v.enum` uses its `values`, `v.array` uses its item). `optional` and `nullable` are not reflected in these types, so declare them in the object type.

## CPF / CNPJ helpers

```ts
import { formatValidCpf, formatValidCnpj, formatValidCpfOrCnpj } from "@felipe.boff/vale";

formatValidCpf("39053344705"); // "390.533.447-05"
formatValidCnpj("04252011000110"); // "04.252.011/0001-10"
formatValidCpfOrCnpj("123"); // null
```

## Cross-field refinements

```ts
const range = v.object<{ start: Date; end: Date }>(
  { start: v.date(), end: v.date() },
  { refine: [{ check: (r) => r.start <= r.end, reason: "invalid_range", field: "end" }] },
);
```

## License

ISC — Felipe Boff
