# Manual QA

> Human testing for the things automation can't judge — usability, exploratory edge cases, and "does this actually feel right." A complement to automated tests, never a replacement.

## Concepts

- **When manual QA matters:** judging visual/UX quality, exploring undocumented edge cases,
  one-off release sign-off, and verifying behavior that's expensive or not-yet-worth automating.
- **Exploratory testing:** simultaneously learning the system, designing tests, and running them —
  following hunches a scripted test wouldn't. Time-boxed and charter-driven, not random clicking.
- **Test case:** a documented scenario — preconditions, steps, expected result — so anyone can
  reproduce a check the same way.
- **Bug report:** the artifact that gets a defect fixed. Must contain clear **repro steps**,
  **expected vs. actual**, environment, and a **severity** (how bad) distinct from priority (how soon).
- **Regression checklist:** the set of critical flows you re-verify before every release to catch
  things a change may have broken elsewhere.

## Best Practices

- Write bug reports a developer can act on without asking questions: minimal steps, exact inputs,
  expected vs. actual, screenshots/logs, build/version, platform.
- Separate **severity** (impact) from **priority** (urgency) — a cosmetic bug on the login page can be
  low severity but high priority.
- Keep a living regression checklist of business-critical paths; run a smoke pass every release.
- Cover **accessibility** (keyboard nav, labels, contrast) and a **cross-browser/device** smoke as
  part of QA, not a separate afterthought.
- Automate what's repetitive and stable; reserve human time for judgment and exploration.

## Patterns & Examples

```text
BUG REPORT — Checkout total ignores discount code
-------------------------------------------------
Severity:    High        Priority: P1
Environment: Web · Chrome 124 · build 2026.6.1 · staging

Steps to reproduce:
  1. Add any item to the cart.
  2. Enter discount code SAVE10 and click "Apply".
  3. Proceed to the order summary.

Expected: Order total is reduced by 10%.
Actual:   "SAVE10 applied" shows, but the total is unchanged.

Evidence: screenshot attached; network tab shows discount=0 in /checkout response.
```

```text
RELEASE REGRESSION CHECKLIST (smoke)
  [ ] Sign up / log in / log out
  [ ] Core happy path (e.g., add to cart → pay → receipt)
  [ ] Search returns expected results
  [ ] Forms validate and show errors
  [ ] Keyboard-only nav reaches all controls (a11y)
  [ ] Renders on Chrome, Firefox, Safari + one mobile width
```

## Common Pitfalls / Anti-patterns

- **Manually testing what should be automated:** re-clicking a stable, deterministic flow every
  release wastes human time and is less reliable than a script. Automate it; explore elsewhere.
- **Vague bug reports:** "it's broken" / "doesn't work" with no steps — un-actionable, bounces back
  and forth, delays the fix.
- **No environment/version:** a bug that "can't be reproduced" because the report omitted the build,
  browser, or data state.
- **QA as a gate at the very end:** treating quality as a final phase instead of testing continuously
  guarantees a crunch and missed defects.

## References

- ISTQB Foundation syllabus — https://www.istqb.org/
- Bach — Exploratory Testing Explained — https://www.satisfice.com/download/exploratory-testing-explained
- WCAG 2.2 (accessibility) — https://www.w3.org/WAI/WCAG22/quickref/

<!-- level: beginner -->
