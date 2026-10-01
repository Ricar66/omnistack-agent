# Improvement Plan

The first iteration strengthened the existing single-assistant instructions. The next iteration adds modular skills, project-local installation, and repeatable engineering demonstrations.

## First iteration: delivered

- Compact core with twelve roles, including Security Engineer and Code Reviewer.
- Proportional workflows, trust boundaries, capability limits, and evidence-based reporting.
- Integer-cent examples and failed-operation boundaries.
- Lean Claude project guidance, dedicated Windsurf guidance, and a reference-only bundle.
- Source, adapter, budget, and drift checks; `npm run check`.
- An executable account example, eight manual evaluation scenarios, and bilingual guides.

Verification recorded on 2026-10-01: all 34 tests and validation passed on Windows / Node 25.9.0; all three original test files and validation passed on Windows / Node 18.12.1. All 12 adapter outputs matched their source, and the lean Custom GPT output used 7,316 of its 8,000-character project budget. Independent review led to documentation and Node 18 test-hook corrections.

Those counts describe the first iteration; new modules and tests may change them. SQL, C#, and pg/argon2 login snippets remain illustrative. No live LLM evaluation was run in that iteration.

## Second iteration: implementation and acceptance

| Change | Required evidence |
| --- | --- |
| Four modular skills with local references | Metadata, relative links, independent package contents, deterministic generation, and drift checks |
| Project-local installer and removal | Preview without writes, refused conflicts, idempotence, preserved project guidance, unchanged receipt-based removal |
| TypeScript reference module | Official sources, source/index validation, and generated output |
| Three runnable demonstrations | Initial failure reproduced and maintainer solution checked for each fixture |
| Shorter path to first use | English/PT READMEs, copyable commands, platform destinations, and honest evidence labels |
| Downloadable installer archive | Local archive inspected/exercised; successful CI artifact rather than assumed registry publication |

Local acceptance completed on 2026-10-01:

- `npm run check` on Windows / Node 25.9.0: 69 tests passed, zero failures or skips, distribution validation passed, and all three demonstrations reproduced their initial failures and verified their solutions.
- Node 18.12.1: all seven test files, distribution validation, and demos passed. This older test reporter aggregates results by file; its seven reported tests are not a count of the internal cases.
- All twelve legacy adapters and four modular packages match their authored sources. All four entries passed the Agent Skills metadata validator.
- The archive was packed, inspected, installed offline into a temporary npm consumer, and exercised through its registered command and extracted CLI: preview, installation, no-op repetition, and unchanged removal passed.
- Separate reviewers approved installer/packaging runtime and docs/demos/recorded responses. Neither reviewer approved files they authored.
- [Two recorded Codex review trials](evaluation-runs/2026-10-01/README.md) retain actual prompts and responses: a file-reading policy block and a supplied-text review. One task with different context is not a comparative benchmark.

The pull request adds Linux/Windows × Node 18/22 checks and a downloadable archive artifact. Remote CI results belong in the pull request; local passing checks do not imply publication on npm or a released GitHub version.

## Evaluation work remains separate

The eight [manual scenarios](../examples/evaluation-cases.md) and the [capture template](evaluation.md#capture-a-real-run) support comparable trials. A measured improvement claim requires saved actual responses, model/platform details, fixed tools and references, repetitions where needed, and independent scoring.

Prioritize future reference modules and host support from recurring user needs. Collect installation problems and reproducible assistant failures through the expanded issue template. Demonstrations and passing build checks do not guarantee more GitHub stars or performance across all models.
