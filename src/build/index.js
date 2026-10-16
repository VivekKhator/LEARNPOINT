import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import config from '../../site.config.js';
import { loadContent } from './content.js';
import { buildSearchIndex } from './search.js';
import { renderSitemap, renderRobots, renderFeed, renderFavicon, renderOgImage } from './seo.js';
import { layout } from '../templates/layout.js';
import {
  homePage, tutorialsPage, verticalPage, trackPage, chapterPage,
  searchPage, playgroundPage, notFoundPage,
} from '../templates/pages.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

const hash8 = (text) => createHash('sha256').update(text).digest('hex').slice(0, 8);

/** Write a file, creating parent directories as needed. */
async function emit(outDir, relPath, contents) {
  const target = path.join(outDir, relPath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, 'utf8');
  return Buffer.byteLength(contents, 'utf8');
}

/** `/tech/python/` -> `tech/python/index.html` so every URL ends in a slash. */
const pathToFile = (url) =>
  url.endsWith('.html') ? url.replace(/^\//, '') : `${url.replace(/^\/|\/$/g, '')}/index.html`.replace(/^\//, '');

export async function build({ outDir = path.join(root, config.build.outDir), quiet = false } = {}) {
  const started = performance.now();
  const log = (...args) => !quiet && console.log(...args);

  const content = await loadContent({ contentDir: path.join(root, 'content'), config });
  if (!content.chapters.length) throw new Error('No publishable chapters found under content/.');

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // --- assets, fingerprinted so they can be cached for a year -------------
  const css = await readFile(path.join(root, 'src/assets/styles.css'), 'utf8');
  const js = await readFile(path.join(root, 'src/assets/app.js'), 'utf8');
  const assets = {
    css: `/assets/styles.${hash8(css)}.css`,
    js: `/assets/app.${hash8(js)}.js`,
  };
  let bytes = 0;
  bytes += await emit(outDir, assets.css.slice(1), css);
  bytes += await emit(outDir, assets.js.slice(1), js);
  bytes += await emit(outDir, 'assets/favicon.svg', renderFavicon(config));
  bytes += await emit(outDir, 'assets/og-default.svg', renderOgImage(config));

  // --- pages --------------------------------------------------------------
  const pages = [
    homePage({ config, content }),
    tutorialsPage({ config, content }),
    searchPage({ config, content }),
    playgroundPage({ config }),
    notFoundPage({ config, content }),
    ...content.verticals.map((vertical) => verticalPage({ config, content, vertical })),
    ...content.tracks.map((track) => trackPage({ config, track })),
    ...content.chapters.map((chapter) => chapterPage({ config, chapter })),
  ];

  for (const { page, body } of pages) {
    const html = layout({ config, content, assets, page, body });
    bytes += await emit(outDir, pathToFile(page.url), html);
  }

  // --- data + machine-readable surfaces -----------------------------------
  bytes += await emit(outDir, 'search-index.json', JSON.stringify(buildSearchIndex(content.chapters)));

  const sitemapEntries = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/tutorials/', priority: 0.9, changefreq: 'weekly' },
    { url: '/playground/', priority: 0.5 },
    ...content.verticals.map((v) => ({ url: v.url, priority: 0.8, changefreq: 'weekly' })),
    ...content.tracks.map((t) => ({ url: t.url, lastmod: t.updated, priority: 0.8, changefreq: 'weekly' })),
    ...content.chapters.map((c) => ({ url: c.url, lastmod: c.updated, priority: 0.7 })),
  ];
  bytes += await emit(outDir, 'sitemap.xml', renderSitemap(config, sitemapEntries));
  bytes += await emit(outDir, 'robots.txt', renderRobots(config));
  bytes += await emit(outDir, 'feed.xml', renderFeed(config, content.chapters));
  // Keeps Jekyll from swallowing the output when deployed to GitHub Pages.
  bytes += await emit(outDir, '.nojekyll', '');

  const elapsed = Math.round(performance.now() - started);
  const stats = {
    pages: pages.length,
    chapters: content.chapters.length,
    tracks: content.tracks.length,
    verticals: content.verticals.length,
    words: content.chapters.reduce((sum, c) => sum + c.words, 0),
    kb: Math.round(bytes / 102.4) / 10,
    ms: elapsed,
    warnings: content.warnings,
    outDir,
  };

  log(
    `\n  ${config.name} built in ${elapsed}ms\n` +
      `  ${stats.pages} pages · ${stats.chapters} chapters · ${stats.tracks} tutorials · ` +
      `${stats.verticals} verticals · ${stats.words.toLocaleString('en-US')} words · ${stats.kb} KB\n` +
      `  → ${path.relative(process.cwd(), outDir) || '.'}\n`,
  );
  for (const warning of content.warnings) log(`  warning: ${warning}`);
  if (content.warnings.length) log('');

  return stats;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  build().catch((error) => {
    console.error(`\n  build failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
