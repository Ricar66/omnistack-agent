import { createHash } from 'node:crypto';
import { posix } from 'node:path';

const SEP = '\n\n---\n\n';
const MODES = new Set(['full', 'lean']);
const MODULE_HEADINGS = [
  'Concepts', 'Best Practices', 'Patterns & Examples',
  'Common Pitfalls / Anti-patterns', 'References',
];

/** Normalize checkouts from either OS, including a leading UTF-8 BOM. */
export function normalizeEol(str) {
  return str.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

/** 12-char sha256 hex of a string. */
export function contentHash(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex').slice(0, 12);
}

/** Character budgets count Unicode code points, including generated headers. */
export function characterCount(str) {
  return [...str].length;
}

/** Ignore fenced examples when inspecting Markdown headings and navigation. */
export function withoutFencedCode(body) {
  let fence = null;
  return normalizeEol(body).split('\n').map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence) {
      if (!marker) return line;
      fence = marker[1];
    } else if (marker && marker[1][0] === fence[0]
      && marker[1].length >= fence.length && !marker[2].trim()) {
      fence = null;
    }
    return '';
  }).join('\n');
}

/** Read the single navigation source; paths resolve from knowledge/_index.md. */
export function knowledgeLinks(indexBody) {
  const entries = [];
  let category = 'Modules';
  for (const line of withoutFencedCode(indexBody).split('\n')) {
    const heading = line.match(/^###\s+(.+?)\s*#*\s*$/);
    if (heading) category = heading[1];
    const links = line.matchAll(/(?<!!)\[([^\]\n]+)\]\(\s*(<[^>\n]+>|[^\s)]+)(?:\s+"[^"]*")?\s*\)/g);
    for (const link of links) {
      const href = link[2].replace(/^<|>$/g, '');
      if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) continue;
      let relativePath;
      try { relativePath = decodeURIComponent(href.split(/[?#]/)[0]); }
      catch { throw new Error(`knowledge/_index.md: invalid link ${href}.`); }
      if (!relativePath || posix.isAbsolute(relativePath) || /[\\:\0]/.test(relativePath)) {
        throw new Error(`knowledge/_index.md: unsafe link ${href}.`);
      }
      const modulePath = posix.normalize(`knowledge/${relativePath}`);
      if (!modulePath.startsWith('knowledge/') || modulePath === 'knowledge/_index.md'
        || !modulePath.endsWith('.md')) {
        throw new Error(`knowledge/_index.md: invalid module link ${href}.`);
      }
      entries.push({ category, label: link[1], path: modulePath });
    }
  }
  return entries;
}

/** Reject incomplete or inconsistent sources before generating any adapters. */
export function validateSources({ coreFiles, indexBody, modules }) {
  if (!coreFiles.length) throw new Error('core/: no Markdown source files found.');
  for (const file of coreFiles) {
    if (!file.body.trim()) throw new Error(`core/${file.name}: source is empty.`);
  }
  if (!indexBody.trim()) throw new Error('knowledge/_index.md: source is missing or empty.');
  if (!modules.length) throw new Error('knowledge/: no modules found.');
  const paths = new Set();
  for (const module of modules) {
    if (!module.path.startsWith('knowledge/') || /[\\:\0]/.test(module.path)
      || module.path.split('/').some((part) => !part || part === '.' || part === '..')
      || !module.path.endsWith('.md')) {
      throw new Error(`Invalid knowledge module path: ${module.path}.`);
    }
    if (paths.has(module.path)) throw new Error(`Duplicate knowledge module: ${module.path}.`);
    paths.add(module.path);
    if (!module.body.trim()) throw new Error(`${module.path}: source is empty.`);
    const text = withoutFencedCode(module.body);
    if (!/^#\s+\S/m.test(text)) throw new Error(`${module.path}: missing topic heading.`);
    const headings = [...text.matchAll(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)].map((m) => m[1]);
    let previous = -1;
    for (const expected of MODULE_HEADINGS) {
      const position = headings.indexOf(expected);
      if (position < 0 || headings.lastIndexOf(expected) !== position) {
        throw new Error(`${module.path}: expected one "## ${expected}" heading.`);
      }
      if (position <= previous) throw new Error(`${module.path}: template headings are out of order.`);
      previous = position;
    }
    const levels = [...text.matchAll(/<!--\s*level:\s*([^]*?)-->/g)].map((m) => m[1].trim());
    if (levels.length !== 1 || !['beginner', 'intermediate', 'advanced'].includes(levels[0])) {
      throw new Error(`${module.path}: expected one level: beginner, intermediate, or advanced.`);
    }
  }
  const indexed = new Set();
  for (const entry of knowledgeLinks(indexBody)) {
    if (!paths.has(entry.path)) throw new Error(`knowledge/_index.md: broken module link ${entry.path}.`);
    if (indexed.has(entry.path)) throw new Error(`knowledge/_index.md: duplicate module link ${entry.path}.`);
    indexed.add(entry.path);
  }
  const missing = [...paths].filter((path) => !indexed.has(path)).sort();
  if (missing.length) throw new Error(`knowledge/_index.md: unindexed modules: ${missing.join(', ')}.`);
}

/** Reject invalid manifests and output paths before any disk writes. */
export function validateTargets(targets) {
  if (!targets.length) throw new Error('No adapter targets configured.');
  const names = new Set();
  const paths = new Set();
  for (const target of targets) {
    if (typeof target.name !== 'string' || !target.name.trim()) throw new Error('Adapter target needs a name.');
    if (names.has(target.name)) throw new Error(`Duplicate adapter name: ${target.name}.`);
    names.add(target.name);
    if (!MODES.has(target.mode)) throw new Error(`${target.name}: invalid mode "${target.mode}"; use full or lean.`);
    if (typeof target.outPath !== 'string' || !target.outPath.startsWith('adapters/')
      || /[\\:\0]/.test(target.outPath)
      || target.outPath.split('/').some((part) => !part || part === '.' || part === '..')) {
      throw new Error(`${target.name}: unsafe output path "${target.outPath}"; use a relative path under adapters/.`);
    }
    const portablePath = target.outPath.toLowerCase();
    if (paths.has(portablePath)) throw new Error(`Duplicate adapter output path: ${target.outPath}.`);
    paths.add(portablePath);
    if (target.frontmatter != null && typeof target.frontmatter !== 'string') {
      throw new Error(`${target.name}: frontmatter must be a string or null.`);
    }
    if (target.includeCore !== undefined && typeof target.includeCore !== 'boolean') {
      throw new Error(`${target.name}: includeCore must be a boolean.`);
    }
    if (target.maxCharacters !== undefined
      && (!Number.isSafeInteger(target.maxCharacters) || target.maxCharacters <= 0)) {
      throw new Error(`${target.name}: maxCharacters must be a positive integer.`);
    }
  }
}

/** coreFiles: Array<{ name, body }>; assembly is deterministic regardless of input order. */
export function assembleCore(coreFiles) {
  return [...coreFiles].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .map((f) => normalizeEol(f.body).trim()).join(SEP);
}

/** lean derives a compact map; full embeds the original index and every module. */
export function assembleKnowledge(modules, indexBody, mode) {
  if (!MODES.has(mode)) throw new Error(`Invalid knowledge mode "${mode}"; use full or lean.`);
  if (mode === 'lean') {
    const lines = [
      '# Knowledge map',
      'Read reference modules only when attached or accessible through available tools. Do not claim access to unavailable files.',
    ];
    let category;
    for (const entry of knowledgeLinks(indexBody)) {
      if (entry.category !== category) {
        category = entry.category;
        lines.push(`\n### ${category}`);
      }
      lines.push(`- [${entry.label}](${entry.path})`);
    }
    return lines.join('\n');
  }
  const ordered = [...modules].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const note = '> The reference modules below are embedded in this document. Index paths are conceptual repository navigation; no extra file access is needed to read these modules.';
  return [note, normalizeEol(indexBody).trim(), ...ordered.map((m) => normalizeEol(m.body).trim())].join(SEP);
}

/** target: { name, outPath, mode, frontmatter, includeCore?, maxCharacters? }. */
export function renderTarget(target, coreStr, knowledgeStr) {
  const body = [target.includeCore === false ? '' : coreStr, knowledgeStr].filter(Boolean).join(SEP);
  const source = target.includeCore === false ? 'knowledge/' : 'core/ + knowledge/';
  const header =
    `<!-- GENERATED from ${source} — DO NOT EDIT — run: npm run build -->\n` +
    `<!-- content-hash: ${contentHash(body)} -->`;
  const fm = target.frontmatter ? `${normalizeEol(target.frontmatter).trim()}\n\n` : '';
  const rendered = `${fm}${header}\n\n${body}\n`;
  if (target.maxCharacters !== undefined && characterCount(rendered) > target.maxCharacters) {
    throw new Error(`${target.name}: rendered ${characterCount(rendered)} characters exceeds project budget ${target.maxCharacters}.`);
  }
  return rendered;
}

const CLAUDE_DESC =
  'Full Stack Software Engineering Specialist — architecture, OOP, databases, ' +
  'DevOps, testing, and technical writing across the whole SDLC.';

/** Declarative adapter table. Existing output paths remain supported. */
export const TARGETS = [
  {
    name: 'claude-skill',
    outPath: 'adapters/claude/SKILL.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nuser-invocable: true\n---`,
  },
  {
    name: 'claude-agent',
    outPath: 'adapters/claude/agent.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nmodel: inherit\n---`,
  },
  { name: 'claude-agents-md', outPath: 'adapters/claude/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'claude-project', outPath: 'adapters/claude/CLAUDE.md', mode: 'lean', frontmatter: null },
  // This is a project portability budget, not a claim about a platform's current limit.
  { name: 'chatgpt-gpt', outPath: 'adapters/chatgpt/custom-gpt-instructions.md', mode: 'lean', frontmatter: null, maxCharacters: 8000 },
  { name: 'chatgpt-system', outPath: 'adapters/chatgpt/system-prompt.md', mode: 'full', frontmatter: null },
  { name: 'copilot', outPath: 'adapters/copilot/copilot-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'gemini', outPath: 'adapters/gemini/gem-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'cursor', outPath: 'adapters/cursor/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'windsurf', outPath: 'adapters/windsurf/AGENTS.md', mode: 'lean', frontmatter: null },
  { name: 'generic', outPath: 'adapters/generic/system-prompt.md', mode: 'full', frontmatter: null },
  { name: 'reference-knowledge', outPath: 'adapters/reference/knowledge.md', mode: 'full', frontmatter: null, includeCore: false },
];
