import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, access, readdir, realpath } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

async function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    join(dirname(process.execPath), '../share/nodejs/npm/bin/npm-cli.js'),
  ].filter(Boolean);
  for (const path of candidates) {
    try { await access(path); return path; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  throw new Error('npm CLI was not found; run this test with npm test');
}

function run(program, args, cwd) {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, `${program} ${args.join(' ')}\n${result.error?.message ?? ''}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

test('npm archive contains the full verified bundle and CLI installs/removes offline from another cwd', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'omnistack-distribution-test-'));
  try {
    const project = join(temporary, 'example project');
    const extraction = join(temporary, 'extracted');
    await Promise.all([mkdir(project), mkdir(extraction)]);
    const cli = await npmCli();
    const output = run(process.execPath, [cli, 'pack', '--ignore-scripts', '--json', '--offline', '--cache', join(temporary, 'npm-cache'), '--pack-destination', temporary], ROOT);
    const packed = JSON.parse(output);
    assert.equal(packed.length, 1);
    assert.equal(basename(packed[0].filename), packed[0].filename);
    assert.match(packed[0].filename, /^omnistack-agent-.*\.tgz$/);
    const archive = join(temporary, packed[0].filename);
    const entries = run('tar', ['-tzf', archive], ROOT).trim().split(/\r?\n/);
    for (const entry of entries) {
      assert.ok(entry.startsWith('package/'), entry);
      assert.ok(!entry.split('/').includes('..'), entry);
      assert.ok(!entry.includes('\\'), entry);
      assert.ok(!/(?:^|\/)(?:node_modules|\.git|\.github|\.env)(?:\/|$)/.test(entry), entry);
      assert.ok(!entry.endsWith('.test.mjs'), entry);
    }
    const manifest = JSON.parse(await readFile(join(ROOT, 'packages/manifest.json'), 'utf8'));
    for (const path of ['package.json', 'scripts/install.mjs', 'scripts/installer-lib.mjs', 'packages/manifest.json', 'LICENSE']) {
      assert.ok(entries.includes(`package/${path}`), `Missing archive entry: ${path}`);
    }
    for (const skill of manifest.skills) {
      for (const file of skill.files) assert.ok(entries.includes(`package/packages/${skill.path}/${file.path}`));
    }
    run('tar', ['-xzf', archive, '-C', extraction], ROOT);
    const packedRoot = join(extraction, 'package');
    const packageJson = JSON.parse(await readFile(join(packedRoot, 'package.json'), 'utf8'));
    assert.equal(packageJson.bin['omnistack-agent'], 'scripts/install.mjs');
    assert.equal(packageJson.version, manifest.version);
    const installer = join(packedRoot, packageJson.bin['omnistack-agent']);
    assert.ok((await readFile(installer, 'utf8')).startsWith('#!/usr/bin/env node\n'));
    const npmProject = join(temporary, 'npm consumer');
    await mkdir(npmProject);
    run(process.execPath, [cli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--offline', '--cache', join(temporary, 'npm-cache'), '--prefix', npmProject, archive], ROOT);
    await access(join(npmProject, 'node_modules/.bin', process.platform === 'win32' ? 'omnistack-agent.cmd' : 'omnistack-agent'));
    const registeredVersion = run(process.execPath, [cli, 'exec', '--offline', '--prefix', npmProject, '--', 'omnistack-agent', '--version'], npmProject);
    assert.equal(registeredVersion.trim(), manifest.version);
    assert.equal(run(process.execPath, [installer, '--version'], project).trim(), manifest.version);
    const args = ['--platform', 'codex', '--project', project];
    const preview = run(process.execPath, [installer, 'install', ...args, '--dry-run'], project);
    assert.match(preview, /Preview: install/);
    assert.match(preview, /No files changed/);
    assert.deepEqual(await readdir(project), []);
    const installed = run(process.execPath, [installer, 'install', ...args], project);
    assert.match(installed, /Result: install/);
    const canonicalProject = await realpath(project);
    for (const skill of manifest.skills) await access(join(canonicalProject, '.agents/skills', skill.name, 'SKILL.md'));
    const repeated = run(process.execPath, [installer, 'install', ...args], project);
    assert.equal((repeated.match(/  unchanged:/g) ?? []).length, manifest.skills.length);
    const removalPreview = run(process.execPath, [installer, 'uninstall', ...args, '--dry-run'], project);
    assert.match(removalPreview, /Preview: uninstall/);
    run(process.execPath, [installer, 'uninstall', ...args], project);
    assert.deepEqual(await readdir(join(project, '.agents/skills')), []);
  } finally {
    assert.equal(dirname(temporary), tmpdir());
    assert.ok(basename(temporary).startsWith('omnistack-distribution-test-'));
    await rm(temporary, { recursive: true, force: true });
  }
});
