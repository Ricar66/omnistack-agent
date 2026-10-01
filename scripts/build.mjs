import { readdir, readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import {
  assembleCore, assembleKnowledge, renderTarget, normalizeEol,
  validateSources, validateTargets, portableRelativePath, TARGETS,
} from './lib.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function sourceEntries(dir) {
  const stat = await lstat(dir);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${dir}: expected a source directory, not a link.`);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink() || !portableRelativePath(entry.name)) {
      throw new Error(`${join(dir, entry.name)}: unsafe source path.`);
    }
  }
  return entries;
}

async function readCore(root) {
  const dir = join(root, 'core');
  const names = (await sourceEntries(dir))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name).sort();
  return Promise.all(
    names.map(async (name) => ({ name, body: normalizeEol(await readFile(join(dir, name), 'utf8')) })),
  );
}

async function walk(dir) {
  const out = [];
  for (const entry of await sourceEntries(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

async function readKnowledge(root) {
  const dir = join(root, 'knowledge');
  const entries = (await walk(dir)).map((abs) => ({
    abs, rel: relative(root, abs).split('\\').join('/'),
  })).sort((a, b) => a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0);
  let indexBody = '';
  const modules = [];
  for (const entry of entries) {
    const body = normalizeEol(await readFile(entry.abs, 'utf8'));
    if (entry.rel === 'knowledge/_index.md') indexBody = body;
    else modules.push({ path: entry.rel, body });
  }
  return { indexBody, modules };
}

export async function readSources(root = ROOT) {
  const [coreFiles, { indexBody, modules }] = await Promise.all([
    readCore(root), readKnowledge(root),
  ]);
  const sources = { coreFiles, indexBody, modules };
  validateSources(sources);
  return sources;
}

/** Pure of writes; optional root/targets allow isolated validation and tests. */
export async function buildAll({ root = ROOT, targets = TARGETS } = {}) {
  validateTargets(targets);
  const { coreFiles, indexBody, modules } = await readSources(root);
  const coreStr = assembleCore(coreFiles);
  return targets.map((target) => ({
    outPath: target.outPath,
    content: renderTarget(target, coreStr, assembleKnowledge(modules, indexBody, target.mode)),
  }));
}

async function writeResults(root, results) {
  // Refuse existing links anywhere in generated destinations before writing.
  for (const result of results) {
    const parts = result.outPath.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const abs = join(root, ...parts.slice(0, i));
      try {
        const stat = await lstat(abs);
        if (stat.isSymbolicLink() || (i < parts.length && !stat.isDirectory())
          || (i === parts.length && !stat.isFile())) throw new Error(`${result.outPath}: unsafe output path.`);
      } catch (err) { if (err.code !== 'ENOENT') throw err; }
    }
  }
  for (const result of results) {
    const abs = join(root, result.outPath);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, result.content, 'utf8');
  }
  return results;
}

/** Legacy adapter API remains independent of skill workflow sources. */
export async function writeAdapters({ root = ROOT, targets = TARGETS } = {}) {
  return writeResults(root, await buildAll({ root, targets }));
}

/** Validate all adapter and package outputs before the first write. */
export async function writeDistribution({ root = ROOT, targets = TARGETS } = {}) {
  const { buildPackages } = await import('./packages.mjs');
  const [adapters, packages] = await Promise.all([buildAll({ root, targets }), buildPackages({ root })]);
  return writeResults(root, [...adapters, ...packages]);
}

async function main() {
  const results = await writeDistribution();
  for (const result of results) console.log(`✓ ${result.outPath}`);
  console.log(`\nBuilt ${TARGETS.length} adapters and 4 skill packages.`);
}

if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`✗ ${err.message}`); process.exitCode = 1; });
}
