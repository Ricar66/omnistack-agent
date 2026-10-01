# Automated Testing

> Tests that run on every change, fast and unattended, so you can refactor without fear. The safety net that lets a codebase keep moving.

## Concepts

- **The test pyramid:** many fast **unit** tests at the base, fewer **integration** tests in the
  middle, a thin layer of slow **end-to-end (e2e)** tests on top. Push verification down the pyramid
  — cheaper, faster, more precise feedback.
- **Unit test:** exercises one unit (a class/function) in isolation. Fast, deterministic, no I/O.
- **Integration test:** verifies that units work together across a real boundary (DB, HTTP, queue).
- **End-to-end test:** drives the whole system as a user would (browser, API surface). High
  confidence, high cost — keep them few.
- **Arrange-Act-Assert (AAA):** the shape of a good test — set up inputs, perform the one action,
  assert the one outcome.
- **TDD loop (red-green-refactor):** write a failing test (red), write the minimum code to pass it
  (green), then clean up with the test as a guard (refactor).

## Best Practices

- One behavior per test; name it after the behavior (`Deposit_RejectsNegativeAmount`).
- Keep unit tests **fast and deterministic** — no clock, network, or random unless injected/seeded.
- Mock sparingly — only true external boundaries (network, clock, filesystem). Over-mocking tests the
  mocks, not the code.
- Treat **coverage as a signal, not a goal.** 100% coverage of trivial getters proves nothing; cover
  the branches that carry risk.
- Make the test suite a precondition for merge (CI), not an afterthought.

## Patterns & Examples

```csharp
// Illustrative C# with xUnit; requires the C# class from the OOP module.
// This repository does not include a .NET project or execute these tests.
public class BankAccountTests
{
    [Fact]
    public void Deposit_IncreasesBalance()
    {
        var account = new BankAccount("Ada", 100m);   // Arrange
        account.Deposit(50m);                          // Act
        Assert.Equal(150m, account.Balance);           // Assert
    }

    [Fact]
    public void Deposit_RejectsNonPositiveAmount()
    {
        var account = new BankAccount("Ada", 100m);
        Assert.Throws<ArgumentException>(() => account.Deposit(0m));
    }
}
```

```javascript
// Excerpt for a file in scripts/: Node >=18, built-in runner, zero dependencies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BankAccount } from '../examples/bank-account.mjs';

test('deposits add integer cents exactly across multiple operations', () => {
  const account = new BankAccount('Ada', 100);
  account.deposit(50);
  account.deposit(1);
  assert.equal(account.balanceCents, 151);
});

test('overflowing deposits fail before mutating the balance', () => {
  const account = new BankAccount('Ada', Number.MAX_SAFE_INTEGER);
  assert.throws(() => account.deposit(1), /balanceCents/);
  assert.equal(account.balanceCents, Number.MAX_SAFE_INTEGER);
});
```

The complete [tests](../../scripts/examples.test.mjs) import the real
[implementation](../../examples/bank-account.mjs), including invalid owners, strings, NaN,
Infinity, fractional cents, overflow and unchanged state after rejection.

```sh
# From the repository root:
node --test scripts/examples.test.mjs
npm test
```

Report the command, scope and actual outcome of checks. A proposed test or an unavailable runner
is **not run**, not passed. These JavaScript unit tests do not verify the illustrative C# or SQL
snippets, database concurrency, production integrations, or the quality of an AI response.

## Common Pitfalls / Anti-patterns

- **Ice-cream cone:** the pyramid inverted — lots of slow, flaky e2e tests and almost no unit tests.
  Slow feedback, hard to debug failures.
- **Testing implementation, not behavior:** asserting that a private method was called rather than
  that the outcome is correct; the tests break on every refactor.
- **Flaky tests:** dependence on timing, ordering, or shared state. A test that fails randomly trains
  the team to ignore red — quarantine and fix it.
- **Coverage worship:** writing assertion-free tests to hit a percentage. Cover behavior and risk.

## References

- Fowler — The Practical Test Pyramid — https://martinfowler.com/articles/practical-test-pyramid.html
- Node.js test runner docs — https://nodejs.org/api/test.html
- xUnit.net documentation — https://xunit.net/

<!-- level: intermediate -->
