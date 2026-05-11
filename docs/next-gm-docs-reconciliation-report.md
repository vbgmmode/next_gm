# Next GM Documentation Reconciliation Report

Date: 2026-05-11

## Current implemented reality (code/tests)

The repository now has a rough but real local-playable slice beyond purely static docs:

- Drafting is not theoretical only:
  - `ui/playable-new-gm-mode/inMemoryDraftActionController.js` wires candidate
    selection through `createNewGMModeInMemoryDraftFlow` and preserves deterministic
    draft/roster assignment output in page lifetime.
  - `tests/playableNewGMModeInMemoryMakePick.test.ts` and
    `tests/playableNewGMModeDraftSelectionIntentAdapter.test.ts` exercise real make-pick
    validation/action boundaries.
- Finance-aware draft setup and budget are live in local flow:
  - `ui/playable-new-gm-mode/` local state supports budget, affordability checks, and
    minimum roster behavior through domain-backed draft logic.
  - `tests/playableNewGMModeDraftBudgetSpend.test.ts`,
    `tests/playableNewGMModeFinanceLimitedDraft.test.ts`,
    and `tests/playableNewGMModeDraftAutoFillMinimumRoster.test.ts` confirm local
    budget behavior and auto-fill constraints.
- Post-draft setup is local and active:
  - `ui/playable-new-gm-mode/localPostDraftSetupController.js` includes brand-specific
    championship setup and rivalry setup.
  - `tests/playableNewGMModeLocalPostDraftSetupFlow.test.ts` verifies these paths.
- Week 1 booking/review loop exists:
  - `ui/playable-new-gm-mode/localWeekOneBookingController.js` builds local week-one
    card segments, validates main-event and roster constraints, runs show preview, and
    advances local week state.
  - `tests/playableNewGMModeLocalWeekOneBookingBuilder.test.ts` validates run-show,
    recap projection, local consequences, and week-advance behavior.
- Save payload / save-load preview path exists:
  - `src/game/domain/gameplayState.ts` and persistence-facing adapters include
    gameplay state shapes, serializer/parser contracts, and bridging helpers.
  - `ui/playable-new-gm-mode/saveLoadController.js`,
    `tests/playableNewGMModeSaveLoadApiController.test.ts`,
    and `tests/playableNewGMModeSaveLoadUi.test.ts` exercise local save slot
    creation/continue behavior.
- Calendar projection exists:
  - local season calendar and road-to-PLE projections are produced from local week state
    through controller logic.
  - booking UI tests assert season timeline helpers remain deterministic.
- Match/Fan/Social preview chain is used in local context:
  - `show-engine-v0`, `match-engine-v0`, `fan-reaction-engine-v0`,
    `social-discourse-engine-v0` are invoked in preview flows for signal projection.
  - `tests/playableNewGMModeLocalWeekOneBookingBuilder.test.ts` asserts seeded behavior
    and deterministic recap output for runs.

## Docs that are current and should remain authoritative

- `docs/ui-ux-doctrine.md`:
  - keeps first-screen and premium visual/flow guardrails
- `docs/design/simulation-doctrine.md`:
  - keeps hidden/player-facing model and randomness discipline
- `docs/new-gm-real-draft-system-architecture.md`:
  - canonical draft domain services and canonical v1 draft flow
- `docs/playable-new-gm-mode-lean-validation-strategy.md`:
  - remains the shared validation-tier baseline
- `docs/playable-new-gm-mode-roadmap.md`:
  - updated to reflect current local playable baseline and remaining blocks

## Docs that are partially stale

- `docs/playable-new-gm-mode-finance-aware-draft-rules-contract.md`
  - still useful as product-direction contract, but references draft-only future
    milestones that are now partially implemented.
- `docs/playable-new-gm-mode-final-implementation-goal.md`
  - includes historical milestone phrasing and testing recommendations from an earlier
    planning phase.
- `docs/playable-new-gm-mode-initial-draft-experience-decision.md`
  - still valuable for strategy framing, but its “mini preview only” assumptions
    no longer match local implementation breadth.

## Docs that are outdated / foundation-era

- `docs/playable-new-gm-mode-to-playable-roadmap.md`:
  - explicitly presents Week 1 setup, booking, and week advancement as future work.
- `docs/playable-new-gm-mode-visual-design-contract.md`
  - currently useful for visual rejection criteria, but some acceptance gates were
    written before local week-one playable implementations existed.

## Specific contradictions found

1. `docs/playable-new-gm-mode-roadmap.md` and `docs/playable-new-gm-mode-to-playable-roadmap.md` both
   described Week 1 initialization, booking, and run-show as blocked, while runnable
   controllers and tests now include those local features.
2. Several docs still describe save payload/save-load as blocked future work, while
   local save payload model, serializer/parser, API controller, and continue/review
   behavior are now present.
3. Multiple baseline documents claimed “no week advancement,” but local week-one
   controls and week-advance tests now exist.
4. Some draft-direction docs still use “preview-only” language for championship/rivalry
   setup and Week 1 handoff while concrete local implementations exist.
5. The previous source-of-truth expectation mixed foundation-mode and rough playable
   state in the same docs, creating contradictory implementation signals.

## Recommended source-of-truth hierarchy going forward

1. `docs/next-gm-docs-reconciliation-report.md` (this document) for conflict resolution.
2. `docs/playable-new-gm-mode-roadmap.md` as current playable planning/ground-truth.
3. `docs/design/simulation-doctrine.md`, `docs/ui-ux-doctrine.md`,
   `docs/new-gm-real-draft-system-architecture.md` for architectural constraints.
4. `src/game/domain/*`, `ui/playable-new-gm-mode/*`, and `tests/playableNewGMMode*.test.ts`
   as the implementation-of-record.
5. Other historical milestones and strategy docs only after the banner check.

## Recommended docs updates and deprecations

- Update:
  - `docs/playable-new-gm-mode-roadmap.md` (done): now reflects local draft-budget,
    post-draft setup, week-one loop, save preview, and season projection.
- Archive-in-place with status banner:
  - `docs/playable-new-gm-mode-to-playable-roadmap.md`
  - `docs/playable-final-implementation-goal.md`
  - `docs/playable-new-gm-mode-initial-draft-experience-decision.md`
- Consider optional review pass for:
  - `docs/playable-new-gm-mode-finance-aware-draft-rules-contract.md`
  - `docs/playable-new-gm-mode-visual-design-contract.md`

## What should be considered blocked now

- full deep simulation and durable consequence mutation
- gameplay persistence as a production save system
- CPU brands and non-player-brand simulation
- GenAI as deterministic gameplay layer (optional flavor only later)
- durable persistence hardening for update/delete/list across full save lifecycle
- PLE depth and polished non-local gameplay UX

## What is no longer blocked because it exists in rough/local form

- budget-aware draft execution
- brand-specific local championship setup
- rivalry setup
- local Week 1 HQ
- local weekly booking builder
- local Run Show + recap preview
- local recurrence/Week 2 advance behavior
- local save payload model + preview load/continue path
- season calendar projection

## What remains future work

- deterministic but consequence-aware full-match depth
- rival-company/CPU ecosystem
- durable replay/persistence stack for gameplay progression
- real league-wide calendar systems (beyond local projection)
- production-ready polished UI/UX for all operational modules
- generated text/GenAI integration as optional flavor only after deterministic core is stable
