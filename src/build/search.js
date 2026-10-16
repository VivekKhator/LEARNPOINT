/**
 * Build the client search index.
 * The whole index ships as one JSON file and is fetched lazily on first
 * keystroke, so it must stay small: bodies are capped and keys are short.
 */
const BODY_CAP = 1400;

export function buildSearchIndex(chapters) {
  return chapters.map((chapter) => ({
    u: chapter.url,
    t: chapter.title,
    k: chapter.track.title,
    v: chapter.vertical.name,
    d: chapter.description,
    w: (chapter.keywords || []).join(' '),
    b: chapter.plain.slice(0, BODY_CAP),
  }));
}

export { BODY_CAP };
