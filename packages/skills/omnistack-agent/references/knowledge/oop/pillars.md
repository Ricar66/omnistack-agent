# The Four Pillars of OOP
> Encapsulation, Abstraction, Inheritance, Polymorphism — the ideas every other OOP technique is built on. Reach for this when deciding how objects should relate.

## Concepts
- **Encapsulation:** hide internal state behind behavior. The object owns its data and guards its
  invariants; callers ask it to *do* things, they don't reach in and mutate fields. This is what
  makes change safe — you can rework the internals without breaking callers.
- **Abstraction:** model the essential, hide the rest. An interface or abstract type names *what*
  an object does, not *how*. Callers depend on the concept (`PaymentGateway`), not the mechanism
  (`StripeHttpClient`).
- **Inheritance (is-a):** a subtype specializes a base type and inherits its contract. Use it only
  when the subtype genuinely *is* a kind of the base and can stand in for it everywhere (see LSP in
  `solid.md`). It is the tightest coupling in OOP — handle with care.
- **Polymorphism:** one interface, many implementations. *Subtype* polymorphism lets a caller treat
  different concrete types uniformly through a shared abstraction; *parametric* polymorphism
  (generics) lets one piece of code work over many types safely. Program to the abstraction and the
  right behavior is selected at runtime.

## Best Practices
- Encapsulate first: make fields private, expose intent-revealing methods, return copies of mutable
  internals.
- Depend on abstractions (interfaces/abstract classes), not concrete types, at module boundaries.
- **Favor composition over inheritance.** Reach for inheritance only for true is-a relationships
  with a stable base contract; reach for composition (has-a) to share behavior.
- Keep inheritance shallow. Every level multiplies the assumptions a subtype must honor.

## Patterns & Examples

Polymorphism — the same call site drives different behavior per concrete type.

```csharp
// C#: subtype polymorphism through an abstract base.
public abstract class Shape
{
    public abstract double Area();
}

public sealed class Circle : Shape
{
    private readonly double _r;
    public Circle(double r) => _r = r;
    public override double Area() => Math.PI * _r * _r;
}

public sealed class Square : Shape
{
    private readonly double _side;
    public Square(double side) => _side = side;
    public override double Area() => _side * _side;
}

// Caller never branches on type — it just asks each Shape for its Area().
double TotalArea(IEnumerable<Shape> shapes) => shapes.Sum(s => s.Area());
```

```javascript
// JavaScript: same polymorphism via a shared method contract (duck typing).
class Circle {
  constructor(r) { this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}

class Square {
  constructor(side) { this.side = side; }
  area() { return this.side ** 2; }
}

// Works for anything that responds to area() — no shared base class required.
const totalArea = (shapes) => shapes.reduce((sum, s) => sum + s.area(), 0);
```

## Common Pitfalls / Anti-patterns
- **Deep inheritance trees:** four levels deep, a change to the base silently breaks a leaf you
  forgot existed. Depth makes behavior hard to trace and brittle to change.
- **Inheritance for code reuse:** subclassing just to grab a few methods couples you to the base's
  entire contract and lifecycle. If the relationship isn't honestly *is-a*, use composition — hold
  the helper as a field and delegate to it.
- **Leaky abstraction:** an interface that exposes implementation details (a `getSqlConnection()` on
  a "repository") forces callers to know the mechanism, defeating the point.
- **Type-checking instead of polymorphism:** `if (shape instanceof Circle) ...` re-implements the
  dispatch the language would do for you. Push the behavior onto the type.

## References
- C# docs: Inheritance and polymorphism — https://learn.microsoft.com/dotnet/csharp/fundamentals/object-oriented/inheritance
- MDN: Object-oriented programming concepts — https://developer.mozilla.org/docs/Learn/JavaScript/Objects
- Gamma et al., *Design Patterns* — "Favor object composition over class inheritance"

<!-- level: intermediate -->
