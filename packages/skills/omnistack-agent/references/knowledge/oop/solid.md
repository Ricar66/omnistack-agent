# SOLID Principles
> Five design principles that keep object-oriented code changeable. Use them to diagnose *why* a class is painful to modify, then refactor toward the fix.

## Concepts
SOLID is five heuristics for organizing responsibilities and dependencies so that change stays
cheap: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface
Segregation, **D**ependency Inversion. Each one names a specific kind of rigidity and points at the
refactor that removes it.

## Best Practices
- Apply a principle when you feel its smell, not pre-emptively. SOLID is a response to pain, not a
  setup tax.
- Refactor toward SOLID in small, test-backed steps — each principle has a mechanical fix.
- Prefer the smallest interface, the narrowest responsibility, and the most abstract dependency that
  still does the job.

## Patterns & Examples

### S — Single Responsibility Principle
A class should have one reason to change.

*Violation smell:* an `Invoice` class that calculates totals **and** renders HTML **and** emails the
customer. A change to the email template forces you to edit (and retest) tax logic.

```csharp
// Fix: split the reasons to change into collaborators.
class Invoice          { public decimal Total() { /* tax/totals only */ return 0m; } }
class InvoiceRenderer  { public string ToHtml(Invoice i) { /* presentation only */ return ""; } }
class InvoiceMailer    { public void Send(Invoice i, string html) { /* delivery only */ } }
```

### O — Open/Closed Principle
Open for extension, closed for modification.

*Violation smell:* a `switch (shape.Type)` you must reopen and edit every time a new shape is added.

```csharp
// Fix: extend by adding a type, not by editing existing code.
abstract class Shape { public abstract double Area(); }
class Circle : Shape { double r; public override double Area() => Math.PI * r * r; }
class Square : Shape { double s; public override double Area() => s * s; }
// Adding a Triangle never touches Circle, Square, or the caller.
```

### L — Liskov Substitution Principle
Subtypes must be usable anywhere their base type is expected, without surprises.

*Violation smell:* `Square : Rectangle` where setting width also mutates height — code written
against `Rectangle` now computes the wrong area. An override that throws `NotSupportedException` is
the same smell.

```csharp
// Fix: don't force an is-a that breaks the contract. Model the shared concept instead.
interface IShape { double Area(); }
class Rectangle : IShape { double w, h; public double Area() => w * h; }
class Square    : IShape { double s;    public double Area() => s * s; }
```

### I — Interface Segregation Principle
Many small, focused interfaces beat one fat one.

*Violation smell:* an `IMachine { Print(); Scan(); Fax(); }` that a simple printer must implement,
stubbing `Scan` and `Fax` with `throw`.

```csharp
// Fix: split so implementers depend only on what they use.
interface IPrinter { void Print(); }
interface IScanner { void Scan(); }
class SimplePrinter : IPrinter { public void Print() { /* ... */ } }
```

### D — Dependency Inversion Principle
Depend on abstractions, not concretions; high-level policy shouldn't import low-level detail.

*Violation smell:* an `OrderService` that does `new SqlOrderRepository()` inside its constructor —
you can't test it without a database, can't swap storage without editing it.

```csharp
// Fix: depend on an interface; inject the concrete implementation.
interface IOrderRepository { void Save(Order o); }
class OrderService
{
    private readonly IOrderRepository _repo;
    public OrderService(IOrderRepository repo) => _repo = repo;  // injected, not newed
}
```

## Common Pitfalls / Anti-patterns
- **Over-segregation:** one method per interface and a constructor with ten dependencies. The fix
  became the new rigidity.
- **Premature OCP:** abstracting for extension points nobody needs yet (violates YAGNI). Add the
  seam when the second case actually arrives.
- **Cargo-cult SRP:** splitting a cohesive class into anemic data-and-helper pairs that always change
  together — that's one responsibility wearing two files.
- **Worshipping the acronym:** treating "is this SOLID?" as the goal instead of "is this easy to
  change?"

## References
- Martin, R. C. — *Agile Software Development, Principles, Patterns, and Practices* (origin of SOLID)
- Martin, *Clean Architecture*, part III (the SOLID principles)
- Microsoft: Architectural principles — https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/architectural-principles

> **SOLID is a means to changeable code, not a checklist to worship.**

<!-- level: intermediate -->
