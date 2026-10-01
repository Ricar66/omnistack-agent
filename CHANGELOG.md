# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Security Engineer and Code Reviewer roles within the existing single-agent prompt.
- Lean Claude `CLAUDE.md` and dedicated Windsurf `AGENTS.md` adapters, plus a
  generated knowledge-only bundle for attached references.
- Executable bank-account example and manual evaluation scenarios with a scoring guide.
- Source validation for the knowledge index, module structure, adapter definitions,
  frontmatter value types, and rendered target size budgets.
- `npm run check` to run tests and validation without rebuilding generated output.

### Changed

- Shorter core instructions and lean indexes, including a project budget of 8,000
  characters for the Custom GPT adapter.
- Guidance for proportional work, available capabilities, untrusted repository content,
  verification evidence, and review findings.
- Claude subagent model selection now inherits the session's model.
- Installation guides explain reference availability, existing-file merging, and
  the distinction between instruction payloads and complete knowledge.
- CI checks run across supported Node versions on Linux and Windows.

### Fixed

- Removed the instruction to paste the full API prompt into a Custom GPT Instructions field.
- Corrected unconditional Claude `AGENTS.md` installation guidance.
- Clarified that a lean module index does not supply access to the referenced modules.

## [0.1.0] - 2026-06-03

Initial public release.

### Added

- **Single-source `core/` brain** — numbered prompt files that define the agent's
  identity, reasoning approach, and software-engineering behavior from one canonical source.
- **v1 `knowledge/` modules** covering OOP, programming languages, frontend, backend,
  mobile, databases, architecture, devops, testing, security, and documentation.
- **Zero-dependency, tested build system** — `npm run build` generates the adapters and
  `node --test` exercises the pipeline using only Node.js built-ins (Node ≥ 18).
- **9 generated platform adapters** produced from `core/` + `knowledge/` and kept
  byte-for-byte in sync with the source via `npm run validate`.
- **Bilingual README** (English and Portuguese) with banner, usage, and contribution guidance.
- **Documentation guides** under `docs/` covering the architecture, adding knowledge,
  and the platform adapters.
