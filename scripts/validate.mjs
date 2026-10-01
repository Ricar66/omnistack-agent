import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import { buildAll, ROOT } from './build.mjs';
import { normalizeEol, TARGETS } from './lib.mjs';

/** Compare generated expectations with disk; validation never rewrites artifacts. */
export async function validateAll({ root = ROOT, targets = TARGETS } = {}) {
  const results = await buildAll({ root, targets });
  const stale = [];
  for (const result of results) {
    let onDisk;
    try { onDisk = await readFile(join(root, result.outPath), 'utf8'); }
    catch (err) {
      if (err.code !== 'ENOENT') throw err;
      stale.push(`${result.outPath} (missing)`);
      continue;
    }
    if (normalizeEol(onDisk) !== result.content) stale.push(result.outPath);
  }
  return stale;
}

async function main() {
  const stale = await validateAll();
  if (stale.length) {
    console.error('✗ Adapters out of sync with core/ + knowledge/:');
    for (const path of stale) console.error(`  - ${path}`);
    console.error('\nFix: run `npm run build` and commit the result.');
    process.exitCode = 1;
    return;
  }
  console.log(`✓ All ${TARGETS.length} adapters in sync.`);
}

if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`✗ ${err.message}`); process.exitCode = 1; });
}
