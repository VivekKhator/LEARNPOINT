import { escapeHtml, attrs, each, icon, jsonScript } from './html.js';

/** Prefix an absolute site path with the configured basePath. */
export const withBase = (config, href = '/') =>
  /^(https?:)?\/\/|^mailto:|^#/.test(href) ? href : `${config.basePath}${href}`.replace(/\/{2,}/g, '/');

export const absoluteUrl = (config, href = '/') =>
  new URL(withBase(config, href), config.url).toString();

function head({ config, page, assets }) {
  const title = page.title === config.name ? config.name : `${page.title} | ${config.name}`;
  const canonical = absoluteUrl(config, page.url || '/');
  const ogImage = absoluteUrl(config, page.image || '/assets/og-default.svg');

  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description || config.description)}">`,
    page.keywords?.length ? `<meta name="keywords" content="${escapeHtml(page.keywords.join(', '))}">` : '',
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    page.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<meta name="theme-color" content="${escapeHtml(config.themeColor)}">`,
    `<meta property="og:type" content="${page.ogType || 'website'}">`,
    `<meta property="og:site_name" content="${escapeHtml(config.name)}">`,
    `<meta property="og:title" content="${escapeHtml(page.title)}">`,
    `<meta property="og:description" content="${escapeHtml(page.description || config.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    `<meta property="og:locale" content="${escapeHtml(config.locale)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    config.twitter ? `<meta name="twitter:site" content="${escapeHtml(config.twitter)}">` : '',
    page.updated ? `<meta property="article:modified_time" content="${escapeHtml(page.updated)}">` : '',
    `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.name)}" href="${escapeHtml(withBase(config, '/feed.xml'))}">`,
    `<link rel="icon" href="${escapeHtml(withBase(config, '/assets/favicon.svg'))}" type="image/svg+xml">`,
    `<link rel="stylesheet" href="${escapeHtml(withBase(config, assets.css))}">`,
    each(page.structuredData, (data) => jsonScript(data)),
  ]
    .filter(Boolean)
    .join('\n    ');
}

/** Runs before first paint so a dark-mode reader never sees a white flash. */
const themeBootstrap =
  `(function(){try{var t=(localStorage.getItem('lp-theme')||'').replace(/"/g,'');` +
  `if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

function header({ config, page, content }) {
  const navItems = [
    ...content.verticals.map((v) => ({ label: v.name, href: v.url, active: page.verticalSlug === v.slug })),
    ...config.nav.map((item) => ({ ...item, active: page.url === item.href })),
  ];

  return `
  <header class="site-header">
    <div class="shell site-header__inner">
      <button type="button" class="icon-btn site-header__burger" data-drawer-toggle aria-expanded="false" aria-controls="site-drawer" aria-label="Open navigation">
        ${icon('menu')}
      </button>
      <a class="brand" href="${escapeHtml(withBase(config, '/'))}">
        <span class="brand__mark" aria-hidden="true">LP</span>
        <span class="brand__name">${escapeHtml(config.name)}</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        ${each(
          navItems,
          (item) =>
            `<a class="site-nav__link${item.active ? ' is-active' : ''}"${attrs({
              href: withBase(config, item.href),
              'aria-current': item.active ? 'page' : null,
            })}>${escapeHtml(item.label)}</a>`,
        )}
      </nav>
      <div class="site-header__tools">
        <button type="button" class="searchbox" data-search-open aria-label="Search tutorials">
          ${icon('search')}<span class="searchbox__hint">Search</span>
          <kbd class="searchbox__kbd">/</kbd>
        </button>
        <button type="button" class="icon-btn" data-theme-toggle aria-label="Switch colour theme">
          <span class="theme-icon theme-icon--light">${icon('sun')}</span>
          <span class="theme-icon theme-icon--dark">${icon('moon')}</span>
        </button>
      </div>
    </div>
  </header>`;
}

function drawer({ config, content, page }) {
  return `
  <div class="drawer" id="site-drawer" hidden>
    <div class="drawer__backdrop" data-drawer-close></div>
    <nav class="drawer__panel" aria-label="All tutorials">
      <div class="drawer__head">
        <span class="drawer__title">Browse</span>
        <button type="button" class="icon-btn" data-drawer-close aria-label="Close navigation">${icon('close')}</button>
      </div>
      ${each(
        content.verticals,
        (vertical) => `
        <section class="drawer__group" style="--accent:${escapeHtml(vertical.accent)}">
          <a class="drawer__group-title" href="${escapeHtml(withBase(config, vertical.url))}">${escapeHtml(vertical.name)}</a>
          <ul class="drawer__list">
            ${each(
              vertical.tracks,
              (track) =>
                `<li><a${attrs({
                  href: withBase(config, track.url),
                  class: `drawer__link${page.trackId === track.id ? ' is-active' : ''}`,
                })}>${escapeHtml(track.shortTitle)}<span class="drawer__count">${track.chapters.length}</span></a></li>`,
            )}
          </ul>
        </section>`,
      )}
    </nav>
  </div>`;
}

function searchOverlay(config) {
  return `
  <div class="search-overlay" id="search-overlay" hidden>
    <div class="search-overlay__backdrop" data-search-close></div>
    <div class="search-overlay__panel" role="dialog" aria-modal="true" aria-label="Search tutorials">
      <form class="search-overlay__form" role="search" action="${escapeHtml(withBase(config, '/search/'))}" method="get">
        ${icon('search')}
        <input type="search" name="q" id="search-input" class="search-overlay__input"
               placeholder="Search chapters, e.g. &quot;join&quot; or &quot;compound interest&quot;"
               autocomplete="off" spellcheck="false" aria-label="Search query">
        <button type="button" class="icon-btn" data-search-close aria-label="Close search">${icon('close')}</button>
      </form>
      <div class="search-overlay__results" id="search-results" role="listbox" aria-label="Search results"></div>
      <p class="search-overlay__foot"><kbd>&uarr;</kbd><kbd>&darr;</kbd> to navigate · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close</p>
    </div>
  </div>`;
}

function footer({ config, content }) {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="shell site-footer__inner">
      <div class="site-footer__brand">
        <a class="brand" href="${escapeHtml(withBase(config, '/'))}">
          <span class="brand__mark" aria-hidden="true">LP</span>
          <span class="brand__name">${escapeHtml(config.name)}</span>
        </a>
        <p class="site-footer__tagline">${escapeHtml(config.tagline)}</p>
        <p class="site-footer__stat">${content.chapters.length} chapters · ${content.tracks.length} tutorials · ${content.verticals.length} subject areas</p>
      </div>
      ${each(
        config.footer.columns,
        (column) => `
        <div class="site-footer__col">
          <h2 class="site-footer__title">${escapeHtml(column.title)}</h2>
          <ul>${each(
            column.links,
            (link) => `<li><a href="${escapeHtml(withBase(config, link.href))}">${escapeHtml(link.label)}</a></li>`,
          )}</ul>
        </div>`,
      )}
    </div>
    <div class="shell site-footer__legal">
      <p>&copy; ${year} ${escapeHtml(config.name)}. ${escapeHtml(config.footer.legal)}</p>
    </div>
  </footer>`;
}

/**
 * Render a complete document.
 * @param {object} options
 * @param {object} options.page  { title, description, url, bodyClass, accent, ... }
 * @param {string} options.body  main-content HTML
 */
export function layout({ config, content, assets, page, body }) {
  return `<!doctype html>
<html lang="${escapeHtml(config.lang)}"${page.accent ? ` style="--accent:${escapeHtml(page.accent)}"` : ''}>
  <head>
    ${head({ config, page, assets })}
    <script>${themeBootstrap}</script>
  </head>
  <body${attrs({ class: page.bodyClass || '' })}>
    <a class="skip-link" href="#main">Skip to content</a>
    ${header({ config, page, content })}
    ${drawer({ config, content, page })}
    <main id="main" class="site-main">${body}</main>
    ${footer({ config, content })}
    ${searchOverlay(config)}
    <script>window.LP={base:${JSON.stringify(config.basePath)}};</script>
    <script src="${escapeHtml(withBase(config, assets.js))}" defer></script>
  </body>
</html>
`;
}
