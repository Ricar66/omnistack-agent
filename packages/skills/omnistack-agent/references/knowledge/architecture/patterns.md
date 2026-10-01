# Architectural Patterns

> The handful of structures most systems are built from — each with the problem it solves and the price it charges. Pick by trade-off, not fashion.

## Concepts

- **Layered (n-tier):** organize code into horizontal layers (presentation → application → domain →
  data), each depending only on the one below. The default for most CRUD applications.
- **Hexagonal (ports & adapters):** the domain sits in the center and talks to the outside world only
  through *ports* (interfaces); *adapters* implement those ports for a specific DB, UI, or queue.
  Keeps business logic independent of frameworks and easy to test.
- **MVC (Model-View-Controller):** separate data (Model), rendering (View), and request handling
  (Controller). The backbone of most web frameworks.
- **Modular monolith vs. microservices:** one deployable with strong internal module boundaries, vs.
  many independently deployable services. Same logical decomposition; different deployment cost.
- **Event-driven:** components communicate by publishing/subscribing to events instead of calling each
  other directly. Decouples producers from consumers and enables async, reactive flows.

## Best Practices

- **Start with a modular monolith.** Get the module boundaries right in-process first; extract a
  service only when a module needs independent scaling, deployment, or ownership.
- Keep dependencies pointing inward — toward the domain — in any layered or hexagonal design.
- Define explicit contracts at every boundary (interfaces, event schemas, API specs).
- Match the pattern to the team and the load, not to a conference talk.

## Patterns & Examples

| Pattern | Intent (1 line) | Fits when | Main trade-off |
|---|---|---|---|
| **Layered** | Stack responsibilities top-to-bottom | Standard CRUD apps, clear request flow | Can ossify into anemic, leaky layers |
| **Hexagonal** | Isolate domain behind ports & adapters | Logic must outlive frameworks; high testability | More indirection/boilerplate up front |
| **MVC** | Split data, view, request handling | Web/UI apps on a framework | "Fat controllers" if domain leaks in |
| **Modular monolith** | One deploy, strong module seams | Most teams/products early on | Shared failure & deploy unit |
| **Microservices** | Independently deployable services | Independent scaling/ownership at scale | Network latency, ops & data complexity |
| **Event-driven** | Communicate via published events | Async workflows, decoupled producers | Hard to trace; eventual consistency |

```text
Hexagonal (ports & adapters):

      [ HTTP adapter ]   [ CLI adapter ]
              \              /
            ( inbound ports )
                   │
            ┌──────────────┐
            │   Domain     │   ← framework-free business logic
            └──────────────┘
                   │
            ( outbound ports )
              /            \
     [ SQL adapter ]   [ Queue adapter ]
```

## Common Pitfalls / Anti-patterns

- **Microservices too early:** distributed-systems pain (latency, partial failure, data consistency)
  before you have the scale or team to justify it.
- **Big ball of mud:** no enforced boundaries, everything reaches into everything — the absence of a
  pattern.
- **Layer-cake leakage:** SQL or framework types bleeding up into the domain, so "layered" is a lie.
- **Event spaghetti:** events firing events firing events with no map of the flow — debugging becomes
  archaeology. Document the event choreography.

## References

- Fowler, *Patterns of Enterprise Application Architecture* — https://martinfowler.com/eaaCatalog/
- Cockburn — Hexagonal Architecture — https://alistair.cockburn.us/hexagonal-architecture/
- Microsoft: .NET microservices architecture — https://learn.microsoft.com/dotnet/architecture/microservices/

<!-- level: intermediate -->
