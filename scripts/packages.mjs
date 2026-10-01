import { createHash } from 'node:crypto';
import { readFile, lstat } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { ROOT, readSources } from './build.mjs';
import { assembleCore, normalizeEol, characterCount, knowledgeLinks, withoutFencedCode, portableRelativePath } from './lib.mjs';

export const SKILLS = [
  {
    name: 'omnistack-agent',
    description: 'Implement and explain software features across an existing project, preserving its conventions and verifying the requested behavior.',
    allModules: true,
  },
  {
    name: 'omnistack-debug',
    description: 'Diagnose a reported software failure, reproduce its cause, and verify a focused regression fix.',
    modules: ['languages/javascript.md', 'languages/typescript.md', 'backend/apis.md', 'databases/relational.md', 'devops/ci-cd.md', 'testing/automated.md'],
  },
  {
    name: 'omnistack-code-review',
    description: 'Review a proposed code change for concrete defects and regressions, with severity, affected paths, and reproducible evidence.',
    modules: ['languages/javascript.md', 'languages/typescript.md', 'oop/solid.md', 'backend/apis.md', 'testing/automated.md', 'security/best-practices.md'],
  },
  {
    name: 'omnistack-security-review',
    description: 'Review requested application security concerns, tracing trust boundaries and authorization with evidence and scoped remediation.',
    modules: ['security/best-practices.md', 'backend/apis.md', 'databases/relational.md', 'devops/ci-cd.md', 'testing/automated.md'],
  },
];

const RESOURCE_PATHS = new Map([
  ['examples/bank-account.mjs', 'references/examples/bank-account.mjs'],
  ['scripts/examples.test.mjs', 'references/scripts/bank-account-checks.mjs'],
]);
const hash = (body) => createHash('sha256').update(body, 'utf8').digest('hex');
const safePath = portableRelativePath;

async function readRegular(root, path) {
  if (!safePath(path)) throw new Error(`Unsafe package source path: ${path}.`);
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const stat = await lstat(join(root, ...parts.slice(0, i)));
    if (stat.isSymbolicLink() || (i < parts.length && !stat.isDirectory())
      || (i === parts.length && !stat.isFile())) throw new Error(`${path}: unsafe package source path.`);
  }
  return normalizeEol(await readFile(join(root, path), 'utf8'));
}

function localLinks(body) {
  const paths = [];
  for (const match of withoutFencedCode(body).matchAll(/(?<!!)\[[^\]\n]+\]\(\s*(<[^>\n]+>|[^\s)]+)(?:\s+"[^"]*")?\s*\)/g)) {
    const href = match[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) continue;
    let path;
    try { path = decodeURIComponent(href.split(/[?#]/)[0]); }
    catch { throw new Error(`Invalid package reference: ${href}.`); }
    if (!path || posix.isAbsolute(path) || /[\\:\0]/.test(path)) throw new Error(`Unsafe package reference: ${href}.`);
    paths.push(path);
  }
  return paths;
}

function validateDefinitions(skills) {
  if (!Array.isArray(skills) || !skills.length) throw new Error('No skill packages configured.');
  const names = new Set();
  for (const skill of skills) {
    if (typeof skill.name !== 'string' || skill.name.length > 64
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) throw new Error(`Invalid skill name: ${skill.name}.`);
    if (names.has(skill.name)) throw new Error(`Duplicate skill name: ${skill.name}.`);
    names.add(skill.name);
    if (typeof skill.description !== 'string' || !skill.description.trim()
      || characterCount(skill.description) > 1024) throw new Error(`${skill.name}: invalid description.`);
    if (skill.allModules !== true && (!Array.isArray(skill.modules)
      || skill.modules.some((path) => !safePath(path) || !path.endsWith('.md')))) {
      throw new Error(`${skill.name}: invalid module selection.`);
    }
  }
}

function validateReferences(files, skillName) {
  const paths = new Set(files.map((file) => file.path));
  for (const file of files.filter((item) => item.path.endsWith('.md'))) {
    for (const path of localLinks(file.content)) {
      const target = posix.normalize(posix.join(posix.dirname(file.path), path));
      if (!safePath(target) || !paths.has(target)) throw new Error(`${skillName}/${file.path}: broken package reference ${path}.`);
    }
  }
}

/** Build portable, independently installable skills without writing files. */
export async function buildPackages({ root = ROOT, skills = SKILLS, version } = {}) {
  validateDefinitions(skills);
  const sources = await readSources(root);
  const availableModules = new Set(sources.modules.map((module) => module.path.slice('knowledge/'.length)));
  for (const skill of skills.filter((item) => !item.allModules)) {
    for (const path of skill.modules) {
      if (!availableModules.has(path)) throw new Error(`${skill.name}: missing selected knowledge module ${path}.`);
    }
  }
  if (version === undefined) version = JSON.parse(await readRegular(root, 'package.json')).version;
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(version)) {
    throw new Error('package.json: invalid package version.');
  }
  const core = assembleCore(sources.coreFiles);
  const navigation = knowledgeLinks(sources.indexBody);
  const manifest = { schemaVersion: 1, version, skills: [] };
  const results = [];
  for (const skill of [...skills].sort((a, b) => a.name < b.name ? -1 : 1)) {
    const workflowPath = `workflows/${skill.name}.md`;
    const workflow = (await readRegular(root, workflowPath)).trim();
    if (!workflow) throw new Error(`${workflowPath}: source is empty.`);
    const selected = sources.modules.filter((module) => skill.allModules
      || skill.modules.includes(module.path.slice('knowledge/'.length)));
    const selectedPaths = new Set(selected.map((module) => module.path));
    const links = navigation.filter((entry) => selectedPaths.has(entry.path));
    const map = ['## Reference modules', 'Read only the reference relevant to this task; these files are packaged beside this skill.',
      ...links.map((entry) => `- [${entry.label}](references/${entry.path})`)].join('\n');
    const instructions = skill.allModules ? core : 'Read [shared engineering guidance](references/core.md) before applying the focused workflow below.';
    const content = `---\nname: ${skill.name}\ndescription: ${JSON.stringify(skill.description)}\n---\n\n`
      + '<!-- GENERATED from core/ + workflows/ + knowledge/ — DO NOT EDIT — run: npm run build -->\n\n'
      + `${instructions}\n\n${workflow}\n\n${map}\n`;
    if (characterCount(content) > 8000) throw new Error(`${skill.name}: rendered ${characterCount(content)} characters exceeds project budget 8000.`);
    if (content.split('\n').length > 500) throw new Error(`${skill.name}: entry exceeds 500 lines.`);
    const files = [{ path: 'SKILL.md', content }];
    if (!skill.allModules) files.push({ path: 'references/core.md', content: `${core}\n` });
    const neededResources = new Set();
    for (const module of selected) {
      for (const path of localLinks(module.body)) {
        const target = posix.normalize(posix.join(posix.dirname(module.path), path));
        if (selectedPaths.has(target)) continue;
        if (!RESOURCE_PATHS.has(target)) throw new Error(`${module.path}: unsupported package resource ${path}.`);
        neededResources.add(target);
      }
      const body = normalizeEol(module.body).trim()
        .replaceAll('../../scripts/examples.test.mjs', '../../scripts/bank-account-checks.mjs');
      files.push({ path: `references/${module.path}`, content: `${body}\n` });
    }
    for (const path of [...neededResources].sort()) {
      files.push({ path: RESOURCE_PATHS.get(path), content: await readRegular(root, path) });
    }
    files.sort((a, b) => a.path < b.path ? -1 : 1);
    validateReferences(files, skill.name);
    const packagePath = `skills/${skill.name}`;
    manifest.skills.push({ name: skill.name, path: packagePath,
      files: files.map((file) => ({ path: file.path, sha256: hash(file.content) })) });
    results.push(...files.map((file) => ({ outPath: `packages/${packagePath}/${file.path}`, content: file.content })));
  }
  results.push({ outPath: 'packages/manifest.json', content: `${JSON.stringify(manifest, null, 2)}\n` });
  return results.sort((a, b) => a.outPath < b.outPath ? -1 : 1);
}
