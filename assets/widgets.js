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

  // ── FHIR Forge slide widget ─────────────────────────────────────────────
  // Wires up the two interactive buttons on slide 3:
  //   • Edit    → reveals the feedback arc, flips review row 3 to "edited",
  //               and updates the Metformin chip dose with a strikethrough.
  //   • Approve → reveals connector 3, the dark Commit panel, the FHIR
  //               resource JSON, and the pulsing provenance highlight.
  // CSS handles the animation; this script just toggles `.is-on` / state.
  function createFhirForge(root) {
    const $ = (sel) => root.querySelector(sel);
    const editBtn    = $('.fg-btn-edit');
    const approveBtn = $('.fg-btn-approve');
    const rejectBtn  = $('.fg-btn-reject');

    const feedback   = $('.fg-feedback');
    const conn3      = $('.fg-conn-3');
    const spark3     = $('.fg-spark-3');
    const panel4     = $('.fg-p4');

    const row3       = $('.fg-row-metformin');
    const state3     = row3 && row3.querySelector('.fg-review-state');
    const check3     = row3 && row3.querySelector('.fg-row-icon');
    const chipName3  = $('.fg-chip-3 .fg-chip-name');

    // Surface init in the console so we can confirm the wiring fired.
    console.log('[fhirForge] init', {
      editBtn: !!editBtn, approveBtn: !!approveBtn, rejectBtn: !!rejectBtn,
      feedback: !!feedback, conn3: !!conn3, spark3: !!spark3, panel4: !!panel4,
      row3: !!row3, chipName3: !!chipName3,
    });

    let edited    = false;
    let committed = false;

    function doEdit(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      console.log('[fhirForge] edit clicked');
      if (edited) return;
      edited = true;

      // Flip review row 3 → "edited" (orange).
      if (state3) {
        state3.textContent = 'edited';
        state3.classList.add('fg-review-state--edit');
      }
      if (check3) {
        check3.textContent = '✎';
        check3.classList.add('fg-row-icon--edit');
      }

      // Surface the actual change on the chip: dose 500 → 1000.
      if (chipName3) {
        chipName3.innerHTML =
          'Metformin <s class="fg-strike">500</s> ' +
          '<span class="fg-new">1000</span> mg BID';
      }

      // Reveal the feedback arc, mark it pulsing.
      if (feedback) feedback.classList.add('is-on');

      // Dim the Edit button — single-shot.
      editBtn.disabled = true;
      editBtn.classList.add('fg-btn--used');
    }

    function doCommit(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      console.log('[fhirForge] approve clicked');
      if (committed) return;
      committed = true;

      // Reveal the commit pipeline: connector spark → dark panel → JSON → provenance.
      if (conn3)   conn3.classList.add('is-on');
      if (spark3)  spark3.classList.add('is-on');
      if (panel4)  panel4.classList.add('is-on');

      // Final state on the Approve button.
      approveBtn.classList.add('fg-btn--written');
      approveBtn.innerHTML = 'Written&nbsp;✓';
      approveBtn.disabled = true;

      // Once the chart-of-record is written, edit no longer makes sense.
      if (editBtn) { editBtn.disabled = true; editBtn.classList.add('fg-btn--used'); }
      if (rejectBtn) { rejectBtn.disabled = true; rejectBtn.style.opacity = '.5'; }
    }

    if (editBtn)    editBtn.addEventListener('click', doEdit);
    if (approveBtn) approveBtn.addEventListener('click', doCommit);
    // Reject is decorative for now — just a soft acknowledgement.
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        if (committed) return;
        rejectBtn.classList.add('fg-btn--used');
        rejectBtn.disabled = true;
      });
    }
  }

  // ── Extraction-moat reveal widget ───────────────────────────────────────
  // Toggles `is-revealed` on the iceberg-layout stage root. CSS handles
  // the dive — the dim "submerged" overlay clears, Po chips fade in, the
  // FHIR server bar surfaces at the bottom of the underwater block.
  function createExtractionMoat(root) {
    const btn = root.querySelector('.ic-btn');
    if (!btn) {
      console.warn('[extractionMoat] no .ic-btn found');
      return;
    }
    let revealed = false;
    function toggle(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      revealed = !revealed;
      root.classList.toggle('is-revealed', revealed);
    }
    btn.addEventListener('click', toggle);
    console.log('[extractionMoat] init');
  }

  // ── Primitives slide ─────────────────────────────────────────────────────
  // Each .pp-card opens a modal whose [data-modal] matches the card's
  // data-prim attribute. State is held on the widget root via data-open.
  function createPrimitives(root) {
    root.addEventListener('click', function (e) {
      var card = e.target.closest('.pp-card');
      if (card && card.dataset.prim) {
        root.setAttribute('data-open', card.dataset.prim);
        return;
      }
      if (e.target.closest('.pp-modal-x') ||
          e.target.classList.contains('pp-modal')) {
        root.removeAttribute('data-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.hasAttribute('data-open')) {
        root.removeAttribute('data-open');
      }
    });
    console.log('[primitives] init');
  }

  // ── Registry ─────────────────────────────────────────────────────────────
  window.deckWidgets = Object.assign(window.deckWidgets || {}, {
    counter:         createCounter,
    reveal:          createReveal,
    fhirForge:       createFhirForge,
    extractionMoat:  createExtractionMoat,
    primitives:      createPrimitives,
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
