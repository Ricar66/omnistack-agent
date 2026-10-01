# Examples

This directory combines executable teaching code with scenarios for evaluating AI responses. Each serves a different purpose.

## Executable account example

[bank-account.mjs](bank-account.mjs) demonstrates money represented as integer cents, validated operations, and preserved account state when an operation fails. Use it alongside the OOP and testing knowledge modules.

From the repository root:

```bash
node examples/bank-account.mjs
npm test
npm run check
```

The first command loads the example module; it does not by itself establish that the boundary checks pass. `npm test` runs the repository's automated tests, including the account boundary cases. `npm run check` also validates authored content and generated adapters without rebuilding them.

The example is teaching code rather than a complete banking or payment system. Use the actual implementation and tests when discussing its supported operations and boundaries.

## Manual agent evaluation

[evaluation-cases.md](evaluation-cases.md) contains eight designed scenarios with prompts, criteria, and expected evidence. They are not captured AI responses or measured results.

Follow [the evaluation guide](../docs/evaluation.md) to compare baseline and improved instructions under the same model, references, tools, and permissions. Save actual responses and score them with the shared rubric.

Automated tests can verify the example and generator. They do not demonstrate that an AI assistant passes these scenarios.
