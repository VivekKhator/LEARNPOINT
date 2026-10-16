# LearnPoint

A read-first learning platform in the spirit of W3Schools and JavatPoint — short
chapters, runnable examples, a self-check at the end — built as a **domain-agnostic
static site engine** rather than a site about one subject.

The repository ships two subject verticals to prove the point:

| Vertical | Tutorials | What it demonstrates |
|---|---|---|
| **Technology** | Python, SQL, JavaScript, Data Structures & Algorithms | The classic use case |
| **Finance** | Stock Market Basics, Personal Finance | The same engine, a completely different domain |

Adding a third domain — medical coding, compliance, law, competitive exams — is
one config entry and a folder of Markdown. No engine code changes.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321, rebuilds and live-reloads on save
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server with file watching and SSE live reload |
| `npm run build` | Build the static site into `dist/` |
| `npm run serve` | Serve a built `dist/` with clean URLs |
| `npm run check` | Lint content and output — dead links, duplicate URLs, thin pages, bad quiz answers |
| `npm test` | 39 unit and integration tests over the build pipeline |
| `npm run new -- tech/python "Chapter title"` | Scaffold a chapter with valid frontmatter |

---

## Why a static generator and not Next.js

The product is text that must rank in search and load on a slow connection. That
pushes every decision the same way:

- **Pre-rendered HTML.** Content is in the first response, not after hydration.
  Crawlers, readers on 3G and screen readers all get the same thing.
- **No client framework.** Total JavaScript is ~18 KB unminified, and every page
  is fully readable with JS disabled. Search, the quiz, progress tracking and the
  playground are progressive enhancements.
- **Build-time syntax highlighting.** highlight.js runs during the build and emits
  CSS classes; the browser downloads no highlighter and the theme follows our own
  design tokens in both light and dark mode.
- **Output is plain files.** Deploys to any CDN or object store. 34 chapters build
  in ~450 ms, so a thousand chapters stays well inside a CI step.
- **Seven direct dependencies**, all build-time. Nothing third-party reaches the
  reader's browser.

---

## Architecture

```
site.config.js            Verticals, nav, footer, SEO defaults — the only domain knowledge
content/
  <vertical>/
    vertical.yml          Optional per-vertical overrides
    <track>/
      track.yml           Title, level, prerequisites, outcomes, ordering
      01-chapter.md       Frontmatter + Markdown
src/
  build/
    index.js              Orchestrator: load → render → emit
    content.js            Markdown + YAML → a normalised content graph
    markdown.js           markdown-it config: callouts, code bar, anchors, TOC capture
    search.js             Client search index
    seo.js                sitemap.xml, robots.txt, feed.xml, favicon, OG image
  templates/
    layout.js             Document shell, head, header, drawer, footer
    components.js         Cards, breadcrumbs, rail, TOC, pager, quiz, FAQ
    pages.js              Home, tutorials, vertical, track, chapter, search, playground, 404
  assets/
    styles.css            Design tokens + components; light/dark; print styles
    app.js                Theme, drawer, search, quiz, progress, playground
scripts/
  dev.js  serve.js  check.js  new-chapter.js
test/build.test.js
```

The build is a pure function of `content/` + `site.config.js`. `loadContent()`
returns a graph of verticals → tracks → chapters with prev/next links, headings,
word counts and reading times already resolved; templates only read from it.

### URL scheme

```
/                               home
/tutorials/                     every tutorial
/<vertical>/                    e.g. /tech/
/<vertical>/<track>/            e.g. /tech/python/
/<vertical>/<track>/<chapter>/  e.g. /tech/python/control-flow/
/search/   /playground/   /404.html
```

Path-based clustering by vertical and track gives search engines an explicit
topic hierarchy, and guarantees no slug collisions across domains.

---

## Writing content

```bash
npm run new -- finance/stock-market "How Dividends Are Taxed"
```

Frontmatter the build and linter expect:

```yaml
---
title: Python Lists and Tuples
description: One sentence, 60–160 characters, written to work as a search result.
keywords: [python list, tuple, slicing]
updated: 2026-10-12
quiz:
  - q: What is the cost of inserting at the front of a list?
    options: ["O(1)", "O(log n)", "O(n)"]
    answer: 2
    explain: Every existing element shifts one position right.
faq:
  - q: Is a tuple faster than a list?
    a: Marginally, and it almost never decides anything.
---
```

Ordering comes from the filename prefix (`03-strings.md` → chapter 3, slug
`strings`). Renumbering files reorders the tutorial; the slug, and therefore the
URL, is unaffected by the number.

### Markdown extensions

Callout blocks:

```markdown
:::tip
Short, concrete advice.
:::
```

`note`, `tip`, `warning`, `danger`, `syntax`, `example`, `interview` — each with
its own colour and icon. An optional custom title follows the name.

Code fences take a language plus flags:

````markdown
```python title=app.py
print("filename shown in the bar")
```

```html run
<p>adds a "Try it yourself" button that opens this in the playground</p>
```

```output
what the program printed
```
````

`run` works for `html`, `css` and `js`. CSS and JS snippets are wrapped in a
minimal host document, and `console.log` is redirected to the output pane.

### What `npm run check` enforces

- Every chapter URL is unique
- Descriptions are 40–170 characters
- Quiz `answer` indexes into that question's own `options`
- Internal Markdown links resolve to a page the build actually emits
- Chapters are over the word floor set in `site.config.js`
- The built `index.html` has a canonical link and structured data

It exits non-zero on problems, so it belongs in CI ahead of a deploy.

---

## SEO and accessibility

Generated for every page: canonical URL, Open Graph and Twitter cards, JSON-LD
(`WebSite` with `SearchAction`, `Course` with `syllabusSections`, `TechArticle`,
`BreadcrumbList`, and `FAQPage` where a chapter defines FAQs), `sitemap.xml`,
`robots.txt` and an RSS feed.

Accessibility: one `h1` per page, landmark elements, a skip link, visible focus
rings, `aria-current` on the active navigation item, labelled icon buttons,
`prefers-reduced-motion` honoured, and a quiz that still reveals its answers
inside `<noscript>`.

---

## Deployment

Output is static files. Set `SITE_URL` so canonical URLs, the sitemap and the
feed are absolute and correct.

```bash
SITE_URL=https://yourdomain.com npm run build
```

- **Netlify** — `netlify.toml` is included; connect the repo and it builds.
- **Vercel** — `vercel.json` is included.
- **GitHub Pages** — `.github/workflows/deploy.yml` builds and publishes on push
  to `main`. For a project site, also set `BASE_PATH=/<repo-name>`.
- **Any CDN or bucket** — upload `dist/`. Hashed asset filenames are safe to
  cache for a year; HTML should be `no-cache`.

---

## Licence

MIT for the code. Content is CC BY-SA 4.0 unless a chapter says otherwise.
