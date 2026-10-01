# Technical Writing

> Documentation is part of the software, not an afterthought. Good docs are audience-first, task-oriented, and live next to the code — done when a newcomer can succeed without asking you.

## Concepts

- **The standard doc set:**
  - **README** — what the project is, how to install and run it, the first task. The front door.
  - **API reference** — every endpoint/function: parameters, return shape, errors, an example call.
  - **ADRs (Architecture Decision Records)** — short, dated records of *why* a significant decision
    was made, the options considered, and the consequences.
  - **Runbooks** — step-by-step operational procedures for on-call: how to deploy, roll back, and
    respond to common incidents.
- **Audience-first writing:** write for the specific reader (new contributor, integrator, on-call
  engineer) and what *they* need to do — not for yourself.
- **Task-oriented structure:** organize around what the reader wants to accomplish ("Deploy to
  staging"), with the goal first, then numbered steps, then reference detail.
- **Docs next to code:** keep documentation in the repo, versioned with the code it describes, so it
  changes in the same PR and can't silently drift.

## Best Practices

- Lead with the goal and the answer; put background and edge cases *after*, not before.
- Show, don't just tell — every concept gets a copy-pasteable, working example.
- Write the smallest doc that lets the reader succeed; delete or update stale content ruthlessly.
- Update docs in the same commit/PR as the code change that affects them.
- Use plain language, active voice, and consistent terms; define a term once and reuse it.

## Patterns & Examples

```markdown
# OrderService

> Creates and queries customer orders. Use it from the checkout flow.

## Quickstart
    npm install
    npm run dev          # API on http://localhost:3000

## Create an order  (task-oriented)
1. POST `/v1/orders` with a JSON body `{ items: [...] }`.
2. On success you get `201 Created` and the order's `id`.

    curl -X POST localhost:3000/v1/orders \
      -H 'Content-Type: application/json' \
      -d '{"items":[{"sku":"BOOK-01","qty":2}]}'

Returns: `{ "id": 43, "status": "pending", "totalCents": 3998 }`
```

```markdown
# ADR 0007: Use PostgreSQL for the primary store
Date: 2026-06-03 · Status: Accepted

## Context
We need transactional integrity for orders and payments.

## Decision
Adopt PostgreSQL (over MongoDB) for ACID transactions and relational integrity.

## Consequences
+ Strong consistency for money flows.  − Team must manage schema migrations.
```

**The done test:** documentation is finished when a newcomer can follow it to success — install, run,
and complete the primary task — *without asking the author*. If they get stuck, the doc has the bug.

## Common Pitfalls / Anti-patterns

- **Stale docs:** instructions that no longer match the code. Worse than no docs — they actively
  mislead. Update them in the same PR.
- **Author-centric writing:** documenting what you find interesting instead of what the reader needs to
  do. Start from the reader's task.
- **Wall of prose:** burying the one command someone needs under paragraphs of background. Lead with
  the answer.
- **Docs detached from code:** a separate wiki that drifts out of sync. Keep docs in the repo.

## References

- Google Technical Writing courses — https://developers.google.com/tech-writing
- Write the Docs — https://www.writethedocs.org/guide/
- Architecture Decision Records (Nygard) — https://adr.github.io/

<!-- level: beginner -->
