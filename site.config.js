/**
 * Global site configuration.
 *
 * The build engine is domain-agnostic: it knows nothing about programming,
 * finance or any other subject. Everything subject-specific lives in
 * `content/<vertical>/` and is described by the `verticals` list below.
 * Adding a new subject area is a config entry plus Markdown files.
 */
export default {
  name: 'LearnPoint',
  tagline: 'Learn by reading. Short lessons, real examples, no fluff.',
  description:
    'LearnPoint is a free, ad-light reference library of structured tutorials. ' +
    'Every topic is split into short chapters you can read in a few minutes, ' +
    'with runnable examples and a quick self-check at the end.',
  // Absolute origin used for canonical URLs, sitemap and RSS. Override with SITE_URL.
  url: process.env.SITE_URL || 'https://learnpoint.example.com',
  // Set to a sub-path (e.g. '/learnpoint') when hosting under GitHub Pages project sites.
  basePath: process.env.BASE_PATH || '',
  locale: 'en',
  lang: 'en',
  author: 'LearnPoint',
  twitter: '@learnpoint',
  themeColor: '#0b5cff',

  /**
   * Verticals = top-level subject domains. Order controls nav order.
   * `accent` drives the per-vertical colour token used across cards, badges
   * and the chapter rail, so each domain feels distinct without a rebuild.
   */
  verticals: [
    {
      slug: 'tech',
      name: 'Technology',
      short: 'Tech',
      accent: '#0b5cff',
      tagline: 'Programming languages, databases and the systems behind them.',
      description:
        'Structured tutorials on programming languages, databases, data structures ' +
        'and system design — written to be read top to bottom, not skimmed.',
    },
    {
      slug: 'finance',
      name: 'Finance',
      short: 'Finance',
      accent: '#0f9d58',
      tagline: 'Markets, money and the maths that decides who keeps it.',
      description:
        'Plain-language tutorials on investing, personal finance and how markets ' +
        'actually clear — the same chapter-by-chapter format, a different domain.',
    },
  ],

  nav: [
    { label: 'Tutorials', href: '/tutorials/' },
    { label: 'Playground', href: '/playground/' },
    { label: 'Search', href: '/search/' },
  ],

  footer: {
    columns: [
      {
        title: 'Learn',
        links: [
          { label: 'All tutorials', href: '/tutorials/' },
          { label: 'Technology', href: '/tech/' },
          { label: 'Finance', href: '/finance/' },
          { label: 'Code playground', href: '/playground/' },
        ],
      },
      {
        title: 'Reference',
        links: [
          { label: 'Search', href: '/search/' },
          { label: 'Sitemap', href: '/sitemap.xml' },
          { label: 'RSS feed', href: '/feed.xml' },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'Source on GitHub', href: 'https://github.com/VivekKhator/learnpoint' },
          { label: 'Contribute a chapter', href: 'https://github.com/VivekKhator/learnpoint#writing-content' },
        ],
      },
    ],
    legal: 'Content is free to read. Examples are released under the MIT licence.',
  },

  build: {
    outDir: 'dist',
    // Chapters shorter than this are flagged by `npm run check` as likely stubs.
    minWords: 120,
    // Average adult reading speed for technical prose.
    wordsPerMinute: 220,
  },
};
