# Playable New GM Mode Lean Validation Strategy

## Purpose

This document defines a risk-scaled validation strategy for Playable New GM Mode Codex work. It is a docs-only audit and operating guide. It does not approve runtime code, tests, UI refactors, gameplay behavior, persistence, backend wiring, generated text, or GenAI.

The goal is to keep the architecture protected without making small UI slices spend most of their time proving that unrelated systems did not change.

## Problem Summary

The current Codex prompt pattern is safe, but too heavy for low-risk changes.

Recent UI-only and local-only slices have repeatedly asked for full `npm test`, broad `Math.random` scans, broad forbidden-runtime scans, docs updates, focused tests, and manual QA even when the actual change was CSS presentation, static shell behavior, or browser-memory-only UI state. That protects the foundation, but it also slows iteration and makes Codex spend more time proving non-impact than implementing the requested slice.

The repo still needs strong guardrails. Playable New GM Mode is intentionally near sensitive boundaries: Real Draft System v1, local-only UI state, future draft execution, future show execution, and blocked persistence. The validation burden should scale with the tier of work:

- Low-risk static UI changes should get lightweight syntax/diff and visual checks.
- UI-local behavior should get focused tests and small forbidden scans.
- UI-to-domain integration should get focused tests plus the full suite.
- Gameplay, simulation, persistence, and GenAI-adjacent changes should keep the full guardrail set.

The package scripts currently expose only:

- `npm run preview:playable-ui`
- `npm test`

There is no separate typecheck or lint script today, so validation should use `node --check`, focused `node --test` files, `npm test`, `git diff --check`, preview smoke checks, and targeted `rg` scans based on risk.

## Risk Tiers

### Tier 1: Visual/static UI-only

Examples:

- CSS, layout, copy, static HTML, static labels, static visual hierarchy.
- No JavaScript behavior changes.
- No domain imports.
- No gameplay, persistence, simulation, storage, network, or GenAI behavior.

This tier covers visual polish and static shell presentation. It should not require full-suite validation unless the change touches shared behavior or test infrastructure.

### Tier 2: UI-local behavior

Examples:

- `ui/playable-new-gm-mode/app.js` screen state.
- Dock visibility and active state.
- Candidate selection.
- Mock or preview state.
- UI adapters that stay browser-memory only.
- Presentation-only Draft Recap preview state.

This tier can affect player flow, but it remains local to the browser page lifetime. It must prove no storage, network, persistence, duplicate draft path, or unintended real draft flow has been added.

### Tier 3: UI-to-domain integration

Examples:

- Make Pick.
- Real Draft System v1 service calls.
- Domain adapters.
- Draft Recap projection from a real in-memory draft result.
- Any UI code that imports from `src/game/domain`.

This tier crosses from browser UI into approved deterministic in-memory domain behavior. It must prove it composes existing Real Draft System v1 services instead of creating a parallel draft system, and that results remain local-only and non-persistent.

### Tier 4: Gameplay/simulation/persistence

Examples:

- Booking.
- Show execution.
- Match, Show, Fan Reaction, or Social Discourse engine calls.
- World-state deltas.
- Save/load behavior.
- SQLite gameplay persistence.
- GenAI or generated text.
- Week advancement, show history, roster/championship/rivalry mutation, business systems, or fan/social consequences.

This tier touches the core foundation guardrails. It should keep the full validation burden.

## Validation Matrix

| Tier | Required Validation | Optional Validation |
| --- | --- | --- |
| Tier 1: Visual/static UI-only | `git diff --check`; `node --check` only for changed JS files; manual visual QA only when layout, overflow, responsive behavior, or visible screen state is affected | Focused screenshot/browser preview when the visual change is substantial; `npm test` only if shared behavior, test fixtures, or runtime contracts changed |
| Tier 2: UI-local behavior | `node --check` on changed JS files; focused tests for changed behavior; `git diff --check`; small forbidden scan for storage, network, and real draft flow terms in changed playable UI files | `npm test` when shared helpers, test harnesses, or cross-screen behavior changed; manual preview for visible flow changes |
| Tier 3: UI-to-domain integration | Focused tests; full `npm test`; `git diff --check`; boundary scan for storage, network, persistence, backend calls, duplicate services, and draft flow composition; docs/checklist update when user-facing behavior or QA responsibility changes | Manual preview of the integrated flow; `Math.random` scan when draft algorithm, randomness, simulation, or tests that could introduce nondeterminism changed |
| Tier 4: Gameplay/simulation/persistence | Focused tests; full `npm test`; `git diff --check`; `Math.random` scan when randomness, simulation, engines, or tests are touched; engine metadata checks when engines are touched; persistence/storage scans when persistence is touched; hidden/player-facing boundary tests; docs update | Additional deterministic replay tests, same-seed/different-seed tests, migration checks, browser QA, or artifact inspection based on the system touched |

## Lean Forbidden Scans

Forbidden scans should be scoped to the files and risk tier involved. Broad repo-wide scans are still useful before milestone commits or high-risk work, but they should not be mandatory for every small UI presentation slice.

### Tier 1 scan set

Usually none unless JavaScript changed.

If JavaScript changed inside the playable UI shell, scan changed files for:

```powershell
rg "fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie" ui/playable-new-gm-mode
```

### Tier 2 scan set

Scan the changed playable UI files for storage, network, and accidental real draft flow terms:

```powershell
rg "fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie" ui/playable-new-gm-mode
rg "createNewGMModeInMemoryDraftFlow|DraftPickCreation|DraftPickExecution|RosterAssignment|RosterStateCreation|AutoDraft|sqlite|OpenAI|api key" ui/playable-new-gm-mode
```

Use this tier for `app.js`, `screenShellState.js`, `draftSelectionIntentAdapter.js`, and `draftRecapPreviewState.js` changes that remain browser-memory-only.

### Tier 3 scan set

Scan playable UI and touched domain adapter files for storage, backend, persistence, duplicate draft systems, and the intended Real Draft System v1 composition path:

```powershell
rg "fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|sqlite|INSERT INTO|UPDATE |DELETE |OpenAI|api key" ui/playable-new-gm-mode src/game/domain tests
rg "playableNewGMModeDraftService|duplicateDraftService|DraftPickCreation|DraftPickExecution|RosterAssignment|RosterStateCreation|createAutoDraft|AutoDraftService" ui/playable-new-gm-mode
rg "createNewGMModeInMemoryDraftFlow|createNewGMModeDraftPickValidationService|createNewGMModeDraftPickCreationService|createNewGMModeDraftPickExecutionService|createNewGMModeDraftPickRosterAssignmentService|createNewGMModeRosterStateCreationService" ui/playable-new-gm-mode src/game/domain tests
```

The final command is not always a failure scan. For Make Pick work, it should prove the approved existing service path is composed intentionally.

### Tier 4 scan set

Use the full foundation guardrail scan set relevant to the touched system:

```powershell
rg "Math\.random" src tests ui
rg "fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie" ui src tests
rg "sqlite|INSERT INTO|UPDATE |DELETE |savePayload|gameplayPayload|save_metadata|schema_migrations" src tests ui
rg "OpenAI|api key|generated text|generatedText|GenAI|prompt" src tests ui
rg "match-engine-v0|show-engine-v0|fan-reaction-engine-v0|social-discourse-engine-v0|metadata" src/game/engines tests docs
```

Use only the lines relevant to the changed capability. For example, persistence scans are required when persistence was touched, not when a CSS layout changed.

## Math.random Guidance

Do not require a `Math.random` scan for every UI-only slice.

Require `rg "Math\.random" src tests ui` when a change touches any of these:

- Simulation engines.
- Randomness services or seeded replay infrastructure.
- Draft algorithms or draft execution logic.
- Tests that could introduce nondeterminism.
- Any Tier 4 gameplay/simulation/persistence work.
- Any Tier 3 UI-to-domain integration that introduces algorithmic selection or randomized behavior.

For Tier 1 visual/static changes and Tier 2 browser-memory-only UI state changes, a `Math.random` scan is optional unless JavaScript behavior or tests introduce a credible nondeterminism risk.

## Full Test Suite Guidance

Do not require full `npm test` for every CSS, static HTML, copy, docs-only, or visual shell change.

Require full `npm test` for:

- Tier 3 UI-to-domain integration.
- Tier 4 gameplay, simulation, persistence, engine, randomness, or GenAI-adjacent work.
- Changes to shared domain contracts, shared fixtures, shared test utilities, or package/test infrastructure.
- Important milestone commits.
- Any change where focused tests pass but the touched surface is known to have broad cross-module coupling.

For Tier 2 UI-local behavior, prefer focused tests during iteration. Run the full suite before milestone commits, before merging a multi-slice branch, or when the UI-local helper becomes shared across screens or imports domain behavior.

For Tier 1 visual/static UI-only changes, `git diff --check`, syntax checks for changed JS, and visual/manual QA are usually enough.

## Docs Update Guidance

Do not update docs or checklists for every tiny visual fix.

Update docs when a change affects one of these:

- Flow order.
- Boundary status.
- Roadmap phase.
- QA responsibility.
- A user-facing capability or blocked capability.
- A validation expectation that future Codex prompts should inherit.
- The Real Draft System v1 integration path.
- Persistence, storage, GenAI, or gameplay guardrails.

For Tier 1 visual polish, docs updates are optional and should happen only when the visual doctrine itself changes. For Tier 2 local behavior, update docs only when the expected flow or QA checklist changes. For Tier 3 and Tier 4 work, docs are usually required when behavior changes.

## Recommended Prompt Template

Use this lean validation clause in future Playable New GM Mode prompts:

```text
Lean validation:
- Classify this slice before editing as Tier 1, Tier 2, Tier 3, or Tier 4 using docs/playable-new-gm-mode-lean-validation-strategy.md.
- Run only the required validation for that tier unless the change crosses into a higher-risk boundary.
- For Tier 1, do not run the full test suite unless shared behavior or test infrastructure changed.
- For Tier 2, run node --check on changed JS, focused behavior tests, git diff --check, and a small storage/network/draft-flow forbidden scan.
- For Tier 3, run focused tests, full npm test, git diff --check, and the UI-to-domain boundary scans.
- For Tier 4, run focused tests, full npm test, git diff --check, randomness/engine/persistence/GenAI scans relevant to touched systems, and update docs.
- Do not run a Math.random scan for visual/static UI-only work unless randomness, simulation, draft algorithms, or nondeterministic tests were touched.
- Report the tier, validation run, skipped validation with reason, and whether the changed files stayed inside the approved scope.
```

## Non-Negotiable Guardrails

These remain hard blocks regardless of tier:

- No duplicate draft systems.
- No persistence before the approved phase.
- No browser storage in local-only phases.
- No GenAI before the approved phase.
- No hidden formulas, hidden rolls, raw internals, or exact simulation deltas in player UI.
- No Match, Show, Fan Reaction, or Social Discourse engine calls from draft screens.
- No Make Pick unless explicitly approved.
- No gameplay start, Week 1 initialization, show booking, show execution, week advancement, or world-state mutation unless explicitly approved.
- No SQLite gameplay writes before the persistence phase is explicitly approved.
- No generated text, tweets, reports, rumors, narratives, or AI-written flavor before the approved phase.

## Practical Default

When the prompt is ambiguous, choose the lowest tier that fully describes the files and behavior being changed, then escalate validation if the diff crosses a boundary.

The core rule is simple: validate what the slice could realistically break. Static presentation should not pay the validation cost of gameplay persistence. UI-to-domain integration should. Simulation and persistence still require the full foundation guardrails.
