import { createHash } from 'node:crypto';
import { lstat, realpath, readFile, readdir, mkdir, open, unlink, rmdir } from 'node:fs/promises';
import { resolve, join, relative, sep, isAbsolute, dirname } from 'node:path';

export const PLATFORM_PATHS = Object.freeze({
  claude: '.claude/skills',
  copilot: '.github/skills',
  cursor: '.cursor/skills',
  codex: '.agents/skills',
});
const RECEIPT = '.omnistack-install.json';
const HASH = /^[a-f0-9]{64}$/;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sha256 = (content) => createHash('sha256').update(content).digest('hex');

export class InstallerError extends Error {
  constructor(message, report) {
    super(message);
    this.name = 'InstallerError';
    this.report = report;
  }
}

function safePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || isAbsolute(value)) return false;
  return value.split('/').every((part) => part && part !== '.' && part !== '..'
    && !/[\x00-\x1f\x7f<>:"|?*]/.test(part) && !/[. ]$/.test(part)
    && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}

function confined(root, path) {
  const inside = relative(root, path);
  if (inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) {
    throw new InstallerError(`Path escapes its root: ${path}`);
  }
}

async function statIfPresent(path) {
  try { return await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function checkedRoot(path, label) {
  if (typeof path !== 'string' || !path) throw new InstallerError(`${label} must be an existing directory`);
  const resolved = resolve(path);
  const info = await lstat(resolved);
  if (info.isSymbolicLink() || !info.isDirectory()) throw new InstallerError(`${label} must be an existing directory without a symlink or junction: ${resolved}`);
  const canonical = await realpath(resolved);
  return canonical;
}

async function checkPath(root, path) {
  confined(root, path);
  const rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory() || resolve(await realpath(root)) !== resolve(root)) {
    throw new InstallerError('Root directory changed or became a symlink/junction');
  }
  const parts = relative(root, path).split(sep).filter(Boolean);
  let current = root;
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i]);
    const info = await statIfPresent(current);
    if (!info) return false;
    if (info.isSymbolicLink()) throw new InstallerError(`Symlinks and junctions are not supported: ${current}`);
    if (i < parts.length - 1 && !info.isDirectory()) throw new InstallerError(`Expected a directory: ${current}`);
    confined(root, await realpath(current));
  }
  return true;
}

function validateFiles(files, label) {
  if (!Array.isArray(files) || files.length === 0) throw new InstallerError(`${label}: missing file list`);
  const seen = new Set();
  for (const file of files) {
    if (!file || !safePath(file.path) || typeof file.sha256 !== 'string' || !HASH.test(file.sha256)
      || file.path.toLowerCase() === RECEIPT || seen.has(file.path.toLowerCase())) {
      throw new InstallerError(`${label}: invalid or duplicate file path/hash`);
    }
    seen.add(file.path.toLowerCase());
  }
  if (!files.some((file) => file.path === 'SKILL.md')) throw new InstallerError(`${label}: missing SKILL.md`);
  const directoryCases = new Map();
  for (const file of files) {
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      const directory = parts.slice(0, i).join('/');
      const key = directory.toLowerCase();
      if (seen.has(key)) throw new InstallerError(`${label}: file and directory paths overlap`);
      if (directoryCases.has(key) && directoryCases.get(key) !== directory) {
        throw new InstallerError(`${label}: case aliases in directory paths`);
      }
      directoryCases.set(key, directory);
    }
  }
  return files.map(({ path, sha256: hash }) => ({ path, sha256: hash }));
}

async function inventory(root) {
  const files = [];
  const directories = [];
  async function visit(path, prefix = '') {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (!safePath(name)) throw new InstallerError(`Unsafe installed file path: ${name}`);
      const child = join(path, entry.name);
      await checkPath(root, child);
      if (entry.isDirectory()) { directories.push(name); await visit(child, name); }
      else if (entry.isFile()) files.push(name);
      else throw new InstallerError(`Only regular files and directories are supported: ${child}`);
    }
  }
  await visit(root);
  return { files: files.sort(), directories: directories.sort() };
}

function expectedDirectories(files) {
  const directories = new Set();
  for (const { path } of files) {
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
  }
  return [...directories].sort();
}

function sameFiles(a, b) {
  const sorted = (files) => files.map((file) => `${file.path}\0${file.sha256}`).sort();
  return JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
}

async function readJson(path, label) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { throw new InstallerError(`${label}: ${error.message}`); }
}

export async function loadPackage(packageRoot) {
  const root = await checkedRoot(packageRoot, 'Package root');
  await checkPath(root, join(root, 'manifest.json'));
  const manifest = await readJson(join(root, 'manifest.json'), 'Invalid package manifest');
  if (!manifest || typeof manifest !== 'object' || manifest.schemaVersion !== 1 || typeof manifest.version !== 'string'
    || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(manifest.version)
    || !Array.isArray(manifest.skills) || manifest.skills.length === 0) {
    throw new InstallerError('Invalid package manifest schema or version');
  }
  const names = new Set();
  const skills = [];
  for (const entry of manifest.skills) {
    if (!entry || typeof entry.name !== 'string' || entry.name.length > 64 || !NAME.test(entry.name)
      || names.has(entry.name) || entry.path !== `skills/${entry.name}`) {
      throw new InstallerError('Invalid or duplicate skill name/path in package manifest');
    }
    names.add(entry.name);
    const files = validateFiles(entry.files, entry.name);
    const path = join(root, entry.path);
    if (!await checkPath(root, path) || !(await lstat(path)).isDirectory()) throw new InstallerError(`Missing skill directory: ${entry.name}`);
    const actual = await inventory(path);
    if (JSON.stringify(actual.files) !== JSON.stringify(files.map((file) => file.path).sort())
      || JSON.stringify(actual.directories) !== JSON.stringify(expectedDirectories(files))) {
      throw new InstallerError(`Unmanifested or missing files/directories in package: ${entry.name}`);
    }
    const contents = new Map();
    for (const file of files) {
      const content = await readFile(join(path, file.path));
      if (sha256(content) !== file.sha256) throw new InstallerError(`Package checksum mismatch: ${entry.name}/${file.path}`);
      contents.set(file.path, content);
    }
    skills.push({ name: entry.name, files, contents });
  }
  return { version: manifest.version, skills };
}

async function ownedSkill(project, path, name) {
  if (!await checkPath(project, path)) return null;
  if (!(await lstat(path)).isDirectory()) throw new InstallerError('Skill destination already exists as a file');
  const actual = await inventory(path);
  if (!actual.files.includes(RECEIPT)) throw new InstallerError('Existing skill has no installation receipt');
  const receipt = await readJson(join(path, RECEIPT), 'Invalid installation receipt');
  if (!receipt || typeof receipt !== 'object' || receipt.schemaVersion !== 1 || receipt.skill !== name || typeof receipt.version !== 'string'
    || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(receipt.version)) {
    throw new InstallerError('Invalid installation receipt schema');
  }
  const files = validateFiles(receipt.files, `Receipt for ${name}`);
  if (JSON.stringify(actual.files) !== JSON.stringify([...files.map((file) => file.path), RECEIPT].sort())
    || JSON.stringify(actual.directories) !== JSON.stringify(expectedDirectories(files))) {
    throw new InstallerError('Installed skill contains missing files or unmanaged additions');
  }
  for (const file of files) {
    const content = await readFile(join(path, file.path));
    if (sha256(content) !== file.sha256) throw new InstallerError(`Installed file was modified: ${file.path}`);
  }
  return { receipt, files };
}

export async function planSkills({ command = 'install', platform, project, skill = 'all', dryRun = false, packageRoot } = {}) {
  if (command !== 'install' && command !== 'uninstall') throw new InstallerError('Command must be install or uninstall');
  if (!Object.hasOwn(PLATFORM_PATHS, platform)) throw new InstallerError(`Unknown platform: ${platform}`);
  if (typeof project !== 'string' || !project) throw new InstallerError('An existing --project directory is required');
  const projectRoot = await checkedRoot(project, 'Project');
  const bundle = await loadPackage(packageRoot);
  const selected = skill === 'all' ? bundle.skills : bundle.skills.filter((entry) => entry.name === skill);
  if (selected.length === 0) throw new InstallerError(`Unknown skill: ${skill}`);
  const report = { version: bundle.version, command, platform, project: projectRoot, dryRun: Boolean(dryRun), skills: [], conflicts: [] };
  const operations = [];
  for (const entry of selected) {
    const path = join(projectRoot, PLATFORM_PATHS[platform], entry.name);
    try {
      const owned = await ownedSkill(projectRoot, path, entry.name);
      if (command === 'install' && owned && !sameFiles(owned.files, entry.files)) {
        throw new InstallerError('Installed skill differs from this package; uninstall it first after preserving edits');
      }
      const status = command === 'install' ? (owned ? 'unchanged' : 'install') : (owned ? 'uninstall' : 'absent');
      report.skills.push({ name: entry.name, path, status });
      operations.push({ ...entry, path, status, owned });
    } catch (error) {
      if (!(error instanceof InstallerError)) throw error;
      report.skills.push({ name: entry.name, path, status: 'conflict', reason: error.message });
      report.conflicts.push(`${entry.name}: ${error.message}`);
    }
  }
  return { report, operations };
}

async function ensureDirectories(root, path, created) {
  confined(root, path);
  let current = root;
  for (const part of relative(root, path).split(sep).filter(Boolean)) {
    current = join(current, part);
    const info = await statIfPresent(current);
    if (!info) {
      try { await mkdir(current); created.push(current); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    await checkPath(root, current);
    if (!(await lstat(current)).isDirectory()) throw new InstallerError(`Expected a directory: ${current}`);
  }
}

async function exclusiveWrite(project, path, content, createdFiles) {
  await checkPath(project, dirname(path));
  const handle = await open(path, 'wx');
  try {
    const info = await handle.stat();
    createdFiles.push({ path, dev: info.dev, ino: info.ino });
    await handle.writeFile(content);
  } finally { await handle.close(); }
}

async function rollback(project, files, directories) {
  const failures = [];
  for (const file of [...files].reverse()) {
    try {
      await checkPath(project, file.path);
      const info = await statIfPresent(file.path);
      if (info && info.dev === file.dev && info.ino === file.ino && info.isFile()) await unlink(file.path);
    } catch (error) { failures.push(error.message); }
  }
  for (const path of [...directories].reverse()) {
    try { await checkPath(project, path); await rmdir(path); }
    catch (error) { if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) failures.push(error.message); }
  }
  return failures;
}

export async function applySkillPlan(plan) {
  const { report, operations } = plan;
  if (report.dryRun) return report;
  if (report.conflicts.length) throw new InstallerError(`No files changed. Resolve conflicts before ${report.command}.`, report);
  // Repeat ownership checks immediately before any mutation, including plans kept for a preview.
  for (const entry of operations) {
    const owned = await ownedSkill(report.project, entry.path, entry.name);
    if ((entry.owned === null) !== (owned === null) || (owned && !sameFiles(entry.owned.files, owned.files))) {
      throw new InstallerError(`Destination changed after preview: ${entry.name}`);
    }
  }
  if (report.command === 'install') {
    const files = [];
    const directories = [];
    try {
      for (const entry of operations.filter((item) => item.status === 'install')) {
        await ensureDirectories(report.project, entry.path, directories);
        for (const file of entry.files) {
          const path = join(entry.path, file.path);
          await ensureDirectories(report.project, dirname(path), directories);
          await exclusiveWrite(report.project, path, entry.contents.get(file.path), files);
        }
        const receipt = { schemaVersion: 1, version: report.version, skill: entry.name, files: entry.files };
        await exclusiveWrite(report.project, join(entry.path, RECEIPT), `${JSON.stringify(receipt, null, 2)}\n`, files);
      }
    } catch (error) {
      const failures = await rollback(report.project, files, directories);
      const detail = failures.length ? ` Rollback could not remove: ${failures.join('; ')}` : ' Newly created files were rolled back.';
      throw new InstallerError(`Installation failed: ${error.message}.${detail}`, report);
    }
  } else {
    for (const entry of operations.filter((item) => item.status === 'uninstall')) {
      // Never recursively delete a skill directory: only receipt-owned unchanged files.
      for (const file of entry.owned.files) {
        const path = join(entry.path, file.path);
        await checkPath(report.project, path);
        if (sha256(await readFile(path)) !== file.sha256) throw new InstallerError(`Installed file changed during removal: ${file.path}`);
        await unlink(path);
      }
      await checkPath(report.project, join(entry.path, RECEIPT));
      await unlink(join(entry.path, RECEIPT));
      for (const directory of expectedDirectories(entry.owned.files).sort((a, b) => b.length - a.length)) {
        const path = join(entry.path, directory);
        await checkPath(report.project, path);
        await rmdir(path);
      }
      await rmdir(entry.path);
    }
  }
  return report;
}

export async function manageSkills(options) {
  return applySkillPlan(await planSkills(options));
}
