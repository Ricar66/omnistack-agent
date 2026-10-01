import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import {
  assembleCore, assembleKnowledge, renderTarget, normalizeEol,
  validateSources, validateTargets, TARGETS,
} from './lib.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readCore(root) {
  const dir = join(root, 'core');
  const names = (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name).sort();
  return Promise.all(
    names.map(async (name) => ({ name, body: normalizeEol(await readFile(join(dir, name), 'utf8')) })),
  );
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
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

/** Pure of writes; optional root/targets allow isolated validation and tests. */
export async function buildAll({ root = ROOT, targets = TARGETS } = {}) {
  validateTargets(targets);
  const [coreFiles, { indexBody, modules }] = await Promise.all([
    readCore(root), readKnowledge(root),
  ]);
  validateSources({ coreFiles, indexBody, modules });
  const coreStr = assembleCore(coreFiles);
  return targets.map((target) => ({
    outPath: target.outPath,
    content: renderTarget(target, coreStr, assembleKnowledge(modules, indexBody, target.mode)),
  }));
}

/** All source, manifest, and budget checks finish before the first write. */
export async function writeAdapters({ root = ROOT, targets = TARGETS } = {}) {
  const results = await buildAll({ root, targets });
  for (const result of results) {
    const abs = join(root, result.outPath);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, result.content, 'utf8');
  }
  return results;
}

async function main() {
  const results = await writeAdapters();
  for (const result of results) console.log(`✓ ${result.outPath}`);
  console.log(`\nBuilt ${results.length} adapters.`);
}

// Importing the builder never writes files, even when argv[1] is absent.
if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`✗ ${err.message}`); process.exitCode = 1; });
}
