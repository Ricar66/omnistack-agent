# Start with one engineering task

This quickstart covers the project-local modular skills for Claude Code, GitHub Copilot, Cursor, and Codex. For ChatGPT, Gemini, Windsurf, API usage, or legacy project guidance, see [platforms.md](platforms.md).

## 1. Choose a platform and skill

Use Node ≥ 18. Clone the repository into your development directory, then enter it:

```bash
git clone https://github.com/Ricar66/omnistack-agent.git
cd omnistack-agent
```

No dependencies or build are required for a checkout containing the generated packages.

| Platform flag | Destination inside your project |
| --- | --- |
| `claude` | `.claude/skills/<skill-name>/` |
| `copilot` | `.github/skills/<skill-name>/` |
| `cursor` | `.cursor/skills/<skill-name>/` |
| `codex` | `.agents/skills/<skill-name>/` |

Start with `omnistack-debug` for a bug, `omnistack-code-review` for a review, `omnistack-security-review` for a security review, or `omnistack-agent` for general work. Omit `--skill`, or use `--skill all`, to install all four.

## 2. Preview, then install

Replace the path with an existing project directory:

```bash
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug --dry-run
node scripts/install.mjs install --platform claude --project "/path/to/your-project" --skill omnistack-debug
```

On Windows, a quoted absolute path works too:

```powershell
node scripts/install.mjs install --platform codex --project "E:\CraftOps\apps\web\my-project" --skill omnistack-debug --dry-run
```

The preview performs checks without writing files. The installer refuses conflicting content and preserves existing `CLAUDE.md`, `AGENTS.md`, Copilot instructions, and unrelated skills. Identical installations are a no-op. Review the printed destination and retain the installation receipt.

The installed `SKILL.md` stays short and links to files inside its own `references/` directory. The host decides when to activate the skill and read those references; the installer cannot guarantee that a model uses them.

## 3. Try a small task

Start a fresh assistant session in the target project. In Claude Code, invoke `/omnistack-debug`. In other hosts, use their available skill controls and inspect loaded context or references where supported.

Use the cart prompt from [the three demonstrations](../examples/showcase/README.md), or a real reproducible bug in your project. State the expected result, constraints, and available test command. Ask the assistant to distinguish executed checks from proposed ones.

For an independent trial, do not show the maintainer solution to the assistant. Keep the trial in a disposable workspace so the demonstration snapshots remain unchanged.

## 4. Check the result

From this repository:

```bash
npm run demo
npm run check
```

The demo command verifies three committed examples. It does not evaluate edits made in another project or score an AI response. Run that project's checks against the assistant's actual change, and save the prompt, response, patch, and output with [this record template](evaluation.md#capture-a-real-run).

## 5. Remove an unchanged installation

Preview first with the same platform, project and skill:

```bash
node scripts/install.mjs uninstall --platform claude --project "/path/to/your-project" --skill omnistack-debug --dry-run
node scripts/install.mjs uninstall --platform claude --project "/path/to/your-project" --skill omnistack-debug
```

Removal relies on the install receipt and refuses changed content. If you customized a skill, retain or move your changes and resolve the conflict manually. There is no force-overwrite option.

The CLI is also included in the repository's npm distribution as `omnistack-agent`. These source commands do not assume an npm registry publication or a release download is available.