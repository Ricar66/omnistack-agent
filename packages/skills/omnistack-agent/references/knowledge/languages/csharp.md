# C# Essentials

> A modern, statically-typed, OOP-first language for backend services, desktop, and cross-platform apps on .NET. Pick when you want strong typing, great tooling, and a mature ecosystem.

## Concepts

- **Types:** `class` (reference, mutable identity), `struct` (value, copied), and `record` (concise,
  value-equality types ideal for DTOs/domain values).
- **Properties:** encapsulated state with `{ get; private set; }` or `{ get; init; }` (set once at
  construction) instead of public fields.
- **Interfaces:** name a capability (`IRepository`) that many classes implement — the basis of
  polymorphism and dependency inversion.
- **Generics:** type-safe reuse — `List<T>`, `Repository<T>` — no casting, checked at compile time.
- **async/await:** non-blocking I/O. An `async` method returns a `Task`/`Task<T>`; `await` suspends
  without blocking the thread.
- **LINQ:** declarative queries over any `IEnumerable<T>` (`Where`, `Select`, `OrderBy`).
- **Null-safety:** nullable reference types (`string?`) make "can this be null?" part of the type, so
  the compiler warns before a `NullReferenceException` happens.

## Best Practices

- Enable nullable reference types (`<Nullable>enable</Nullable>`) and treat its warnings as errors.
- Prefer `record` for immutable value/data types; prefer `init` properties over public setters.
- `await` async calls all the way up; never `.Result`/`.Wait()` (deadlocks, blocked threads).
- Depend on interfaces and inject collaborators; use `IEnumerable<T>`/`IReadOnlyList<T>` at boundaries.

## Patterns & Examples

```csharp
// Idiomatic C#: a record value type, an async repository call, LINQ, and null-safety.
public record Customer(Guid Id, string Name, string? Email);   // value-equality DTO

public class CustomerService(ICustomerRepository repo)          // primary constructor (C# 12)
{
    public async Task<IReadOnlyList<string>> ActiveNamesAsync()
    {
        IReadOnlyList<Customer> all = await repo.GetAllAsync();  // non-blocking I/O
        return all
            .Where(c => c.Email is not null)   // null-aware filter
            .OrderBy(c => c.Name)
            .Select(c => c.Name)
            .ToList();
    }
}
```

**Pick when:** enterprise/backend APIs (ASP.NET Core), cross-platform apps (MAUI), game dev (Unity),
or any team that values static typing and first-class tooling.

## Common Pitfalls / Anti-patterns

- **Blocking on async (`.Result`, `.Wait()`):** causes deadlocks in some contexts and wastes threads.
  Stay async end-to-end.
- **Ignoring nullable warnings:** disabling them throws away C#'s best defense against null bugs.
- **Public mutable fields:** breaks encapsulation; use properties (and `init`/`private set`).
- **`async void`:** un-awaitable and swallows exceptions; only valid for event handlers.

## References

- C# language documentation — https://learn.microsoft.com/dotnet/csharp/
- .NET API browser — https://learn.microsoft.com/dotnet/api/
- Async/await best practices — https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/

<!-- level: intermediate -->
