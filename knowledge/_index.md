# Knowledge Base — Navigation Hub
> The map of omnistack-agent's knowledge. Start here to find a module, or to add one.

## How this knowledge base is organized
The knowledge base is a set of small, self-contained Markdown modules, one topic per file, grouped
into folders by domain (OOP, Languages, Frontend, Backend, Mobile, Databases, Architecture, DevOps,
Testing, Security, Documentation). Every module follows the same fixed template so any topic reads
the same way — concepts first, then best practices, real commented examples, the traps to avoid, and
authoritative references — and closes with a difficulty level. The build derives compact navigation
for lean adapters and embeds this index plus all modules in full adapters. This hub is the single
table of contents contributors and readers both rely on. To add knowledge, copy the template into the right
folder, write the module, and link it under its category here.

## Module template
Every knowledge module MUST follow this shape, in this order. Use real, commented examples,
authoritative references, and exactly one level: `beginner`, `intermediate`, or `advanced`.

```markdown
# <Topic>
> One-line summary + when this matters

## Concepts
## Best Practices
## Patterns & Examples
## Common Pitfalls / Anti-patterns
## References

<!-- level: beginner -->
```

## Modules by category

### OOP
The agent's specialization; use classes and objects when they fit the domain and language.
- [Classes, Objects & Attributes](oop/classes-objects-attributes.md) — the atoms of OOP; read this first.
- [The Four Pillars of OOP](oop/pillars.md) — encapsulation, abstraction, inheritance, polymorphism.
- [SOLID Principles](oop/solid.md) — five principles for changeable object-oriented code.
- [Design Patterns](oop/design-patterns.md) — a catalog of reusable solutions (GoF and beyond).

### Languages
Language-specific essentials; preserve each language's idioms.
- [C# Essentials](languages/csharp.md) — types, records, async/await, LINQ, null-safety.
- [JavaScript Essentials](languages/javascript.md) — modern JS, modules, async, and the footguns.
- [TypeScript Essentials](languages/typescript.md) — narrowing, boundary validation, strict configuration and domain states.
- [HTML & CSS Essentials](languages/html-css.md) — semantic HTML, the box model, Flexbox & Grid, a11y.

### Frontend
UI frameworks and patterns.
- [React](frontend/react.md) — components, props/state, hooks, composition, controlled inputs.

### Backend
Services and APIs.
- [API Design](backend/apis.md) — REST resources, verbs/status, versioning, validation, auth, idempotency.

### Mobile
Native vs cross-platform.
- [Cross-Platform Mobile](mobile/cross-platform.md) — React Native, Flutter, MAUI; offline, push, SQLite.

### Databases
Relational, non-relational, and data modeling.
- [Relational Databases](databases/relational.md) — tables, normalization, indexes, transactions, ACID.
- [Non-Relational Databases (NoSQL)](databases/non-relational.md) — document, key-value, wide-column, CAP.
- [Data Modeling](databases/modeling.md) — entities, relationships, cardinality, keys, ER diagrams.

### Architecture
Scalability and architectural patterns.
- [Scalability](architecture/scalability.md) — vertical vs horizontal, statelessness, caching, queues.
- [Architectural Patterns](architecture/patterns.md) — layered, hexagonal, MVC, monolith vs microservices.

### DevOps
CI/CD, infrastructure as code, deployment.
- [CI/CD](devops/ci-cd.md) — pipelines (lint→test→build→deploy), environments, IaC, rollbacks, secrets.

### Testing
Automated testing and manual QA.
- [Automated Testing](testing/automated.md) — the test pyramid, AAA, TDD, mocking, coverage as a signal.
- [Manual QA](testing/manual-qa.md) — exploratory testing, bug reports, regression checklists, a11y.

### Security
Secure-by-default practices.
- [Security Best Practices](security/best-practices.md) — OWASP Top 10, validation, secrets, least privilege.

### Documentation
Technical writing.
- [Technical Writing](documentation/technical-writing.md) — README, API docs, ADRs, runbooks; reader-first.

<!-- level: beginner -->
