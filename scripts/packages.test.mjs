import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm, unlink, access, symlink } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildPackages, SKILLS } from './packages.mjs';
import { ROOT, writeDistribution } from './build.mjs';
import { validateDistribution } from './validate.mjs';
import { characterCount, portableRelativePath } from './lib.mjs';

const moduleBody = (name) => `# ${name}\n## Concepts\nConcept.\n## Best Practices\nPractice.\n## Patterns & Examples\nExample.\n## Common Pitfalls / Anti-patterns\nPitfall.\n## References\nReference.\n<!-- level: intermediate -->\n`;
const modulePaths = [...new Set(SKILLS.flatMap((skill) => skill.modules || []))].sort();
const manifestOf = (results) => JSON.parse(results.find((result) => result.outPath === 'packages/manifest.json').content);
const sha256 = (body) => createHash('sha256').update(body, 'utf8').digest('hex');

async function withFixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'omnistack-packages-test-'));
  try {
    const sources = [
      ['core/00-core.md', '# Core\nShared engineering instructions.\n'],
      ['knowledge/_index.md', '# Index\n### Modules\n' + modulePaths.map((path) => `- [${path}](${path})`).join('\n') + '\n'],
      ['package.json', '{"version":"0.2.0"}\n'],
      ...modulePaths.map((path) => [`knowledge/${path}`, moduleBody(path)]),
      ...SKILLS.map((skill) => [`workflows/${skill.name}.md`, '# Workflow\nFocus on the requested task.\n']),
    ];
    for (const [path, body] of sources) {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await writeFile(join(root, path), body, 'utf8');
    }
    await fn(root, sources.map(([path]) => path));
  } finally {
    assert.equal(dirname(root), tmpdir());
    assert.ok(basename(root).startsWith('omnistack-packages-test-'));
    await rm(root, { recursive: true, force: true });
  }
}

test('real packages are deterministic, independently linked, and completely hashed', async () => {
  const first = await buildPackages();
  assert.deepEqual(await buildPackages(), first);
  const manifest = manifestOf(first);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.version, JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8')).version);
  assert.deepEqual(manifest.skills.map((skill) => skill.name), SKILLS.map((skill) => skill.name).sort());
  assert.equal(manifest.skills.flatMap((skill) => skill.files).length, first.length - 1);
  for (const skill of manifest.skills) {
    const entry = first.find((result) => result.outPath === `packages/${skill.path}/SKILL.md`).content;
    assert.ok(characterCount(entry) <= 8000);
    assert.ok(entry.split('\n').length <= 500);
    assert.ok(!entry.includes('user-invocable:'));
    for (const file of skill.files) {
      assert.ok(portableRelativePath(file.path));
      assert.match(file.sha256, /^[0-9a-f]{64}$/);
      const output = first.find((result) => result.outPath === `packages/${skill.path}/${file.path}`);
      assert.equal(file.sha256, sha256(output.content));
      assert.ok(!output.content.includes('\r'));
    }
    assert.ok(skill.files.some((file) => file.path === 'references/examples/bank-account.mjs'));
    assert.ok(skill.files.some((file) => file.path === 'references/scripts/bank-account-checks.mjs'));
    assert.ok(!skill.files.some((file) => file.path.endsWith('.test.mjs')));
  }
});

test('packaged executable references preserve their relative imports and checks', () => withFixture(async (root) => {
  const results = await buildPackages();
  const files = results.filter((result) => result.outPath.startsWith('packages/skills/omnistack-debug/') && result.outPath.endsWith('.mjs'));
  for (const file of files) {
    await mkdir(dirname(join(root, file.outPath)), { recursive: true });
    await writeFile(join(root, file.outPath), file.content, 'utf8');
  }
  const checks = join(root, 'packages/skills/omnistack-debug/references/scripts/bank-account-checks.mjs');
  const run = spawnSync(process.execPath, ['--test', checks], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr + run.stdout);
}));

test('package generation is write-free and normalizes all authored text before hashing', () => withFixture(async (root, paths) => {
  const before = await buildPackages({ root });
  await assert.rejects(access(join(root, 'packages')), { code: 'ENOENT' });
  for (const path of paths) {
    const body = await readFile(join(root, path), 'utf8');
    await writeFile(join(root, path), '\uFEFF' + body.replace(/\n/g, '\r\n'), 'utf8');
  }
  assert.deepEqual(await buildPackages({ root }), before);
}));

test('version changes update only the manifest and reject malformed versions', () => withFixture(async (root) => {
  const before = await buildPackages({ root });
  await writeFile(join(root, 'package.json'), '{"version":"0.2.1+local.1"}', 'utf8');
  const after = await buildPackages({ root });
  assert.equal(manifestOf(after).version, '0.2.1+local.1');
  assert.deepEqual(after.filter((result) => !result.outPath.endsWith('manifest.json')), before.filter((result) => !result.outPath.endsWith('manifest.json')));
  await assert.rejects(buildPackages({ root, version: '../../outside' }), /invalid package version/);
}));

test('definitions reject missing modules, unsafe paths, and invalid or duplicate skill names', () => withFixture(async (root) => {
  await assert.rejects(buildPackages({ root, skills: [{ ...SKILLS[1], modules: ['languages/typo.md'] }] }), /missing selected knowledge module/);
  for (const path of ['NUL.md', 'languages/trailing.md.', 'languages/file?.md', '../outside.md']) {
    await assert.rejects(buildPackages({ root, skills: [{ ...SKILLS[1], modules: [path] }] }), /invalid module selection/);
  }
  for (const name of ['../outside', 'Uppercase', 'a--b', 'x'.repeat(65)]) {
    await assert.rejects(buildPackages({ root, skills: [{ ...SKILLS[0], name }] }), /Invalid skill name/);
  }
  await assert.rejects(buildPackages({ root, skills: [SKILLS[0], SKILLS[0]] }), /Duplicate skill name/);
}));

test('bad workflows, references and budgets fail before any distribution writes', () => withFixture(async (root) => {
  const workflow = join(root, 'workflows/omnistack-security-review.md');
  await writeFile(workflow, ' ', 'utf8');
  await assert.rejects(writeDistribution({ root }), /source is empty/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
  await writeFile(workflow, '# Security\n[Missing](references/unknown.md)\n', 'utf8');
  await assert.rejects(writeDistribution({ root }), /broken package reference/);
  await assert.rejects(access(join(root, 'packages')), { code: 'ENOENT' });
  await writeFile(workflow, 'Instruction '.repeat(1000), 'utf8');
  await assert.rejects(writeDistribution({ root }), /exceeds project budget 8000/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
}));

test('distribution validation detects edits, CRLF, missing and unexpected files or directories without rewriting', () => withFixture(async (root) => {
  const built = await writeDistribution({ root });
  assert.deepEqual(await validateDistribution({ root }), []);
  const skill = built.find((result) => result.outPath === 'packages/skills/omnistack-agent/SKILL.md');
  await writeFile(join(root, skill.outPath), skill.content.replace(/\n/g, '\r\n'), 'utf8');
  let stale = await validateDistribution({ root });
  assert.deepEqual(stale, [skill.outPath]);
  assert.ok((await readFile(join(root, skill.outPath), 'utf8')).includes('\r\n'));
  await writeDistribution({ root });
  const core = 'packages/skills/omnistack-debug/references/core.md';
  await rm(join(root, core));
  await writeFile(join(root, 'packages/unexpected.txt'), 'extra', 'utf8');
  await mkdir(join(root, 'packages/empty-unexpected'));
  stale = await validateDistribution({ root });
  assert.ok(stale.includes(`${core} (missing)`));
  assert.ok(stale.includes('packages/unexpected.txt (unexpected)'));
  assert.ok(stale.includes('packages/empty-unexpected/ (unexpected)'));
  assert.equal(await readFile(join(root, 'packages/unexpected.txt'), 'utf8'), 'extra');
}));

test('package drift follows workflow and shared core dependencies', () => withFixture(async (root) => {
  await writeDistribution({ root });
  await writeFile(join(root, 'workflows/omnistack-debug.md'), '# Debug\nNew diagnostic guidance.\n', 'utf8');
  assert.deepEqual(await validateDistribution({ root }), ['packages/manifest.json', 'packages/skills/omnistack-debug/SKILL.md']);
  await writeDistribution({ root });
  await writeFile(join(root, 'core/00-core.md'), '# Core\nChanged shared guidance.\n', 'utf8');
  const stale = await validateDistribution({ root });
  for (const skill of SKILLS) {
    const path = skill.allModules ? `packages/skills/${skill.name}/SKILL.md` : `packages/skills/${skill.name}/references/core.md`;
    assert.ok(stale.includes(path));
  }
  assert.ok(stale.includes('packages/manifest.json'));
}));

test('portable paths reject Windows aliases, trailing dots and control characters', () => {
  for (const path of ['skills/NUL/SKILL.md', 'references/CON.md', 'COM1', 'foo./bar.md', 'space /a.md', 'path\\file.md', 'a\u0001b', 'x:y.md']) {
    assert.equal(portableRelativePath(path), false, path);
  }
  for (const path of ['skills/omnistack-agent/SKILL.md', 'references/core.md', '.agents/skills']) assert.equal(portableRelativePath(path), true, path);
});

test('source and output directory links are refused before writes', (t) => withFixture(async (root) => {
  const outside = join(root, 'outside');
  await mkdir(outside);
  await copyFile(join(root, 'core/00-core.md'), join(outside, '00-core.md'));
  await rm(join(root, 'core'), { recursive: true });
  try { await symlink(outside, join(root, 'core'), 'junction'); }
  catch (err) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(err.code)) { t.skip(`Directory links unavailable: ${err.code}`); return; }
    throw err;
  }
  await assert.rejects(writeDistribution({ root }), /source directory, not a link/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
  await unlink(join(root, 'core'));
  await mkdir(join(root, 'core'));
  await copyFile(join(outside, '00-core.md'), join(root, 'core/00-core.md'));
  await symlink(outside, join(root, 'packages'), 'junction');
  await assert.rejects(writeDistribution({ root }), /unsafe output path/);
  await assert.rejects(access(join(root, 'adapters')), { code: 'ENOENT' });
  await assert.rejects(validateDistribution({ root }), /unsafe package output link/);
  assert.deepEqual(await readFile(join(outside, '00-core.md'), 'utf8'), '# Core\nShared engineering instructions.\n');
}));
