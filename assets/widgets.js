/*
 * widgets.js — interactive slide widgets for the modular deck.
 *
 * Why this file exists
 * ────────────────────
 * Reveal.js fragments loaded via fetch() + insertAdjacentHTML do NOT execute
 * inline <script> tags. The canonical pattern for rich slide content is:
 *
 *   1. Per-widget factory functions live in this file (one source of truth).
 *   2. Slides reference them declaratively via `data-widget="<name>"`
 *      (and optionally `data-widget-options='<json>'` for per-instance config).
 *   3. After every slide fragment is in the DOM, the shell calls
 *      `deckWidgetsInit(slidesEl)`. It scans for `[data-widget]` markers
 *      and invokes the matching factory, which mutates the marker in place.
 *
 * Adding a new widget:
 *   1. Define `function createMyWidget(root, options) { … }` below.
 *   2. Register it on `window.deckWidgets` (`{ myWidget: createMyWidget }`).
 *   3. In a slide, mark a root element:
 *        <div data-widget="myWidget" data-widget-options='{"foo":1}'>…</div>
 *
 * No inline <script> tags in any slide. No clone-replace dance.
 */

(function () {

  // ── Example widget: counter ─────────────────────────────────────────────
  // <div data-widget="counter" data-widget-options='{"start":0,"label":"clicks"}'></div>
  function createCounter(root, options) {
    const start = Number.isFinite(options.start) ? options.start : 0;
    const label = options.label || 'clicks';
    let count = start;

    root.innerHTML = `
      <button type="button" class="dc-counter-btn"
        style="display:inline-flex;align-items:center;gap:14px;
               padding:14px 22px;border-radius:999px;border:1px solid var(--rule);
               background:var(--paper-3);color:var(--ink);
               font-family:'Geist Mono',ui-monospace,monospace;font-size:18px;
               cursor:pointer;transition:transform .12s ease, box-shadow .2s ease;
               box-shadow:0 2px 8px -4px rgba(0,0,0,.18)">
        <span class="dc-counter-value" style="font-weight:600;color:var(--accent)">${count}</span>
        <span style="color:var(--muted)">${label}</span>
      </button>`;
    const btn = root.querySelector('.dc-counter-btn');
    const val = root.querySelector('.dc-counter-value');
    btn.addEventListener('pointerdown', () => { btn.style.transform = 'scale(.96)'; });
    btn.addEventListener('pointerup',   () => { btn.style.transform = ''; });
    btn.addEventListener('click', () => { count += 1; val.textContent = count; });
  }

  // ── Example widget: reveal ──────────────────────────────────────────────
  // <div data-widget="reveal" data-widget-options='{"prompt":"Click to show","answer":"42"}'></div>
  function createReveal(root, options) {
    const prompt = options.prompt || 'Click to reveal';
    const answer = options.answer || '';

    root.innerHTML = `
      <button type="button" class="dc-reveal-btn"
        style="display:inline-block;padding:16px 24px;border-radius:12px;
               border:1px dashed var(--rule);background:transparent;
               color:var(--muted);font-family:'Geist Mono',ui-monospace,monospace;
               font-size:15px;letter-spacing:.08em;text-transform:uppercase;
               cursor:pointer;transition:all .25s ease">
        ${prompt}
      </button>`;
    const btn = root.querySelector('.dc-reveal-btn');
    btn.addEventListener('click', () => {
      btn.outerHTML = `<div style="display:inline-block;padding:16px 24px;
        border-radius:12px;background:var(--paper-3);
        border:1px solid var(--rule);color:var(--ink);
        font-family:inherit;font-style:italic;font-size:24px;
        line-height:1.3;animation:dc-fade-in .4s ease both">${answer}</div>`;
    });
  }

  // ── Registry ─────────────────────────────────────────────────────────────
  window.deckWidgets = Object.assign(window.deckWidgets || {}, {
    counter: createCounter,
    reveal:  createReveal,
  });

  // ── Initialiser called by index.html before Reveal boots ────────────────
  window.deckWidgetsInit = function (scope) {
    const root = scope || document;
    root.querySelectorAll('[data-widget]').forEach(el => {
      const name = el.getAttribute('data-widget');
      const factory = window.deckWidgets[name];
      if (!factory) {
        console.warn(`[widgets] unknown widget: ${name}`);
        return;
      }
      let options = {};
      const raw = el.getAttribute('data-widget-options');
      if (raw) {
        try { options = JSON.parse(raw); }
        catch (err) { console.warn(`[widgets] bad options on ${name}:`, err); }
      }
      try { factory(el, options); }
      catch (err) { console.error(`[widgets] ${name} failed:`, err); }
    });
  };

  // Tiny shared keyframe used by widgets above.
  if (!document.getElementById('dc-widgets-style')) {
    const style = document.createElement('style');
    style.id = 'dc-widgets-style';
    style.textContent = `@keyframes dc-fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }`;
    document.head.appendChild(style);
  }

})();
