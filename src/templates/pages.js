import { escapeHtml, each, icon, attrs } from './html.js';
import { withBase, absoluteUrl } from './layout.js';
import {
  breadcrumbs, trackCard, chapterSidebar, tableOfContents, pager, quiz, faqBlock, sectionHeading,
} from './components.js';

const VERTICAL_ICON = { tech: 'terminal', finance: 'chart' };

/* ------------------------------------------------------------------ home */

export function homePage({ config, content }) {
  const featured = content.tracks.filter((t) => t.featured);
  const picks = (featured.length ? featured : content.tracks).slice(0, 6);
  const latest = [...content.chapters]
    .filter((c) => c.updated)
    .sort((a, b) => String(b.updated).localeCompare(String(a.updated)))
    .slice(0, 6);

  const body = `
  <section class="hero">
    <div class="shell hero__inner">
      <p class="hero__eyebrow">${content.chapters.length} free chapters · no sign-up · no paywall</p>
      <h1 class="hero__title">${escapeHtml(config.tagline)}</h1>
      <p class="hero__lede">${escapeHtml(config.description)}</p>
      <form class="hero__search" role="search" action="${escapeHtml(withBase(config, '/search/'))}" method="get">
        ${icon('search')}
        <input type="search" name="q" placeholder="Search a topic — SQL joins, recursion, index funds…" aria-label="Search tutorials">
        <button type="submit" class="btn btn--primary">Search</button>
      </form>
      <ul class="hero__chips">
        ${each(content.tracks.slice(0, 7), (t) =>
          `<li><a class="chip" href="${escapeHtml(withBase(config, t.url))}">${escapeHtml(t.shortTitle)}</a></li>`)}
      </ul>
    </div>
  </section>

  <section class="shell block">
    ${sectionHeading('Pick a subject area', 'The same chapter-by-chapter format, applied to very different domains.')}
    <div class="grid grid--verticals">
      ${each(content.verticals, (v) => `
        <a class="vcard" href="${escapeHtml(withBase(config, v.url))}" style="--accent:${escapeHtml(v.accent)}">
          <span class="vcard__icon">${icon(VERTICAL_ICON[v.slug] || 'book')}</span>
          <h3 class="vcard__title">${escapeHtml(v.name)}</h3>
          <p class="vcard__text">${escapeHtml(v.tagline)}</p>
          <span class="vcard__meta">${v.tracks.length} tutorials · ${v.chapterCount} chapters</span>
        </a>`)}
    </div>
  </section>

  <section class="shell block">
    ${sectionHeading('Start here', 'Tutorials that assume nothing and build up in order.')}
    <div class="grid grid--cards">${each(picks, (t) => trackCard(config, t))}</div>
    <p class="block__more"><a class="btn btn--ghost" href="${escapeHtml(withBase(config, '/tutorials/'))}">Browse all ${content.tracks.length} tutorials ${icon('arrowRight')}</a></p>
  </section>

  <section class="band">
    <div class="shell grid grid--features">
      <div class="feature"><span class="feature__icon">${icon('book')}</span>
        <h3>Readable, not watchable</h3>
        <p>Every chapter is prose you can skim, search and copy from. No 40-minute video to scrub through when you just need the syntax.</p></div>
      <div class="feature"><span class="feature__icon">${icon('terminal')}</span>
        <h3>Examples you can run</h3>
        <p>Front-end snippets open in a sandbox editor in the same tab. Change a line, press run, see what breaks.</p></div>
      <div class="feature"><span class="feature__icon">${icon('check')}</span>
        <h3>A check at the end</h3>
        <p>Short self-tests catch the misreading before it becomes a habit. Progress is stored in your browser, not an account.</p></div>
      <div class="feature"><span class="feature__icon">${icon('layers')}</span>
        <h3>One engine, any subject</h3>
        <p>The site is a content pipeline, not a hard-coded course. A new domain is a folder of Markdown and one config entry.</p></div>
    </div>
  </section>

  ${latest.length ? `
  <section class="shell block">
    ${sectionHeading('Recently updated', 'Freshly written or revised chapters.')}
    <ul class="list-rows">
      ${each(latest, (c) => `
        <li><a class="row" href="${escapeHtml(withBase(config, c.url))}">
          <span class="row__main"><span class="row__title">${escapeHtml(c.title)}</span>
            <span class="row__sub">${escapeHtml(c.track.title)}</span></span>
          <span class="row__meta">${escapeHtml(c.updated)}</span></a></li>`)}
    </ul>
  </section>` : ''}`;

  return {
    page: {
      title: config.name,
      description: config.description,
      url: '/',
      bodyClass: 'page-home',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: config.name,
          url: absoluteUrl(config, '/'),
          description: config.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl(config, '/search/')}?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    },
    body,
  };
}

/* -------------------------------------------------------------- tutorials */

export function tutorialsPage({ config, content }) {
  const body = `
  <div class="shell page-head">
    ${breadcrumbs(config, [{ label: 'Home', href: '/' }, { label: 'Tutorials' }])}
    <h1>All tutorials</h1>
    <p class="page-head__lede">${content.tracks.length} tutorials, ${content.chapters.length} chapters, grouped by subject area.</p>
  </div>
  ${each(content.verticals, (v) => `
    <section class="shell block" style="--accent:${escapeHtml(v.accent)}">
      ${sectionHeading(v.name, v.tagline)}
      <div class="grid grid--cards">${each(v.tracks, (t) => trackCard(config, t))}</div>
    </section>`)}`;

  return {
    page: {
      title: 'All tutorials',
      description: `Browse every tutorial on ${config.name}: ${content.tracks.map((t) => t.title).join(', ')}.`,
      url: '/tutorials/',
      bodyClass: 'page-index',
      structuredData: [listSchema(config, content.tracks, 'All tutorials')],
    },
    body,
  };
}

/* --------------------------------------------------------------- vertical */

export function verticalPage({ config, content, vertical }) {
  const body = `
  <div class="shell page-head" style="--accent:${escapeHtml(vertical.accent)}">
    ${breadcrumbs(config, [{ label: 'Home', href: '/' }, { label: vertical.name }])}
    <h1>${escapeHtml(vertical.name)}</h1>
    <p class="page-head__lede">${escapeHtml(vertical.description)}</p>
    <p class="page-head__stats">
      <span class="pill">${vertical.tracks.length} tutorials</span>
      <span class="pill">${vertical.chapterCount} chapters</span>
      <span class="pill">${vertical.tracks.reduce((s, t) => s + t.readingTime, 0)} min of reading</span>
    </p>
  </div>
  <div class="shell block" style="--accent:${escapeHtml(vertical.accent)}">
    <div class="grid grid--cards">${each(vertical.tracks, (t) => trackCard(config, t))}</div>
  </div>`;

  return {
    page: {
      title: `${vertical.name} tutorials`,
      description: vertical.description,
      url: vertical.url,
      accent: vertical.accent,
      verticalSlug: vertical.slug,
      bodyClass: 'page-index',
      structuredData: [listSchema(config, vertical.tracks, `${vertical.name} tutorials`)],
    },
    body,
  };
}

/* ------------------------------------------------------------------ track */

export function trackPage({ config, track }) {
  const body = `
  <div class="shell page-head" style="--accent:${escapeHtml(track.vertical.accent)}">
    ${breadcrumbs(config, [
      { label: 'Home', href: '/' },
      { label: track.vertical.name, href: track.vertical.url },
      { label: track.title },
    ])}
    <h1>${escapeHtml(track.title)}</h1>
    <p class="page-head__lede">${escapeHtml(track.description)}</p>
    <p class="page-head__stats">
      <span class="pill pill--level">${escapeHtml(track.level)}</span>
      <span class="pill">${track.chapters.length} chapters</span>
      <span class="pill">${icon('clock')} ${track.readingTime} min</span>
      ${track.updated ? `<span class="pill">Updated ${escapeHtml(track.updated)}</span>` : ''}
    </p>
    <p class="page-head__cta">
      <a class="btn btn--primary" href="${escapeHtml(withBase(config, track.chapters[0].url))}">Start chapter 1 ${icon('arrowRight')}</a>
      <a class="btn btn--ghost" data-resume href="${escapeHtml(withBase(config, track.chapters[0].url))}" hidden>Resume where you left off</a>
    </p>
  </div>

  <div class="shell block track-layout" style="--accent:${escapeHtml(track.vertical.accent)}">
    <div class="track-layout__main">
      <h2 class="section-head__title">Chapters</h2>
      <ol class="chapter-list" data-track="${escapeHtml(track.id)}">
        ${each(track.chapters, (c) => `
          <li><a class="chapter-list__item" href="${escapeHtml(withBase(config, c.url))}" data-chapter="${escapeHtml(c.id)}">
            <span class="chapter-list__num">${c.index}</span>
            <span class="chapter-list__body">
              <span class="chapter-list__title">${escapeHtml(c.title)}</span>
              <span class="chapter-list__desc">${escapeHtml(c.description)}</span>
            </span>
            <span class="chapter-list__meta">${c.readingTime} min</span>
            <span class="chapter-list__tick" aria-hidden="true">${icon('check')}</span>
          </a></li>`)}
      </ol>
    </div>
    <aside class="track-layout__aside">
      ${track.outcomes.length ? `
        <section class="panel">
          <h2 class="panel__title">What you'll be able to do</h2>
          <ul class="panel__ticks">${each(track.outcomes, (o) => `<li>${icon('check')}<span>${escapeHtml(o)}</span></li>`)}</ul>
        </section>` : ''}
      ${track.prerequisites.length ? `
        <section class="panel">
          <h2 class="panel__title">Before you start</h2>
          <ul class="panel__ticks">${each(track.prerequisites, (p) => `<li>${icon('arrowRight')}<span>${escapeHtml(p)}</span></li>`)}</ul>
        </section>` : ''}
      ${track.tags.length ? `
        <section class="panel">
          <h2 class="panel__title">Topics covered</h2>
          <p class="tagcloud">${each(track.tags, (t) => `<span class="tag">${escapeHtml(t)}</span>`)}</p>
        </section>` : ''}
    </aside>
  </div>`;

  return {
    page: {
      title: track.title,
      description: track.description,
      url: track.url,
      accent: track.vertical.accent,
      verticalSlug: track.vertical.slug,
      trackId: track.id,
      updated: track.updated,
      bodyClass: 'page-track',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: track.title,
          description: track.description,
          url: absoluteUrl(config, track.url),
          provider: { '@type': 'Organization', name: config.name, url: absoluteUrl(config, '/') },
          educationalLevel: track.level,
          isAccessibleForFree: true,
          inLanguage: config.lang,
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: `PT${track.readingTime}M`,
          },
          syllabusSections: track.chapters.map((c, i) => ({
            '@type': 'Syllabus',
            name: c.title,
            description: c.description,
            position: i + 1,
            url: absoluteUrl(config, c.url),
          })),
        },
        breadcrumbSchema(config, [
          { label: 'Home', href: '/' },
          { label: track.vertical.name, href: track.vertical.url },
          { label: track.title, href: track.url },
        ]),
      ],
    },
    body,
  };
}

/* ---------------------------------------------------------------- chapter */

export function chapterPage({ config, chapter }) {
  const { track, vertical } = chapter;
  const trail = [
    { label: 'Home', href: '/' },
    { label: vertical.name, href: vertical.url },
    { label: track.shortTitle, href: track.url },
    { label: chapter.title, href: chapter.url },
  ];

  const body = `
  <div class="shell chapter-layout" style="--accent:${escapeHtml(vertical.accent)}">
    <aside class="chapter-layout__rail">${chapterSidebar(config, track, chapter.id)}</aside>

    <article class="chapter" data-chapter="${escapeHtml(chapter.id)}" data-track="${escapeHtml(track.id)}">
      ${breadcrumbs(config, trail.slice(0, -1).concat({ label: chapter.title }))}
      <header class="chapter__head">
        <p class="chapter__eyebrow">${escapeHtml(track.title)} · Chapter ${chapter.index} of ${track.chapters.length}</p>
        <h1 class="chapter__title">${escapeHtml(chapter.title)}</h1>
        <p class="chapter__meta">
          <span>${icon('clock')} ${chapter.readingTime} min read</span>
          ${chapter.updated ? `<span>Updated <time datetime="${escapeHtml(chapter.updated)}">${escapeHtml(chapter.updated)}</time></span>` : ''}
          <span>${chapter.words} words</span>
        </p>
      </header>

      <div class="prose">${chapter.html}</div>

      ${quiz(chapter)}
      ${faqBlock(chapter)}

      <div class="chapter__done">
        <button type="button" class="btn btn--primary" data-mark-done>${icon('check')} Mark chapter as read</button>
        <p class="chapter__done-note">Stored in this browser only. Clearing site data resets it.</p>
      </div>

      ${pager(config, chapter)}
    </article>

    <aside class="chapter-layout__toc">
      ${tableOfContents(chapter.headings)}
      <div class="toc__aside">
        <a class="btn btn--ghost btn--block" href="${escapeHtml(withBase(config, track.url))}">All ${track.chapters.length} chapters</a>
      </div>
    </aside>
  </div>`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: chapter.title,
      description: chapter.description,
      url: absoluteUrl(config, chapter.url),
      wordCount: chapter.words,
      inLanguage: config.lang,
      isPartOf: { '@type': 'Course', name: track.title, url: absoluteUrl(config, track.url) },
      author: { '@type': 'Organization', name: config.author },
      publisher: { '@type': 'Organization', name: config.name, url: absoluteUrl(config, '/') },
      ...(chapter.updated ? { dateModified: chapter.updated } : {}),
      ...(chapter.keywords.length ? { keywords: chapter.keywords.join(', ') } : {}),
    },
    breadcrumbSchema(config, trail),
  ];

  if (chapter.faq.length) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: chapter.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return {
    page: {
      title: chapter.title,
      description: chapter.description,
      keywords: chapter.keywords,
      url: chapter.url,
      accent: vertical.accent,
      verticalSlug: vertical.slug,
      trackId: track.id,
      updated: chapter.updated,
      ogType: 'article',
      bodyClass: 'page-chapter',
      structuredData,
    },
    body,
  };
}

/* ----------------------------------------------------------------- search */

export function searchPage({ config, content }) {
  const body = `
  <div class="shell page-head">
    ${breadcrumbs(config, [{ label: 'Home', href: '/' }, { label: 'Search' }])}
    <h1>Search</h1>
    <p class="page-head__lede">Full-text search across all ${content.chapters.length} chapters. Runs entirely in your browser.</p>
    <form class="hero__search hero__search--page" role="search" method="get" data-search-form>
      ${icon('search')}
      <input type="search" name="q" id="page-search-input" placeholder="Try &quot;primary key&quot;, &quot;closure&quot; or &quot;SIP&quot;"
             aria-label="Search query" autocomplete="off" autofocus>
      <button type="submit" class="btn btn--primary">Search</button>
    </form>
  </div>
  <div class="shell block">
    <p class="search-status" data-search-status role="status">Type at least two characters.</p>
    <div class="search-results" data-search-page-results></div>
  </div>`;

  return {
    page: {
      title: 'Search',
      description: `Search every chapter on ${config.name}.`,
      url: '/search/',
      bodyClass: 'page-search',
      noindex: true,
    },
    body,
  };
}

/* ------------------------------------------------------------- playground */

export function playgroundPage({ config }) {
  const starter = `<!doctype html>
<html>
  <head>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; }
      h1   { color: #0b5cff; }
    </style>
  </head>
  <body>
    <h1>Hello, LearnPoint</h1>
    <p id="out">Edit the code and press Run.</p>
    <script>
      document.getElementById('out').textContent = 'Ran at ' + new Date().toLocaleTimeString();
    </scr` + `ipt>
  </body>
</html>`;

  const body = `
  <div class="shell page-head page-head--tight">
    ${breadcrumbs(config, [{ label: 'Home', href: '/' }, { label: 'Playground' }])}
    <h1>Code playground</h1>
    <p class="page-head__lede">A sandboxed HTML/CSS/JS editor. Nothing is uploaded — the code runs in an isolated frame inside this page, and the share link encodes it in the URL.</p>
  </div>
  <div class="playground" data-playground>
    <div class="playground__pane playground__pane--editor">
      <div class="playground__bar">
        <span class="playground__label">Editor</span>
        <span class="playground__actions">
          <button type="button" class="btn btn--sm btn--ghost" data-pg-reset>Reset</button>
          <button type="button" class="btn btn--sm btn--ghost" data-pg-share>Copy share link</button>
          <button type="button" class="btn btn--sm btn--primary" data-pg-run>Run ${icon('arrowRight')}</button>
        </span>
      </div>
      <textarea class="playground__code" data-pg-code spellcheck="false" aria-label="Code editor">${escapeHtml(starter)}</textarea>
    </div>
    <div class="playground__pane playground__pane--output">
      <div class="playground__bar"><span class="playground__label">Result</span>
        <span class="playground__hint">sandboxed · allow-scripts only</span></div>
      <iframe class="playground__frame" data-pg-frame title="Playground output" sandbox="allow-scripts allow-modals"></iframe>
    </div>
  </div>`;

  return {
    page: {
      title: 'Code playground',
      description: 'Run HTML, CSS and JavaScript in a sandboxed editor. No account, nothing uploaded.',
      url: '/playground/',
      bodyClass: 'page-playground',
    },
    body,
  };
}

/* -------------------------------------------------------------------- 404 */

export function notFoundPage({ config, content }) {
  const body = `
  <div class="shell page-head page-head--center">
    <p class="error-code">404</p>
    <h1>That chapter isn't here</h1>
    <p class="page-head__lede">The page may have been renamed. Search, or pick a tutorial below.</p>
    <p class="page-head__cta">
      <a class="btn btn--primary" href="${escapeHtml(withBase(config, '/tutorials/'))}">Browse tutorials</a>
      <a class="btn btn--ghost" href="${escapeHtml(withBase(config, '/search/'))}">Search</a>
    </p>
  </div>
  <div class="shell block">
    <div class="grid grid--cards">${each(content.tracks.slice(0, 6), (t) => trackCard(config, t, { compact: true }))}</div>
  </div>`;

  return {
    page: { title: 'Page not found', description: 'The page you asked for does not exist.', url: '/404.html', noindex: true, bodyClass: 'page-error' },
    body,
  };
}

/* --------------------------------------------------------------- schemas */

function breadcrumbSchema(config, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(config, item.href || '/'),
    })),
  };
}

function listSchema(config, tracks, name) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: tracks.length,
    itemListElement: tracks.map((track, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: track.title,
      url: absoluteUrl(config, track.url),
    })),
  };
}
