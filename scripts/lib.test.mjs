import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contentHash, assembleCore, assembleKnowledge, renderTarget, normalizeEol,
  characterCount, withoutFencedCode, knowledgeLinks, validateSources, validateTargets, TARGETS,
} from './lib.mjs';

const moduleBody = `# Topic
> A reference module.

## Concepts
Concept.
## Best Practices
Practice.
## Patterns & Examples
Example.
## Common Pitfalls / Anti-patterns
Pitfall.
## References
Reference.

<!-- level: beginner -->`;
const source = () => ({
  coreFiles: [{ name: '00-core.md', body: 'Core instructions' }],
  indexBody: '# Index\n### OOP\n- [Topic](oop/topic.md) — description\n',
  modules: [{ path: 'knowledge/oop/topic.md', body: moduleBody }],
});
const target = (overrides = {}) => ({
  name: 'test', outPath: 'adapters/test/instructions.md', mode: 'full', frontmatter: null,
  ...overrides,
});

test('normalization strips BOM and makes all line endings OS-independent', () => {
  assert.equal(normalizeEol('\uFEFFa\r\nb\rc\n'), 'a\nb\nc\n');
  assert.equal(contentHash(normalizeEol('x\r\ny')), contentHash(normalizeEol('x\ny')));
});

test('contentHash is deterministic and changes with the content', () => {
  assert.equal(contentHash('hello'), contentHash('hello'));
  assert.match(contentHash('hello'), /^[0-9a-f]{12}$/);
  assert.notEqual(contentHash('hello'), contentHash('world'));
});

test('core assembly sorts and normalizes sources without mutating them', () => {
  const files = [{ name: '01-b.md', body: 'B\r\n' }, { name: '00-a.md', body: '\uFEFF  A  ' }];
  assert.equal(assembleCore(files), 'A\n\n---\n\nB');
  assert.equal(files[0].name, '01-b.md');
});

test('fenced samples do not supply headings or navigation links', () => {
  const index = `${source().indexBody}\n~~~markdown\n### Fake\n- [Fake](missing.md)\n~~~~\n`;
  assert.deepEqual(knowledgeLinks(index), [{ category: 'OOP', label: 'Topic', path: 'knowledge/oop/topic.md' }]);
  assert.equal(withoutFencedCode('Before\n````md\n```\nHidden\n````\nAfter'), 'Before\n\n\n\n\nAfter');
});

test('lean navigation comes from index categories and links, excluding contributor prose and module bodies', () => {
  const { modules, indexBody } = source();
  const out = assembleKnowledge(modules, `${indexBody}\nContributor instructions.`, 'lean');
  assert.match(out, /### OOP\n- \[Topic\]\(knowledge\/oop\/topic.md\)/);
  assert.ok(!out.includes('description'));
  assert.ok(!out.includes('Contributor instructions'));
  assert.ok(!out.includes('## Concepts'));
});

test('full knowledge embeds the index and every module in deterministic path order', () => {
  const index = '# Original index';
  const modules = [{ path: 'knowledge/b.md', body: 'Body B' }, { path: 'knowledge/a.md', body: 'Body A' }];
  const out = assembleKnowledge(modules, index, 'full');
  assert.ok(out.indexOf(index) < out.indexOf('Body A'));
  assert.ok(out.indexOf('Body A') < out.indexOf('Body B'));
  assert.equal(assembleKnowledge([...modules].reverse(), index, 'full'), out);
});

test('knowledge assembly rejects an unknown mode instead of silently selecting full', () => {
  assert.throws(() => assembleKnowledge([], '# Index', 'small'), /Invalid knowledge mode/);
});

test('rendering includes normalized frontmatter, content hash and all source text', () => {
  const out = renderTarget(target({ frontmatter: '---\r\nname: x\r\n---' }), 'CORE', 'KNOW');
  assert.ok(out.startsWith('---\nname: x\n---\n\n<!-- GENERATED'));
  assert.ok(out.includes(`content-hash: ${contentHash('CORE\n\n---\n\nKNOW')}`));
  assert.ok(out.endsWith('CORE\n\n---\n\nKNOW\n'));
  assert.equal(renderTarget(target(), 'C', 'K'), renderTarget(target(), 'C', 'K'));
});

test('a knowledge-only target excludes the core persona from its body and hash', () => {
  const out = renderTarget(target({ includeCore: false }), 'CORE', 'KNOW');
  assert.ok(!out.includes('CORE'));
  assert.ok(out.includes(`content-hash: ${contentHash('KNOW')}`));
  assert.ok(out.startsWith('<!-- GENERATED from knowledge/'));
});

test('budgets count code points of the whole rendered file, including headers and frontmatter', () => {
  const configured = target({ frontmatter: '---\nname: budget\n---' });
  const output = renderTarget(configured, '😀', 'Reference');
  const count = characterCount(output);
  assert.equal(output.length, count + 1);
  assert.equal(renderTarget({ ...configured, maxCharacters: count }, '😀', 'Reference'), output);
  assert.throws(() => renderTarget({ ...configured, maxCharacters: count - 1 }, '😀', 'Reference'), /exceeds project budget/);
});

test('source validation accepts the module template and ignores fenced example links', () => {
  const input = source();
  input.indexBody += '\n```md\n- [Example](missing.md)\n```';
  assert.doesNotThrow(() => validateSources(input));
});

test('source validation rejects missing, duplicate and unindexed modules', () => {
  assert.throws(() => validateSources({ ...source(), indexBody: '- [Missing](missing.md)' }), /broken module link/);
  assert.throws(() => validateSources({ ...source(), indexBody: `${source().indexBody}- [Again](oop/topic.md)` }), /duplicate module link/);
  assert.throws(() => validateSources({ ...source(), indexBody: '# No links' }), /unindexed modules/);
  assert.throws(() => validateSources({ ...source(), modules: [...source().modules, ...source().modules] }), /Duplicate knowledge module/);
});

test('source validation rejects missing template headings even when a fenced example contains them', () => {
  const input = source();
  input.modules[0].body = moduleBody.replace('## References\nReference.', '```md\n## References\n```');
  assert.throws(() => validateSources(input), /expected one "## References"/);
});

test('source validation rejects wrong heading order and invalid or duplicate difficulty levels', () => {
  for (const body of [
    moduleBody.replace('## Concepts', '## Best Practices').replace('## Best Practices\nPractice.', '## Concepts\nPractice.'),
    moduleBody.replace('level: beginner', 'level: expert'),
    `${moduleBody}\n<!-- level: advanced -->`,
  ]) {
    assert.throws(() => validateSources({ ...source(), modules: [{ ...source().modules[0], body }] }), /template headings are out of order|expected one level/);
  }
});

test('source validation rejects missing and empty core, index and module source files', () => {
  for (const input of [
    { ...source(), coreFiles: [] },
    { ...source(), coreFiles: [{ name: '00-empty.md', body: ' \n' }] },
    { ...source(), indexBody: '' },
    { ...source(), modules: [] },
    { ...source(), modules: [{ path: 'knowledge/empty.md', body: ' \n' }] },
  ]) assert.throws(() => validateSources(input), /no .*found|empty/);
});

test('index links cannot escape knowledge or point back to the index', () => {
  for (const href of ['../../elsewhere.md', '/absolute.md', 'oop\\topic.md', '_index.md', 'topic.txt', '%zz']) {
    assert.throws(() => knowledgeLinks(`- [Topic](${href})`), /invalid|unsafe/i, href);
  }
});

test('manifest validation rejects bad modes, names, duplicate paths and unsafe destinations', () => {
  assert.throws(() => validateTargets([target({ mode: 'compact' })]), /invalid mode/);
  assert.throws(() => validateTargets([target(), target({ outPath: 'adapters/other.md' })]), /Duplicate adapter name/);
  assert.throws(() => validateTargets([target(), target({ name: 'other', outPath: 'adapters/TEST/instructions.md' })]), /Duplicate adapter output/);
  for (const outPath of ['../outside.md', '/adapters/out.md', 'adapters/../out.md', 'adapters/./out.md', 'adapters//out.md', 'adapters\\out.md', 'C:/adapters/out.md']) {
    assert.throws(() => validateTargets([target({ outPath })]), /unsafe output path/, outPath);
  }
  for (const maxCharacters of [0, -1, 1.5, '8000']) {
    assert.throws(() => validateTargets([target({ maxCharacters })]), /positive integer/);
  }
});

test('the manifest preserves legacy paths and includes portable lean and knowledge-only targets', () => {
  assert.doesNotThrow(() => validateTargets(TARGETS));
  const legacy = [
    'claude/SKILL.md', 'claude/agent.md', 'claude/AGENTS.md',
    'chatgpt/custom-gpt-instructions.md', 'chatgpt/system-prompt.md',
    'copilot/copilot-instructions.md', 'gemini/gem-instructions.md',
    'cursor/AGENTS.md', 'generic/system-prompt.md',
  ];
  for (const path of legacy) assert.ok(TARGETS.some((item) => item.outPath === `adapters/${path}`));
  for (const path of ['claude/CLAUDE.md', 'windsurf/AGENTS.md']) {
    assert.equal(TARGETS.find((item) => item.outPath === `adapters/${path}`).mode, 'lean');
  }
  assert.equal(TARGETS.find((item) => item.outPath === 'adapters/reference/knowledge.md').includeCore, false);
  assert.equal(TARGETS.find((item) => item.name === 'chatgpt-gpt').maxCharacters, 8000);
  const agent = TARGETS.find((item) => item.name === 'claude-agent');
  assert.match(agent.frontmatter, /^---\nname: omnistack-agent\ndescription: .+\nmodel: inherit\n---$/);
  assert.match(TARGETS.find((item) => item.name === 'claude-skill').frontmatter, /\nuser-invocable: true\n---$/);
});
