# JavaScript Essentials

> The language of the web (and, via Node.js, the server). Dynamic, flexible, and full of footguns — modern JS gives you the tools to avoid most of them.

## Concepts

- **`let` / `const`:** block-scoped bindings. Default to `const`; use `let` only when you must
  reassign. Never `var` (function-scoped, hoisted — a bug source).
- **Modules (ESM):** `import`/`export` split code into files with explicit dependencies — the standard
  over the legacy CommonJS `require`.
- **Classes & private fields:** `class` with `#field` for true private state (not accessible outside
  the class).
- **Promises & async/await:** asynchronous values. `await` a promise to read its result without
  callbacks; wrap awaited I/O in `try/catch`.
- **Array methods:** `map`, `filter`, `reduce`, `find`, `some`/`every` express transformations
  declaratively instead of manual loops.
- **Destructuring & spread:** pull values out (`const { id } = user`) and copy/merge (`{ ...a, ...b }`,
  `[...xs]`) concisely.

## Best Practices

- `const` by default; reach for `let` only on real reassignment.
- Use strict equality `===` always; `==` does surprising type coercion.
- Prefer immutable updates (spread/`map`) over mutating shared arrays and objects.
- Handle promise rejections — `await` inside `try/catch`, or `.catch()` on every chain.

## Patterns & Examples

```javascript
// Modern idiomatic JS: ESM, async/await, destructuring, array methods.
export async function topActiveUsers(api) {
  const users = await api.fetchUsers();           // await async I/O
  return users
    .filter((u) => u.isActive)                     // declarative
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ id, name }) => ({ id, name }));        // destructure + reshape
}

class Counter {
  #count = 0;                 // truly private field
  increment() { this.#count += 1; return this.#count; }
  get value() { return this.#count; }
}
```

## Common Pitfalls / Anti-patterns

- **`==` coercion:** `0 == ''` and `null == undefined` are `true`; `[] == false` is `true`. Use `===`.
- **`this` confusion:** `this` depends on *how* a function is called, not where it's defined. Use arrow
  functions (which capture the enclosing `this`) for callbacks.
- **Hoisting surprises with `var`:** `var` declarations move to the top and are `undefined` until
  assigned. Use `let`/`const`, which stay in the temporal dead zone until declared.
- **Mutating shared state:** in-place `push`/`sort` on an array passed around causes spooky action at a
  distance. Copy first.
- **Unhandled promise rejection:** a forgotten `await`/`catch` silently swallows errors.

## References

- MDN JavaScript Guide — https://developer.mozilla.org/docs/Web/JavaScript/Guide
- JavaScript modules (MDN) — https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules
- TC39 — the ECMAScript standard — https://tc39.es/

<!-- level: beginner -->
