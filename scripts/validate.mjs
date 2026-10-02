import { readFile, readdir, lstat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import { buildAll, ROOT } from './build.mjs';
import { normalizeEol, TARGETS } from './lib.mjs';

async function compareResults(root, results, normalized = false) {
  const stale = [];
  for (const result of results) {
    let onDisk;
    try { onDisk = await readFile(join(root, result.outPath), normalized ? 'utf8' : undefined); }
    catch (err) {
      if (err.code !== 'ENOENT') throw err;
      stale.push(`${result.outPath} (missing)`);
      continue;
    }
    if (normalized ? normalizeEol(onDisk) !== result.content : !onDisk.equals(Buffer.from(result.content, 'utf8'))) stale.push(result.outPath);
  }
  return stale;
}

/** Legacy adapter comparison accepts normalized checkouts and never writes. */
export async function validateAll({ root = ROOT, targets = TARGETS } = {}) {
  return compareResults(root, await buildAll({ root, targets }), true);
}

async function packageFiles(root, path = 'packages') {
  let stat;
  try { stat = await lstat(join(root, path)); }
  catch (err) { if (err.code === 'ENOENT') return []; throw err; }
  if (stat.isSymbolicLink()) throw new Error(`${path}: unsafe package output link.`);
  if (!stat.isDirectory()) return [path];
  const files = [`${path}/`];
  for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
    files.push(...await packageFiles(root, `${path}/${entry.name}`));
  }
  return files.sort();
}

/** Package bytes must match manifest hashes exactly; extra files are drift. */
export async function validateDistribution({ root = ROOT, targets = TARGETS } = {}) {
  const { buildPackages } = await import('./packages.mjs');
  const [adapters, packages] = await Promise.all([buildAll({ root, targets }), buildPackages({ root })]);
  const actual = await packageFiles(root);
  const expected = new Set(packages.map((result) => result.outPath));
  for (const result of packages) {
    const parts = result.outPath.split('/');
    for (let i = 1; i < parts.length; i++) expected.add(parts.slice(0, i).join('/') + '/');
  }
  return [
    ...await compareResults(root, adapters, true),
    ...await compareResults(root, packages),
    ...actual.filter((path) => !expected.has(path)).map((path) => `${path} (unexpected)`),
  ];
}

async function main() {
  const stale = await validateDistribution();
  if (stale.length) {
    console.error('✗ Adapters or skill packages out of sync with authored sources:');
    for (const path of stale) console.error(`  - ${path}`);
    console.error('\nFix: run `npm run build`, remove unexpected package files, and commit the result.');
    process.exitCode = 1;
    return;
  }
  console.log(`✓ All ${TARGETS.length} adapters in sync; skill packages and manifest hashes match.`);
}

if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`✗ ${err.message}`); process.exitCode = 1; });
}
