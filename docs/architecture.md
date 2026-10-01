# Architecture

omnistack-agent authors instructions once and generates per-platform files. It is a prompt and reference library, not a model runtime, tool server, or multiagent orchestrator.

## Source and generated output

```text
core/ + knowledge/ → scripts/build.mjs → adapters/
                           ↓
                     source contracts
                           ↓
                  scripts/validate.mjs
```

- `core/` contains numbered Markdown files for identity, principles, roles, workflow, interaction style, and guardrails. Filename order determines assembly order.
- `knowledge/` contains domain modules and `_index.md`, the canonical navigation source.
- `scripts/lib.mjs` defines targets and assembly functions. The build writes generated files; validation computes the expected output and compares it with committed files.
- `adapters/` is generated and committed so consumers can install without Node or a build step.
- `examples/` contains executable code and manual evaluation scenarios.

Role descriptions guide one assistant's behavior. Actual tools, model selection, permissions, and delegation support come from the host platform.

## Payload modes

| Payload | Core instructions | Knowledge |
| --- | --- | --- |
| Full instruction adapter | Complete core | Index and all modules inline |
| Lean instruction adapter | Complete core | Compact category/module map |
| Reference bundle | None | Index and all modules inline |

The reference target writes `adapters/reference/knowledge.md` with `includeCore: false`. It is reference content for uploads or filesystem access, rather than another instruction persona.

Lean maps omit contributor templates and module descriptions. Their `knowledge/...` paths identify modules in the source repository. Copying a map does not copy those files or give an assistant access to GitHub. A user can attach the reference bundle or make source files accessible in the project; otherwise the assistant must acknowledge the missing reference. Full adapters include modules in the same file, and their index links serve as conceptual navigation.

## Size and compatibility

Keep the core around **5,800 characters** as an editorial target; the generator does not enforce a separate core-size ceiling. The Custom GPT target has an **8,000-character project budget** for its complete rendered file, counted as Unicode code points. The enforced target budget leaves room for its compact index and generated header; it does not assert a universal host limit.

The original instruction adapter paths remain available. Lean `adapters/claude/CLAUDE.md` and `adapters/windsurf/AGENTS.md` provide smaller installation options. Claude skill/subagent and Cursor adapters still embed full knowledge in this iteration; no separate on-demand reference package is generated for them.

Claude skill and agent frontmatter appears at the beginning of the file. The subagent uses `model: inherit`. Installation details and official platform references are in [platforms.md](platforms.md).

## Validation and drift detection

The generator validates the authored inputs and target contracts before accepting output:

- Index links resolve to registered knowledge modules, with complete module coverage.
- Modules contain required sections and a valid difficulty marker.
- Target names, output paths, modes, frontmatter value types, and configured size budgets satisfy their contracts.
- Generated output matches its source deterministically.

The source check accepts frontmatter values only as strings or null. It does not parse YAML syntax or validate YAML delimiters; tests cover the generated variants.

Generated files include a header and content hash. `npm run validate` checks the expected rendered files against disk, including missing files and byte differences. A matching hash alone is not the completion check.

```bash
npm run build
npm run check
```

`npm run build` writes the adapters. `npm run check` runs tests and validation without writing new adapters, so drift remains visible. CI uses the same checks on Node 18 and 22 across Linux and Windows.

Unit and integration tests check assembly, invalid inputs, drift detection, and the executable example. They do not measure whether an LLM follows the instructions well; use [the evaluation guide](evaluation.md) for that separate question.

## Adding a platform

1. Add a target definition in `scripts/lib.mjs`: unique name, output path under `adapters/`, `full` or `lean` mode, and optional frontmatter or size budget.
2. Specify whether it includes core instructions. A knowledge-only target must remain clearly labeled as reference content.
3. Add tests for the target's format and constraints.
4. Run `npm run build`, then `npm run check`.
5. Document actual installation and reference availability in [platforms.md](platforms.md) and both READMEs.
6. Commit the definition and generated files together.

Consult the platform's official format documentation before adding support. Preserve existing user guidance during installation; generated files should be reviewed and merged into a consumer's project, rather than blindly replacing its instructions.
