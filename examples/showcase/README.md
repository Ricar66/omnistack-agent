# Three repeatable demonstrations

Run from the repository root with Node ≥ 18:

```bash
npm run demo
```

The command runs the same contract checks against each initial fixture and its maintainer-authored solution. An initial failure is required: if it stops reproducing, the command fails. All solution checks must pass.

Observed output from `node scripts/demos.mjs` on Windows / Node 25.9.0:

```text
cart: initial check failed as expected; solution checks passed
permissions: initial check failed as expected; solution checks passed
tasks: initial check failed as expected; solution checks passed
3 maintainer-authored demonstrations verified; no model responses evaluated.
```

These are executable engineering examples, not AI response transcripts or model benchmark results. The checks live in [scripts/demos.mjs](../../scripts/demos.mjs); their regression tests are in [scripts/demos.test.mjs](../../scripts/demos.test.mjs). The deliberately broken initial fixtures are only teaching inputs.

To try a prompt with your assistant, use a disposable project, provide the initial snippet, and keep the solution out of its context. Enable the indicated skill through your host. Save the actual response and checks using [the evaluation guide](../../docs/evaluation.md). Reading the answer first is useful for learning, but is not an independent evaluation.

## 1. Fix a cart total

Suggested skill: `omnistack-debug`.

```text
A cart total is unexpectedly becoming text. This is the complete fixture:

// src/cart.mjs
export function totalCents(items) {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, "0");
}

Prices and quantities are validated positive integers before this function.
Find the bug, make the smallest correction, and show a regression check for
1250 cents × 2 and 350 cents × 1. The result must be the number 2850.
Preserve the existing input contract. Report only checks you actually ran;
if execution is unavailable, provide a proposed check and say so.
```

[Initial fixture](cart/before.mjs) · [Maintainer solution](cart/after.mjs)

The initial string accumulator produces text through JavaScript coercion. The small correction uses numeric zero. Checks cover the stated two-item value and type, an empty cart, and a one-cent item. This fixture assumes valid integer inputs and totals within JavaScript's safe integer range; it is not a pricing or payment service.

## 2. Review an access check

Suggested skill: `omnistack-code-review`.

```text
Review this fixture. Return actionable findings with severity and file/line
location; do not rewrite the whole module.

// src/access.mjs
1 export function canDelete(user) {
2   if (user.role = "admin") return true;
3   return false;
4 }

Only an exact "admin" role may delete. The access check must not modify user.
Explain the impact and a minimal correction. Include a regression check or
label it as proposed if no execution tool is available.
```

[Initial fixture](permissions/before.mjs) · [Maintainer solution](permissions/after.mjs)

Line 2 assigns a role and returns true for members, granting unintended access while mutating their state. The solution compares with strict equality. Checks cover a member, an admin, case sensitivity, an absent role, and unchanged/frozen input. This is a tiny role-check example; real authorization also depends on identity, resources, and server-side enforcement.

## 3. Add a bounded filter feature

Suggested skill: `omnistack-agent`.

```text
This dependency-free module already returns open tasks:

// src/tasks.mjs
export function listOpenTasks(tasks) {
  return tasks.filter(task => !task.done);
}

Add an optional limit parameter. When omitted, return all open tasks in their
original order. Zero returns an empty array. Accept only non-negative safe
integers; reject negative, fractional, non-numeric, infinite and unsafe limits.
Apply the limit after filtering. Do not mutate the input or add dependencies.
Show relevant checks and state which actually ran.
```

[Initial fixture](tasks/before.mjs) · [Maintainer solution](tasks/after.mjs)

The initial function passes its old no-limit behavior but fails the new zero-limit contract. The solution validates the optional limit, filters, then slices. Checks cover omission, zero, one, a limit larger than the result, empty input, invalid values, original order, and frozen input. Rejection is a `RangeError`; no new framework or data layer is needed.

## Evaluate your own change

The repository demonstration runner imports committed snapshots. It does not automatically import code an assistant changed in a separate project. Apply the matching exported check to your function in that workspace, or reproduce its assertions in the project's own test framework.

For example, to check a cart fix in a disposable `src/cart.mjs`, save a test module that imports your function and asserts its numeric total is 2850 and its empty total is zero. Run it with `node --test`, save the output, and record the exact file under evaluation. Comparing a snapshot to itself is not evidence that an assistant completed the task.