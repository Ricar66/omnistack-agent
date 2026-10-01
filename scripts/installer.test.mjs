import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm, access, symlink, copyFile, readdir, rmdir, realpath } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { InstallerError, PLATFORM_PATHS, loadPackage, planSkills, applySkillPlan, manageSkills } from './installer-lib.mjs';
import { parseArguments } from './install.mjs';

const hash = (content) => createHash('sha256').update(content).digest('hex');
const scriptRoot = new URL('./', import.meta.url);

async function withFixture(fn) {
  const root = await mkdtemp(join(tmpdir(), 'omnistack-install-test-'));
  try {
    const packageRoot = join(root, 'packages');
    const project = join(root, 'project with spaces');
    const outside = join(root, 'outside');
    await Promise.all([mkdir(packageRoot), mkdir(project), mkdir(outside)]);
    const skills = [];
    for (const name of ['omnistack-agent', 'omnistack-debug']) {
      const sources = [
        ['SKILL.md', `---\nname: ${name}\ndescription: Test skill.\n---\n# ${name}\n`],
        ['references/topic.md', '# A reference\n'],
      ];
      const files = [];
      for (const [path, content] of sources) {
        const destination = join(packageRoot, 'skills', name, path);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, content);
        files.push({ path, sha256: hash(content) });
      }
      skills.push({ name, path: `skills/${name}`, files });
    }
    const manifest = { schemaVersion: 1, version: '0.2.0', skills };
    await writeFile(join(packageRoot, 'manifest.json'), JSON.stringify(manifest));
    const options = { packageRoot, project, platform: 'claude' };
    await fn({ root, packageRoot, project, outside, manifest, options });
  } finally {
    assert.equal(dirname(root), tmpdir());
    assert.ok(basename(root).startsWith('omnistack-install-test-'));
    await rm(root, { recursive: true, force: true });
  }
}

async function assertMissing(path) {
  await assert.rejects(access(path), { code: 'ENOENT' });
}

async function saveManifest(packageRoot, manifest) {
  await writeFile(join(packageRoot, 'manifest.json'), JSON.stringify(manifest));
}

test('argument parser handles defaults and rejects unknown, duplicate or missing options', () => {
  assert.deepEqual(parseArguments(['--platform', 'codex', '--project', 'my app', '--dry-run']), {
    command: 'install', skill: 'all', dryRun: true, platform: 'codex', project: 'my app',
  });
  assert.equal(parseArguments(['uninstall', '--skill', 'omnistack-debug']).command, 'uninstall');
  assert.deepEqual(parseArguments(['--help']), { help: true });
  assert.deepEqual(parseArguments(['--version']), { version: true });
  for (const args of [['constructor'], ['__proto__'], ['--force'], ['--project'], ['--platform', '--dry-run'], ['--dry-run', '--dry-run'], ['--version', '--dry-run']]) {
    assert.throws(() => parseArguments(args), InstallerError);
  }
});

test('dry run previews all skills without making project directories', () => withFixture(async ({ options, project }) => {
  const report = await manageSkills({ ...options, dryRun: true });
  assert.deepEqual(report.skills.map((skill) => skill.status), ['install', 'install']);
  assert.deepEqual(report.conflicts, []);
  assert.deepEqual(await readdir(project), []);
}));

test('installation is idempotent and preserves project guidance and unrelated skills', () => withFixture(async ({ options, project, manifest }) => {
  const guidance = ['CLAUDE.md', 'AGENTS.md', '.github/copilot-instructions.md', '.claude/skills/my-existing/SKILL.md'];
  for (const path of guidance) {
    await mkdir(dirname(join(project, path)), { recursive: true });
    await writeFile(join(project, path), `Keep ${path}\n`);
  }
  const installed = await manageSkills(options);
  assert.deepEqual(installed.skills.map((skill) => skill.status), ['install', 'install']);
  const destination = join(project, '.claude/skills/omnistack-agent');
  const receipt = JSON.parse(await readFile(join(destination, '.omnistack-install.json'), 'utf8'));
  assert.deepEqual(receipt, { schemaVersion: 1, version: '0.2.0', skill: 'omnistack-agent', files: manifest.skills[0].files });
  const repeated = await manageSkills(options);
  assert.deepEqual(repeated.skills.map((skill) => skill.status), ['unchanged', 'unchanged']);
  for (const path of guidance) assert.equal(await readFile(join(project, path), 'utf8'), `Keep ${path}\n`);
}));

test('each supported platform uses its project-specific discovery directory', () => withFixture(async ({ options, project }) => {
  for (const [platform, directory] of Object.entries(PLATFORM_PATHS)) {
    const report = await manageSkills({ ...options, platform, skill: 'omnistack-debug' });
    assert.equal(report.skills[0].path, join(await realpath(project), directory, 'omnistack-debug'));
    await access(join(report.skills[0].path, 'SKILL.md'));
  }
}));

test('a conflict in the last selected skill prevents every new installation', () => withFixture(async ({ options, project }) => {
  const existing = join(project, '.claude/skills/omnistack-debug');
  await mkdir(existing, { recursive: true });
  await writeFile(join(existing, 'SKILL.md'), 'User content');
  const preview = await manageSkills({ ...options, dryRun: true });
  assert.deepEqual(preview.skills.map((skill) => skill.status), ['install', 'conflict']);
  await assert.rejects(manageSkills(options), /No files changed/);
  await assertMissing(join(project, '.claude/skills/omnistack-agent'));
  assert.equal(await readFile(join(existing, 'SKILL.md'), 'utf8'), 'User content');
}));

test('modified installed content and unmanaged additions are never overwritten', () => withFixture(async ({ options, project }) => {
  await manageSkills(options);
  const destination = join(project, '.claude/skills/omnistack-agent');
  const path = join(destination, 'SKILL.md');
  const original = await readFile(path);
  await writeFile(path, 'Local edit');
  await assert.rejects(manageSkills(options), /No files changed/);
  assert.equal(await readFile(path, 'utf8'), 'Local edit');
  await writeFile(path, original);
  await writeFile(join(destination, 'my-note.txt'), 'Keep me');
  await assert.rejects(manageSkills(options), /No files changed/);
  assert.equal(await readFile(join(destination, 'my-note.txt'), 'utf8'), 'Keep me');
}));

test('a changed package requires clean uninstall before reinstalling', () => withFixture(async ({ options, packageRoot, manifest, project }) => {
  await manageSkills(options);
  const path = join(packageRoot, 'skills/omnistack-agent/SKILL.md');
  const changed = 'Updated skill content';
  await writeFile(path, changed);
  manifest.skills[0].files[0].sha256 = hash(changed);
  await saveManifest(packageRoot, manifest);
  await assert.rejects(manageSkills(options), /No files changed/);
  assert.notEqual(await readFile(join(project, '.claude/skills/omnistack-agent/SKILL.md'), 'utf8'), changed);
}));

test('tampered package hashes or unmanifested files fail before touching project', () => withFixture(async ({ options, packageRoot, project }) => {
  const path = join(packageRoot, 'skills/omnistack-debug/references/topic.md');
  const original = await readFile(path);
  await writeFile(path, 'Tampered');
  await assert.rejects(manageSkills(options), /checksum mismatch/);
  assert.deepEqual(await readdir(project), []);
  await writeFile(path, original);
  await writeFile(join(packageRoot, 'skills/omnistack-debug/unlisted.txt'), 'Extra');
  await assert.rejects(manageSkills(options), /Unmanifested/);
  assert.deepEqual(await readdir(project), []);
}));

test('unsafe file paths, case aliases, hashes and duplicate names are rejected', () => withFixture(async ({ options, packageRoot, manifest, project }) => {
  const original = JSON.stringify(manifest);
  for (const unsafe of ['../SKILL.md', '/SKILL.md', 'C:/SKILL.md', 'references\\topic.md', 'CON.md', 'refs/trailing./topic.md', 'refs /topic.md', 'refs/name:stream', 'refs/../topic.md', '.omnistack-install.json']) {
    const bad = JSON.parse(original);
    bad.skills[0].files[1].path = unsafe;
    await saveManifest(packageRoot, bad);
    await assert.rejects(manageSkills(options), /invalid or duplicate/);
  }
  const duplicate = JSON.parse(original);
  duplicate.skills[0].files.push({ ...duplicate.skills[0].files[0], path: 'skill.md' });
  await saveManifest(packageRoot, duplicate);
  await assert.rejects(manageSkills(options), /invalid or duplicate/);
  const badHash = JSON.parse(original);
  badHash.skills[0].files[0].sha256 = 'not-a-hash';
  await saveManifest(packageRoot, badHash);
  await assert.rejects(manageSkills(options), /invalid or duplicate/);
  const repeated = JSON.parse(original);
  repeated.skills.push(repeated.skills[0]);
  await saveManifest(packageRoot, repeated);
  await assert.rejects(manageSkills(options), /duplicate skill/);
  assert.deepEqual(await readdir(project), []);
}));

test('invalid manifest schemas and selectors produce errors without mutations', () => withFixture(async ({ options, packageRoot, project, manifest }) => {
  for (const invalid of [null, {}, { ...manifest, schemaVersion: 2 }, { ...manifest, version: '../../escape' }, { ...manifest, skills: [] }]) {
    await saveManifest(packageRoot, invalid);
    await assert.rejects(manageSkills(options), /Invalid package manifest/);
  }
  await saveManifest(packageRoot, manifest);
  for (const override of [{ platform: '__proto__' }, { skill: 'missing' }, { command: 'delete' }, { project: join(project, 'missing') }]) {
    await assert.rejects(manageSkills({ ...options, ...override }));
  }
  assert.deepEqual(await readdir(project), []);
}));

test('uninstall preview and clean reversal preserve unrelated project data', () => withFixture(async ({ options, project }) => {
  await writeFile(join(project, 'AGENTS.md'), 'Keep me');
  await manageSkills(options);
  const preview = await manageSkills({ ...options, command: 'uninstall', dryRun: true });
  assert.deepEqual(preview.skills.map((skill) => skill.status), ['uninstall', 'uninstall']);
  await access(join(project, '.claude/skills/omnistack-agent/SKILL.md'));
  const removed = await manageSkills({ ...options, command: 'uninstall' });
  assert.deepEqual(removed.skills.map((skill) => skill.status), ['uninstall', 'uninstall']);
  await assertMissing(join(project, '.claude/skills/omnistack-agent'));
  await assertMissing(join(project, '.claude/skills/omnistack-debug'));
  assert.equal(await readFile(join(project, 'AGENTS.md'), 'utf8'), 'Keep me');
  const repeated = await manageSkills({ ...options, command: 'uninstall' });
  assert.deepEqual(repeated.skills.map((skill) => skill.status), ['absent', 'absent']);
}));

test('uninstall refuses a late modified skill before deleting any selected files', () => withFixture(async ({ options, project }) => {
  await manageSkills(options);
  const path = join(project, '.claude/skills/omnistack-debug/references/topic.md');
  await writeFile(path, 'Keep local edit');
  await assert.rejects(manageSkills({ ...options, command: 'uninstall' }), /No files changed/);
  await access(join(project, '.claude/skills/omnistack-agent/SKILL.md'));
  assert.equal(await readFile(path, 'utf8'), 'Keep local edit');
}));

test('uninstall refuses missing files, forged traversal receipts and extra empty directories', () => withFixture(async ({ options, project }) => {
  await manageSkills(options);
  const destination = join(project, '.claude/skills/omnistack-agent');
  await mkdir(join(destination, 'my-empty-directory'));
  await assert.rejects(manageSkills({ ...options, command: 'uninstall' }), /No files changed/);
  await rmdir(join(destination, 'my-empty-directory'));
  const reference = join(destination, 'references/topic.md');
  const originalReference = await readFile(reference);
  await rm(reference);
  await assert.rejects(manageSkills({ ...options, command: 'uninstall' }), /No files changed/);
  await access(join(destination, 'SKILL.md'));
  await writeFile(reference, originalReference);
  const receiptPath = join(destination, '.omnistack-install.json');
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  receipt.files[0].path = '../../../AGENTS.md';
  await writeFile(receiptPath, JSON.stringify(receipt));
  await assert.rejects(manageSkills({ ...options, command: 'uninstall' }), /No files changed/);
  await access(join(destination, 'SKILL.md'));
}));

test('changed destinations after planning are refused without applying the earlier plan', () => withFixture(async ({ options, project }) => {
  const plan = await planSkills(options);
  const destination = join(project, '.claude/skills/omnistack-debug');
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, 'SKILL.md'), 'Created after preview');
  await assert.rejects(applySkillPlan(plan), /receipt/);
  await assertMissing(join(project, '.claude/skills/omnistack-agent'));
}));

test('project destination junctions/symlinks cannot redirect writes outside the project', (t) => withFixture(async ({ options, project, outside }) => {
  try { await symlink(outside, join(project, '.claude'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) { t.skip(`Link creation unavailable: ${error.code}`); return; } throw error; }
  const preview = await manageSkills({ ...options, dryRun: true });
  assert.equal(preview.conflicts.length, 2);
  await assert.rejects(manageSkills(options), /No files changed/);
  assert.deepEqual(await readdir(outside), []);
}));

test('package junctions/symlinks cannot read untrusted reference files outside the bundle', (t) => withFixture(async ({ options, packageRoot, outside }) => {
  const references = join(packageRoot, 'skills/omnistack-agent/references');
  await rm(join(references, 'topic.md'));
  await rmdir(references);
  await writeFile(join(outside, 'topic.md'), '# A reference\n');
  try { await symlink(outside, references, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) { t.skip(`Link creation unavailable: ${error.code}`); return; } throw error; }
  await assert.rejects(manageSkills(options), /Symlinks and junctions/);
}));

test('CLI resolves its bundle relative to the script even when run from another cwd', () => withFixture(async ({ root, project }) => {
  const scripts = join(root, 'scripts');
  await mkdir(scripts);
  for (const name of ['install.mjs', 'installer-lib.mjs']) await copyFile(new URL(name, scriptRoot), join(scripts, name));
  const cli = join(scripts, 'install.mjs');
  const version = spawnSync(process.execPath, [cli, '--version'], { cwd: project, encoding: 'utf8' });
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), '0.2.0');
  const preview = spawnSync(process.execPath, [cli, 'install', '--platform', 'codex', '--project', project, '--dry-run'], { cwd: project, encoding: 'utf8' });
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /Preview: install/);
  assert.match(preview.stdout, /No files changed/);
  assert.deepEqual(await readdir(project), []);
  const help = spawnSync(process.execPath, [cli, '--help'], { cwd: project, encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /project directory must already exist/);
}));

test('case aliases in parent directories are rejected before reading package content', () => withFixture(async ({ options, packageRoot, manifest }) => {
  manifest.skills[0].files.push({ path: 'References/extra.md', sha256: hash('Extra') });
  await saveManifest(packageRoot, manifest);
  await assert.rejects(manageSkills(options), /case aliases/);
}));

test('unexpected write failures roll back only files created by that attempt', () => withFixture(async ({ options, project }) => {
  const keep = join(project, '.claude/skills/my-existing/SKILL.md');
  await mkdir(dirname(keep), { recursive: true });
  await writeFile(keep, 'Preserve this existing skill');
  const plan = await planSkills(options);
  // A buffer-writing failure after earlier skill files were created exercises rollback without a production test hook.
  plan.operations[1].contents.set('SKILL.md', Symbol('unwritable content'));
  await assert.rejects(applySkillPlan(plan), /Newly created files were rolled back/);
  assert.equal(await readFile(keep, 'utf8'), 'Preserve this existing skill');
  await assertMissing(join(project, '.claude/skills/omnistack-agent'));
  await assertMissing(join(project, '.claude/skills/omnistack-debug'));
}));
