# Adding a Knowledge Module

Knowledge is authored in `knowledge/` and generated into adapters. Each module covers one topic, with concepts, examples, pitfalls, and sources.

## 1. Choose a topic and sources

Look for an existing module before adding another. Extend it when the topic belongs there. Prefer official documentation and standards; state the applicable version when behavior depends on it. Distinguish facts, design choices, and trade-offs.

Use examples that fit the stated environment. Handle the boundaries you teach: an integer-cent money example should cover invalid amounts, overflow, insufficient funds, and failed-operation state, not just its happy path.

## 2. Use the module template

Create a Markdown file with these exact section headings and one valid difficulty marker:

```markdown
# Topic
> One-line summary and when this matters.

## Concepts

## Best Practices

## Patterns & Examples

## Common Pitfalls / Anti-patterns

## References

<!-- level: beginner -->
```

The level can be `beginner`, `intermediate`, or `advanced`. Put explanations beneath each heading. Use language-tagged fences for code and link to sources under References.

The contribution template belongs in this guide; the knowledge index stays focused on navigation so lean adapters stay small.

## 3. Place and register the module

Use an appropriate domain folder and a short kebab-case filename, for example `knowledge/languages/python.md`. Add a category in the index if no existing domain fits.

In [knowledge/_index.md](../knowledge/_index.md), add a link under the matching category, **relative to the `knowledge/` directory**:

```markdown
- [Python Essentials](languages/python.md)
```

Register every module exactly once. Do not point to files outside the knowledge tree. Validation checks module coverage and link integrity.

The build discovers module files, but a discovered file must still be present in the index. Adding a module without an index entry is an invalid source change.

## 4. Regenerate and verify

```bash
npm run build
npm run check
```

Full instruction adapters and the reference bundle include the module inline. Lean instruction adapters include its entry in the compact map, with a repository-oriented `knowledge/...` path. That map does not copy the module into the consumer's project or fetch it automatically.

`npm run check` runs tests and validates the generated files without rebuilding. It catches source contract failures and stale committed output. It does not establish the correctness of every teaching claim or the quality of a model's response: review the references and run any relevant example tests separately.

## 5. Review and contribute

Review the module for a clear scope, source/version accuracy, executable examples, and useful pitfalls. For behavior changes, consider a scenario in [the evaluation cases](../examples/evaluation-cases.md).

Commit the source module, its index entry, and generated adapters together. In the pull request, describe what the module teaches and which checks you ran. See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full workflow.
