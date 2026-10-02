# TypeScript Essentials

> Static checks for JavaScript contracts; validate external data at runtime and preserve the installed compiler's configuration.

## Concepts

- TypeScript checks types before execution; annotations and assertions do not validate incoming JSON at runtime.
- `unknown` requires narrowing before use. Use it for untrusted values instead of propagating `any`.
- Discriminated unions represent exclusive states and let control flow select their valid fields.
- Structural typing checks compatible shapes. A type declaration is a contract, not proof that a network response satisfies it.
- `readonly` restricts assignment through a typed reference; it does not freeze an object at runtime.

## Best Practices

- Inspect the installed TypeScript version, project scripts and `tsconfig.json` before changing compiler options or suggesting language features. Use the matching official documentation.
- Prefer the project's strict settings; tightening options in an existing project is a separate change with its own compatibility review.
- Validate data at API, file and environment boundaries, then pass a narrowed domain value to internal code. Keep static checking and runtime checks complementary.
- Model absence explicitly and use exhaustive branches where omission would lose a domain state. Avoid non-null assertions that hide an actual nullable path.
- Keep generic parameters tied to meaningful relationships between inputs and outputs; prefer straightforward types to clever conditional machinery.

## Patterns & Examples

Illustrative snippet: distinguish a successful result from an error, while accepting an untrusted identifier only after a runtime check.

```typescript
type Lookup =
  | { kind: 'found'; id: string }
  | { kind: 'missing' };

function readIdentifier(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError('Identifier must be a non-empty string.');
  }
  return value.trim();
}

function describeLookup(result: Lookup): string {
  switch (result.kind) {
    case 'found': return result.id;
    case 'missing': return 'No matching record';
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}
```

Run the project's typecheck script to check its configured source scope; successful typechecking does not prove network validation or runtime behavior. This repository does not compile the illustrative snippet as part of its dependency-free Node tests.

## Common Pitfalls / Anti-patterns

- `JSON.parse(text) as User` trusts the input without checking its shape.
- `value!` and broad `as` assertions can suppress a real contract mismatch; inspect the boundary instead.
- An optional field and a field explicitly set to `undefined` may have different meanings under the project's compiler settings and domain rules.
- Truthiness checks can reject valid zero or empty-string values; compare against the actual absent state.
- Upgrading the compiler can add checks under `strict`; verify the existing project rather than assuming a previously passing build remains valid.

## References

- TypeScript narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- TypeScript object types and readonly: https://www.typescriptlang.org/docs/handbook/2/objects.html
- TypeScript strict configuration: https://www.typescriptlang.org/tsconfig/strict.html
- TypeScript project configuration: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

<!-- level: intermediate -->
