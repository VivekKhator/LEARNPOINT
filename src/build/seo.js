import { absoluteUrl } from '../templates/layout.js';

const xmlEscape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {Array<{url:string, lastmod?:string|null, priority?:number, changefreq?:string}>} entries
 */
export function renderSitemap(config, entries) {
  const urls = entries
    .map(({ url, lastmod, priority = 0.6, changefreq = 'monthly' }) =>
      [
        '  <url>',
        `    <loc>${xmlEscape(absoluteUrl(config, url))}</loc>`,
        lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '',
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority.toFixed(1)}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderRobots(config) {
  return `User-agent: *
Allow: /
Disallow: /search/

Sitemap: ${absoluteUrl(config, '/sitemap.xml')}
`;
}

export function renderFeed(config, chapters) {
  const items = [...chapters]
    .sort((a, b) => String(b.updated || '').localeCompare(String(a.updated || '')))
    .slice(0, 40)
    .map((chapter) => {
      const link = absoluteUrl(config, chapter.url);
      const date = chapter.updated ? new Date(`${chapter.updated}T00:00:00Z`) : new Date();
      return `    <item>
      <title>${xmlEscape(chapter.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <category>${xmlEscape(chapter.track.title)}</category>
      <pubDate>${date.toUTCString()}</pubDate>
      <description>${xmlEscape(chapter.description)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(config.name)}</title>
    <link>${xmlEscape(absoluteUrl(config, '/'))}</link>
    <description>${xmlEscape(config.description)}</description>
    <language>${xmlEscape(config.lang)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(absoluteUrl(config, '/feed.xml'))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

/** Tiny inline-SVG brand assets — no binary files, no extra requests to a CDN. */
export function renderFavicon(config) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${xmlEscape(config.themeColor)}"/>
  <text x="32" y="43" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
        font-size="30" font-weight="700" fill="#fff" text-anchor="middle">LP</text>
</svg>
`;
}

export function renderOgImage(config) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${xmlEscape(config.themeColor)}"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0c1120"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="url(#g)" opacity="0.12"/>
  <rect x="96" y="112" width="84" height="84" rx="20" fill="url(#g)"/>
  <text x="138" y="170" font-family="system-ui,sans-serif" font-size="38" font-weight="800"
        fill="#fff" text-anchor="middle">LP</text>
  <text x="96" y="300" font-family="system-ui,sans-serif" font-size="72" font-weight="800" fill="#ffffff">
    ${xmlEscape(config.name)}
  </text>
  <text x="96" y="372" font-family="system-ui,sans-serif" font-size="34" fill="#aab4cd">
    ${xmlEscape(config.tagline)}
  </text>
  <text x="96" y="500" font-family="ui-monospace,monospace" font-size="26" fill="#7fb4ff">
    read · run · check yourself
  </text>
</svg>
`;
}
