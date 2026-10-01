# Platform Install Guide

Generated modular skills and legacy adapters are committed. Use the project-local installer for Claude Code, GitHub Copilot, Cursor, or Codex; it requires Node ≥ 18. Manual Markdown adapter installation does not require Node or a build.

## Modular skills: preview and install

See [the quickstart](quickstart.md) for a complete first task. The four available skills are `omnistack-agent`, `omnistack-debug`, `omnistack-code-review`, and `omnistack-security-review`. Each package includes a short entry and its reference files.

| Platform flag | Project-local skill directory | Format documentation |
| --- | --- | --- |
| `claude` | `.claude/skills/` | [Claude Code skills](https://code.claude.com/docs/en/skills) |
| `copilot` | `.github/skills/` | [Copilot agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) |
| `cursor` | `.cursor/skills/` | [Cursor skills](https://cursor.com/docs/skills) |
| `codex` | `.agents/skills/` | [Codex skills](https://developers.openai.com/codex/skills) |

From this repository, replace the project path with an existing directory:

```bash
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug --dry-run
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug
```

Omit `--skill` or pass `--skill all` to install all four. The installer validates the packaged files and prints each destination. A dry run writes nothing; identical installed files with their matching receipt are a no-op. Conflicts stop the selected operation. There is no global install or force-overwrite option.

Restart or reload the host as its client requires, then inspect its skills/context controls. In Claude Code, use `/omnistack-debug` to explicitly invoke that installed skill. Metadata and references support discovery; they do not guarantee activation or reference retrieval.

To remove an unchanged installed skill:

```bash
node scripts/install.mjs uninstall --platform claude --project "/path/to/your-project" --skill omnistack-debug --dry-run
node scripts/install.mjs uninstall --platform claude --project "/path/to/your-project" --skill omnistack-debug
```

Keep the installation receipt. Removal refuses modified or unmanaged content; resolve customized files manually. The installer does not merge or overwrite `CLAUDE.md`, `AGENTS.md`, or `copilot-instructions.md`.

You can also copy a complete folder from `packages/skills/` into the platform's skill directory. Include its `references/`, rather than only `SKILL.md`. A manual copy has no installer receipt, so the installer will treat it as unmanaged content.

The following sections cover the preserved manual adapters.

## Preserve existing guidance

For manual adapters, if your project already has `CLAUDE.md`, `AGENTS.md`, a skill with the same name, or Copilot instructions, back it up and merge the relevant instructions. Keep local build commands, conventions, permissions, and security requirements. Resolve conflicts before starting a new session. Copying an adapter over an existing file can discard those project rules.

The adapter supplies instructions; the host supplies tools and permissions. An instruction to run a command or consult a file does not make that capability available.

## Choose a payload

**Lean** contains core instructions and a compact module map. The paths in the map refer to the source repository; they are usable only if you attach reference content or provide filesystem access to the modules. Copying the instruction text alone does not load the knowledge.

**Full** includes the complete knowledge in one file and consumes more context. Claude skill/subagent, the legacy Claude `AGENTS.md`, Cursor, and API full variants remain available. These legacy full files do not use separate reference files; the modular skills above do.

**Reference** is [adapters/reference/knowledge.md](../adapters/reference/knowledge.md): knowledge without the core persona. Upload it where your platform supports knowledge files, or copy it into an accessible project directory and identify its local path in your guidance. Ask the assistant to consult relevant sections when needed. Do not add a startup import of the entire bundle if your aim is to keep startup context small.

## ChatGPT (Custom GPT, where available)

Use [custom-gpt-instructions.md](../adapters/chatgpt/custom-gpt-instructions.md) for the **Instructions** field.

1. Open the GPT creation/configuration interface offered by your account.
2. Paste the lean instructions, name the GPT, and save according to your account's sharing controls.
3. If a Knowledge upload is available, attach [knowledge.md](../adapters/reference/knowledge.md).
4. Preview a task and check whether the GPT can use the attached knowledge. If no reference is attached, the index remains a topic map.

The adapter is limited to **8,000 characters by this project**, not by a documented universal platform limit. Keep [system-prompt.md](../adapters/chatgpt/system-prompt.md), the full variant, for an API or other interface with sufficient context capacity; do not paste it into the Custom GPT Instructions field.

Available customization interfaces depend on the account and workspace. OpenAI's [customization guide](https://learn.chatgpt.com/docs/build-plugins) covers reusable instructions and reference material in plugins, and its [GPT migration guide](https://learn.chatgpt.com/docs/migrate-custom-gpts) covers Enterprise migration. This repository does not generate a ChatGPT plugin package.

## Claude Code (project guidance)

Recommended: [adapters/claude/CLAUDE.md](../adapters/claude/CLAUDE.md), the lean variant.

1. Merge it into `CLAUDE.md` at your repository root, or into your existing project `.claude/CLAUDE.md`.
2. If you want the knowledge, provide the reference bundle or source modules in the project and state their path.
3. Start a new session and use `/memory` or `/context` to inspect the loaded guidance.

The preserved [adapters/claude/AGENTS.md](../adapters/claude/AGENTS.md) includes full knowledge. Current Claude Code can load `AGENTS.md` directly, but default discovery is conditional: a project or ancestor `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` can take precedence. Older clients may require a `CLAUDE.md` import.

When sharing an existing `AGENTS.md`, add this to a `CLAUDE.md` beside it, preserving other Claude instructions:

```markdown
@AGENTS.md
```

This import loads the referenced content too, so importing the full adapter still costs its full context. Check [Claude's memory documentation](https://code.claude.com/docs/en/memory) for your version's discovery settings.

## Claude Code (legacy single-file skill or subagent)

### Skill

Copy [SKILL.md](../adapters/claude/SKILL.md) to `.claude/skills/omnistack-agent/SKILL.md`, then invoke `/omnistack-agent`. It includes YAML metadata and full knowledge. This is a Claude Code installation, rather than a claim that the same frontmatter can be uploaded to every Claude surface.

Prefer the modular skills above for short task entries with their own supporting files. This preserved adapter remains a full single file. [Official skills guide](https://code.claude.com/docs/en/skills)

### Subagent

Copy [agent.md](../adapters/claude/agent.md) into `.claude/agents/`, then restart the session or reload agents through the host's agent controls. Its frontmatter sets the name and description, and `model: inherit` uses the session's model. It includes full knowledge.

A subagent runs only through Claude Code's delegation features; the adapter does not create an orchestration runtime. [Official subagent guide](https://code.claude.com/docs/en/sub-agents)

## GitHub Copilot

Merge [copilot-instructions.md](../adapters/copilot/copilot-instructions.md) into `.github/copilot-instructions.md` at your repository root, then commit it.

Copilot supports repository-wide instructions at that path. In Copilot Chat, inspect response references to confirm the instructions were used; available instruction types vary by environment. If using Copilot CLI, start a new session to pick up edited instructions. [Repository instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions), [CLI instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)

The adapter is lean. Provide accessible reference files and their project path if you need the knowledge beyond the topic map.

## Gemini (Gem, where available)

1. Open Gemini's Gem editor and create a Gem.
2. Paste [gem-instructions.md](../adapters/gemini/gem-instructions.md) into **Instructions**.
3. Under **Knowledge**, add [knowledge.md](../adapters/reference/knowledge.md) if you want the complete references.
4. Name the Gem, save it, and preview a task using the knowledge.

Google documents Gem knowledge uploads separately from instructions. Uploading from your device avoids assuming that the Gem can read this repository or a local folder. [Official Gem guide](https://support.google.com/gemini/answer/15235603?hl=en)

This adapter targets Gems; it is not a Gemini CLI `GEMINI.md` file or a generated Gemini skill package.

## Cursor

Merge [adapters/cursor/AGENTS.md](../adapters/cursor/AGENTS.md) into `AGENTS.md` at the project root and commit it.

Cursor supports plain Markdown `AGENTS.md` guidance in the root and subdirectories. The preserved adapter is full. If you want scoped project rules, follow Cursor's native rule format; this repository does not generate `.mdc` rules. Rules apply to supported Agent features, rather than every editor completion. [Official rules guide](https://cursor.com/docs/rules)

## Windsurf / Cascade

Merge the dedicated lean [adapters/windsurf/AGENTS.md](../adapters/windsurf/AGENTS.md) into `AGENTS.md` at your project root and commit it.

Cascade processes root `AGENTS.md` guidance as always active, and subdirectory files apply to their directory scope. Add accessible references and their path if you need the complete knowledge. The older shared Cursor file remains usable as a larger full payload, but the dedicated adapter is the lean option. [Official Cascade documentation](https://docs.devin.ai/desktop/cascade/memories)

## APIs and other LLMs

Use [adapters/generic/system-prompt.md](../adapters/generic/system-prompt.md) or [adapters/chatgpt/system-prompt.md](../adapters/chatgpt/system-prompt.md) when you want full knowledge inline.

Pass the content through the provider's supported instruction interface and allow for the model's context limits, conversation history, and tool output. APIs differ in how system/developer instructions are represented; the filename does not prescribe a request schema.

For a smaller payload, use a lean adapter and supply references through a supported file or retrieval mechanism. Check that the assistant can actually retrieve them before expecting module-based answers.
