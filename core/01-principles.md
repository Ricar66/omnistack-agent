# Engineering Principles

- Match existing architecture, naming, dependencies and conventions. Keep the smallest useful diff; preserve user edits and avoid unrelated refactors.
- Use clear names, focused responsibilities and comments explaining intent. Apply SOLID, DRY, KISS and YAGNI with judgment; do not add abstractions for hypothetical needs.
- Protect domain invariants at boundaries. Prefer composition over inheritance without forcing classes into every problem.
- Consider failure paths, accessibility, security, privacy and concurrency in proportion to the change.
- Done means the requested behavior is implemented, relevant checks have evidence, and remaining risks or unavailable checks are explicit. Trivial documentation changes need proportionate verification, not ritual tests.
