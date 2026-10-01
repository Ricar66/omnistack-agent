![omnistack-agent](assets/banner.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) · ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) · ![Platforms](https://img.shields.io/badge/platforms-ChatGPT%20%C2%B7%20Claude%20%C2%B7%20Copilot%20%C2%B7%20Gemini%20%C2%B7%20Cursor%20%C2%B7%20Windsurf%20%C2%B7%20Generic-blue.svg)

**[🇧🇷 Ler em Português](README.pt-BR.md)**

## What is this

**omnistack-agent** is an open-source collection of instructions and software-engineering references for AI assistants. A single source (`core/` + `knowledge/`) generates adapters for several platforms using a tested Node script with no npm dependencies.

It gives one assistant twelve engineering roles. It does not run an independent multiagent system or grant tools, permissions, or access to your files.

- **Software Architect** — boundaries, trade-offs, and architecture decisions.
- **Full Stack Developer** — features across UI, APIs, and data.
- **Mobile Developer** — native and cross-platform apps.
- **Backend Engineer** — services, domain logic, and data integrity.
- **Frontend Engineer** — accessible interfaces and predictable state.
- **Database Administrator** — schemas, indexes, migrations, and tuning.
- **DevOps Engineer** — CI/CD, infrastructure, deployments, and rollback.
- **QA Engineer** — test strategy, regression checks, and bug reports.
- **Security Engineer** — trust boundaries, threats, and secure defaults.
- **Code Reviewer** — actionable findings supported by file and line evidence.
- **Technical Writer** — READMEs, API references, and architecture guides.
- **Software Mentor** — explanations with examples you can run.

The instructions encourage proportional changes, evidence before conclusions, respect for existing project conventions, and explicit handling of missing tools or information. Object-oriented design is an available approach; choose abstractions that fit the problem.

## How to use

The adapters are already generated and committed. You do not need Node or a build step to use them. Review the instructions and merge them with any existing project guidance before installation.

| Platform | Adapter | Installation |
| --- | --- | --- |
| **ChatGPT** (Custom GPT, where available) | [custom-gpt-instructions.md](adapters/chatgpt/custom-gpt-instructions.md) | Paste the lean file into **Instructions**. Optionally upload [knowledge.md](adapters/reference/knowledge.md) as reference knowledge. |
| **Claude Code** (project guidance) | [CLAUDE.md](adapters/claude/CLAUDE.md) | Merge the lean instructions into your project’s `CLAUDE.md`. |
| **Claude Code** (subagent) | [agent.md](adapters/claude/agent.md) | Save in `.claude/agents/`. Its model setting inherits your session’s model. |
| **Claude Code** (skill) | [SKILL.md](adapters/claude/SKILL.md) | Save as `.claude/skills/omnistack-agent/SKILL.md`; invoke `/omnistack-agent`. This variant includes the full knowledge. |
| **GitHub Copilot** | [copilot-instructions.md](adapters/copilot/copilot-instructions.md) | Merge into `.github/copilot-instructions.md`. |
| **Gemini** (Gem, where available) | [gem-instructions.md](adapters/gemini/gem-instructions.md) | Paste into **Instructions**. Optionally add [knowledge.md](adapters/reference/knowledge.md) under **Knowledge**. |
| **Cursor** | [AGENTS.md](adapters/cursor/AGENTS.md) | Merge into your project’s root `AGENTS.md`. This variant includes the full knowledge. |
| **Windsurf / Cascade** | [AGENTS.md](adapters/windsurf/AGENTS.md) | Merge the dedicated lean adapter into your project’s root `AGENTS.md`. |
| **API / other LLMs** | [system-prompt.md](adapters/generic/system-prompt.md) | Use the instruction interface supported by your provider, within its context limits. This variant includes the full knowledge. |

**Lean** includes core instructions and a module index. The index is a map, not the module contents: references are usable only when attached or accessible in your project. **Full** includes the complete knowledge inline and costs more context. The Custom GPT adapter has a project budget of **8,000 characters**, not a universal platform limit.

See [the installation guide](docs/platforms.md) for existing-file safety, reference setup, Claude `AGENTS.md` compatibility, and the full API variants.

## Examples and evaluation

[Examples](examples/README.md) include an executable account example and [manual evaluation scenarios](examples/evaluation-cases.md) covering debugging, features, security, reviews, version checks, architecture, unavailable tools, and money boundaries.

The scenarios are test inputs and expected evidence, not recorded AI responses or measured quality claims. Use the [evaluation guide](docs/evaluation.md) to compare prompts under the same model and tool setup. Automated checks validate repository contracts and executable examples; they do not establish the quality of model responses.

## How to contribute

> Edit `core/`, `knowledge/`, or the build scripts to change generated output. Never edit `adapters/` by hand.

1. Change the source. Register new modules in `knowledge/_index.md`.
2. Regenerate the adapters with `npm run build`.
3. Run `npm run check` for tests and validation.
4. Commit source and regenerated output together, then open a pull request.

`npm run check` does **not** rebuild adapters, so it catches committed output that has drifted from the source. Node **≥ 18** is required for contributor commands; no npm installation is needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [adding knowledge](docs/adding-knowledge.md) for the module template.

## Repository structure

```text
core/        # Authored identity, roles, workflow, style, and guardrails
knowledge/   # Authored reference modules and their index
adapters/    # Generated instructions and knowledge bundle
scripts/     # Dependency-free build, validation, and tests
examples/    # Executable example and manual evaluation scenarios
docs/        # Installation, architecture, contribution, and evaluation guides
assets/      # Banner and static media
```

## Next improvements

The [improvement plan](docs/improvement-plan.md) tracks the current changes and candidates for later work: TypeScript and more domain modules, platform reference packages, and recorded model evaluations. Changes should follow evidence from real use.

## License

Released under the **MIT License**. See [LICENSE](LICENSE).
