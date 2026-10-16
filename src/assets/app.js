/* LearnPoint client runtime.
   Everything here is progressive enhancement: the pages are complete HTML
   without it. No framework, no build step, ~6 KB gzipped. */
(function () {
  'use strict';

  var BASE = (window.LP && window.LP.base) || '';
  var url = function (p) { return (BASE + p).replace(/\/{2,}/g, '/'); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------ storage */
  // localStorage throws in private mode and in sandboxed frames; never let
  // that take the page down.
  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
  };

  /* -------------------------------------------------------------- theme */
  function initTheme() {
    var btn = $('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      // Stored raw, not JSON — the inline bootstrap in <head> reads it before
      // this file has loaded and cannot afford to parse.
      try { localStorage.setItem('lp-theme', next); } catch (e) { /* private mode */ }
    });
  }

  /* ------------------------------------------------------------- drawer */
  function initDrawer() {
    var drawer = $('#site-drawer');
    var toggle = $('[data-drawer-toggle]');
    if (!drawer || !toggle) return;

    function open() {
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var first = $('.drawer__panel a, .drawer__panel button', drawer);
      if (first) first.focus();
    }
    function close() {
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
    toggle.addEventListener('click', function () { drawer.hidden ? open() : close(); });
    $$('[data-drawer-close]', drawer).forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) close(); });
  }

  /* ---------------------------------------------------------- copy code */
  function initCopy() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy]');
      if (!btn) return;
      var fig = btn.closest('.code');
      var src = fig && $('.code__source', fig);
      if (!src) return;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(src.value).then(done, function () { legacyCopy(src, done); });
      } else {
        legacyCopy(src, done);
      }
    });
  }
  function legacyCopy(textarea, done) {
    textarea.hidden = false;
    textarea.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    textarea.hidden = true;
  }

  /* ------------------------------------------- send a snippet to /playground */
  function encodeCode(text) {
    // UTF-8 safe base64url so the share link survives any character.
    var bytes = new TextEncoder().encode(text);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeCode(hash) {
    try {
      var b64 = hash.replace(/-/g, '+').replace(/_/g, '/');
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch (e) { return null; }
  }

  function initRunButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-run]');
      if (!btn) return;
      var fig = btn.closest('.code');
      var src = fig && $('.code__source', fig);
      if (!src) return;
      var lang = btn.getAttribute('data-run');
      var code = src.value;
      var doc =
        lang === 'css' ? '<!doctype html>\n<html>\n<head>\n<style>\n' + code + '\n</style>\n</head>\n<body>\n  <h1>Styled heading</h1>\n  <p class="demo">Edit the CSS and press Run.</p>\n</body>\n</html>'
        : (lang === 'js' || lang === 'javascript')
          ? '<!doctype html>\n<html>\n<body>\n<pre id="log"></pre>\n<script>\nconst log=(...a)=>document.getElementById("log").textContent+=a.join(" ")+"\\n";\nconsole.log=log;\n' + code + '\n<\/script>\n</body>\n</html>'
          : code;
      window.location.href = url('/playground/') + '#code=' + encodeCode(doc);
    });
  }

  /* --------------------------------------------------------- playground */
  function initPlayground() {
    var root = $('[data-playground]');
    if (!root) return;
    var editor = $('[data-pg-code]', root);
    var frame = $('[data-pg-frame]', root);
    var initial = editor.value;

    var fromHash = location.hash.indexOf('#code=') === 0 ? decodeCode(location.hash.slice(6)) : null;
    if (fromHash) editor.value = fromHash;

    function run() {
      // srcdoc + sandbox keeps the sample isolated from the parent origin.
      frame.srcdoc = editor.value;
    }
    run();

    $('[data-pg-run]', root).addEventListener('click', run);
    $('[data-pg-reset]', root).addEventListener('click', function () {
      editor.value = initial;
      history.replaceState(null, '', location.pathname);
      run();
    });
    $('[data-pg-share]', root).addEventListener('click', function (e) {
      var link = location.origin + location.pathname + '#code=' + encodeCode(editor.value);
      var btn = e.currentTarget;
      var ok = function () {
        btn.textContent = 'Link copied';
        setTimeout(function () { btn.textContent = 'Copy share link'; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(ok, ok); else ok();
      history.replaceState(null, '', '#code=' + encodeCode(editor.value));
    });

    // Ctrl/Cmd+Enter runs; Tab inserts two spaces instead of leaving the field.
    editor.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = editor.selectionStart, en = editor.selectionEnd;
        editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(en);
        editor.selectionStart = editor.selectionEnd = s + 2;
      }
    });
  }

  /* ------------------------------------------------------------ progress */
  var PROGRESS_KEY = 'lp-progress';
  var getProgress = function () { return store.get(PROGRESS_KEY, {}) || {}; };

  function paintProgress() {
    var done = getProgress();
    $$('[data-chapter]').forEach(function (el) {
      if (el.tagName === 'A' && done[el.getAttribute('data-chapter')]) el.classList.add('is-done');
    });
    $$('[data-track]').forEach(function (scope) {
      var links = $$('a[data-chapter]', scope);
      if (!links.length) return;
      var count = links.filter(function (a) { return done[a.getAttribute('data-chapter')]; }).length;
      var bar = $('[data-progress-bar]', scope);
      var label = $('[data-progress-label]', scope);
      if (bar) bar.style.width = Math.round((count / links.length) * 100) + '%';
      if (label) label.textContent = count + ' / ' + links.length + ' done';
    });
  }

  function initProgress() {
    paintProgress();

    var btn = $('[data-mark-done]');
    var article = $('.chapter[data-chapter]');
    if (btn && article) {
      var id = article.getAttribute('data-chapter');
      var wrap = btn.closest('.chapter__done');
      var sync = function () {
        var isDone = !!getProgress()[id];
        btn.innerHTML = isDone ? '&#10003; Read — click to undo' : btn.getAttribute('data-label') || btn.innerHTML;
        wrap.classList.toggle('is-done', isDone);
      };
      btn.setAttribute('data-label', btn.innerHTML);
      sync();
      btn.addEventListener('click', function () {
        var p = getProgress();
        if (p[id]) delete p[id]; else p[id] = Date.now();
        store.set(PROGRESS_KEY, p);
        sync();
        paintProgress();
      });
    }

    // "Resume where you left off" on a track page.
    var resume = $('[data-resume]');
    var list = $('.chapter-list[data-track]');
    if (resume && list) {
      var done = getProgress();
      var links = $$('a[data-chapter]', list);
      var next = links.find(function (a) { return !done[a.getAttribute('data-chapter')]; });
      var anyDone = links.some(function (a) { return done[a.getAttribute('data-chapter')]; });
      if (anyDone && next) { resume.href = next.getAttribute('href'); resume.hidden = false; }
    }
  }

  /* ---------------------------------------------------------------- quiz */
  function initQuiz() {
    $$('[data-quiz] .quiz__q').forEach(function (field) {
      var answer = Number(field.getAttribute('data-answer'));
      var explain = $('.quiz__explain', field);
      field.addEventListener('change', function (e) {
        if (!e.target.matches('input[type="radio"]')) return;
        var picked = Number(e.target.value);
        $$('.quiz__option', field).forEach(function (opt, i) {
          opt.classList.remove('is-correct', 'is-wrong');
          opt.classList.add('is-locked');
          if (i === answer) opt.classList.add('is-correct');
          else if (i === picked) opt.classList.add('is-wrong');
          var input = $('input', opt);
          if (input) input.disabled = true;
        });
        if (explain && explain.textContent.trim()) explain.hidden = false;
      });
    });
  }

  /* ------------------------------------------------------------ scrollspy */
  function initScrollSpy() {
    var items = $$('.toc__item a');
    if (!items.length || !('IntersectionObserver' in window)) return;
    var map = {};
    items.forEach(function (a) {
      var target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (target) map[target.id] = a.parentElement;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var li = map[entry.target.id];
        if (!li) return;
        if (entry.isIntersecting) {
          $$('.toc__item.is-active').forEach(function (el) { el.classList.remove('is-active'); });
          li.classList.add('is-active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* -------------------------------------------------------------- search */
  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(url('/search-index.json'))
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; });
    }
    return indexPromise;
  }

  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function scoreEntry(entry, terms) {
    var title = entry.t.toLowerCase();
    var track = (entry.k || '').toLowerCase();
    var keywords = (entry.w || '').toLowerCase();
    var body = entry.b.toLowerCase();
    var total = 0;

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var hit = 0;
      if (title === term) hit += 120;
      if (title.indexOf(term) === 0) hit += 60;
      else if (title.indexOf(term) > -1) hit += 40;
      if (keywords.indexOf(term) > -1) hit += 25;
      if (track.indexOf(term) > -1) hit += 12;
      var occurrences = body.split(term).length - 1;
      if (occurrences) hit += Math.min(18, 4 + occurrences * 1.5);
      if (!hit) return 0;            // every term must appear somewhere
      total += hit;
    }
    return total;
  }

  function snippet(entry, terms) {
    var body = entry.b;
    var lower = body.toLowerCase();
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = lower.indexOf(terms[i]);
    if (at < 0) return escapeHtml(entry.d.slice(0, 150));
    var start = Math.max(0, at - 60);
    var text = (start ? '…' : '') + body.slice(start, start + 180).trim() + '…';
    var out = escapeHtml(text);
    terms.forEach(function (term) {
      out = out.replace(new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return out;
  }

  function search(index, query, limit) {
    var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    return index
      .map(function (entry) { return { entry: entry, score: scoreEntry(entry, terms) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 12)
      .map(function (r) {
        return { entry: r.entry, html: resultHtml(r.entry, terms) };
      });
  }

  function resultHtml(entry, terms) {
    return (
      '<a class="sresult" href="' + escapeHtml(url(entry.u)) + '">' +
      '<span class="sresult__crumb">' + escapeHtml(entry.v) + ' · ' + escapeHtml(entry.k) + '</span>' +
      '<span class="sresult__title">' + escapeHtml(entry.t) + '</span>' +
      '<span class="sresult__snippet">' + snippet(entry, terms) + '</span></a>'
    );
  }

  function initSearchOverlay() {
    var overlay = $('#search-overlay');
    if (!overlay) return;
    var input = $('#search-input', overlay);
    var results = $('#search-results', overlay);
    var cursor = -1;

    function open() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      input.focus();
      input.select();
      loadIndex();
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      cursor = -1;
    }

    $$('[data-search-open]').forEach(function (el) { el.addEventListener('click', open); });
    $$('[data-search-close]', overlay).forEach(function (el) { el.addEventListener('click', close); });
    $('.search-overlay__form', overlay).addEventListener('submit', function (e) {
      if (!input.value.trim()) e.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
        document.activeElement.isContentEditable;
      if (e.key === '/' && !typing && overlay.hidden) { e.preventDefault(); open(); }
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); overlay.hidden ? open() : close(); }
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    var render = debounce(function () {
      var q = input.value.trim();
      cursor = -1;
      if (q.length < 2) { results.innerHTML = ''; return; }
      loadIndex().then(function (index) {
        var found = search(index, q, 10);
        results.innerHTML = found.length
          ? found.map(function (r) { return r.html; }).join('')
          : '<p class="search-empty">No chapter matches “' + escapeHtml(q) + '”.</p>';
      });
    }, 110);

    input.addEventListener('input', render);

    overlay.addEventListener('keydown', function (e) {
      var links = $$('.sresult', results);
      if (!links.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (l, i) { l.classList.toggle('is-cursor', i === cursor); });
        links[cursor].scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter' && cursor > -1) { e.preventDefault(); links[cursor].click(); }
    });
  }

  function initSearchPage() {
    var form = $('[data-search-form]');
    if (!form) return;
    var input = $('input[name="q"]', form);
    var status = $('[data-search-status]');
    var target = $('[data-search-page-results]');

    function run(q) {
      if (q.length < 2) {
        status.textContent = 'Type at least two characters.';
        target.innerHTML = '';
        return;
      }
      status.textContent = 'Searching…';
      loadIndex().then(function (index) {
        var found = search(index, q, 40);
        status.textContent = found.length
          ? found.length + ' chapter' + (found.length > 1 ? 's' : '') + ' match “' + q + '”.'
          : 'Nothing matches “' + q + '”. Try a shorter or more general word.';
        target.innerHTML = found.map(function (r) { return r.html; }).join('');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      history.replaceState(null, '', q ? '?q=' + encodeURIComponent(q) : location.pathname);
      run(q);
    });
    input.addEventListener('input', debounce(function () { run(input.value.trim()); }, 180));

    var initial = new URLSearchParams(location.search).get('q');
    if (initial) { input.value = initial; run(initial.trim()); }
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments, self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  /* ----------------------------------------------------------------- go */
  function boot() {
    initTheme();
    initDrawer();
    initCopy();
    initRunButtons();
    initPlayground();
    initProgress();
    initQuiz();
    initScrollSpy();
    initSearchOverlay();
    initSearchPage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
