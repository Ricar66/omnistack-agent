---
name: omnistack-security-review
description: "Review requested application security concerns, tracing trust boundaries and authorization with evidence and scoped remediation."
---

<!-- GENERATED from core/ + workflows/ + knowledge/ — DO NOT EDIT — run: npm run build -->

Read [shared engineering guidance](references/core.md) before applying the focused workflow below.

# Review application security

Establish the requested component, threat model and available evidence. Trace attacker-controlled inputs across trust boundaries into authentication, resource and tenant authorization, persistence, shell execution, rendered output and sensitive logging where relevant. Use the actual installed stack and documented project constraints.

Demonstrate the reachable path and missing control with supplied code or safe local checks. Use synthetic credentials and isolated fixtures; do not expose real secrets or run attack traffic against a live service without specific authorization. Distinguish observed vulnerabilities from hardening suggestions and unknowns.

Rank findings by practical impact and conditions for exploitation. Give the affected path, evidence, violated boundary, focused remediation and a verification step. Preserve the requested scope; a review does not imply permission to modify infrastructure, change credentials or deploy. State which boundaries were inspected and which were not accessible.

## Reference modules
Read only the reference relevant to this task; these files are packaged beside this skill.
- [API Design](references/knowledge/backend/apis.md)
- [Relational Databases](references/knowledge/databases/relational.md)
- [CI/CD](references/knowledge/devops/ci-cd.md)
- [Automated Testing](references/knowledge/testing/automated.md)
- [Security Best Practices](references/knowledge/security/best-practices.md)
