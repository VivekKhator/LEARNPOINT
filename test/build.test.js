import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../site.config.js';
import { build } from '../src/build/index.js';
import { loadContent, parseFrontmatter, slugify, toPlainText } from '../src/build/content.js';
import { createRenderer, parseFenceInfo } from '../src/build/markdown.js';
import { buildSearchIndex } from '../src/build/search.js';
import { renderSitemap, renderRobots, renderFeed } from '../src/build/seo.js';
import { withBase, absoluteUrl } from '../src/templates/layout.js';
import { escapeHtml } from '../src/templates/html.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(path.join(root, 'dist', p), 'utf8');

describe('frontmatter', () => {
  test('parses YAML and separates the body', () => {
    const { data, body } = parseFrontmatter('---\ntitle: Hi\nkeywords: [a, b]\n---\nBody text\n');
    assert.equal(data.title, 'Hi');
    assert.deepEqual(data.keywords, ['a', 'b']);
    assert.equal(body.trim(), 'Body text');
  });

  test('tolerates a file with no frontmatter', () => {
    const { data, body } = parseFrontmatter('Just a body');
    assert.deepEqual(data, {});
    assert.equal(body, 'Just a body');
  });

  test('throws with the filename on malformed YAML', () => {
    assert.throws(
      () => parseFrontmatter('---\na: [1,\n---\nx', 'bad.md'),
      /bad\.md/,
    );
  });
});

describe('helpers', () => {
  test('slugify strips punctuation and collapses separators', () => {
    assert.equal(slugify('Python  Lists & Tuples!'), 'python-lists-tuples');
  });

  test('toPlainText removes code fences and markdown syntax', () => {
    const plain = toPlainText('# Title\n\n`code` and ```\nblock\n```\n\n[link](/x) **bold**');
    assert.ok(!plain.includes('block'));
    assert.ok(!plain.includes('#'));
    assert.ok(plain.includes('link'));
    assert.ok(plain.includes('bold'));
  });

  test('escapeHtml neutralises every dangerous character', () => {
    assert.equal(escapeHtml(`<img src=x onerror="a">&'`), '&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;');
  });

  test('parseFenceInfo reads the language, flags and key=value pairs', () => {
    const parsed = parseFenceInfo('js run title=app.js');
    assert.equal(parsed.lang, 'js');
    assert.equal(parsed.title, 'app.js');
    assert.ok(parsed.flags.has('run'));
  });

  test('withBase respects basePath and leaves absolute URLs alone', () => {
    const scoped = { ...config, basePath: '/docs' };
    assert.equal(withBase(scoped, '/tech/'), '/docs/tech/');
    assert.equal(withBase(scoped, 'https://example.com'), 'https://example.com');
    assert.equal(absoluteUrl(config, '/tech/'), new URL('/tech/', config.url).toString());
  });
});

describe('markdown rendering', () => {
  const renderer = createRenderer();

  test('collects h2 and h3 headings for the table of contents', () => {
    const { headings } = renderer.render('## One\n\ntext\n\n### Two\n');
    assert.deepEqual(headings.map((h) => h.id), ['one', 'two']);
    assert.deepEqual(headings.map((h) => h.level), [2, 3]);
  });

  test('headings are collected per render, not accumulated', () => {
    renderer.render('## First\n');
    const { headings } = renderer.render('## Second\n');
    assert.equal(headings.length, 1);
    assert.equal(headings[0].id, 'second');
  });

  test('code fences get a copy control and a verbatim source copy', () => {
    const { html } = renderer.render('```js\nconst a = 1 < 2;\n```\n');
    assert.match(html, /data-copy/);
    assert.match(html, /class="code__source"/);
    assert.match(html, /const a = 1 &lt; 2;/);
  });

  test('only runnable languages get a Try it button', () => {
    assert.match(renderer.render('```html run\n<p>x</p>\n```').html, /data-run="html"/);
    assert.doesNotMatch(renderer.render('```python run\nprint(1)\n```').html, /data-run/);
  });

  test('external links are given rel="noopener noreferrer"', () => {
    const { html } = renderer.render('[x](https://example.com)');
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /target="_blank"/);
  });

  test('internal links are left untouched', () => {
    const { html } = renderer.render('[x](/tech/python/)');
    assert.doesNotMatch(html, /target="_blank"/);
  });

  test('containers render as accessible callouts', () => {
    const { html } = renderer.render(':::danger\nCareful.\n:::\n');
    assert.match(html, /callout--danger/);
    assert.match(html, /role="note"/);
  });

  test('tables are wrapped so they can scroll on narrow screens', () => {
    const { html } = renderer.render('| a | b |\n|---|---|\n| 1 | 2 |\n');
    assert.match(html, /<div class="table-wrap">/);
  });
});

describe('content graph', () => {
  let content;
  before(async () => {
    content = await loadContent({ contentDir: path.join(root, 'content'), config });
  });

  test('loads every configured vertical', () => {
    assert.equal(content.verticals.length, config.verticals.length);
  });

  test('publishes chapters in at least two different domains', () => {
    const domains = new Set(content.chapters.map((c) => c.vertical.slug));
    assert.ok(domains.size >= 2, 'the engine must be proven domain-agnostic');
  });

  test('every chapter URL is unique', () => {
    const urls = content.chapters.map((c) => c.url);
    assert.equal(new Set(urls).size, urls.length);
  });

  test('prev/next form a consistent chain inside each track', () => {
    for (const track of content.tracks) {
      assert.equal(track.chapters[0].prev, null);
      assert.equal(track.chapters.at(-1).next, null);
      for (let i = 1; i < track.chapters.length; i++) {
        assert.equal(track.chapters[i].prev, track.chapters[i - 1]);
        assert.equal(track.chapters[i - 1].next, track.chapters[i]);
      }
    }
  });

  test('chapter indexes are 1-based and sequential', () => {
    for (const track of content.tracks) {
      assert.deepEqual(
        track.chapters.map((c) => c.index),
        track.chapters.map((_, i) => i + 1),
      );
    }
  });

  test('every quiz answer indexes into its own options', () => {
    for (const chapter of content.chapters) {
      for (const question of chapter.quiz) {
        assert.ok(Array.isArray(question.options) && question.options.length >= 2, chapter.id);
        assert.ok(
          Number.isInteger(question.answer) && question.options[question.answer] !== undefined,
          `${chapter.id}: answer out of range`,
        );
      }
    }
  });

  test('loading content produces no warnings', () => {
    assert.deepEqual(content.warnings, []);
  });
});

describe('search index', () => {
  let index;
  before(async () => {
    const content = await loadContent({ contentDir: path.join(root, 'content'), config });
    index = buildSearchIndex(content.chapters);
  });

  test('has one entry per chapter with the required keys', () => {
    assert.ok(index.length > 0);
    for (const entry of index) {
      for (const key of ['u', 't', 'k', 'v', 'd', 'b']) {
        assert.ok(entry[key] !== undefined, `missing ${key}`);
      }
    }
  });

  test('bodies carry no markdown or code noise', () => {
    assert.ok(index.every((e) => !e.b.includes('```')));
  });

  test('stays small enough to fetch on first keystroke', () => {
    const kb = Buffer.byteLength(JSON.stringify(index)) / 1024;
    assert.ok(kb < 512, `search index is ${kb.toFixed(0)} KB`);
  });
});

describe('seo artefacts', () => {
  test('sitemap is well-formed and escapes URLs', () => {
    const xml = renderSitemap(config, [{ url: '/a/', lastmod: '2026-01-01' }]);
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<loc>.*\/a\/<\/loc>/);
    assert.match(xml, /<lastmod>2026-01-01<\/lastmod>/);
  });

  test('robots points at the sitemap and hides the search page', () => {
    const txt = renderRobots(config);
    assert.match(txt, /Sitemap: https?:\/\//);
    assert.match(txt, /Disallow: \/search\//);
  });

  test('feed escapes ampersands in titles', () => {
    const feed = renderFeed(config, [
      { title: 'A & B', url: '/x/', description: 'd', updated: '2026-01-01', track: { title: 'T' } },
    ]);
    assert.match(feed, /A &amp; B/);
    assert.doesNotMatch(feed, /<title>A & B<\/title>/);
  });
});

describe('built output', () => {
  let stats;
  before(async () => {
    stats = await build({ quiet: true });
  });

  test('build reports no warnings', () => {
    assert.deepEqual(stats.warnings, []);
  });

  test('emits every required top-level file', async () => {
    for (const file of ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'feed.xml', 'search-index.json']) {
      assert.ok((await read(file)).length > 0, file);
    }
  });

  test('every page carries a canonical link and structured data', async () => {
    for (const page of ['index.html', 'tech/python/index.html', 'tech/python/introduction/index.html']) {
      const html = await read(page);
      assert.match(html, /<link rel="canonical"/, page);
      assert.match(html, /application\/ld\+json/, page);
      assert.match(html, /<meta property="og:title"/, page);
    }
  });

  test('a chapter page renders its rail, quiz and pager', async () => {
    const html = await read('tech/python/control-flow/index.html');
    assert.match(html, /class="rail"/);
    assert.match(html, /data-quiz/);
    assert.match(html, /class="pager"/);
    assert.match(html, /Python Control Flow/);
  });

  test('a chapter with FAQ entries emits FAQPage structured data', async () => {
    const html = await read('tech/python/introduction/index.html');
    assert.match(html, /"@type":"FAQPage"/);
  });

  test('a track page emits Course structured data', async () => {
    const html = await read('tech/python/index.html');
    assert.match(html, /"@type":"Course"/);
    assert.match(html, /"syllabusSections"/);
  });

  test('the search page is excluded from indexing', async () => {
    assert.match(await read('search/index.html'), /noindex/);
  });

  test('asset filenames are content-hashed for immutable caching', async () => {
    const html = await read('index.html');
    assert.match(html, /\/assets\/styles\.[0-9a-f]{8}\.css/);
    assert.match(html, /\/assets\/app\.[0-9a-f]{8}\.js/);
  });

  test('the sitemap lists every chapter', async () => {
    const xml = await read('sitemap.xml');
    const content = await loadContent({ contentDir: path.join(root, 'content'), config });
    for (const chapter of content.chapters) {
      assert.ok(xml.includes(`${chapter.url}</loc>`), `${chapter.url} missing from sitemap`);
    }
  });

  test('no page leaks an unrendered template placeholder', async () => {
    const html = await read('tech/sql/joins/index.html');
    assert.doesNotMatch(html, /\[object Object\]/);
    assert.doesNotMatch(html, /undefined<\//);
  });
});
