# Design Patterns
> Named, reusable solutions to recurring design problems. A shared vocabulary — reach for a pattern when you recognize its problem, not to decorate code that doesn't need it.

## Concepts
Design patterns are proven arrangements of classes and objects, traditionally grouped by what they
organize:
- **Creational** — how objects get made (Factory, Builder, Singleton, Abstract Factory, Prototype).
- **Structural** — how objects are composed (Adapter, Decorator, Facade, Composite, Proxy, Bridge).
- **Behavioral** — how objects collaborate and share responsibility (Strategy, Observer, Command,
  Template Method, State, Iterator).

A pattern is a *response to a force* (change, coupling, duplication). If the force isn't present,
the pattern is just extra indirection.

## Best Practices
- Recognize the problem first, then name the pattern — never start from "let's use a pattern."
- Prefer the simplest pattern that resolves the force; a plain function often beats a class hierarchy.
- Patterns are communication: when you do use one, name it (`OrderStrategy`, `PriceObserver`) so the
  next reader sees the intent.

## Patterns & Examples

### Factory (Creational)
**Intent:** centralize object creation behind a method so callers don't depend on concrete types.
**When to use:** the concrete type depends on input/config, or construction is non-trivial and
repeated.

```javascript
// One place decides which concrete logger to build.
function createLogger(env) {
  switch (env) {
    case 'prod': return new JsonLogger();
    case 'test': return new NullLogger();
    default:     return new ConsoleLogger();
  }
}
const log = createLogger(process.env.NODE_ENV); // caller stays decoupled from concretes
```

*Over-use warning:* a factory that only ever returns `new Thing()` adds indirection with no payoff —
just call the constructor.

### Strategy (Behavioral)
**Intent:** capture interchangeable algorithms behind a common interface; swap them at runtime.
**When to use:** you have a family of variants (pricing rules, sort orders, compression) selected by
context.

```csharp
interface IShippingCost { decimal For(Order o); }
class Standard : IShippingCost { public decimal For(Order o) => 5m; }
class Express  : IShippingCost { public decimal For(Order o) => 15m; }

class Checkout
{
    private readonly IShippingCost _cost;
    public Checkout(IShippingCost cost) => _cost = cost;   // strategy injected
    public decimal Total(Order o) => o.Subtotal + _cost.For(o);
}
```

*Over-use warning:* if there's exactly one algorithm and no real prospect of another, a plain method
is clearer than a strategy hierarchy.

### Observer (Behavioral)
**Intent:** let many subscribers react to a subject's changes without the subject knowing them.
**When to use:** one-to-many event notification — UI updates, domain events, pub/sub.

```javascript
class Subject {
  #observers = new Set();
  subscribe(fn) { this.#observers.add(fn); return () => this.#observers.delete(fn); }
  notify(event) { for (const fn of this.#observers) fn(event); }
}
const stock = new Subject();
const unsubscribe = stock.subscribe((e) => console.log('price:', e.price));
stock.notify({ price: 42 }); // every subscriber reacts
```

*Over-use warning:* deep chains of observers triggering observers make control flow impossible to
trace. For complex flows, prefer an explicit event bus with logging.

### Adapter (Structural)
**Intent:** wrap an incompatible interface so it fits the one your code expects.
**When to use:** integrating a third-party/legacy API without leaking its shape across your codebase.

```javascript
// Your code expects pay(amountCents). The vendor SDK speaks a different dialect.
class StripeAdapter {
  constructor(stripe) { this.stripe = stripe; }
  pay(amountCents) {
    return this.stripe.charges.create({ amount: amountCents, currency: 'usd' });
  }
}
const gateway = new StripeAdapter(stripeSdk); // rest of app depends on pay(), not Stripe
```

*Over-use warning:* don't adapt an interface you fully control — just change it. Adapters are for
boundaries you can't edit.

### Repository (Structural / DDD)
**Intent:** present persistence as an in-memory collection of domain objects, hiding the data store.
**When to use:** you want domain logic free of SQL/ORM detail and tests free of a real database.

```csharp
interface IUserRepository
{
    User? GetById(Guid id);
    void Add(User user);
}
// SqlUserRepository implements it with EF/Dapper; InMemoryUserRepository implements it for tests.
class UserService
{
    private readonly IUserRepository _users;
    public UserService(IUserRepository users) => _users = users;
}
```

*Over-use warning:* a repository that's a thin pass-through over an ORM that already gives you this
abstraction is duplication. Add it when domain logic or testability actually benefits.

### Dependency Injection (Behavioral / structural enabler)
**Intent:** supply a class's collaborators from outside instead of constructing them inside.
**When to use:** almost always for cross-cutting collaborators (repositories, clients, clocks) — it's
the practical form of the Dependency Inversion principle.

```csharp
class ReportService
{
    private readonly IClock _clock;
    private readonly IUserRepository _users;
    // Collaborators are injected -> easy to swap a fake clock/repo in tests.
    public ReportService(IClock clock, IUserRepository users)
    {
        _clock = clock;
        _users = users;
    }
}
```

*Over-use warning:* injecting trivial, stateless helpers (or wiring a full DI container into a tiny
script) adds ceremony. Inject what varies or needs faking; just `new` the rest.

## Common Pitfalls / Anti-patterns
- **Pattern-driven design:** forcing a pattern onto a problem that doesn't have its force, producing
  indirection nobody needs.
- **Golden-hammer Singleton:** global mutable state dressed as a pattern — hard to test, hides
  dependencies. Prefer DI with a single registered instance.
- **Naming without applying:** calling a class `XManager`/`XFactory` while it does none of the
  pattern's job, misleading readers.
- **Pattern soup:** five patterns where a function and a list would do.

## References
- Gamma, Helm, Johnson, Vlissides — *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF)
- Refactoring.Guru: Design Patterns — https://refactoring.guru/design-patterns
- Fowler, *Patterns of Enterprise Application Architecture* (Repository, others)

<!-- level: advanced -->
