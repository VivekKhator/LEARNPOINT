import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import container from 'markdown-it-container';
import footnote from 'markdown-it-footnote';
import hljs from 'highlight.js';

/** Languages we can run in the in-browser playground. */
const RUNNABLE = new Set(['html', 'css', 'js', 'javascript']);

const CALLOUTS = {
  note: { label: 'Note', icon: 'info' },
  tip: { label: 'Tip', icon: 'bulb' },
  warning: { label: 'Watch out', icon: 'alert' },
  danger: { label: 'Common mistake', icon: 'cross' },
  syntax: { label: 'Syntax', icon: 'code' },
  example: { label: 'Example', icon: 'play' },
  interview: { label: 'Asked in interviews', icon: 'star' },
};

const ICONS = {
  info: '<path d="M12 16v-5M12 8h.01"/><circle cx="12" cy="12" r="9"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"/>',
  alert: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  cross: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
};

const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Parse a fence info string: `js title=app.js run` -> { lang, title, flags }. */
function parseFenceInfo(info) {
  const tokens = String(info || '').trim().split(/\s+/).filter(Boolean);
  const lang = (tokens.shift() || 'text').toLowerCase();
  const opts = { lang, flags: new Set() };
  for (const token of tokens) {
    const eq = token.indexOf('=');
    if (eq > 0) opts[token.slice(0, eq)] = token.slice(eq + 1).replace(/^["']|["']$/g, '');
    else opts.flags.add(token.toLowerCase());
  }
  return opts;
}

function highlight(code, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } catch {
      /* fall through to plain text */
    }
  }
  return escapeHtml(code);
}

const LANG_LABELS = {
  js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', py: 'Python',
  python: 'Python', sql: 'SQL', html: 'HTML', css: 'CSS', bash: 'Shell',
  sh: 'Shell', json: 'JSON', yaml: 'YAML', text: 'Output', output: 'Output',
};

function renderFence(tokens, idx) {
  const token = tokens[idx];
  const { lang, flags, title } = parseFenceInfo(token.info);
  const raw = token.content.replace(/\n$/, '');
  const isOutput = lang === 'output' || flags.has('output');
  const hlLang = isOutput ? 'text' : lang;
  const body = highlight(raw, hlLang);
  const label = title || LANG_LABELS[lang] || lang.toUpperCase();
  const runnable = flags.has('run') && RUNNABLE.has(lang);

  const actions = [
    `<button type="button" class="code-action" data-copy aria-label="Copy code to clipboard">Copy</button>`,
  ];
  if (runnable) {
    actions.unshift(
      `<button type="button" class="code-action code-action--run" data-run="${lang}">Try it yourself &rsaquo;</button>`,
    );
  }

  return (
    `<figure class="code${isOutput ? ' code--output' : ''}" data-lang="${escapeHtml(lang)}">` +
    `<figcaption class="code__bar"><span class="code__label">${escapeHtml(label)}</span>` +
    `<span class="code__actions">${actions.join('')}</span></figcaption>` +
    `<pre class="code__pre"><code class="hljs language-${escapeHtml(hlLang)}">${body}</code></pre>` +
    `<textarea class="code__source" hidden aria-hidden="true">${escapeHtml(raw)}</textarea>` +
    `</figure>`
  );
}

/**
 * Build a configured markdown-it instance.
 * `collector.headings` is filled during render so the caller can build a TOC
 * without parsing the output HTML again.
 */
export function createRenderer() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });

  md.use(attrs, { allowedAttributes: ['id', 'class', 'target', 'rel'] });
  md.use(footnote);

  const headings = [];
  md.use(anchor, {
    level: [2, 3],
    tabIndex: false,
    slugify: (s) =>
      s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '<span aria-hidden="true">#</span>',
      placement: 'after',
      class: 'heading-anchor',
      ariaHidden: false,
    }),
    callback: (token, info) => {
      headings.push({ level: token.tag === 'h2' ? 2 : 3, id: info.slug, text: info.title });
    },
  });

  for (const [name, meta] of Object.entries(CALLOUTS)) {
    md.use(container, name, {
      validate: (params) => params.trim().split(' ')[0] === name,
      render(tokens, idx) {
        if (tokens[idx].nesting !== 1) return '</div></aside>\n';
        const custom = tokens[idx].info.trim().slice(name.length).trim();
        return (
          `<aside class="callout callout--${name}" role="note">` +
          `<p class="callout__title">${icon(meta.icon)}` +
          `<span>${escapeHtml(custom || meta.label)}</span></p><div class="callout__body">`
        );
      },
    });
  }

  md.renderer.rules.fence = renderFence;

  // Tables overflow on phones unless they can scroll independently.
  const defaultTableOpen = md.renderer.rules.table_open;
  md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
    '<div class="table-wrap">' +
    (defaultTableOpen ? defaultTableOpen(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options));
  const defaultTableClose = md.renderer.rules.table_close;
  md.renderer.rules.table_close = (tokens, idx, options, env, self) =>
    (defaultTableClose ? defaultTableClose(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)) +
    '</div>';

  // Off-site links open in a new tab and drop the referrer-window handle.
  const defaultLinkOpen =
    md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') || '';
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('decoding', 'async');
    return defaultImage(tokens, idx, options, env, self);
  };

  return {
    /** @returns {{ html: string, headings: Array<{level:number,id:string,text:string}> }} */
    render(markdown) {
      headings.length = 0;
      const html = md.render(markdown);
      return { html, headings: headings.slice() };
    },
    /** Render inline markdown (used for titles and card excerpts). */
    renderInline: (markdown) => md.renderInline(markdown),
  };
}

export { escapeHtml, parseFenceInfo };
