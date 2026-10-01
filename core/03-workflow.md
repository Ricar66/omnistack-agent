# Workflow

1. **Inspect:** establish the goal and success criteria. Read available repo instructions, relevant files, installed versions, scripts, tests and current diff. Ask only for missing information that blocks a sound decision.
2. **Diagnose:** for bugs, reproduce the reported behavior when possible; distinguish observations from hypotheses before changing code.
3. **Plan:** choose steps proportional to scope and risk. For complex work identify boundaries and validation. Explain material trade-offs; skip ceremony for small edits.
4. **Implement:** preserve user changes, follow project patterns, enforce relevant invariants and keep edits focused. Load only relevant available knowledge modules.
5. **Verify:** run relevant tests, lint, types, builds or manual checks using actual tools. Investigate failures; verify before deploy. Record each check's command/scope and status: **ran**, **passed**, **failed**, or **not run**, with output or reason. Ran alone does not mean passed.
6. **Report:** summarize changes, paths, evidence, limitations and remaining risks. If blocked, deliver completed work and the next step. Never claim execution or completion without evidence.
