import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, access, copyFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildAll, writeAdapters, ROOT } from './build.mjs';
import { validateAll } from './validate.mjs';
import { TARGETS, characterCount } from './lib.mjs';

const moduleBody = (name) => `# ${name}
## Concepts
A concept.
## Best Practices
A practice.
## Patterns & Examples
An example.
## Common Pitfalls / Anti-patterns
A pitfall.
## References
A reference.
<!-- level: intermediate -->\n`;
const targets = [
  { name: 'full', outPath: 'adapters/test/full.md', mode: 'full', frontmatter: null },
  { name: 'lean', outPath: 'adapters/test/lean.md', mode: 'lean', frontmatter: null },
  { name: 'reference', outPath: 'adapters/test/reference.md', mode: 'full', includeCore: false, frontmatter: null },
];

async function withFixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'omnistack-agent-test-'));
  try {
    const sources = [
      ['core/10-tail.md', 'Tail core instructions\n'],
      ['core/00-front.md', 'First core instructions\n'],
      ['knowledge/_index.md', '# Index\n### Topics\n- [Z](topics/z.md) — extra description\n- [A](topics/a.md)\n'],
      ['knowledge/topics/z.md', moduleBody('Z module')],
      ['knowledge/topics/a.md', moduleBody('A module')],
    ];
    await Promise.all(sources.map(async ([path, body]) => {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await writeFile(join(root, path), body, 'utf8');
    }));
    await fn(root);
  } finally {
    assert.equal(dirname(root), tmpdir());
    assert.ok(basename(root).startsWith('omnistack-agent-test-'));
    await rm(root, { recursive: true, force: true });
  }
}

async function copyScripts(root) {
  await mkdir(join(root, 'scripts'));
  await Promise.all(['lib.mjs', 'build.mjs', 'validate.mjs'].map((name) =>
    copyFile(join(ROOT, 'scripts', name), join(root, 'scripts', name))));
}

test('real sources render every configured target deterministically within budgets', async () => {
  const first = await buildAll();
  assert.deepEqual(await buildAll(), first);
  assert.deepEqual(first.map((result) => result.outPath), TARGETS.map((item) => item.outPath));
  for (let i = 0; i < first.length; i++) {
    assert.ok(!first[i].content.includes('\r'));
    if (TARGETS[i].maxCharacters) assert.ok(characterCount(first[i].content) <= TARGETS[i].maxCharacters);
  }
});

test('build is write-free and sorts sources independently of creation order', () => withFixture(async (root) => {
  const results = await buildAll({ root, targets });
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
  const full = results.find((item) => item.outPath.endsWith('/full.md')).content;
  assert.ok(full.indexOf('First core instructions') < full.indexOf('Tail core instructions'));
  assert.ok(full.indexOf('# A module') < full.indexOf('# Z module'));
  const lean = results.find((item) => item.outPath.endsWith('/lean.md')).content;
  assert.ok(lean.includes('[Z](knowledge/topics/z.md)'));
  assert.ok(!lean.includes('# Z module'));
  const reference = results.find((item) => item.outPath.endsWith('/reference.md')).content;
  assert.ok(reference.includes('# Z module'));
  assert.ok(!reference.includes('core instructions'));
}));

test('CRLF and BOM source checkouts produce identical artifacts', () => withFixture(async (root) => {
  const before = await buildAll({ root, targets });
  for (const path of ['core/00-front.md', 'core/10-tail.md', 'knowledge/_index.md', 'knowledge/topics/a.md', 'knowledge/topics/z.md']) {
    const body = await readFile(join(root, path), 'utf8');
    await writeFile(join(root, path), `\uFEFF${body.replace(/\n/g, '\r\n')}`, 'utf8');
  }
  assert.deepEqual(await buildAll({ root, targets }), before);
}));

test('invalid late target or source fails before any artifact write', () => withFixture(async (root) => {
  const oversized = [...targets, { ...targets[0], name: 'tiny', outPath: 'adapters/test/tiny.md', maxCharacters: 1 }];
  await assert.rejects(writeAdapters({ root, targets: oversized }), /exceeds project budget/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
  await writeFile(join(root, 'knowledge/_index.md'), '- [Missing](missing.md)', 'utf8');
  await assert.rejects(writeAdapters({ root, targets }), /broken module link/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
}));

test('validation accepts normalized artifacts and detects missing or edited ones without changing them', () => withFixture(async (root) => {
  const built = await writeAdapters({ root, targets });
  assert.deepEqual(await validateAll({ root, targets }), []);
  const first = join(root, built[0].outPath);
  await writeFile(first, `\uFEFF${built[0].content.replace(/\n/g, '\r\n')}`, 'utf8');
  assert.deepEqual(await validateAll({ root, targets }), []);
  await writeFile(first, 'Manual edit', 'utf8');
  await rm(join(root, built[1].outPath));
  assert.deepEqual(await validateAll({ root, targets }), [built[0].outPath, `${built[1].outPath} (missing)`]);
  assert.equal(await readFile(first, 'utf8'), 'Manual edit');
}));

test('drift follows actual dependencies: core does not alter reference, module bodies do not alter lean', () => withFixture(async (root) => {
  await writeAdapters({ root, targets });
  await writeFile(join(root, 'core/00-front.md'), 'Changed core instructions', 'utf8');
  assert.deepEqual(await validateAll({ root, targets }), [targets[0].outPath, targets[1].outPath]);
  await writeAdapters({ root, targets });
  await writeFile(join(root, 'knowledge/topics/a.md'), moduleBody('Changed module'), 'utf8');
  assert.deepEqual(await validateAll({ root, targets }), [targets[0].outPath, targets[2].outPath]);
}));

test('validate CLI returns failure for drift and success after generation', () => withFixture(async (root) => {
  await copyScripts(root);
  const command = join(root, 'scripts', 'validate.mjs');
  const missing = spawnSync(process.execPath, [command], { cwd: root, encoding: 'utf8' });
  assert.equal(missing.status, 1, missing.stderr);
  assert.match(missing.stderr, /out of sync/);
  await writeAdapters({ root });
  const synced = spawnSync(process.execPath, [command], { cwd: root, encoding: 'utf8' });
  assert.equal(synced.status, 0, synced.stderr);
  assert.match(synced.stdout, /adapters in sync/);
}));

test('build CLI reports budget errors concisely and leaves all outputs unwritten', () => withFixture(async (root) => {
  await copyScripts(root);
  await writeFile(join(root, 'core/00-front.md'), 'Instruction '.repeat(1000), 'utf8');
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /chatgpt-gpt: rendered .* exceeds project budget 8000/);
  assert.ok(!result.stderr.includes('    at '));
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
}));
