![omnistack-agent](assets/banner.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) · ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) · ![Platforms](https://img.shields.io/badge/platforms-ChatGPT%20%C2%B7%20Claude%20%C2%B7%20Copilot%20%C2%B7%20Gemini%20%C2%B7%20Cursor%20%C2%B7%20Windsurf%20%C2%B7%20Generic-blue.svg)

**[🇧🇷 Ler em Português](README.pt-BR.md)**

**omnistack-agent** helps an AI assistant debug code, review changes, implement features, and explain engineering decisions with evidence. It provides short task skills and engineering references, generated from one source with no npm dependencies.

One assistant can use twelve engineering roles. Tools, permissions, model selection, and delegation come from your host platform.

## Start with one task

Use Node **≥ 18** for the installer and executable demonstrations. The generated files are already committed; you do not need a build or `npm install`.

1. Clone the repository and choose your platform.
2. Preview a skill installation into an **existing project**, then install it.
3. Try a [copyable demonstration prompt](examples/showcase/README.md) in a disposable workspace.
4. Run the checks and compare the result with the documented contract.

```bash
git clone https://github.com/Ricar66/omnistack-agent.git
cd omnistack-agent
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug --dry-run
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug
npm run demo
```

Replace the project path with an existing directory. Choose `claude`, `copilot`, `cursor`, or `codex` for `--platform`. In Claude Code, invoke `/omnistack-debug`; other hosts discover skills through their own controls. Check that the host actually loaded the skill.

| Skill | Use it for |
| --- | --- |
| [omnistack-agent](packages/skills/omnistack-agent/SKILL.md) | General engineering work across the twelve roles |
| [omnistack-debug](packages/skills/omnistack-debug/SKILL.md) | Reproducing a bug, isolating its cause, and verifying a small fix |
| [omnistack-code-review](packages/skills/omnistack-code-review/SKILL.md) | Actionable findings with severity, file/line evidence, and impact |
| [omnistack-security-review](packages/skills/omnistack-security-review/SKILL.md) | Trust boundaries, realistic attack paths, and proportionate mitigations |

Each package contains its own reference files; an index link does not have to rely on a separate clone. The installer previews destinations, refuses conflicts, and treats identical installations as a no-op. It does not replace your project guidance. See [the quickstart](docs/quickstart.md) and [installation guide](docs/platforms.md), including safe removal.

## Three demonstrations you can repeat

```text
cart: initial check failed as expected; solution checks passed
permissions: initial check failed as expected; solution checks passed
tasks: initial check failed as expected; solution checks passed
3 maintainer-authored demonstrations verified; no model responses evaluated.
```

This is the output of `npm run demo`: a money-total bug, an access-check bug, and a bounded task-filter feature. [Prompts, initial fixtures, solutions, and checks](examples/showcase/README.md) are available to inspect.

The solutions are maintainer-authored. These checks verify the demonstrations, rather than measure model quality. The [evaluation guide](docs/evaluation.md) explains how to save and compare actual responses under the same model and tool setup.

[Two recorded Codex review trials](docs/evaluation-runs/2026-10-01/README.md) show an observed response and a file-read policy limitation; they are not a comparative benchmark.

## Other platform adapters

You can use the existing Markdown adapters manually without Node. Review and merge them with existing project rules.

| Platform | Adapter | Use |
| --- | --- | --- |
| ChatGPT Custom GPT | [custom-gpt-instructions.md](adapters/chatgpt/custom-gpt-instructions.md) | Paste into Instructions; optionally attach [knowledge.md](adapters/reference/knowledge.md) |
| Claude Code project guidance | [CLAUDE.md](adapters/claude/CLAUDE.md) | Merge into your project `CLAUDE.md` |
| Claude Code subagent | [agent.md](adapters/claude/agent.md) | Save in `.claude/agents/`; model inherits the session |
| GitHub Copilot project guidance | [copilot-instructions.md](adapters/copilot/copilot-instructions.md) | Merge into `.github/copilot-instructions.md` |
| Gemini Gem | [gem-instructions.md](adapters/gemini/gem-instructions.md) | Paste into Instructions; optionally attach the reference bundle |
| Cursor project guidance | [AGENTS.md](adapters/cursor/AGENTS.md) | Merge into root `AGENTS.md`; full knowledge inline |
| Windsurf / Cascade | [AGENTS.md](adapters/windsurf/AGENTS.md) | Merge into root `AGENTS.md`; lean |
| API / other LLMs | [system-prompt.md](adapters/generic/system-prompt.md) | Use your provider's instruction interface and context limits |

**Lean** adapters contain core instructions and a module map. They need accessible or attached references. **Full** adapters embed all knowledge and consume more context. The preserved [Claude single-file skill](adapters/claude/SKILL.md) remains available; the modular packages above load supporting files as needed. The Custom GPT adapter has an **8,000-character project budget**, rather than a universal platform limit.

## Engineering coverage

The references cover architecture, OOP, JavaScript, TypeScript, C#, SQL, frontend, backend, mobile, databases, DevOps, testing, security, and documentation. Instructions encourage proportional changes, project conventions, clear capability limits, and observed verification before completion claims. Choose abstractions that fit the task.

The twelve roles are Architect, Full Stack Developer, Mobile Developer, Backend Engineer, Frontend Engineer, Database Administrator, DevOps Engineer, QA Engineer, Security Engineer, Code Reviewer, Technical Writer, and Software Mentor.

## Contribute

> Edit `core/`, `workflows/`, `knowledge/`, or scripts. Never edit `adapters/` or `packages/` by hand.

```bash
npm run build
npm run check
npm run demo
```

`npm run check` tests and validates committed output without rebuilding it, so drift is visible. See [CONTRIBUTING.md](CONTRIBUTING.md), [adding knowledge](docs/adding-knowledge.md), and the [improvement plan](docs/improvement-plan.md).

```text
core/        # Shared engineering instructions
workflows/   # Focused task skill sources
knowledge/   # Reference modules and canonical index
adapters/    # Generated legacy platform instructions
packages/    # Generated modular skills, references, and manifest
scripts/     # Build, validation, installer, demonstrations, and tests
examples/    # Runnable examples and evaluation scenarios
docs/        # Quickstart, installation, architecture, and evaluation
```

Released under the **MIT License**. See [LICENSE](LICENSE).