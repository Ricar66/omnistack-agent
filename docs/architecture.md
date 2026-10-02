# Architecture

omnistack-agent authors instructions and engineering references once, then generates legacy adapters and modular skills. It is a prompt/reference library. Model execution, tools, permissions, and delegation belong to the host.

## Authored sources and generated output

```text
core/ + knowledge/ ────────────→ adapters/
          +
     workflows/ ──────────────→ packages/skills/<name>/
                                     SKILL.md
                                     references/
                                packages/manifest.json
```

- `core/` contains shared identity, principles, roles, workflow, interaction style, and guardrails. Numbered filenames determine assembly order.
- `knowledge/` contains reference modules; `_index.md` is the canonical navigation source.
- `workflows/` contains the four authored task skill bodies.
- `scripts/build.mjs`, `scripts/lib.mjs`, and `scripts/packages.mjs` generate deterministic output. Validation computes expected output and compares it with committed files.
- `adapters/` and `packages/` are generated and committed. Never edit them by hand.
- `examples/` and `scripts/demos.mjs` provide executable examples and contract checks.

Role descriptions guide one assistant. Installing four skills does not launch four independent agents.

## Payload choices

| Payload | Instructions | References |
| --- | --- | --- |
| Full legacy adapter | Complete core | Index and all modules inline |
| Lean legacy adapter | Complete core | Compact module map; content must be supplied separately |
| Legacy reference bundle | None | Index and all modules inline |
| Modular general skill | Complete core and task workflow | Packaged files linked from its entry |
| Modular focused skill | Task workflow and linked shared core | Selected packaged reference files |

The modular packages are `omnistack-agent`, `omnistack-debug`, `omnistack-code-review`, and `omnistack-security-review`. Each owns its references, so users can install one independently. Local reference links resolve inside the package rather than pointing to a clone the consumer may not have.

The host reads skill metadata for discovery, activates a skill according to its own behavior, and loads supporting files when relevant. Progressive packaging makes that possible; it does not prove that a particular model retrieved or used a file.

Legacy lean `knowledge/...` maps still identify source-repository modules. A map alone does not copy the files or grant GitHub access. `adapters/reference/knowledge.md` remains a knowledge-only bundle for supported uploads and filesystem access.

## Distribution and installation

`packages/manifest.json` lists package version, skill names, paths, and SHA-256 digests for the shipped skill files. It is generated without timestamps. The project-local installer validates packaged files, previews destinations, and refuses conflicting content.

The installer writes skills into `.claude/skills/`, `.github/skills/`, `.cursor/skills/`, or `.agents/skills/`, according to the selected platform. It does not overwrite existing project guidance or unrelated skill names. An installation receipt records its files so unchanged installations can be recognized or removed. Changed or unmanaged installations need manual resolution.

The npm distribution contains the installer CLI and generated packages. A local `npm pack --ignore-scripts` creates an archive without publishing to a registry. CI retains its Linux / Node 22 archive as the `omnistack-agent-installer` artifact for 14 days after successful checks. Artifact availability depends on an actual successful workflow run.

## Size and compatibility

Keep core around **5,800 characters** as an editorial target, rather than an enforced source ceiling. The Custom GPT legacy adapter has an **8,000-character project budget** for its complete rendered output, counted as Unicode code points. This budget does not establish a universal host limit.

Modular skill entries use standard discovery metadata and link to supporting files; they do not embed the entire reference library. Generated skill frontmatter precedes the body. The Claude subagent preserves `model: inherit`.

Original adapter paths remain available. Formats and installation details are documented in [platforms.md](platforms.md).

## Verification boundaries

```bash
npm run build
npm run check
npm run demo
```

The build validates authored source contracts before generating output. Checks cover module headings and difficulty, index coverage, target paths and budgets, packaged links and digests, installer behavior, drift, and executable examples. `npm run check` does not rebuild files; stale output stays visible.

Legacy frontmatter values are checked as strings or null. The modular package generator has its own metadata and reference contracts. Neither check implies that every host supports every adapter.

CI runs on Linux and Windows with Node 18 and 22. Tests establish behavior within their fixtures and environments. The demonstrations reproduce initial defects or missing feature behavior and verify maintainer-authored solutions. Model-response quality requires separate [recorded evaluations](evaluation.md).

## Extending the project

For a reference module, follow [adding-knowledge.md](adding-knowledge.md). For an adapter, define its target in `scripts/lib.mjs`. For a modular skill, add a workflow and package definition with its relevant references, tests, and actual host-installation instructions.

Consult official format documentation before claiming support. Regenerate and check both output trees, preserve existing consumers' paths, and commit source together with generated files.
