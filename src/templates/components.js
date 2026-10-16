import { escapeHtml, attrs, each, icon } from './html.js';
import { withBase } from './layout.js';

export function breadcrumbs(config, trail) {
  return `
  <nav class="crumbs" aria-label="Breadcrumb">
    <ol>
      ${each(
        trail,
        (item, i) =>
          `<li>${
            i === trail.length - 1
              ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
              : `<a href="${escapeHtml(withBase(config, item.href))}">${escapeHtml(item.label)}</a>`
          }</li>`,
      )}
    </ol>
  </nav>`;
}

export function trackCard(config, track, { compact = false } = {}) {
  return `
  <a class="card card--track${compact ? ' card--compact' : ''}" href="${escapeHtml(withBase(config, track.url))}"
     style="--accent:${escapeHtml(track.vertical.accent)}">
    <span class="card__eyebrow">${escapeHtml(track.vertical.name)}</span>
    <h3 class="card__title">${escapeHtml(track.title)}</h3>
    ${compact ? '' : `<p class="card__text">${escapeHtml(track.description)}</p>`}
    <span class="card__meta">
      <span class="pill pill--level">${escapeHtml(track.level)}</span>
      <span class="card__dot">·</span>${track.chapters.length} chapters
      <span class="card__dot">·</span>${track.readingTime} min read
    </span>
  </a>`;
}

export function chapterSidebar(config, track, currentId) {
  return `
  <nav class="rail" aria-label="${escapeHtml(track.title)} contents" data-track="${escapeHtml(track.id)}">
    <div class="rail__head">
      <a class="rail__title" href="${escapeHtml(withBase(config, track.url))}">${escapeHtml(track.title)}</a>
      <p class="rail__progress"><span class="rail__bar"><span class="rail__bar-fill" data-progress-bar></span></span>
        <span class="rail__progress-label" data-progress-label>0 / ${track.chapters.length} done</span></p>
    </div>
    <ol class="rail__list">
      ${each(
        track.chapters,
        (chapter) => `
        <li>
          <a${attrs({
            href: withBase(config, chapter.url),
            class: `rail__link${chapter.id === currentId ? ' is-active' : ''}`,
            'data-chapter': chapter.id,
            'aria-current': chapter.id === currentId ? 'page' : null,
          })}>
            <span class="rail__num">${chapter.index}</span>
            <span class="rail__text">${escapeHtml(chapter.navTitle)}</span>
            <span class="rail__tick" aria-hidden="true">${icon('check')}</span>
          </a>
        </li>`,
      )}
    </ol>
  </nav>`;
}

export function tableOfContents(headings) {
  if (headings.length < 2) return '';
  return `
  <nav class="toc" aria-label="On this page">
    <h2 class="toc__title">On this page</h2>
    <ul class="toc__list">
      ${each(
        headings,
        (h) =>
          `<li class="toc__item toc__item--h${h.level}"><a href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`,
      )}
    </ul>
  </nav>`;
}

export function pager(config, chapter) {
  const { prev, next } = chapter;
  if (!prev && !next) return '';
  return `
  <nav class="pager" aria-label="Chapter navigation">
    ${
      prev
        ? `<a class="pager__link pager__link--prev" href="${escapeHtml(withBase(config, prev.url))}" rel="prev">
            ${icon('arrowLeft')}<span><span class="pager__dir">Previous</span><span class="pager__title">${escapeHtml(prev.navTitle)}</span></span>
           </a>`
        : '<span></span>'
    }
    ${
      next
        ? `<a class="pager__link pager__link--next" href="${escapeHtml(withBase(config, next.url))}" rel="next">
            <span><span class="pager__dir">Next</span><span class="pager__title">${escapeHtml(next.navTitle)}</span></span>${icon('arrowRight')}
           </a>`
        : '<span></span>'
    }
  </nav>`;
}

/**
 * Self-check quiz. Answers are rendered into the markup but the correct index
 * only unlocks after a choice is made, so the page still works without JS
 * (the explanation list is exposed inside a <details>).
 */
export function quiz(chapter) {
  if (!chapter.quiz.length) return '';
  return `
  <section class="quiz" data-quiz data-chapter="${escapeHtml(chapter.id)}" aria-labelledby="quiz-heading">
    <h2 class="quiz__heading" id="quiz-heading">${icon('spark')} Check yourself</h2>
    <p class="quiz__sub">${chapter.quiz.length} quick question${chapter.quiz.length > 1 ? 's' : ''}. No score is sent anywhere — it stays in your browser.</p>
    ${each(
      chapter.quiz,
      (item, qi) => `
      <fieldset class="quiz__q" data-answer="${Number(item.answer)}">
        <legend class="quiz__prompt"><span class="quiz__n">Q${qi + 1}</span> ${escapeHtml(item.q)}</legend>
        <div class="quiz__options">
          ${each(
            item.options || [],
            (option, oi) => `
            <label class="quiz__option">
              <input type="radio" name="q-${escapeHtml(chapter.slug)}-${qi}" value="${oi}">
              <span class="quiz__option-text">${escapeHtml(option)}</span>
            </label>`,
          )}
        </div>
        <p class="quiz__explain" hidden>${escapeHtml(item.explain || '')}</p>
      </fieldset>`,
    )}
    <noscript><details class="quiz__noscript"><summary>Show answers</summary><ol>${each(
      chapter.quiz,
      (item) =>
        `<li><strong>${escapeHtml((item.options || [])[Number(item.answer)] || '')}</strong> — ${escapeHtml(item.explain || '')}</li>`,
    )}</ol></details></noscript>
  </section>`;
}

export function faqBlock(chapter) {
  if (!chapter.faq.length) return '';
  return `
  <section class="faq" aria-labelledby="faq-heading">
    <h2 id="faq-heading">Frequently asked</h2>
    ${each(
      chapter.faq,
      (item) => `
      <details class="faq__item">
        <summary>${escapeHtml(item.q)}</summary>
        <div class="faq__answer"><p>${escapeHtml(item.a)}</p></div>
      </details>`,
    )}
  </section>`;
}

export function sectionHeading(title, sub = '', id = '') {
  return `
  <header class="section-head"${id ? ` id="${escapeHtml(id)}"` : ''}>
    <h2 class="section-head__title">${escapeHtml(title)}</h2>
    ${sub ? `<p class="section-head__sub">${escapeHtml(sub)}</p>` : ''}
  </header>`;
}
