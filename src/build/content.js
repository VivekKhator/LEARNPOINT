import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { createRenderer } from './markdown.js';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Split `---\nyaml\n---\nbody` into data + body. Tolerates files with no frontmatter. */
export function parseFrontmatter(source, file = '<string>') {
  const match = source.match(FRONTMATTER);
  if (!match) return { data: {}, body: source };
  let data;
  try {
    data = yaml.load(match[1]) || {};
  } catch (err) {
    throw new Error(`Invalid YAML frontmatter in ${file}: ${err.message}`);
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Frontmatter in ${file} must be a mapping`);
  }
  return { data, body: source.slice(match[0].length) };
}

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/** `03-for-loops.md` -> { order: 3, slug: 'for-loops' } */
function parseFilename(filename) {
  const base = filename.replace(/\.md$/i, '');
  const match = base.match(/^(\d+)[-_.](.+)$/);
  return match
    ? { order: Number(match[1]), slug: slugify(match[2]) }
    : { order: Number.MAX_SAFE_INTEGER, slug: slugify(base) };
}

/** Strip markdown syntax so the text can be indexed and excerpted. */
export function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^:::.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~>|]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const countWords = (text) => (text ? text.split(/\s+/).filter(Boolean).length : 0);

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function readYaml(file) {
  const raw = await readFile(file, 'utf8');
  return yaml.load(raw) || {};
}

/**
 * Load every vertical / track / chapter under `contentDir` into one graph.
 * Pure data in, pure data out — nothing here knows about HTML pages.
 */
export async function loadContent({ contentDir, config }) {
  const renderer = createRenderer();
  const verticals = [];
  const tracks = [];
  const chapters = [];
  const warnings = [];

  for (const verticalConfig of config.verticals) {
    const verticalDir = path.join(contentDir, verticalConfig.slug);
    if (!(await exists(verticalDir))) {
      warnings.push(`Vertical "${verticalConfig.slug}" is configured but content/${verticalConfig.slug}/ does not exist.`);
      continue;
    }

    const overridesFile = path.join(verticalDir, 'vertical.yml');
    const overrides = (await exists(overridesFile)) ? await readYaml(overridesFile) : {};
    const vertical = {
      ...verticalConfig,
      ...overrides,
      slug: verticalConfig.slug,
      url: `/${verticalConfig.slug}/`,
      tracks: [],
    };

    const entries = await readdir(verticalDir, { withFileTypes: true });
    for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const trackDir = path.join(verticalDir, entry.name);
      const manifestFile = path.join(trackDir, 'track.yml');
      if (!(await exists(manifestFile))) {
        warnings.push(`Skipping ${path.relative(contentDir, trackDir)} — no track.yml.`);
        continue;
      }
      const manifest = await readYaml(manifestFile);
      const trackSlug = slugify(manifest.slug || entry.name);

      const track = {
        slug: trackSlug,
        id: `${vertical.slug}/${trackSlug}`,
        url: `/${vertical.slug}/${trackSlug}/`,
        title: manifest.title || entry.name,
        shortTitle: manifest.shortTitle || manifest.title || entry.name,
        description: manifest.description || '',
        level: manifest.level || 'Beginner',
        duration: manifest.duration || null,
        order: Number.isFinite(manifest.order) ? manifest.order : 999,
        icon: manifest.icon || '',
        tags: manifest.tags || [],
        prerequisites: manifest.prerequisites || [],
        outcomes: manifest.outcomes || [],
        featured: manifest.featured === true,
        vertical,
        chapters: [],
      };

      const files = (await readdir(trackDir))
        .filter((f) => f.toLowerCase().endsWith('.md'))
        .sort();

      const parsed = [];
      for (const file of files) {
        const absolute = path.join(trackDir, file);
        const source = await readFile(absolute, 'utf8');
        const { data, body } = parseFrontmatter(source, path.relative(contentDir, absolute));
        const { order, slug } = parseFilename(file);
        parsed.push({ absolute, file, order, slug, data, body });
      }
      parsed.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));

      for (const [index, item] of parsed.entries()) {
        const { html, headings } = renderer.render(item.body);
        const plain = toPlainText(item.body);
        const words = countWords(plain);
        const slug = slugify(item.data.slug || item.slug);

        const chapter = {
          id: `${track.id}/${slug}`,
          slug,
          url: `${track.url}${slug}/`,
          index: index + 1,
          title: item.data.title || item.slug.replace(/-/g, ' '),
          navTitle: item.data.navTitle || item.data.title || item.slug.replace(/-/g, ' '),
          description:
            item.data.description || `${plain.slice(0, 157).trimEnd()}${plain.length > 157 ? '…' : ''}`,
          keywords: item.data.keywords || [],
          updated: item.data.updated ? String(item.data.updated).slice(0, 10) : null,
          quiz: Array.isArray(item.data.quiz) ? item.data.quiz : [],
          faq: Array.isArray(item.data.faq) ? item.data.faq : [],
          draft: item.data.draft === true,
          html,
          headings,
          plain,
          words,
          readingTime: Math.max(1, Math.round(words / config.build.wordsPerMinute)),
          sourcePath: path.relative(process.cwd(), item.absolute),
          track,
          vertical,
        };

        if (chapter.draft) continue;
        if (words < config.build.minWords) {
          warnings.push(`${chapter.sourcePath}: only ${words} words — below the ${config.build.minWords}-word floor.`);
        }
        track.chapters.push(chapter);
        chapters.push(chapter);
      }

      // Linear reading order inside a track drives prev/next and progress.
      track.chapters.forEach((chapter, i) => {
        chapter.prev = track.chapters[i - 1] || null;
        chapter.next = track.chapters[i + 1] || null;
      });

      track.words = track.chapters.reduce((sum, c) => sum + c.words, 0);
      track.readingTime = Math.max(1, Math.round(track.words / config.build.wordsPerMinute));
      track.updated = track.chapters.map((c) => c.updated).filter(Boolean).sort().at(-1) || null;

      if (!track.chapters.length) {
        warnings.push(`Track ${track.id} has no publishable chapters.`);
        continue;
      }
      vertical.tracks.push(track);
      tracks.push(track);
    }

    vertical.tracks.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    vertical.chapterCount = vertical.tracks.reduce((sum, t) => sum + t.chapters.length, 0);
    verticals.push(vertical);
  }

  tracks.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return { verticals, tracks, chapters, warnings };
}
