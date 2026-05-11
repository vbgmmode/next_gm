# Playable New GM Mode v0.1 Roadmap

## Purpose

This document maps the current `next_gm` repository state to a local-only Playable New GM Mode v0.1. It is a durable implementation roadmap, not runtime approval. No runtime code, persistence behavior, SQLite gameplay writes, GenAI calls, or broad refactors are approved by this document.

The target is a playable in-memory prototype loop that proves player flow and deterministic handoffs before durable gameplay consequences or save payloads exist.

## Source Baseline

This roadmap is grounded in:

- `docs/playable-new-gm-mode-roadmap.md`
- `docs/ui-ux-doctrine.md`
- `docs/new-gm-real-draft-system-architecture.md`
- `docs/simulation-gaps-dossier.md`
- The current static shell in `ui/playable-new-gm-mode/index.html`, `styles.css`, and `app.js`

The current UI shell starts on Game Landing / Title Screen, routes Start New Game into Contract Signing, supports Setup Basics, Assistant Setup, Choose GM, Select Brand, Initial Draft, Draft Recap, and Brand Dashboard / Week 1 Setup as static or mock surfaces, and currently keeps Make Pick, Auto Draft, Draft Recap transition, and show booking locked.

## Current State Summary

The foundation is stable.

Real Draft System v1.0 is stable and in-memory only. It can validate draft selection intent, create draft pick objects, execute draft picks, create roster assignment results, create in-memory roster state, summarize draft completion, and run the one-shot in-memory draft flow. It is not approval for gameplay start, persistence, UI mutation, generated text, GenAI, Week 1 initialization, or durable roster payloads.

A static/mock UI shell exists. It already models the player-facing sequence from Game Landing / Title Screen through New GM setup, Initial Draft, Draft Recap, and Brand Dashboard / Week 1 Setup. The shell has a local `uiState`, brand switching, candidate selection preview, and locked draft/show actions, but it is not yet a complete playable state machine.

The simulation has a deterministic spine but not durable gameplay consequences. Seeded randomness, engine boundaries, hidden/player-facing separation, and Match -> Show -> Fan/Social shell handoffs exist. The stack does not yet apply winners, title changes, popularity movement, morale, injuries, rivalry progression, business results, show history, week advancement, world-state deltas, or gameplay persistence.

The playable loop is not complete. The player can inspect the prototype flow, but cannot yet complete an in-memory draft from the UI, project the real draft result into Draft Recap, perform local post-draft setup, book and run a minimal Week 1 show recap preview, or advance to the next week in memory.

## Definition Of Playable v0.1

Playable v0.1 means the player can complete one local-only New GM session loop without persistence:

1. Start a new game from the title screen.
2. Choose setup options, GM, and brand.
3. Complete an in-memory draft.
4. See a Draft Recap backed by the in-memory draft result.
5. Reach Brand Dashboard / Week 1 Setup.
6. Optionally assign champions and create rivalries locally.
7. Book a minimal Week 1 show.
8. Run a deterministic show recap preview.
9. Advance to the next week in memory.

No persistence is required for v0.1. Reloading the page may reset the session.

Playable v0.1 does not require full economy, durable saves, SQLite gameplay writes, generated text, GenAI, real fan/social narratives, full match outcomes, title-history persistence, long-term morale, injuries, popularity deltas, or business simulation.

## Roadmap Guardrails

- No duplicate draft system. Compose the Real Draft System v1.0 services instead of creating parallel draft objects, execution results, roster assignments, or roster state models.
- No save payload persistence before the playable loop works in memory.
- No SQLite gameplay writes before an explicit persistence phase.
- No GenAI before core gameplay works.
- No full-page scrolling. Preserve viewport-first screens with contained panel scrolling only.
- No browser storage in local-only phases. Do not use `localStorage`, `sessionStorage`, `indexedDB`, URL hash state, or query params as gameplay state.
- No hidden formulas, hidden rolls, raw stat math, or exact internal deltas in player-facing output.
- No broad refactors. Each phase should add the smallest contract, adapter, or controller needed to prove the next playable step.
- No generated text, tweets, reports, rumors, narratives, or AI-written flavor until explicitly approved.
- No real save/load/list UI wiring while v0.1 is local-only.
- No gameplay persistence through identity-only SQLite shells.

## Existing Systems To Reuse

Use the Real Draft System v1.0 services for draft behavior:

- `createNewGMModeDraftPickValidationService()`
- `createNewGMModeDraftPickCreationService()`
- `createNewGMModeDraftPickExecutionService()`
- `createNewGMModeDraftPickRosterAssignmentService()`
- `createNewGMModeRosterStateCreationService()`
- `createNewGMModeDraftCompletionSummary()`
- `createNewGMModeInMemoryDraftFlow()`

Use existing simulation shells only as deterministic preview foundations:

- `RandomService`
- `createSimulationContext()`
- `createSimulationEngineContext()`
- `match-engine-v0`
- `show-engine-v0`
- Existing hidden/player-facing signal boundaries

Use the current static UI shell as the visual and flow baseline:

- Game Landing / Title Screen first.
- Start New Game -> Contract Signing.
- Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft.
- Initial Draft -> Draft Recap only after an approved local in-memory draft completion.
- Draft Recap -> Brand Dashboard / Week 1 Setup.
- Brand Dashboard / Week 1 Setup remains the first post-draft home base.

## Phase 1: Local-Only Player Session State

Type: UI-only.

Objective:
Create a disposable in-memory player session controller that owns the current flow state and correct initial screen state for Playable New GM Mode. It should formalize the current UI shell behavior without persistence.

Existing systems to reuse:

- Current `ui/playable-new-gm-mode/app.js` screen activation behavior.
- Current Game Landing / Title Screen first-flow doctrine.
- Current static setup and brand selection surfaces.

New files likely needed:

- `ui/playable-new-gm-mode/sessionState.js`
- `ui/playable-new-gm-mode/sessionState.test.js` or equivalent focused test harness

Explicitly blocked capabilities:

- Browser storage.
- Save identity creation.
- Save payload persistence.
- Backend calls.
- Draft pick execution.
- Roster assignment.
- Week advancement.
- Route or URL state authority.

Exit criteria:

- Reload starts from Game Landing / Title Screen.
- Start New Game enters Contract Signing.
- Setup choices, selected GM, selected brand, active screen, and draft selected candidate can live in memory only.
- The session can be reset without deleting any external data.
- Locked states remain locked until later phases.

Suggested validation:

- Focused unit or browser smoke test proving default screen, transitions, reset behavior, and no storage writes.
- Search for `localStorage`, `sessionStorage`, `indexedDB`, and backend fetch calls in the playable UI files.
- Manual static preview of the first flow.

## Phase 2: Draft Selection Intent Preview

Type: UI + domain integration.

Objective:
Convert a focused candidate row into a local-only draft selection intent preview without creating or executing a draft pick.

Existing systems to reuse:

- Current Initial Draft candidate row selection UI.
- `newGMModeDraftSelectionIntentObject`
- `newGMModeDraftSelectionIntentObjectValidator`
- `newGMModeDraftSelectionIntentReadinessSummary`
- Existing static candidate/readiness data.

New files likely needed:

- `ui/playable-new-gm-mode/draftSelectionIntentAdapter.js`
- Focused tests for the adapter and UI preview state.

Explicitly blocked capabilities:

- Draft pick creation.
- Draft pick execution.
- Roster assignment.
- Roster state creation.
- Draft completion.
- Auto Draft.
- Save payload writes.
- Browser storage.
- GenAI.

Exit criteria:

- Selecting a candidate creates a UI-safe selection intent preview in memory.
- Preview shows player-facing status language without raw validation internals or formulas.
- Make Pick remains locked unless Phase 3 is explicitly active.
- Invalid or unavailable candidates can show blocked status without side effects.

Suggested validation:

- Focused tests for valid, unavailable, malformed, and reset preview states.
- Test or grep proving no calls to pick creation, pick execution, roster assignment, roster state creation, storage, backend APIs, or GenAI.

## Phase 3: Controlled In-Memory Make Pick Action

Type: UI + domain integration.

Objective:
Enable one controlled player-triggered Make Pick action that uses the existing Real Draft System v1.0 services to complete the approved in-memory draft path.

Existing systems to reuse:

- `createNewGMModeDraftPickValidationService()`
- `createNewGMModeDraftPickCreationService()`
- `createNewGMModeDraftPickExecutionService()`
- `createNewGMModeDraftPickRosterAssignmentService()`
- `createNewGMModeRosterStateCreationService()`
- `createNewGMModeDraftCompletionSummary()`
- Prefer `createNewGMModeInMemoryDraftFlow()` when a one-shot local draft is enough.

New files likely needed:

- `ui/playable-new-gm-mode/inMemoryDraftActionController.js`
- `ui/playable-new-gm-mode/inMemoryDraftProjection.js`
- Focused integration tests for the player action boundary.

Explicitly blocked capabilities:

- Duplicate draft services or parallel draft models.
- Persistent roster state.
- Gameplay start.
- Week 1 initialization.
- Championship assignment.
- Division assignment.
- Rivalry creation.
- Browser storage.
- SQLite gameplay writes.
- GenAI.

Exit criteria:

- Make Pick is enabled only when the local selection intent is valid and the phase is active.
- The action calls the existing v1 services in documented order or through the canonical one-shot flow.
- The result stays in page memory.
- The UI receives an in-memory roster state and draft completion summary.
- All forbidden capabilities remain absent.

Suggested validation:

- Same input replay returns the same draft result.
- Blocked candidate input returns a blocked result without mutation.
- Focused absence tests for storage, backend calls, SQLite, GenAI, duplicate models, and gameplay start.
- `rg "Math\\.random" src tests ui` remains clean if runtime tests touch seeded behavior.

## Phase 4: Draft Recap Real Projection

Type: UI + domain integration.

Objective:
Replace static Draft Recap content with a projection from the completed in-memory draft result.

Existing systems to reuse:

- In-memory roster state object from Phase 3.
- Roster assignment result projection.
- Draft completion summary.
- Current Draft Recap screen and grouping doctrine.

New files likely needed:

- `ui/playable-new-gm-mode/draftRecapProjection.js`
- `ui/playable-new-gm-mode/draftRecapProjection.test.js`

Explicitly blocked capabilities:

- Persisted roster payloads.
- Gameplay start.
- Championship assignment.
- Division initialization.
- Week 1 mutation.
- Generated narrative recap.
- Raw hidden object dumps in player-facing output.

Exit criteria:

- Draft Recap appears only after in-memory draft completion.
- The player's roster is grouped by safe display buckets such as men's division, women's division, tag teams, prospects/developmental, and unassigned/TBD when metadata does not support cleaner grouping.
- Pick order, candidate identity, role, brand fit, and roster need coverage can be shown from approved data.
- The recap transitions to Brand Dashboard / Week 1 Setup without creating durable state.

Suggested validation:

- Projection tests for complete, partial, empty, and blocked draft results.
- UI smoke check that Draft Preview language does not remain primary after Draft Recap.
- Search proving no save, storage, backend, GenAI, or SQLite writes.

## Phase 5: Post-Draft Local Champion, Rivalry, And Checklist Setup

Type: UI-only at first, then UI + domain integration only if explicit local contracts are approved.

Objective:
Allow the player to organize the post-draft brand locally by assigning champions, optionally creating local rivalries, and clearing or reopening a Week 1 setup checklist.

Existing systems to reuse:

- Brand Dashboard / Week 1 Setup shell.
- Draft Recap roster projection.
- UI doctrine for manual championship setup and optional rivalry creation.

New files likely needed:

- `ui/playable-new-gm-mode/postDraftSetupState.js`
- `ui/playable-new-gm-mode/championAssignmentLocalProjection.js`
- `ui/playable-new-gm-mode/rivalryLocalProjection.js`
- Focused tests for local-only champion and rivalry state.

Explicitly blocked capabilities:

- Silent auto-assignment of champions.
- Title history persistence.
- Division persistence.
- Rivalry persistence.
- Morale, popularity, or fan/social consequences.
- Assistant-generated recommendations.
- Week advancement.
- SQLite writes.

Exit criteria:

- The player can manually select champion placeholders from the drafted roster in memory.
- The player can create local rivalry placeholders from drafted roster members.
- Checklist state is local and resettable.
- Skipping this setup remains allowed.
- No hidden formulas or auto-booking logic decide the player's setup.

Suggested validation:

- Focused UI state tests for assign, clear, duplicate prevention, and reset.
- Smoke check that checklist closure is local only.
- Search proving no browser storage, backend calls, persistence, or GenAI.

## Phase 6: Minimal Booking Builder

Type: UI + domain integration.

Objective:
Let the player book a minimal Week 1 show in memory using the drafted roster and local setup choices.

Existing systems to reuse:

- Current Brand Dashboard / Week 1 Setup CTA shape.
- Existing show-engine input expectations where appropriate.
- Existing Match and Show shell boundaries.
- UI doctrine for booking as a production timeline.

New files likely needed:

- `ui/playable-new-gm-mode/weekOneBookingState.js`
- `ui/playable-new-gm-mode/minimalShowCardBuilder.js`
- `src/game/domain/minimalShowBookingIntentObject.ts` only if a domain contract is approved.
- Focused tests for card validity and no side effects.

Explicitly blocked capabilities:

- Durable show state.
- Full booking system.
- Drag-only controls without non-drag alternatives.
- Predicted ratings, fan reaction, social buzz, match grade, rivalry gain, morale movement, title prestige movement, or business impact before the show is run.
- Auto-booking.
- Assistant decisions.
- Persistence.
- GenAI.

Exit criteria:

- The player can create a minimal show card in memory.
- Required technical constraints can block impossible states only.
- Warnings remain issue-focused, not formula-focused.
- The card can be handed to a deterministic recap preview phase without saving.

Suggested validation:

- Tests for empty card, duplicate wrestler conflict, unavailable wrestler, champion not booked warning, and valid minimal card.
- UI smoke check that all booking actions have non-drag alternatives.
- Search proving no storage, persistence, backend calls, GenAI, or predicted outcome formulas.

## Phase 7: Show Execution Recap Preview

Type: UI + domain integration.

Objective:
Run a deterministic show recap preview from the in-memory Week 1 booking without applying durable gameplay consequences.

Existing systems to reuse:

- `RandomService`
- `createSimulationContext()`
- `createSimulationEngineContext()`
- `show-engine-v0`
- `match-engine-v0`
- Existing player-facing signal boundary helpers.

New files likely needed:

- `ui/playable-new-gm-mode/showRecapPreviewController.js`
- `ui/playable-new-gm-mode/showRecapProjection.js`
- Optional narrow domain preview contract only if approved, such as `src/game/domain/showRecapPreviewObject.ts`
- Focused deterministic preview tests.

Explicitly blocked capabilities:

- Real match winners if not explicitly approved for preview.
- Title changes.
- Injuries.
- Morale changes.
- Popularity deltas.
- Rivalry progression.
- Attendance, revenue, show grades, business results.
- Fan/social generated narratives.
- Week history persistence.
- Save writes.

Exit criteria:

- Same seed and same in-memory show card produce the same recap preview.
- Different seed can diverge only through approved seeded preview signals.
- Player-facing recap uses signals and summaries, not hidden rolls or formulas.
- Preview result remains local and non-persistent.

Suggested validation:

- Same-seed replay test.
- Different-seed divergence test where approved.
- Tests proving debug roll traces remain hidden/non-player-facing.
- `rg "Math\\.random" src tests ui` has no matches.
- Search proving no persistence or GenAI calls.

## Phase 8: Local-Only Week Advancement

Type: UI + domain integration.

Objective:
Advance from Week 1 to the next week in memory after the recap preview, without durable world-state deltas or save payloads.

Existing systems to reuse:

- Local player session state from Phase 1.
- Show recap preview result from Phase 7.
- Current header/week display shell.

New files likely needed:

- `ui/playable-new-gm-mode/localWeekAdvanceController.js`
- `ui/playable-new-gm-mode/weekStateProjection.js`
- Focused tests for local week increment/reset.

Explicitly blocked capabilities:

- Durable calendar state.
- Persistent show history.
- World-state deltas.
- Save payload writes.
- SQLite gameplay writes.
- Background simulation of rival companies.
- Business, fan/social, morale, injury, or popularity progression.
- Browser storage.

Exit criteria:

- The player can advance from Week 1 to Week 2 in memory.
- The UI reflects the new local week state.
- The previous recap can be referenced only within the current page lifetime.
- Reload resets the local-only session unless a later persistence phase is explicitly approved.

Suggested validation:

- Tests for advance, reset, repeat advance, and no advance before recap preview.
- Search proving no save writes, browser storage, backend calls, SQLite gameplay writes, or durable history.

## Phase 9+: World-State Deltas, Persistence, And Richer Simulation Systems

Type: Domain-only first, then UI + domain integration after approval.

Objective:
Only after v0.1 is playable in memory, define durable world-state changes, persistence boundaries, and richer simulation systems.

Existing systems to reuse:

- Current deterministic simulation spine.
- Existing hidden/player-facing signal boundaries.
- Identity-only SQLite foundation only as a foundation reference, not gameplay payload approval.
- Docs from the simulation gaps dossier.

New files likely needed:

- `src/game/domain/worldStateDeltaContract.ts`
- `src/game/domain/nonMutatingConsequencePreviewContract.ts`
- `src/game/persistence/gameplaySavePayloadBoundary.ts` only after explicit persistence approval.
- SQLite migrations only after the persistence phase is explicitly approved.

Explicitly blocked capabilities until separately approved:

- Gameplay payload persistence.
- SQLite gameplay writes.
- Save load/list UI wiring.
- Durable roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated-text, or GenAI persistence.
- Full match outcomes and consequence application.
- GenAI dramatization.

Exit criteria:

- Durable delta contracts are documented and tested before persistence.
- Persistence scope is explicitly approved before schema or repository work.
- Gameplay consequences have hidden/player-facing boundaries and deterministic tests.
- GenAI remains downstream dramatization over structured truth only after core systems work.

Suggested validation:

- Contract tests for stable ordering, same-seed replay, and no hidden formula leakage.
- Migration tests only after persistence is approved.
- `rg "Math\\.random" src tests` remains clean.
- Explicit no-GenAI and no-generated-text checks until that phase is approved.

## Recommended Next Implementation Slice

The recommended next implementation slice is:

Local-only player session state plus correct initial flow state.

This should be a narrow runtime implementation prompt after this docs-only task. It should formalize the current UI shell's ephemeral state boundary, keep Game Landing / Title Screen as the first screen, keep setup/GM/brand/candidate selections in memory only, preserve locked draft/show actions, and prove that reload resets the session without browser storage.

It should not execute draft picks, create roster state, persist saves, call SQLite, use backend APIs, run GenAI, start Week 1 gameplay, or advance weeks.

## Recommended Next Implementation Prompt

Use the repo-local gm-backend-simulation-architect skill.

We are working in `C:\Users\vinni\OneDrive\Documents\next_gm`.

Goal: implement the first Playable New GM Mode v0.1 slice: local-only player session state plus correct initial flow state.

Before editing, read:

- `docs/playable-new-gm-mode-to-playable-roadmap.md`
- `docs/playable-new-gm-mode-roadmap.md`
- `docs/ui-ux-doctrine.md`
- `docs/new-gm-real-draft-system-architecture.md`
- `ui/playable-new-gm-mode/index.html`
- `ui/playable-new-gm-mode/app.js`
- `ui/playable-new-gm-mode/styles.css`

Scope:

- Add or refine a small local-only session state controller for the playable UI shell.
- Preserve Game Landing / Title Screen as the first screen.
- Preserve Start New Game -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft.
- Keep selected GM, selected brand, setup choices, focused candidate, and current flow step in memory only.
- Reload must reset the session.
- Keep Make Pick, Auto Draft, Draft Recap transition, Book Show, Run Show, and Week Advance locked unless already static/mock.

Hard blocks:

- Do not use `localStorage`, `sessionStorage`, `indexedDB`, URL hash state, or query params for gameplay state.
- Do not call draft pick creation, execution, roster assignment, roster state creation, draft completion, or `createNewGMModeInMemoryDraftFlow()`.
- Do not add save payload persistence or SQLite gameplay writes.
- Do not call backend APIs.
- Do not add GenAI or generated text.
- Do not broad-refactor the UI shell.

Validation:

- Add focused tests or a lightweight browser/static smoke check proving default initial state, local transitions, reset behavior, and no storage usage.
- Run `git diff --check`.
- Run only the focused validation needed for this UI slice.
- Report files changed, validation results, storage grep result, and any remaining blocked capabilities.
