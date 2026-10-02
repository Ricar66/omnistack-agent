#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { realpath } from 'node:fs/promises';
import { InstallerError, loadPackage, manageSkills } from './installer-lib.mjs';

const PACKAGE_ROOT = fileURLToPath(new URL('../packages/', import.meta.url));
const HELP = `OmniStack Agent — project skill installer

Usage:
  omnistack-agent install --platform <claude|copilot|cursor|codex> --project <directory> [--skill <name|all>] [--dry-run]
  omnistack-agent uninstall --platform <platform> --project <directory> [--skill <name|all>] [--dry-run]
  omnistack-agent --help
  omnistack-agent --version

The command defaults to install; --skill defaults to all.
The project directory must already exist. Preview with --dry-run.
Existing skills must have a matching installation receipt and unchanged files.
Conflicts stop all selected installations or removals. No force/overwrite option.
`;

export function parseArguments(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  if (args.includes('--version')) {
    if (args.length !== 1) throw new InstallerError('--version must be used alone');
    return { version: true };
  }
  const options = { command: 'install', skill: 'all', dryRun: false };
  const remaining = [...args];
  if (remaining[0] === 'install' || remaining[0] === 'uninstall') options.command = remaining.shift();
  const seen = new Set();
  while (remaining.length) {
    const flag = remaining.shift();
    if (seen.has(flag)) throw new InstallerError(`Duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === '--dry-run') { options.dryRun = true; continue; }
    const flags = { '--platform': 'platform', '--project': 'project', '--skill': 'skill' };
    if (!Object.hasOwn(flags, flag)) throw new InstallerError(`Unknown option: ${flag}`);
    const key = flags[flag];
    const value = remaining.shift();
    if (!value || value.startsWith('--')) throw new InstallerError(`Missing value for ${flag}`);
    options[key] = value;
  }
  return options;
}

function printReport(report) {
  console.log(`${report.dryRun ? 'Preview' : 'Result'}: ${report.command} for ${report.platform} in ${report.project}`);
  for (const skill of report.skills) {
    console.log(`  ${skill.status}: ${skill.name} -> ${skill.path}${skill.reason ? ` (${skill.reason})` : ''}`);
  }
  if (report.dryRun) console.log('No files changed.');
}

export async function main(args = process.argv.slice(2)) {
  try {
    const options = parseArguments(args);
    if (options.help) { console.log(HELP); return 0; }
    if (options.version) { console.log((await loadPackage(PACKAGE_ROOT)).version); return 0; }
    const report = await manageSkills({ ...options, packageRoot: PACKAGE_ROOT });
    printReport(report);
    return report.conflicts.length ? 1 : 0;
  } catch (error) {
    if (error.report) printReport(error.report);
    console.error(`Install error: ${error.message}`);
    return 1;
  }
}

let invokedPath;
if (process.argv[1]) {
  try {
    invokedPath = await realpath(resolve(process.argv[1]));
  } catch (error) {
    if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
  }
}
if (invokedPath && invokedPath === await realpath(fileURLToPath(import.meta.url))) {
  process.exitCode = await main();
}
