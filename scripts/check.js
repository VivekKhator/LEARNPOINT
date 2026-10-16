#!/usr/bin/env node
/**
 * Content + output linter. Run in CI before deploying.
 * Catches the failures that static sites actually ship with: dead internal
 * links, duplicate URLs, missing metadata and thin pages.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../site.config.js';
import { loadContent } from '../src/build/content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notices = [];

const content = await loadContent({ contentDir: path.join(root, 'content'), config });
content.warnings.forEach((w) => notices.push(w));

// 1. Unique URLs.
const seen = new Map();
for (const item of [...content.tracks, ...content.chapters]) {
  if (seen.has(item.url)) problems.push(`Duplicate URL ${item.url} (${item.id} and ${seen.get(item.url)})`);
  seen.set(item.url, item.id);
}

// 2. Metadata completeness — these drive the SERP snippet.
for (const chapter of content.chapters) {
  if (!chapter.description || chapter.description.length < 40) {
    problems.push(`${chapter.sourcePath}: description is missing or under 40 characters.`);
  }
  if (chapter.description.length > 170) {
    notices.push(`${chapter.sourcePath}: description is ${chapter.description.length} chars; Google truncates near 160.`);
  }
  if (!chapter.updated) notices.push(`${chapter.sourcePath}: no "updated" date in frontmatter.`);
  if (!chapter.quiz.length) notices.push(`${chapter.sourcePath}: no quiz questions.`);
  for (const [i, q] of chapter.quiz.entries()) {
    const options = q.options || [];
    if (options.length < 2) problems.push(`${chapter.sourcePath} quiz ${i + 1}: needs at least two options.`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= options.length) {
      problems.push(`${chapter.sourcePath} quiz ${i + 1}: "answer" must index into options.`);
    }
  }
}

// 3. Internal links resolve to a real page.
const known = new Set(['/', '/tutorials/', '/search/', '/playground/', '/404.html', '/sitemap.xml', '/feed.xml', '/robots.txt']);
content.verticals.forEach((v) => known.add(v.url));
content.tracks.forEach((t) => known.add(t.url));
content.chapters.forEach((c) => known.add(c.url));

const LINK = /\[[^\]]*\]\((\/[^)\s]*)\)/g;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.md')) {
      const source = await readFile(full, 'utf8');
      for (const match of source.matchAll(LINK)) {
        const href = match[1].split('#')[0];
        if (href && !known.has(href)) {
          problems.push(`${path.relative(root, full)}: internal link ${href} does not resolve.`);
        }
      }
    }
  }
}
await walk(path.join(root, 'content'));

// 4. Built output present, if a build has run.
const distIndex = path.join(root, config.build.outDir, 'index.html');
if (await stat(distIndex).then(() => true, () => false)) {
  const html = await readFile(distIndex, 'utf8');
  if (!html.includes('<link rel="canonical"')) problems.push('dist/index.html has no canonical link.');
  if (!html.includes('application/ld+json')) problems.push('dist/index.html has no structured data.');
} else {
  notices.push('dist/ not built yet — run `npm run build` to lint the output too.');
}

const label = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
console.log(`\n  Checked ${label(content.chapters.length, 'chapter')} across ${label(content.tracks.length, 'tutorial')}.`);
if (notices.length) {
  console.log(`\n  ${label(notices.length, 'notice')}:`);
  notices.forEach((n) => console.log(`    · ${n}`));
}
if (problems.length) {
  console.log(`\n  ${label(problems.length, 'problem')}:`);
  problems.forEach((p) => console.log(`    ✗ ${p}`));
  console.log('');
  process.exitCode = 1;
} else {
  console.log('\n  No blocking problems.\n');
}
