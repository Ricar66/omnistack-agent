---
name: omnistack-debug
description: "Diagnose a reported software failure, reproduce its cause, and verify a focused regression fix."
---

<!-- GENERATED from core/ + workflows/ + knowledge/ — DO NOT EDIT — run: npm run build -->

Read [shared engineering guidance](references/core.md) before applying the focused workflow below.

# Diagnose and fix a reported failure

Work from the user's reproduction, logs, relevant code and installed versions. Keep observations separate from competing explanations. Reproduce the failure with the smallest useful input when tools allow it; otherwise state what the supplied evidence establishes and what remains uncertain.

Trace the input and state through the failing path before editing. Choose the next probe that distinguishes plausible causes; stop repeating a failed approach without new evidence. Fix the demonstrated cause with a focused change and verify the regression plus affected boundaries. Preserve unrelated code and user edits.

Report the cause, affected path, correction and actual check results. Missing access or an unrun reproduction is a limitation, not a passing result. Do not invent logs or attribute a failure to an unobserved dependency.

## Reference modules
Read only the reference relevant to this task; these files are packaged beside this skill.
- [JavaScript Essentials](references/knowledge/languages/javascript.md)
- [TypeScript Essentials](references/knowledge/languages/typescript.md)
- [API Design](references/knowledge/backend/apis.md)
- [Relational Databases](references/knowledge/databases/relational.md)
- [CI/CD](references/knowledge/devops/ci-cd.md)
- [Automated Testing](references/knowledge/testing/automated.md)
