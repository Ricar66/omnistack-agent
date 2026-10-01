# Recorded Codex review trials — 2026-10-01

These are two observed sessions for one synthetic review task, not a baseline comparison or a performance benchmark. The three executable demonstrations remain maintainer-authored. No claim about other models, platforms, or GitHub stars follows from these trials.

## Setup

- Candidate: generated version 0.2.0 from `codex/modular-install-and-showcase`, based on `cbe9876` (the integrated first iteration). Instruction fingerprints below identify the exact supplied content; the pull request records its committed revision.
- Host: Windows, Node 25.9.0, OpenAI Codex CLI 0.159.2.
- Model/provider reported by the CLI: `gpt-6.1-sol` / `openai`; reasoning effort `none`; no additional sampling setting supplied.
- Fresh ephemeral session per run, `--ignore-user-config`, `--skip-git-repo-check`, `--sandbox read-only`, no permission bypass. Installed skill metadata and parent project instructions were not removed, so this is not an isolated model-only evaluation.
- `omnistack-code-review` was installed in a disposable project's `.agents/skills/` by the version 0.2.0 installer. No real application or secret files were supplied.
- User configuration was ignored for reproducibility; authentication still used the existing local account. No API key was added to the repository.

| Input | SHA-256 |
| --- | --- |
| `packages/manifest.json` | `6fa0dd7ecf48dd8a603216384688693448ebbf90fe28374a4c304e1c07fdad89` |
| `omnistack-code-review/SKILL.md` | `1c50822f17d2f07576bfd4272ff2eaa56c2adece849432b628f9525d0ab39f09` |
| `omnistack-code-review/references/core.md` | `b9575b1f6001945736db2afd963c0fbe9f1e8dbf832192c953d6d0cacd8400a2` |

## Fixture

Both sessions concern this four-line `src/access.mjs`:

```javascript
export function canDelete(user) {
  if (user.role = "admin") return true;
  return false;
}
```

The contract permits deletion only for the exact `admin` role and forbids mutation of the user. The task asks for a review, not an implementation.

## Run 1: file-based trial, tools blocked

[Exact prompt](file-prompt.txt) · [Actual final response](file-response.md)

The assistant acknowledged the selected skill and attempted to read its installed entry, shared guidance, and fixture. The host execution policy rejected both file-reading attempts with `blocked by policy`; no successful file read or regression test was observed. It then reported the limitation and labeled its checks as proposed. The process exited 0, which only means a final response was produced; it does not make this a completed code review.

This trial establishes an observed attempt to use the installed entry and truthful handling of unavailable reads. It does not establish that the complete skill was loaded or that the code defect was found.

## Run 2: supplied-text trial, no tools requested

[Exact prompt including supplied instructions](inline-prompt.txt) · [Actual final response](inline-response.md)

A new session received the complete skill entry, shared guidance, and fixture in the prompt, with explicit instructions not to open files, run commands, or contact services. The observed response identified the assignment at `src/access.mjs:2`, explained unauthorized access and role mutation, proposed strict equality, and labeled the regression check as not executed. No command attempt appeared in this session's log; no files changed.

Supplying the fixture and instructions changed the available context. This is a documented alternative for a session with blocked tools, not evidence that one variant outperformed the other under equal conditions.

## Limits

One review task, one session per input mode, no baseline, and no repeated samples. The second run received the skill text directly and therefore does not test reference-file discovery. The first run could not complete source inspection. Neither run executed an AI-produced patch or regression test. Repository tests separately verify the committed demonstrations and installation behavior.

Keep these observed responses and their limitations when interpreting the [evaluation rubric](../../evaluation.md). A broader quality claim still requires comparable baseline/candidate runs with fixed tools, references, and independent scoring.
