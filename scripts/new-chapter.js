#!/usr/bin/env node
/**
 * Scaffold a chapter with the frontmatter the build and linter expect.
 *   npm run new -- tech/python "Dictionaries in Python"
 */
import { readdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [target, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ');

if (!target || !title) {
  console.error('\n  Usage: npm run new -- <vertical>/<track> "Chapter title"\n');
  process.exit(1);
}

const trackDir = path.join(root, 'content', target);
await access(trackDir).catch(() => {
  console.error(`\n  No such track: content/${target}\n`);
  process.exit(1);
});

const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
const existing = (await readdir(trackDir)).filter((f) => f.endsWith('.md'));
const next = String(existing.length + 1).padStart(2, '0');
const file = path.join(trackDir, `${next}-${slug}.md`);
const today = new Date().toISOString().slice(0, 10);

await writeFile(
  file,
  `---
title: ${title}
description: One sentence, 60–160 characters, that would make sense as a Google result.
keywords: []
updated: ${today}
quiz:
  - q: Replace with a question that catches a real misunderstanding.
    options: ["Wrong but plausible", "Correct", "Clearly wrong"]
    answer: 1
    explain: Say why the right answer is right and why the tempting one is not.
---

Open with the problem this chapter solves, in two sentences. No "in this chapter we will".

## First concept

Explain, then show.

\`\`\`text
example here
\`\`\`

:::tip
A short, concrete piece of advice.
:::

## What to remember

- Point one.
- Point two.
`,
  'utf8',
);

console.log(`\n  Created ${path.relative(root, file)}\n`);
