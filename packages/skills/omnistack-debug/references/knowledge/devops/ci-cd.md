# CI/CD

> Automate the path from a commit to running software, so every change is built, tested, and shipped the same safe way. The pipeline is the team's quality ratchet.

## Concepts

- **Continuous Integration (CI):** every push is automatically built and tested against the main
  branch, catching breakage within minutes instead of at release.
- **Continuous Delivery / Deployment (CD):** *delivery* keeps the main branch always deployable with a
  one-click release; *deployment* takes it further and ships every green build automatically.
- **Pipeline stages:** a typical flow is **lint → test → build → deploy**, each gating the next — a
  failing stage stops the line.
- **Environments:** promote the same artifact through `dev → staging → production`; never rebuild per
  environment, only re-configure.
- **Infrastructure as Code (IaC):** define servers, networks, and services in version-controlled files
  (Terraform, Bicep, CloudFormation) so infra is reproducible, reviewable, and rebuildable — not
  hand-clicked in a console.
- **Rollbacks:** every deploy must be reversible — redeploy the previous artifact, or use blue-green /
  canary so a bad release affects few or no users.
- **Secrets handling:** inject credentials at deploy time from a secret store / CI secrets, never
  committed to the repo.

## Best Practices

- Keep the pipeline fast — minutes, not hours — or people route around it.
- Build the artifact once, then promote that exact artifact through environments.
- Fail fast: cheap checks (lint, unit tests) before slow ones (e2e, deploy).
- Make rollback a tested, one-command operation, not a fire drill.
- Store secrets in the platform's secret manager; reference them, never hardcode.

## Patterns & Examples

```yaml
# .github/workflows/ci.yml — a minimal lint → test → build pipeline on every push/PR.
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint          # fail fast on style/static errors
      - run: npm test              # then the test suite
      - run: npm run build         # then produce the deployable artifact
```

```text
Promote one artifact; never rebuild per environment:

  commit ──CI──> [artifact v123] ──> dev ──> staging ──(approve)──> production
                                                            └─ rollback = redeploy v122
```

## Common Pitfalls / Anti-patterns

- **Rebuilding per environment:** building separately for staging and prod means you ship something
  you never tested. Build once, promote the same artifact.
- **Secrets in the repo:** API keys committed to Git (even in history) are compromised. Use a secret
  manager and rotate.
- **Slow, flaky pipelines:** long or randomly-failing runs erode trust until people `--no-verify` and
  merge anyway.
- **No rollback plan:** "roll forward only" turns a bad deploy into an outage. Make reverting trivial.

## References

- GitHub Actions documentation — https://docs.github.com/actions
- Fowler — Continuous Integration — https://martinfowler.com/articles/continuousIntegration.html
- Terraform documentation — https://developer.hashicorp.com/terraform/docs

<!-- level: intermediate -->
