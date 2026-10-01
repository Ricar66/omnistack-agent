# Improvement Plan

This iteration strengthens the existing single-agent instructions, packaging, and verification. It preserves the original adapter paths and source-first contribution workflow.

## Delivery scope

- Compact core instructions with twelve roles, including Security Engineer and Code Reviewer.
- Proportional workflows, trust boundaries, capability limits, and evidence-based reporting.
- Improved reference examples for integer-cent money and failed operations.
- Lean Claude project guidance and a dedicated Windsurf adapter.
- A knowledge-only bundle for attached or accessible references.
- Source, adapter, budget, and drift checks with a combined `npm run check` command.
- An executable account example, manual evaluation scenarios, and updated installation/contribution guides.

The full Claude skill/subagent and Cursor payloads remain available. This iteration does not introduce modular platform packages, a multiagent runtime, or measured model-quality claims.

## Acceptance checklist

Verified against the final combined change on 2026-10-01:

- [x] Tests and validation pass through `npm run check`.
- [x] Regenerated adapters match the authored source.
- [x] The Custom GPT adapter fits its 8,000-character project budget.
- [x] Original adapter paths remain available and new installation paths are documented.
- [x] Knowledge references and module registrations satisfy source contracts.
- [x] The executable money example covers stated boundaries.
- [x] Documentation and both READMEs agree with the delivered behavior.
- [x] Evaluation scenarios are labeled as inputs/criteria, not observed responses.

Manual model comparisons are a separate activity described in [evaluation.md](evaluation.md); passing repository checks does not complete that evaluation.

## Verification evidence

- Windows / Node 25.9.0: all 34 tests and validation passed.
- Windows / Node 18.12.1: all three test files and validation passed using a temporary official runtime.
- All 12 generated outputs match their sources; lean instructions use 7,316 of the 8,000-character project budget.
- Independent review identified documentation overclaims and a Node 18 test-hook incompatibility; both were corrected and checked.
- Authored documentation links and copyable module templates passed local checks.
- SQL, C# and pg/argon2 login snippets remain illustrative; no live LLM evaluation was run.

## Candidates for a later iteration

| Candidate | Evidence to collect first |
| --- | --- |
| TypeScript and additional language/domain modules | Repeated user tasks that current modules do not support |
| Platform reference packages loaded on demand | Context cost and installation results for the existing full adapters |
| Recorded model comparisons | Comparable responses across the manual scenarios, with fixed tools and references |

Prioritize changes based on those results. Add support only when its format and installation can be documented and checked.
