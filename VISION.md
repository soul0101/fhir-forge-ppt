# Prompt Opinion — The Patient Brain

*Vision, strategy, and complete 11-slide rebuild spec*

---

## How to use this document

This is the full specification for rebuilding the existing `fhir-forge-ppt` deck around a new vision: **The Patient Brain**. The deck audience is the internal Prompt Opinion team — this is a vision-and-positioning brief, not a buyer-facing pitch.

The document has three layers:

1. **The vision** (Part 1) — the strategic thinking the deck must communicate
2. **The transitions** (Part 2) — what's moving from the old deck to the new one, and why
3. **The slide spec** (Parts 3–4) — every slide, in build-ready detail

Parts 5–8 are supporting reference (design system, voice, what to avoid, build priority).

The existing deck is built in Reveal.js 5.1.0 with a hand-rolled CSS system. Preserve the visual language; replace the narrative.

---

# PART 1 · THE VISION

## The core insight

Healthcare AI doesn't have a model problem. It has a chart problem.

Every clinical AI agent today — ambient scribes, coding agents, prior auth tools, care management software — reads from a chart that is stale, fragmented, and structurally broken. The chart sits behind an EHR that was designed to capture documentation for billing, not to be a living source of truth. Updates happen in bursts during encounters and rot between them. Notes accumulate as prose; structured data (problem lists, medication lists, allergy panels) drifts from reality. By the time an AI agent queries the chart, it's working from last week's truth.

So agents produce one-off outputs — a beautifully written SOAP note, a set of suggested ICD codes, a draft prior auth submission — and none of it updates the structured chart for the next agent. The hospital ends up with twelve AI vendors, each integrating separately, each rebuilding the same patient context from scratch, each producing outputs that don't feed back. The chart actually gets *worse* over time, not better — more notes, more text, more options chosen, but no curation.

The opportunity is to build the layer that fixes this: a continuously updated, AI-curated source of truth that ingests across every clinical source, reconciles conflicts, maintains structured state, serves context on demand to every downstream agent, and proactively surfaces what matters. We call this the **Patient Brain**.

The mechanism that makes this defensible isn't any single feature. It's the **compounding effect**: when the chart stays fresh and structured, every agent built on top automatically gets better. The scribe writes notes that catch what was actually discussed because it knows the full history. The coder produces codes that survive audit because the structured chart supports them. The prior auth agent gets approvals first-time because the evidence is already in the chart. The platform is more than the sum of its agents — and competitors who sell individual agents can't replicate it.

## What the Patient Brain is, concretely

Not a metaphor. Six concrete capabilities — six verbs:

**Listens.** Continuous ingestion from every clinical source: EHR data via FHIR, incoming documents (referrals, discharge summaries, external CCDAs), labs and imaging reports, ambient conversations from scribes, patient-reported intake forms, device and wearable data.

**Reasons.** Reconciles conflicts across sources (the cardiologist's diagnosis vs. the PCP's problem list; the med list at hospital A vs. hospital B; the allergy from intake vs. the allergy in last year's note). Time-orders facts. Maintains structured state for diagnoses, medications, allergies, vitals trends, pending orders, care plan, social context, and goals of care, with provenance on every fact.

**Serves.** Returns fresh, cited context on demand to humans and to AI agents. Any caller — a clinician's chart view, an ambient scribe, a prior auth agent — can ask "what's the current state of this patient's diabetes management?" and get a structured answer with source citations.

**Signals.** Watches for clinically meaningful patterns and notifies the right person via the right channel when they occur. Configurable per organization, expressed in natural language, routed (not pushed), and tuned by feedback.

**Acts.** Writes structured updates back to the EHR as validated FHIR resources. This is where the unstructured-to-structured engine (FHIR Forge productized) lives — it's how the brain physically updates the chart.

**Learns.** Incorporates clinician corrections to get sharper over time. When a clinician edits an extracted value or dismisses a signal, the brain records the correction with provenance and uses it to improve future inferences.

## The foundation — a layered stack

The platform is not a flat set of peer pillars. It is a dependency stack: each layer is built on the one below it. From the ground up:

**Layer 1 — Integration (the base).** The ability to connect to any system, in and out. Connectors to any EHR (Epic, Oracle Health/Cerner, Athena, Meditech) plus the non-FHIR reality of healthcare data: HL7v2 feeds, CCDA, fax and document gateways, lab interfaces, terminology services. Read context in; write validated FHIR back out through whatever interface each site exposes. Nothing above this layer can listen or write back without it. This is also a real moat against EHR-locked competitors — Epic only works inside Epic.

**Layer 2 — Unstructured-to-Structured Engine + Guardrails (sitting on Integration).** Two capabilities that operate on what Integration brings in:

- **Engine.** Documents in, validated FHIR out. Extract, ground in terminology authorities (LOINC, SNOMED, RxNorm, ICD-10), reconcile against the existing chart, validate against the right profile (US Core, Da Vinci PAS, payer-specific IGs), write back as a transaction. This is FHIR Forge productized.
- **Guardrails.** Auditable records of every action. Scoped permissions per agent (what an agent can read and write). Profile-aware validation before any write-back. Clinician approval on any material change. Done well, done at the right architectural layer, not bolted on.

**Layer 3 — Patient Brain (on top of the Engine and Guardrails).** The continuously curated patient-context layer. The differentiating layer. Houses the six verbs. It is not a peer of the Engine and Guardrails — it is built on them: it *Acts* by writing back through the Engine, and it operates within the Guardrails. And both of those, in turn, are built on Integration.

Agents — ambient scribe, coding agent, prior auth, care management, clinical trial matching, quality and care gap — sit on top of the Patient Brain and inherit the entire stack beneath them.

## The proactive layer (signals)

Most of healthcare AI is reactive: a clinician opens a chart, an agent queries it on request, an output gets produced. The Patient Brain adds a second mode that no competitor offers: it watches for things and tells you when they happen.

A clinic configures criteria — for example, eligibility for a metastatic triple-negative breast cancer trial — in natural language. The brain evaluates every patient in the panel against the criteria continuously, including against unstructured notes (pathology reports, oncology narrative, response-to-therapy text). When a patient becomes eligible, the brain surfaces the signal to the research coordinator's inbox. When the patient is enrolled or declines, feedback updates the brain.

The same architecture handles a dozen real use cases: care gap closure alerts to care managers, discharge follow-up reminders to schedulers, incidental finding signals to PCPs, risk-stratification signals for care management, medication-interaction signals for prescribers, social-determinant signals for social work.

This is the layer that twenty years of rule-based clinical decision support failed to deliver — because rules fire on structured fields and produce alert fatigue. The brain reads the whole chart (notes included), evaluates with AI, routes contextually, and learns when its signals get dismissed. Alert fatigue decreases over time instead of increasing.

## The compounding effect

This is the strategic insight that makes the platform worth more than the sum of its agents.

When the chart is fresh and structurally sound:

- The ambient scribe writes notes that catch what was actually discussed — because it has the full patient history, recent labs, prior conversations as context
- The coding agent produces codes that survive audit — because the structured problem list, medication history, and progress notes all support them
- The prior auth agent drafts submissions that get approved first-time — because the evidence is already in the chart, in the right structured form, mapped to the right FHIR profile
- The care management agent reaches the right patients at the right time — because risk signals, social context, and care plan status are continuously current

Every agent built on top inherits the freshness. Every agent's output reconciles back into the brain and improves the next agent's context. The platform compounds. Competitors selling individual point-solution agents cannot replicate this — because they don't own the substrate.

The mantra: **update the chart once, every agent on top gets smarter. Build the brain, the platform compounds.**

## The wedge — where we start

The first concrete thing Prompt Opinion sells is pre-encounter chart preparation.

Most clinical encounters fail at the same moment: the clinician opens the chart 30 seconds before the visit and the chart is wrong, incomplete, or unreadable. The problem list has stale entries. The med list missed last week's discharge changes. The referral note never made it into structured data. Half the visit is reconciliation that should have happened automatically.

The Patient Brain solves this: in the 24 hours before any scheduled encounter, the brain runs across every available clinical artifact for that patient (recent notes, discharge summaries, external CCDs, lab results, patient intake forms), extracts what's clinically relevant, deduplicates against the existing chart, and surfaces only the changes for clinician review — with one-click confirm or edit. The chart is ready when the clinician walks in.

This is the wedge. It's measurable (problem list accuracy, med reconciliation completeness, encounter overrun time, billing first-pass acceptance), it's clinician-loved (it takes work off them), and it's a natural foothold to expand from: same engine applied to continuous chart maintenance, external record reconciliation, care gap closure, prior auth readiness, clinical trial matching.

## Parallel industries — the pattern we're applying

The "company brain" pattern has worked in multiple industries:

- **Glean, Sana, Decagon, Notion AI, Dust** — enterprise knowledge brains that unify scattered information so every employee and every AI agent has the same context
- **dbt** — the canonical layer for the data warehouse; every analytics tool runs on top of it
- **Plaid** — the freshness layer for financial data; every fintech runs on it
- **Datadog** — continuous observability of production systems instead of periodic snapshots
- **Clay, Common Room, Apollo** — the CRM-that-updates-itself layer; AI on top is useful because the substrate is live

The common thread: in every mature industry, the substrate that's continuously updated wins over the one that's batch-updated. The platform that maintains the canonical layer with provenance becomes the dependency. Healthcare hasn't had this layer yet because nobody could automate clinical curation; AI made it possible.

The chart is the CRM. The encounter is the sales call. AI agents are the workflows. The Patient Brain is the layer that keeps the chart live so everything on top works.

## Honest competitive read

**Innovaccer** is the closest competitor. Their data fabric (Gravity) is the most similar in shape. But it's a batch analytics warehouse optimized for reporting, not a live clinical brain serving real-time agent queries. They'd need to rebuild their architecture. Their enterprise sales motion makes that slow. Window of opportunity: 12–18 months.

**Epic** has the data but no brain. The EHR is a document store with workflows on top, not an intelligent layer. Epic will eventually try to build this; the question is whether Prompt Opinion is already the standard by then. Their constraint: they only work inside Epic.

**Abridge, Ambience, Suki, Notable, Commure, Hippocratic** all live *above* the brain layer. They consume context; they don't maintain it. Each one rebuilds context from scratch on every interaction. Eventually they'll want to plug into a shared brain rather than rebuild — that someone could be Prompt Opinion.

**PhenoML, Amazon Comprehend Medical, Google Healthcare API, John Snow Labs** are extraction-only. They produce entities and codes but never touch the chart. Commoditizing fast — cents per call. Not direct competitors; potential ingestion paths.

**The lane is genuinely open.** No vendor has built a continuously updated, multi-source, write-back-grade patient brain that serves downstream agents and proactively surfaces signals. That is the lane Prompt Opinion takes.

## What we are not

Important boundaries to maintain in the deck:

- **The brain does not make clinical decisions.** It surfaces information; clinicians decide. It does not diagnose, prescribe, or recommend a specific treatment. This keeps the platform out of FDA SaMD territory and respects clinician judgment. It's also a real differentiator: the platform that *informs* clinicians wins adoption over the platform that *replaces* them.
- **The brain is not another agent.** It's the foundation agents stand on. Frame everything this way.
- **The brain is not a database.** It integrates, reconciles, reasons, signals, learns. A database doesn't do those things.
- **The brain is not analytics.** It's an operational system serving live workflows, not retrospective reports.

---

# PART 2 · TRANSITIONS FROM THE CURRENT DECK

## What the current deck does

The existing 12-slide deck is built around FHIR Forge as the product. Its narrative arc:

1. **Title** — "The Last Mile Layer"
2. **Born unstructured** — problem of fragmented inputs
3. **Every chart, by hand** — the cost of manual conversion
4. **FHIR Forge** — hero animation, the proof
5. **FHIR Forge demo video** — the same proof, video form
6. **PhenoML case study** — what extraction-only looks like at its best
7. **Extraction isn't the moat (iceberg)** — the moat is integration + reconciliation + provenance + guardrails
8. **Market map (2×2)** — competitors mapped, gap in upper-right
9. **One agentic loop** — the architecture diagram
10. **How FHIR Forge is different** — three intelligence cards
11. **One engine, many endpoints** — foundation + six vertical markets
12. **A workflow, not a workforce** — closing

The current deck is **substrate-positioned**: "we are the last mile layer." It treats FHIR Forge as the centerpiece. The Patient Brain concept is implied through the loop and the engine-with-endpoints metaphor but never named.

## What the new deck does

The new arc treats FHIR Forge as **proof of capability** and elevates **the Patient Brain as the destination**. FHIR Forge is named as the Unstructured-to-Structured Engine, one column of Layer 2 on the Foundation. A new Slide 4 (**Why healthcare AI stalls**) bridges the chart-broken pain to the architectural answer by naming three KLAS-attributed walls (no governance · unmeasurable ROI · won't integrate) that the rest of the deck then answers by name. The deck spends its second half building the brain concept, then resolves into the foundation-with-agents-on-top architecture that shows compounding, and closes on the emotional payoff of proactive signals.

New arc:

1. Title (**Patient Brain**)
2. Born unstructured
3. Every chart, by hand
4. **Why healthcare AI stalls** (three KLAS walls; architectural, not model)
5. FHIR Forge (the proof; closing band carries the moat line)
6. Market map (the lane is empty; extraction-only players cluster in the lower-left)
7. **The Patient Brain** (central vision, the living layer)
8. **Six verbs** (what the brain does)
9. **The Foundation** (Integration → Engine + Guardrails + Provenance → Brain → Agents)
10. **Signals** (proactive, not reactive; the emotional payoff after the foundation)
11. Closing

## Key shifts


| Shift                      | From (current deck)             | To (new deck)                                              |
| -------------------------- | ------------------------------- | ---------------------------------------------------------- |
| Headline concept           | "The Last Mile Layer"           | "The Patient Brain"                                        |
| Treatment of FHIR Forge    | Centerpiece                     | Proof of capability + Engine column on the Foundation      |
| Concept of differentiation | Better extraction + integration | Brain that compounds across agents                         |
| Bridge to architecture     | Implicit                        | Explicit (Slide 4 names three walls; deck answers each)    |
| Reactive vs. proactive     | Reactive (responds to queries)  | Both reactive and proactive (signals as emotional peak)    |
| Foundation visibility      | Implicit (skyline metaphor)     | Explicit (Integration → Engine + Guardrails + Provenance → Brain → Agents) |
| Provenance treatment       | Folded into "intelligence"      | Its own column on Layer 2 alongside Engine and Guardrails  |
| Agent positioning          | "We serve six markets"          | "Agents build on top of the brain and inherit the whole stack" |
| Compounding mechanism      | Not articulated                 | Explicit on the Foundation footer, visualized in the stack build |
| Wedge                      | Standalone slide                | Cut; wedge framing lives in speaker notes for now          |
| Closing                    | "A workflow, not a workforce"   | "A workflow, not a workforce. A brain, not another agent." |


## Slides that go away

Five slides from the original deck do not survive in the current cut:

- **Old Slide 5 (FHIR Forge demo video)** is deleted. The full demo can live in speaker notes or an appendix.
- **Old Slide 6 (PhenoML case study)** is deleted. Extraction-only players fold into the lower-left cluster on the market map (now Slide 6).
- **Old Slide 9 (One agentic loop)** is deleted. Its function is taken by the Patient Brain slide (now Slide 7).
- **Old Slide 10 (How FHIR Forge is different, 3-card)** is deleted. Its function is taken by the Six Verbs slide (now Slide 8).
- **The Wedge slide (start small, then the whole day)** that an earlier draft planned is also cut from the current cut. Pre-encounter chart prep as the first concrete product remains an essential commercial idea; for now it lives in speaker notes and is the implicit answer to "Unmeasurable ROI" (Wall #2 on the new Slide 4). A future deck may bring it back as a dedicated slide.

The iceberg ("Extraction isn't the moat") that an earlier draft planned is dropped entirely. Its strategic load splits cleanly: "extraction is commodity, the chart is the moat" becomes the closing band on the FHIR Forge slide (Slide 5), and the extraction-only players fold into the market map (Slide 6).

Net: the deck is now 11 slides. A new architectural-bridge slide (Slide 4) sits between the chart-broken pain and the FHIR Forge proof. The market map sits at Slide 6, right after FHIR Forge. Signals (the emotional peak) moves to penultimate, immediately after the Foundation.

---

# PART 3 · THE 11-SLIDE SPINE (QUICK REFERENCE)


| #  | Title                              | Status                       | One-line summary                                                                       |
| -- | ---------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| 1  | The Patient Brain                  | KEPT                         | Animated title; the destination is on slide 1                                          |
| 2  | Born unstructured                  | KEPT                         | Six channels of input, no system holding them                                          |
| 3  | Every chart, by hand               | KEPT                         | The conversion tax; the chart rots between encounters                                  |
| 4  | Why healthcare AI stalls           | **NEW**                      | Three KLAS-attributed walls (governance · ROI · integration); architectural, not model |
| 5  | FHIR Forge                         | MODIFIED                     | Hero demo as proof of capability; closing band carries the moat line                   |
| 6  | No one builds the brain            | KEPT (moved)                 | Market map; extraction-only cluster lower-left; star labels the Brain                  |
| 7  | The Patient Brain                  | KEPT                         | Three-sided living layer (inputs left, chart below, agents above)                      |
| 8  | What the brain does (six verbs)    | KEPT                         | 3x2 verb grid: Listens · Reasons · Serves · Signals · Acts · Learns                    |
| 9  | One foundation, every agent        | MODIFIED                     | Layered stack: Integration → Engine + Guardrails + **Provenance** → Brain → Agents     |
| 10 | Proactive, not reactive (signals)  | KEPT (moved to penultimate)  | Four signal cards over a patient timeline; the emotional payoff                        |
| 11 | A workflow, not a workforce        | KEPT                         | Two-line close                                                                         |


Key structural moves vs. the earlier draft of this spec:

- **New Slide 4** (Why healthcare AI stalls) bridges the chart-broken pain to the architectural answer by naming three KLAS walls. The deck then answers each wall by name on Slide 9 (Integration answers "won't integrate"; Guardrails + Provenance answer "no governance"; the implicit wedge answers "unmeasurable ROI").
- **Foundation (Slide 9) Layer 2 now has THREE columns** (Engine + Guardrails + **Provenance**) rather than two. The three columns map directly onto the three walls from Slide 4.
- **Signals moves to penultimate** as the emotional peak after the Foundation is established.
- **Wedge slide is cut** in the current cut; the wedge framing lives in speaker notes.

> The slide-by-slide spec in Part 4 below was written for the earlier 11-slide arc and has been updated to match the current structure. The live HTML in `content/` remains the implementation source of truth.


---

# PART 4 · DETAILED SLIDE-BY-SLIDE SPEC

Each slide spec contains: **status, layout, exact copy, visual elements, animation, why it exists.**

Slide dimensions are 1280 × 720. Class system follows existing Reveal.js deck (`.sheet`, `.chrome`, `.rise`, `.section-marker`, `.kicker`, `.flow-line`, `.sig`, `.pageno`). CSS variables follow `assets/deck.css` (`--accent`, `--ink`, `--ink-2`, `--ink-3`, `--muted`, `--rule`, `--paper-3`).

---

## Slide 1 · The Patient Brain (Title)

**Status: MODIFIED** — same visual treatment, new headline and subline.

### Layout

Identical to current title slide. Ambient dot-grid back-plate. Padding 120px top/bottom, 100px sides. Vertical flex column with 36px gap. Section marker at top, hero headline, subline, hairline rule.

### Copy

- **Section marker** (kept): `A Strategy Brief · Internal`
- **Headline** (changed): `The Patient Brain.` — same 104px Geist weight 700, letterspacing -0.034em, color `--ink`, line-height 1.0. Can be set as one line or two (`The Patient` / `Brain.`); test both, prefer one line if it fits.
- **Subline** (changed): `How I built FHIR Forge. What it taught me. Where I think Prompt Opinion should plant a flag.` — three sentences. The last clause "where I think Prompt Opinion should plant a flag" uses the `kicker` accent treatment to mark it as the destination.
- **Footer signature** (kept): `FOR PROMPT OPINION · INTERNAL`
- **Pageno** (kept): `01 / 11`

### Visual

Same dot-grid SVG mask (`lml-title-grid`, `lml-title-fade`, `lml-title-mask`) at opacity .55. No new visual elements.

### Animation

Same `.rise` staggered animations:

- Section marker: --d 0s
- Headline: --d .05s
- Subline: --d .1s
- Hairline rule: --d .16s

### Why this exists

The current title hides the destination of the deck. Renaming to "The Patient Brain" puts the flag on slide 1 so the rest of the deck reads as a buildup to a named idea, not a delayed reveal. Everything else on the slide can stay because the treatment already works.

---

## Slide 2 · Born unstructured

**Status: KEPT** — one word change in subline only.

### Layout

Unchanged. Section marker, h2 headline with kicker, subline, then the 5-column grid (input boxes on left, flow lines, central seam, flow lines, output column on right).

### Copy

- **Section marker** (kept): `The Problem`
- **Headline** (kept): `Born unstructured. Needed structured.`
- **Subline** (CHANGED): `Six channels of clinical input. No system that holds them together.`

The single-word change ("seam" → "system") plants the missing-system thesis that the Patient Brain (Slide 6) will resolve.

### Visual

All six input boxes, flow lines, seam visualization, and output column kept identical. The `.flow-line` SVG animations stay.

### Animation

No change.

### Why this exists

This is the strongest visualization in the deck and rhymes directly with Slide 6 (channels become inputs to the brain). It earns its place visually. The subline tweak is the only thing that changes — but it does important narrative work.

---

## Slide 3 · Every chart, by hand

**Status: KEPT** — one closing-band tweak.

### Layout

Unchanged. The three numbers (TIME / LAG / RE-KEYING), the flow chain with re-key tags, the closing band.

### Copy

- **Headline** (kept): `Every chart, by hand.`
- **Subline** (kept): `Hours of work per encounter. Days of lag. Re-keying at every handoff.`
- **Closing band** (CHANGED): `Every chart pays a tax. The tax is conversion work — and the chart still rots between encounters.`

The "rots between encounters" addition justifies the brain — without it, the deck's argument can be read as "Prompt Opinion does conversion better." With it, the staleness problem is named, which sets up the brain as the actual solution.

### Visual & animation

Unchanged.

### Why this exists

It's a strong cost-of-problem slide that earns its place. The closing-band tweak makes the slide land on the right note for the new vision.

---

## Slide 4 · FHIR Forge

**Status: MODIFIED** — animation untouched, one new closing band added.

### Layout, copy, visual, animation

The hero animation is unchanged. Discharge summary on the left, extraction chips lifting, grounding codes snapping on, HITL review panel on the right. It plays for ~5s on slide enter, then stops. The two click-interactions remain: clicking EDIT flips the third row to orange (Metformin dose 500 to 1000 with strikethrough, feedback arc pulses); clicking APPROVE commits the bundle.

Existing headline `FHIR Forge.` stays. Existing subline `Discharge summary in. Chart-ready FHIR out.` stays.

### New closing band (the bridge)

Add a single closing band at the bottom of the slide, in the same treatment used on Slide 3:

`Extraction is the easy part. Keeping the chart true is the moat.`

This is the line the deleted iceberg used to carry. It reframes the proof just shown (we can extract) into the strategic claim (the moat is the chart, not the extraction), and it bridges into the market map on Slide 5 and the brain on Slide 6.

### Why this exists

The animation is the proof of capability that gives the deck credibility. Don't touch what works. The closing band is the only addition: it turns the demo from "look what we built" into "and here is why it matters," which is the hinge the second half swings on.

### Note

The old Slide 5 (demo video) is DELETED. The full demo video can live in speaker notes as an appendix link, or in a separate appendix slide that is not part of the main flow.

---

## Slide 5 · The market: no one builds the brain

**Status: MODIFIED** — the market map moves up from old Slide 10 to here. Axes and hover behavior preserved. The extraction-only players the deleted iceberg used to name now live as the lower-left cluster. Headline and star label updated.

### Why it moved here

This is the single competitive beat of the deck. Placing it right after the FHIR Forge proof does two things: it groups all competitive framing in one place, and it sets up the brain reveal on Slide 6. The audience leaves this slide with one question in their head, "so who is in that empty quadrant," which Slide 6 answers.

### Layout

The existing 2x2 chart structure, preserved:

- **X-axis: workflow scope** (single primitive to full end-to-end loop)
- **Y-axis: chart contribution** with a small clarifying caption `how much the system actually updates the live chart`

### What's preserved

- The 2x2 chart structure and both axes
- The hover-reveal mechanic (player to category plus a one-line description)
- The pulsing star/target in the upper-right

### What's new (absorbed from the deleted iceberg)

- **Lower-left cluster, the extraction-only players.** Place PhenoML, Amazon Comprehend Medical, Google Healthcare API, and John Snow Labs together in the lower-left (narrow workflow scope, low chart contribution). A small muted caption near the cluster: `extraction-only: document to entities to codes. The chart never sees it.` These are the players the iceberg used to call out; they belong here, at the origin of both axes.
- Keep the other existing competitor positions where they are.

### Copy

- **Section marker**: `The Gap`
- **Headline** (CHANGED): `Everyone owns a slice. No one builds the brain.`
- **Y-axis label**: `Chart contribution` with caption `how much the system actually updates the live chart`
- **Upper-right star/pulse label** (CHANGED): `Patient Brain`
- **Extraction cluster caption**: `extraction-only: document to entities to codes. The chart never sees it.`
- **Arrow annotation**: a thin diagonal arrow from the upper-right pulse toward the lower-left cluster, single label: `empty.`
- **Optional text box (upper-left of chart area)**: `This quadrant exists because no one has built the system that maintains the chart and serves every agent.`

### Visual

The 2x2 chart, axis labels, gridlines, and competitor markers stay in place. Hover/click reveal unchanged. The upper-right star gets a slightly more pronounced pulse (slower, larger amplitude) so it anchors the eye. The lower-left extraction cluster is the only new group of markers.

### Animation

Existing animation preserved. The upper-right pulse becomes more prominent. The extraction-only cluster fades in with the other markers.

### Why this exists

This is the analytical proof slide and the only competitive beat. The audience sees with their own eyes that the upper-right is empty, and that the extraction-only vendors sit at the bottom-left, far from the brain. Its power is in what it shows, not what it says, so don't over-engineer it.

---

## Slide 6 · The Patient Brain (the central slide)

**Status: NEW** — replaces the old "One agentic loop" slide.

### Importance

This is the single most important slide in the deck. The vision succeeds or fails here. Invest the most design effort on this slide.

### The idea in one sentence

The brain is a living layer that sits between the unstructured world and the chart, and serves every agent on top. Not an orb, not a chart. A layer with bidirectional flow on every side.

### Layout — a three-sided layer diagram

- **Top band (~16%)**: section marker, headline, subline.
- **Center (~68%)**: the layer diagram (described below).
- **Bottom strip (~16%)**: the live-FHIR caption.

The diagram has the brain as a horizontal slab in the visual center, with three distinct relationships:

- **Left, unstructured input, one-way in.** The same six channels as Slide 2, rendered smaller for visual rhyme. Arrows flow rightward into the brain. This is the raw, fragmented material.
- **Bottom, the chart, bidirectional.** A chart layer (EHR / FHIR) sits below the brain. A two-way connection: the brain reads the existing record to reconcile against it, and writes validated FHIR updates back down into it. This makes write-back literal and visible, the exact thing extraction-only players never do.
- **Top, the agents, bidirectional.** A row of agents sits on top of the brain. Fresh context flows up, their outputs flow back down into the brain. The down-arrow is the loop that Slide 10 cashes as compounding.

The brain slab itself reads as alive: reconciled facts streaming through it left to right, a quiet "current" indicator. No glowing orb, no pulse-for-decoration.

### Where FHIR Forge sits

The left-to-chart path (unstructured input in, validated FHIR written to the chart below) is FHIR Forge, the Engine layer. On this slide it is one arrow of three relationships. That is the point: the slide draws, rather than asserts, that FHIR Forge is a capability the brain uses, not the brain itself. The brain is the whole living layer: it also holds the reconciled truth, serves agents, and learns.

### Copy

- **Section marker**: `The Vision`
- **Headline**: `The Patient Brain.`
- **Subline** (serif italic, Newsreader): `A living layer over the chart. Unstructured input in, the record kept true, fresh context out to every agent on top.`
- **Left caption** (small, muted): `every unstructured source`
- **Bottom-link caption** (mono, small): `reads the record · writes back validated FHIR`
- **Top caption** (small, muted): `fresh context up · outputs back down`
- **Bottom strip** (mono, small): `Live FHIR · provenance on every fact · written back to the chart via the Unstructured-to-Structured Engine.`

Note: no agent-card detail and no compounding line on this slide. Those belong to Slide 10. Slide 6 establishes the living layer and the bidirectional loop; it does one thing cleanly.

### Visual elements

**Center, the brain slab.** A horizontal band, ~520px wide, with a soft accent glow at its edges. Inside it, a slow left-to-right drift of small fact tokens with tiny provenance dots, suggesting continuous reconciliation. A small `current` pill at one corner is the only thing that keeps breathing.

**Left, unstructured input.** Six small channel labels stacked vertically (matching Slide 2): clinical & encounter notes, faxed referrals & orders, outside records (CCDs, PDFs), patient intake forms, lab/imaging & pathology reports, portal messages & call notes. One-way arrows from each into the brain.

**Bottom, the chart.** A chart layer below the brain, labeled `The Chart (EHR · FHIR)` with a thin row of structured sections (problems · meds · labs). A bidirectional connector to the brain.

**Top, the agents.** A row of four generic agent nodes (keep them generic here; they get named on Slide 10). Bidirectional connectors to the brain.

### Animation sequence

Plays on slide enter, total ~3.2 seconds:

1. **0.0s**: section marker, headline, subline rise (existing `.rise` pattern).
2. **0.4s**: the brain slab and the chart layer appear, joined by the bidirectional connector.
3. **1.0s**: unstructured inputs arrive from the left, staggered ~60ms each, flowing into the brain.
4. **1.8s**: the brain reconciles, then writes one update down into the chart. A single fact lands in the chart row with a source tag (the write-back, made visible).
5. **2.4s**: agents appear on top. Context flows up to one agent, the agent's output flows back down into the brain. The loop closes.
6. **3.2s**: settles. The brain keeps its quiet "current" indication; nothing else animates.

### Why this exists

This slide carries the full vision. It rhymes with Slide 2 (the six channels return as the left-side input) but resolves the missing system. The chart below shows what the brain keeps true. The agents on top, and the down-arrow from them, foreshadow Slide 10 (the foundation and compounding). The bidirectional loop established here is the mechanism; Slide 10 reveals its consequence. If a viewer remembers one slide, it should be this one.

---

## Slide 7 · What the brain does: six verbs

**Status: NEW** — replaces the old "How FHIR Forge is different" slide.

### Layout

- **Top band (~18%)**: Section marker + headline + subline
- **Middle band (~65%)**: 3×2 grid of verb tiles
- **Bottom band (~17%)**: Closing italic line

### Copy

- **Section marker**: `The Spine`
- **Headline**: `What the brain does.`
- **Subline**: `Six things. Each one buildable. Together they describe something no competitor offers.`
- **Closing line** (bottom band, italic): `Six verbs. One system. The spine of the platform.`

### Visual — the six tiles

Each tile is ~290 × 200 pixels with these elements:

- Small icon (~32px) in the top-left
- Verb name (~36px, Geist weight 600, color `--ink`)
- One-line description (~14px, Geist weight 400, color `--ink-3`)

Tile treatment: 1px rule border in `--rule` color. Background: `--paper-3` or slightly lighter. On hover (if presentation is interactive), the tile lifts ~4px with a subtle drop shadow.

Tile positions (left to right, top row then bottom row):


| Position  | Verb        | Description                                                              | Icon hint                  |
| --------- | ----------- | ------------------------------------------------------------------------ | -------------------------- |
| 1 (top-L) | **Listens** | Continuous ingestion from every clinical source.                         | ear / radio waves          |
| 2 (top-C) | **Reasons** | Reconciles conflicts across sources, time-orders facts, maintains state. | merge arrows / gears       |
| 3 (top-R) | **Serves**  | Returns fresh, cited context on demand to humans and agents.             | arrow-out / dispatch       |
| 4 (bot-L) | **Signals** | Notifies the right person when configured conditions are met.            | bell / spark               |
| 5 (bot-C) | **Acts**    | Writes structured updates back to the EHR via FHIR.                      | pencil-on-page / write     |
| 6 (bot-R) | **Learns**  | Incorporates clinician corrections to get sharper over time.             | upward curve / brain-arrow |


Use the same lucide-style stroke-based icons (1.75 stroke width) as the existing deck for visual consistency.

### Animation

Tiles fade in with a 100ms stagger, top row first. Total animation: ~700ms. Don't over-animate — this slide is a poster.

### Why this exists

Slide 6 showed the shape of the brain. This slide shows what it does inside. The two read as one beat: topology, then operations, with no overlap. The slide is also the architectural reference: every later slide can be understood as "which verb does this serve?" The team should walk away able to recite six verbs.

---

## Slide 8 · The brain is alive: signals

**Status: NEW**

### Importance

This is the emotional center of the deck. It's where the audience viscerally understands "living platform." Invest design effort here, second only to Slide 6.

### Layout

A vertically segmented layout:

- **Top band (~12%)**: Section marker + headline + subline
- **Upper-middle band (~38%)**: Four signal cards
- **Middle strip (~8%)**: Brain in center with arrows up to signals, down to timeline
- **Lower-middle band (~28%)**: Patient timeline
- **Bottom band (~14%)**: Italic footer

### Copy

- **Section marker**: `Proactive Mode`
- **Headline**: `The brain doesn't just answer. It tells you what matters.`
- **Subline**: `Configurable signals, evaluated against the full chart — including unstructured notes. Routed, not pushed. Learned, not hardcoded.`
- **Footer** (italic): `Twenty years of rule-based clinical decision support failed because rules fire on structured fields. The brain reads the whole chart and learns when its signals get dismissed.`

### Visual — the four signal cards

Four cards arranged horizontally, each ~280 × 180 pixels:

**Card 1 — Clinical Trial Eligibility**

- Status pill (top-right): `NEW` (accent color)
- Body: `Patient SH meets eligibility criteria for METASTATIC-TNBC-04 (line 2 therapy failure, ECOG ≤ 2).`
- Routed-to row: `→ Research Coordinator · Inbox`
- Config tag: `configured by: Oncology`

**Card 2 — Care Gap Closing**

- Status pill: `ACTION` (warm accent)
- Body: `HEDIS CDC-A1c gap closing in 14 days. Last A1c 8.2% (>9% threshold), no order in 90 days.`
- Routed-to: `→ Care Manager · Worklist`
- Config tag: `configured by: Quality`

**Card 3 — Discharge Follow-up Overdue**

- Status pill: `OVERDUE` (red accent)
- Body: `Discharged from MGH 7 days ago for CHF. No follow-up booked. Risk of readmission.`
- Routed-to: `→ Scheduler · Outreach queue`
- Config tag: `configured by: Transitions`

**Card 4 — Incidental Finding**

- Status pill: `FYI` (muted)
- Body: `Recent CT abdomen mentions 8mm renal lesion, radiologist flagged for follow-up.`
- Routed-to: `→ PCP · Chart inbox`
- Config tag: `configured by: Imaging`

### Visual — middle strip

A thin horizontal strip in the slide's vertical middle, containing the brain node (small, ~80px diameter) in the center. Four upward arrows connect the brain to the four signal cards above. Four downward arrows connect the brain to four timeline events below. This makes the causal chain visible: event → brain → signal.

### Visual — patient timeline

A horizontal timeline running left to right across the lower-middle band. Four event markers along the timeline:

- Marker 1 (leftmost, "Day 0"): `Discharge summary from MGH` — links upward to Card 3
- Marker 2 ("Day 3"): `External lab result, A1c 8.2%` — links upward to Card 2
- Marker 3 ("Day 5"): `CT abdomen report` — links upward to Card 4
- Marker 4 ("Day 6"): `Oncology note, treatment failure` — links upward to Card 1

Timeline treatment: minimal, like a Gantt-chart strip. Time flows left to right. Each marker is a small dot or pin with the day label and event description underneath.

### Animation

On slide enter (total ~2.5 seconds):

1. Headline + subline rise (~0.3s)
2. Timeline draws left-to-right, events appearing with 200ms stagger (~0.8s)
3. Brain pulses once
4. Connection arrows draw upward from timeline through brain to signal cards (~0.6s, drawing in order matching timeline)
5. Signal cards rise into view from below the brain, staggered 100ms each (~0.4s)
6. Footer fades in last

### Why this exists

This is the slide that separates Prompt Opinion from every "context API" pitch. Without this slide, the brain is a database. With it, the brain is an assistant — and the audience feels the difference.

---

## Slide 9 · The wedge: start small, then the whole day

**Status: REDESIGNED** — was a static morning-panel mockup. Now a two-beat walkthrough: it opens on the wedge alone (small, winnable), then zooms out to reveal that the wedge is the first act of the brain's whole day, and closes the loop.

### The strategic point this slide must land

This slide grounds the vision. After the brain (6), the verbs (7), and the signals (8), the audience needs to believe there is a narrow, credible, winnable first move. So the slide must *open small*. It shows the one thing we sell first, then earns the expansion by zooming out. The discipline is the demarcation: the audience sees the wedge alone before they see the platform. If both appear at once, the slide stops being a wedge and becomes the vision again.

Read as a sentence: *we start with the morning panel; the same brain runs the rest of the day; tonight's sign-off is tomorrow's panel.*

### Two beats, click-advanced

Built as a Reveal fragment walkthrough. It opens in Beat 1 (the wedge, alone). One click pivots (a zoom-out) into Beat 2 (the full day plus the loop). In a live talk you hold on Beat 1 to make the "this is where we start" point, then click to expand. An autoplay variant runs on timers.

### Persona continuity

The focal patient is **Pt. SH, 64F, CHF, post-MGH discharge**, the recurring patient from Slides 6 and 8. Second person throughout ("your panel," "your 9:00") puts the audience in the clinician's seat.

---

### BEAT 1 — The wedge, alone (on enter)

A single, focused panel. Nothing else on the canvas. This is the small, winnable product.

**Frame badge** (top-left of the canvas, small, accent): `Where we start · v1`

**The panel — Pt. SH's prepared brief**, two compact columns:

- **Left, Today (~35%)**: four schedule rows, SH selected at top. Each: time · `Pt. XX, age/sex` · one-line context · status dot (green `chart current` / amber `updates pending` / red `signals to review`).
- **Right, SH's brief (~65%)**, three short blocks:
  - `What changed since last visit` — three sourced lines (MGH discharge 5/20: 2 dx, 3 med changes; outside lab 5/23: A1c 8.2%; cardiology 5/25: CHF confirmed, cardiac MRI planned), each with a small source tag.
  - `Signals to review` — two lines (discharge follow-up overdue; A1c care gap).
  - `Talking points` — three muted bullets.

**Optional grounding strip** (small, muted, below the panel): `measured by: problem-list accuracy · med-rec completeness · encounter overrun · first-pass billing`. This names the wedge's metrics so it reads as a real product, not a feature, and preempts the "who buys chart prep" question. Include if there is room.

**Copy at Beat 1:**

- **Section marker**: `The Wedge`
- **Headline**: `Start where it's felt first.`
- **Subline**: `Pre-encounter chart prep. Clinician-loved, measurable, live in weeks.`

---

### THE PIVOT — zoom out (on click)

The single panel shrinks and docks as the first station of a **day rail** that draws out to the right. The badge flips from `Where we start` to `Where it goes`. This is the hinge of the slide: the wedge becomes Act 1 of a larger loop. The zoom-out should feel like stepping back to see the whole day.

The day rail, once drawn, has three stations with a progress line:

`8:02 · Before` (the panel, now docked) → `9:05 · During` → `9:24 · After`

---

### BEAT 2 — The whole day (the platform vision)

The day plays out across the rail. The Before panel is already docked from Beat 1. The animation now fills in During and After, then the loop.

**During · 9:05 (the live encounter):**

- Ambient scribe transcript streams (a few real `Dr:` / `Pt:` lines about meds and ankle swelling).
- Structured extractions lift out as it streams, each with a `→ FHIR` write indicator: `+ Metformin 500 → 1000 mg · dose change`, `+ Symptom: ankle edema`, `+ Plan: cardiac MRI ordered`.
- A live CDS card surfaces mid-stream: `Live check · A1c 8.2% above target, last order 94 days ago. Order today?` with `Order` / `Dismiss`.
- Tag: `scribe writes structured FHIR as you talk · CDS fires live`.

**After · 9:24 (review, sign, hand off):**

- The AI-drafted note shown collapsed (heading + two lines, `expand` affordance).
- Structured updates queued for the chart, each with `✓ confirm` / `✎ edit`: `Problems: + CHF exacerbation`, `Meds: Metformin 500 → 1000 mg`, `Orders: A1c, cardiac MRI`.
- `Sign & close`, softly pulsing. Small line: `your edits teach the brain`.
- On sign: a `chart updated` flash, then downstream handoff chips light: `→ Coding agent` `→ Prior auth` `→ Care gap` (the agents from Slide 10 inherit the clean chart, no re-keying).

**The loop (the payoff):** an arc draws from After back to the Before station, and the caption types in (kicker accent): `Tonight's sign-off is tomorrow's prepared chart.`

**Copy that appears at Beat 2:**

- **Second framing line** (follows the Beat 1 subline): `The same brain runs the rest of the day.`
- **Footer band**: `Same brain, the whole day: live scribe write-back · live CDS · one-click sign-off · a chart that is true for every agent next.`

---

### Animation sequence

**On enter (Beat 1):**

1. Headline + subline rise.
2. The single wedge panel fades in, centered, with the `Where we start · v1` badge.
3. Hold here in a live talk.

**Click 1, the pivot:**

4. The panel shrinks and docks left; the day rail draws out to the right; the badge flips to `Where it goes`; the framing line `The same brain runs the rest of the day` fades in.

**Click 2, During:**

5. Progress line to station 2; transcript streams; extraction chips lift with `→ FHIR`; CDS card pops.

**Click 3, After:**

6. Progress line to station 3; review panel fills in with ✓/✎; `Sign & close` pulses.

**Click 4, the payoff:**

7. Sign depresses; `chart updated` flash; downstream chips light; loop arc draws back to Before; loop caption types in. Settle.

**Autoplay variant**: same order on ~3s timers; pause on the loop, then restart at Beat 1. Click-driven is better for a live talk.

### Visual treatment

Keep the real-clinical-tool aesthetic: `--paper-3` / `--rule`, muted palette, ~13-14px body, status dots in muted accent variants, never cartoon-bright. The zoom-out should be a smooth scale-and-reposition, not a flashy transition. Every panel should look like software a clinician would actually use. Restraint is what sells the realism, and the realism is what makes the vision credible.

### Relationship to Slide 10

Slide 9 and Slide 10 both close the compounding loop, on purpose, in two registers. Slide 9 is the *lived* loop: one clinician, one patient, tonight's sign-off becomes tomorrow's prep. Slide 10 is the *architectural* loop: agents on the stack, every output reconciling back. Keep Slide 9 human and concrete, Slide 10 structural, so the repetition reads as reinforcement, not redundancy.

### Why this exists

This is the most tangible slide in the deck and the one that earns the vision. It opens on a narrow, winnable product the team could ship first, then zooms out to show that the small thing is the front door to the whole platform, and closes the loop in human terms. It is the wedge and the vision in one controlled move: start small, then the whole day. If a skeptic asks "what do you actually sell first, and where does it go," this slide answers both.

---

## Slide 10 · The Foundation: the stack every agent inherits

**Status: MODIFIED** — the old "One engine, many endpoints" skyline becomes an explicit *layered foundation* with agents on top. This is the force-multiplier slide.

### Importance

This is where the compounding effect lands. Second only to Slide 6 in strategic weight. The slide carries the architectural conclusion of the entire deck.

### Relationship to Slide 6

Slide 6 drew the brain as a single living layer with bidirectional flow. This slide does the two things Slide 6 deliberately left out: it splits that layer into the full dependency stack (Integration, then Engine + Guardrails, then Brain), and it names the agents on top and shows that they compound. Do not redraw Slide 6's input/output loop here. The in-and-out was established on Slide 6; this slide is composition (the layered stack) plus consequence (compounding).

### The core idea — a dependency stack, not flat pillars

The foundation is not three (or four) equal columns standing side by side. It is a stack where each layer is built on the one below it. Reading bottom to top:

1. **Integration** — the base. Connect to any system. Nothing above can listen or write back without it.
2. **Engine + Guardrails** — two capabilities that operate on what Integration brings in.
3. **Patient Brain** — built on the Engine and Guardrails (it *Acts* through the Engine, operates within the Guardrails).
4. **Agents** — sit on top of the Brain and inherit the entire stack.

The build order *is* the lesson: connect → structure safely → curate → agents. Drawing the layers in that order on slide enter teaches the architecture without a word of explanation.

### Layout

Vertical layout, top to bottom:

- **Top band (~14%)**: Section marker + headline + subline
- **Skyline zone (~38%)**: Six agent "buildings"
- **Brain layer (~14%)**: Full-width Patient Brain band, accented
- **Engine + Guardrails layer (~14%)**: Two columns, sitting on the Integration base
- **Integration base (~10%)**: Full-width band — the ground everything rests on
- **Bottom band (~10%)**: Compounding footer

The vertical stacking is the whole point: a viewer's eye reads the dependency order from the bottom up (or watches it build that way).

### Copy

- **Section marker**: `The Foundation`
- **Headline**: `One foundation. Every agent gets smarter.`
- **Subline**: `Connectivity at the base. The engine and guardrails above it. The brain on top. Every agent inherits the whole stack, and the platform compounds with every action.`
- **Compounding footer** (two-line italic, kicker accent):
  ```
  Update the chart once. Every agent on top inherits the freshness.
  Build the brain. The platform compounds.
  ```

### Visual — the skyline (top of the stack)

Six agent "buildings" sitting on top of the Patient Brain layer. Each building is the same height (uniform 300px constraint from the original — preserve this).

Inside each building, three elements stacked vertically:

- Agent name at the top (Geist weight 600)
- One-line description in muted text
- A small `← inherits the stack` indicator at the bottom of the building, pointing down toward the foundation

The six buildings (left to right):

1. **Ambient Scribe** — `Notes that catch what was actually discussed.`
2. **Coding & HCC Agent** — `Codes that survive audit.`
3. **Prior Auth Agent** — `Submissions that get approved first time.`
4. **Quality & Care Gap Agent** — `HEDIS measures captured by construction.`
5. **Clinical Trial Matching Agent** — `Eligible patients surfaced before the trial window closes.`
6. **Care Management Agent** — `Right patient. Right intervention. Right time.`

**Roots/tendrils visual:** Thin lines descend from each building down through *every* layer — Brain, Engine/Guardrails, Integration — to the ground line. This is the visual cue that agents are not standalone; they're rooted in the full stack, not just the layer directly beneath them.

### Visual — the layered foundation

Three stacked layers below the skyline, sharing a single horizontal "ground" line at the very bottom. Top to bottom:

**Layer 3 (top, full width) — Patient Brain**

- Layer label: `Patient Brain` (Geist weight 600)
- Sub-label (small muted): `Continuously curated patient context`
- Tiny verb strip: `Listens · Reasons · Serves · Signals · Acts · Learns`
- Visual emphasis: a 1px accent border (the differentiating layer). This band spans the full width, visually sitting *across* the two columns below it — signaling the Brain is composed of both.

**Layer 2 (middle, two columns) — Engine + Guardrails**

- **Left column — Unstructured-to-Structured Engine**
  - Sub-label: `FHIR Forge productized. Documents in. Validated FHIR out.`
  - Tiny capability strip: `Extract · Ground · Reconcile · Validate · Write back`
- **Right column — Guardrails**
  - Sub-label: `Auditable records. Scoped writes. Clinician approval.`
  - Tiny capability strip: `Audit log · Permission scopes · Profile validation · HITL approval`

**Layer 1 (base, full width) — Integration**

- Layer label: `Integration`
- Sub-label: `Connect to any EHR, any source, any system. In and out.`
- Tiny capability strip: `FHIR R4 · SMART · HL7v2 · CCDA · Fax/doc gateways · Terminology services`
- Treatment: the widest, most grounded band — reads as bedrock. A subtle inbound/outbound cue (small arrows in and out at the edges) reinforces "in and out."

The three layers are visually nested: Integration is widest at the base, Engine + Guardrails sit within it as two columns, and the Brain spans across the top of those two. The skyline rests on the Brain.

### Animation

On slide enter, building the stack bottom-up (total ~2.6 seconds). The order is the architectural truth the slide is teaching: connect → structure safely → curate → agents.

1. **0.0s**: Headline + subline rise
2. **0.3s**: **Integration base** draws in first — the ground (~0.4s)
3. **0.8s**: **Engine + Guardrails** rise on top of it, the two columns appearing together (~0.4s)
4. **1.3s**: **Patient Brain** layer slides across the top of those two and pulses once (~0.4s)
5. **1.8s**: **Skyline buildings** rise from the Brain, 100ms stagger (~0.5s)
6. **2.2s**: Thin tendril lines draw down from the buildings through every layer to the ground
7. **2.4s**: The compounding feedback loop draws: from one agent, down through the stack, back up to the next agent
8. **2.6s**: Compounding footer types in

### The compounding visual (core, not optional)

Compounding is the thesis of the entire deck, and it must be shown here, not just stated in the footer. Promote this from polish to a required element. Two ways to show it, use at least one:

1. **Feedback loop.** A thin line runs from an agent on top, down through the stack, and back up to the next agent, with a small label `every output reconciles back · the next agent inherits it`. This is the visible mechanism of compounding.
2. **Growth over time.** The buildings subtly grow taller (~2 to 3% scale) in a slow loop, signaling that agents get sharper as the foundation deepens. Barely perceptible, never distracting.

The feedback loop is the stronger of the two because it shows why the platform compounds, not just that it does. Prefer it.

### Why this exists

This is where the strategic thesis closes. The layered stack visible: Integration at the base, Engine and Guardrails on it, Brain on those. Agents-on-top visible. The compounding mechanism explicit in both the footer and the feedback loop. If a viewer remembers two slides from the deck, they should remember Slide 6 (the brain itself) and Slide 10 (the foundation that compounds).

---

## Slide 11 · Closing: A workflow, not a workforce. A brain, not another agent platform.

**Status: KEPT with sharpening** — the visual treatment stays, the closing line becomes two lines.

### Layout

Same as the current closing slide. Section marker, large closing statement, hairline rule, footer signature.

### Copy

- **Section marker**: `In Closing`
- **Closing statement** (two lines, large weight, the second line in accent kicker color):
  ```
  A workflow, not a workforce.
  A brain, not another agent platform.
  ```
- Below, in smaller muted text (preserved/adjusted from current closing subline): `Healthcare's data problem was never capturing information. It is converting it, curating it, and serving it back to every workflow that depends on it. That work should be a platform every team shares, not labor every team repeats.`

### Visual

Same as current. Don't add new visual elements. The closing slide should feel like a breath — a pause to land the message.

### Animation

Existing `.rise` pattern. Both lines of the closing statement should appear together as one unit (slight stagger if needed, ~100ms between line 1 and line 2). The subline appears after the closing statement.

### Why this exists

The two lines do double duty: the first carries the political/cultural message (anti-displacement, healthcare-friendly), the second carries the strategic message (platform thesis). Both audiences walk away with their preferred takeaway. Both lines are memorable. Both are short enough to be repeated.

---

# PART 5 · DESIGN SYSTEM REFERENCE

## Stack

- Reveal.js 5.1.0 (pinned)
- Custom CSS in `assets/deck.css` and slide-local styles
- Fonts: Geist (300-900), Geist Mono (300-700), Newsreader (400-600 italic + roman)
- No build step. Plain HTML + ES modules. Slide order in `manifest.json`.

## Slide dimensions

- 1280 × 720 px (canonical canvas)
- Center: false, transition: fade

## Key CSS variables (existing)

- `--accent` — kicker accent (italic clauses, key highlights)
- `--ink` — primary text
- `--ink-2` — secondary text
- `--ink-3` — tertiary/subline text
- `--muted` — muted captions, icons
- `--rule` — borders, dividers
- `--paper-3` — card / chip backgrounds

## Existing utility classes

- `.sheet` — slide container
- `.chrome` — top header strip (with `.dot` and `.right`)
- `.rise` — fade-and-rise entrance animation (controlled by `--d` delay variable)
- `.section-marker` — small uppercase label above headlines
- `.kicker` — italic accent treatment for key phrases
- `.flow-line` — animated flow line SVG (used in slides 2 and 3)
- `.sig` — bottom-left signature
- `.pageno` — bottom-right page number
- `.folio` — folio number in top chrome

## Typography hierarchy (existing)

- Title h1: 104px Geist 700, letterspacing -0.034em, line-height 1.0
- Headline h2: ~40px Geist 600, letterspacing -0.022em
- Subline body: 15-22px Geist 400, color `--ink-3`
- Section marker: ~12-14px Geist 500, uppercase, letterspacing
- Mono caption: ~12px Geist Mono 400, uppercase

## Animation conventions

- Existing `.rise` pattern: opacity 0 → 1, translateY 8px → 0, with cubic-bezier ease-out
- Stagger via `--d` custom property (e.g., `style="--d:.16s"`)
- Standard duration: 400-600ms per element
- Total slide enter sequence: ~2-3 seconds for vision slides, ~600ms for poster slides

---

# PART 6 · VOICE AND TONE GUIDANCE

## What the deck sounds like

- **Plain English.** Not marketing-speak. Not jargon-heavy. If a sentence needs a glossary, rewrite it.
- **Confident, not breathless.** The deck makes claims and supports them. It doesn't hedge, but it doesn't oversell.
- **Architectural.** When describing the platform, talk about structure, layers, foundations. The audience is technical-adjacent.
- **Outsider perspective.** This is "what I think after building FHIR Forge" — opinionated, grounded, willing to be wrong but committed.

## Sentence-level conventions

- Short sentences. Often two words. *"The chart compounds."* Better than *"The chart, as we have seen, compounds in valuable ways."*
- Pair concrete and abstract. *"Update the chart once. Every agent gets smarter."* Concrete action, abstract consequence.
- Use the kicker accent sparingly. One italic phrase per slide is usually right. More than two dilutes the emphasis.
- Italics for emphasis. Bold sparingly (it competes with the kicker treatment).

## Words to use

- **Brain, chart, foundation, layer, pillar, signal, context, fresh, current, live, reconcile**
- **Listens, reasons, serves, signals, acts, learns** (the six verbs — repeat them throughout)
- **Compounds, inherits, deepens, sharpens** (these convey the force-multiplier idea)

## Words to avoid

- "Solution" (vague). Say what it does.
- "Powered by AI" (table stakes). Say what the AI actually does.
- "Innovative" (telling, not showing). Show it.
- "Cutting-edge" / "state-of-the-art" / "next-generation" — never.
- "Holistic" / "comprehensive" / "end-to-end" — almost never. Be specific instead.
- "Ecosystem" (unless talking about a real third-party ecosystem). Usually "platform" is better.

---

# PART 7 · WHAT NOT TO DO (LESSONS FROM ITERATION)

The vision for this deck went through several rounds. These are the moves that were tried and rejected. Don't reintroduce them.

## Don't brand new nouns

The earlier version tried "Trust Receipts" (signed audit records), "Agent Charters" (policy-as-code), "Determinism Boundary" (architectural framing). All were rejected as decoration. The deck should describe things in plain language. If something needs a name beyond what it does, it's probably not earning its place.

## Don't lead with metaphors that aren't yours

"The Stripe of healthcare AI" was floated as a one-liner. Rejected — overused, and it positions Prompt Opinion as derivative. The deck describes what Prompt Opinion *is*, not what it's "the X of."

## Don't make audit/safety/compliance the center of the story

Guardrails matter. They're Pillar 3. But they're not the differentiator — every healthcare AI vendor claims safety. The differentiator is the brain that compounds. Leading with safety reads as defensive and makes the deck sound like a compliance brochure.

## Don't pitch the deck as buyer-focused

This is an internal vision deck. Don't add ROI tables, customer logos, or persona slides. The audience is the Prompt Opinion team thinking about positioning. Stay strategic.

## Don't dilute FHIR Forge

FHIR Forge is the proof of capability and Pillar 2 of the foundation. Don't bury it. Don't elevate it above the brain either. It earns one slide as a hero demo (Slide 4) and one mention as a layer of the stack (Slide 10).

## Don't add slides

11 slides is the constraint and is the right number. If something seems to need a slide of its own, it probably belongs in one of the existing slide's spec.

## Don't over-animate

Slides 6, 8, 9, and 10 have multi-step animations because the ideas need to unfold visually. Slide 9 in particular is a deliberate walkthrough (the wedge expanding into the whole day). Other slides (7, 11) should be quieter. Animation is a tool, not the point.

---

# PART 8 · BUILD PRIORITY

If building under time pressure, here's the order of investment:

## Tier 1 — must be excellent

- **Slide 6 — The Patient Brain.** The deck succeeds or fails on this slide. The three-sided living-layer visualization is the centerpiece. Spend the most design time here.
- **Slide 10 — The Foundation.** Carries the strategic conclusion. The layered stack (Integration → Engine + Guardrails → Brain) must be unmistakably clear, agents-on-top must read as inheriting the whole stack, and the compounding visual must actually show the loop.

## Tier 2 — important and new

- **Slide 8 — Signals.** The emotional center. The timeline plus signal cards visualization must feel alive.
- **Slide 9 — The Wedge.** A two-beat walkthrough: opens on the wedge alone, then zooms out to the whole day and the loop. Must look like a real clinical tool, not a marketing mockup; the realism is what makes the vision credible. More design lift than before.

## Tier 3 — modifications to existing strong slides

- **Slide 5 — The market.** Moved up from old Slide 10. Mostly preserved; the new piece is the lower-left extraction-only cluster and the label changes.
- **Slide 4 — FHIR Forge.** Animation untouched; the new closing band is the only addition.
- **Slide 1 — Title.** Headline change and subline tweak.

## Tier 4 — minimal change

- **Slide 2 — Born unstructured.** One word change.
- **Slide 3 — Every chart, by hand.** One closing clause added.
- **Slide 11 — Closing.** Two-line closing replaces one-line.

## Tier 5 — new slide that needs polish but is a poster, not a centerpiece

- **Slide 7 — Six verbs.** Important conceptually, but visually it is a 3x2 grid with good typography. Less design lift than Tier 1.

---

# Appendix · Suggested file structure

The existing repo organizes slides as:

```
content/00-intro/01-title.html
content/01-problem/02-born-unstructured.html
content/01-problem/04-conversion-economy.html
content/00-intro/03-fhir-forge.html
content/00-intro/05-fhir-forge-demo.html  (delete: old demo video)
content/02-solution/05-phenoml.html       (delete: extraction players move into the market map)
content/02-solution/06-extraction-moat.html (delete: iceberg dropped entirely)
content/02-solution/06-market-map.html
content/02-solution/06-one-workflow.html  (delete: replaced by the new Patient Brain slide)
content/02-solution/10-how-different.html (delete: replaced by the new Six Verbs slide)
content/03-platform/10-one-engine.html
content/04-closing/10-closing.html
```

For the new 11-slide deck, suggested additions:

```
content/02-solution/06-patient-brain.html        (NEW · Slide 6)
content/02-solution/07-six-verbs.html             (NEW · Slide 7)
content/02-solution/08-signals.html               (NEW · Slide 8)
content/02-solution/09-wedge.html                 (NEW · Slide 9)
```

And modifications to:

```
content/00-intro/01-title.html                (MODIFIED · Slide 1)
content/01-problem/02-born-unstructured.html  (MODIFIED · Slide 2)
content/01-problem/04-conversion-economy.html (MODIFIED · Slide 3)
content/00-intro/03-fhir-forge.html           (MODIFIED · Slide 4, new closing band)
content/02-solution/06-market-map.html        (MODIFIED · Slide 5, moved up; extraction cluster added)
content/03-platform/10-one-engine.html        (MODIFIED · Slide 10, the Foundation)
content/04-closing/10-closing.html            (MODIFIED · Slide 11, Closing)
```

Update `manifest.json` to reflect the new 11-slide order and to remove the deleted slides.

---

*End of spec.*