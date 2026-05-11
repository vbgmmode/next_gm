# Playable New GM Mode Roadmap (Reconciled Baseline, 2026-05-11)

## Current Baseline

- The static shell and local state architecture are still in place.
- Draft now runs with budget-aware local behavior in UI-to-domain flow using
  `createNewGMModeInMemoryDraftFlow()` and related domain services.
- Drafted talent is assigned to the selected player brand, and source roster
  remains metadata-only (`Drafted From` / `Source Pool`).
- Brand-specific championship setup exists in local flow.
- Rivalry setup exists in local flow.
- Week 1 HQ exists in local playable flow.
- Local weekly booking builder exists with segment validation and main-event requirement.
- Run Show and show recap preview exist in rough local form.
- Local recurrence loop includes local consequences and Week 2 advancement.
- Save payload and save-load preview path exists:
  - gameplay state model + serializer/parser contracts
  - local save API controller
  - continue/load preview path in UI
  - no durable gameplay payload persistence is required for this local loop
- Week calendar projection for season flow exists in session state (road-to-PLE labels,
  defense windows, rivalry prompts, and history-count metadata).
- All visible simulation paths continue to preserve deterministic replay behavior
  with seeded/structured randomness and no `Math.random`.

## Source Doctrine Stack

1. `docs/design/simulation-doctrine.md`
2. `docs/ui-ux-doctrine.md`
3. `docs/new-gm-real-draft-system-architecture.md`
4. `docs/playable-new-gm-mode-lean-validation-strategy.md`
5. `src/game/domain/...` draft service chain
6. `ui/playable-new-gm-mode/*` local controllers/adapters/tests

These docs define constraints and current implementation boundaries unless a newer
reconciliation entry updates them.

## What is implemented now vs what remains blocked

### Implemented and now open as local rough truth

- budget-aware local draft action exists in the UI with in-memory flow integration
- brand-specific local championship assignment
- local rivalry setup
- local Week 1 HQ and Week 2 advancement flow
- local show booking with `Singles Match`, `Promo`, and `Main Event Singles Match`
- local recap generation from run-through of engines (`match-engine-v0` ->
  `show-engine-v0` -> fan/social handoff/preview) with no durable effects
- save payload contract + local save/load preview behavior
- season calendar projection from local week state

### Still blocked (future work)

- full deep simulation of consequences:
  full match/booking consequences, title changes, injuries, morale/fatigue/personal
  progression, rivalry progression persistence, fan/social persistence, and business
  systems
- CPU brands and cross-brand simulation/competition systems
- GenAI as gameplay truth layer (GenAI may remain optional flavor only and post-cascade)
- durable production persistence hardening (beyond local rough save preview)
- durable PLE depth / event-card consequences beyond local projection
- polished full UX for mature management screens beyond the current local/rough contract

## Playable Flow Reality (now)

- `Game Landing / Title Screen` remains the startup entrypoint.
- `Start New Game` -> `Contract Signing` -> `Setup Basics` -> `Assistant Setup`
  (optional) -> `Choose GM` -> `Select Brand`.
- `Initial Draft` now flows into in-memory draft action + recap with local post-draft
  progression.
- Post-draft local setup includes:
  - championship setup
  - rivalry setup
  - Week 1 HQ
- From Week 1 HQ:
  - local booking build
  - Run Show
  - recap + local consequence summary
  - Week 2 advance
- Save-load preview path exists and routes current gameplay state payload shape.

## Hard boundary reminders for this phase

The following are still non-negotiable where not already implemented:

- no gameplay persistence as a general durable save system
- no durable roster/championship/division/calendar/match/show/world-state mutation
- no backend save create/update/delete wiring from this phase
- no browser storage for runtime state (in-memory first)
- no generated hidden-roll exposure, raw internal formulas, raw IDs, backend diagnostics
  in player UI
- no live/mandatory GenAI calls in gameplay core

## Constraint language to keep in all docs

- Keep `Math.random` blocked; random behavior remains seeded and deterministic through
  approved context and services (`RandomService`, `createSimulationContext`,
  `createSimulationEngineContext`).
- If/when GenAI is introduced, it is flavor and should never own gameplay truth.
- Core game facts come from deterministic state and structured simulation outputs.
- Finance should remain player-facing as gamey money labels, not abstract token tables.
- UI remains premium wrestling GM direction (not SaaS/admin/debug style).
- Drafted talent is bound to selected player brand; source information remains metadata-only.

## Recommended next docs source-of-truth flow

1. Use this roadmap as the current executable planning surface.
2. Use the reconciliation report for conflict resolution when documents disagree.
3. Treat older roadmap/draft-decision docs with explicit historical status banners.
4. Apply validations from `docs/playable-new-gm-mode-lean-validation-strategy.md`
   and update only touched docs after each capability phase.

## Blocked until future explicit approval

- Full deep simulation execution consequences (beyond rough local recap preview)
- durable save payload persistence
- production save/create/update/delete behavior
- CPU brands and other-brand simulation behavior
- full business layer and calendar depth
- polished, non-local persistence-driven UX milestones
