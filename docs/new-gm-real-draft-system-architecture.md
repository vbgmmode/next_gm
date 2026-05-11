# New GM Mode Real Draft System Architecture Map v1.0

This document is the canonical architecture map for the completed New GM Mode Real Draft System v1.0.

The Real Draft System is now approved real gameplay-domain behavior, but only inside a pure deterministic in-memory domain flow. It can validate a draft selection intent against the static candidate set, create draft pick objects, execute a draft pick as an in-memory domain step, create a roster assignment result, create an in-memory roster state object, and summarize draft completion.

Playable New GM Mode is still separate and blocked. The completed draft pipeline must not be treated as approval for gameplay start, Week 1 initialization, persistence, UI wiring, generated text, or GenAI.

## Canonical v1 Flow

1. Draft Selection Intent
   - Source object: `src/game/domain/newGMModeDraftSelectionIntentObject.ts`
   - Purpose: Captures the explicit player or caller intent to select a candidate for a brand and draft slot.
   - Layer type: inert object guardrail.

2. Draft Pick Validation Service
   - Source file: `src/game/domain/newGMModeDraftPickValidationService.ts`
   - Purpose: Validates the selection intent structure, candidate lookup, fixture/wrestler reference match, candidate eligibility, brand reference, draft round, and draft pick number.
   - Output: `Draft Pick Validation Result Object`.
   - Layer type: real v1 domain behavior.

3. Draft Pick Creation Service
   - Source file: `src/game/domain/newGMModeDraftPickCreationService.ts`
   - Purpose: Creates a draft pick object from an approved validation result, or creates a blocked draft pick object from a blocked or malformed validation result.
   - Output status examples:
     - `draft-pick-created-execution-ready`
     - `draft-pick-creation-blocked`
   - Layer type: real v1 domain behavior.

4. Draft Pick Execution Service
   - Source file: `src/game/domain/newGMModeDraftPickExecutionService.ts`
   - Purpose: Executes an execution-ready draft pick as a pure in-memory domain step and creates an execution result object.
   - Output status examples:
     - `draft-pick-executed-roster-assignment-ready`
     - `draft-pick-execution-blocked`
   - Layer type: real v1 domain behavior.

5. Roster Assignment Service
   - Source file: `src/game/domain/newGMModeDraftPickRosterAssignmentService.ts`
   - Purpose: Converts a roster-assignment-ready execution result into an in-memory roster assignment result object and derives an inert deterministic roster slot reference.
   - Output status examples:
     - `roster-assignment-created-roster-state-ready`
     - `roster-assignment-blocked`
   - Layer type: real v1 domain behavior.

6. Roster State Creation Service
   - Source file: `src/game/domain/newGMModeRosterStateCreationService.ts`
   - Purpose: Creates a frozen in-memory roster state object from one or more roster assignment result objects, builds deterministic membership references, preserves source assignment result IDs, and blocks duplicate wrestler membership within the same brand roster.
   - Output status examples:
     - `roster-state-created-draft-complete-gameplay-start-blocked`
     - `roster-state-creation-blocked`
   - Layer type: real v1 domain behavior.

7. Draft Completion Summary
   - Source file: `src/game/domain/newGMModeDraftCompletionSummary.ts`
   - Purpose: Validates the roster state object, reports whether the draft is complete in memory, surfaces roster membership count and brand roster references, and keeps gameplay start and adjacent capabilities blocked.
   - Output phase examples:
     - `draft-complete-in-memory-roster-created-gameplay-start-blocked`
     - `draft-completion-blocked`
   - Layer type: real v1 domain behavior.

8. One-shot In-Memory Draft Flow
   - Source file: `src/game/domain/newGMModeInMemoryDraftFlow.ts`
   - Purpose: Runs the canonical pipeline in order:
     1. validate draft pick
     2. create draft pick
     3. execute draft pick
     4. create roster assignment result
     5. create roster state object
     6. create draft completion summary
   - Output: A frozen flow result containing all intermediate objects and summaries.
   - Layer type: real v1 domain behavior.

## Canonical v1 Files

These files power the real v1 in-memory draft flow and should be reused instead of rebuilt:

- `src/game/domain/newGMModeDraftPickValidationService.ts`
- `src/game/domain/newGMModeDraftPickCreationService.ts`
- `src/game/domain/newGMModeDraftPickExecutionService.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentService.ts`
- `src/game/domain/newGMModeRosterStateCreationService.ts`
- `src/game/domain/newGMModeDraftCompletionSummary.ts`
- `src/game/domain/newGMModeInMemoryDraftFlow.ts`
- `src/game/domain/index.ts`

## Support Guardrail Files

### Candidate Objects and Readiness

- `src/game/domain/newGMModeDraftPickCandidateObject.ts`
- `src/game/domain/newGMModeDraftPickCandidateObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickCandidateReadinessSummary.ts`
- `src/game/domain/newGMModeStaticWrestlerFixtureCatalogShell.ts`
- `src/game/domain/newGMModeStaticWrestlerFixtureValidatorShell.ts`
- `src/game/domain/newGMModeStaticWrestlerFixtureValidationSummaryShell.ts`

Layer types:
- Candidate object set: inert object guardrail.
- Candidate validator: inert object guardrail.
- Candidate readiness summary: readiness summary.
- Static wrestler fixtures: static catalog and guardrail shell.

### Selection Intent Guardrails

- `src/game/domain/newGMModeDraftSelectionIntentContractShell.ts`
- `src/game/domain/newGMModeDraftSelectionIntentObject.ts`
- `src/game/domain/newGMModeDraftSelectionIntentObjectValidator.ts`
- `src/game/domain/newGMModeDraftSelectionIntentReadinessSummary.ts`

Layer types:
- Contract shell: boundary contract.
- Selection intent object: inert object guardrail.
- Validator: inert object guardrail.
- Readiness summary: readiness summary.

### Validation Result Guardrails

- `src/game/domain/newGMModeDraftPickValidationIssueCatalog.ts`
- `src/game/domain/newGMModeDraftPickValidationResultContractShell.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObject.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObjectReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickValidationResultReadinessSummary.ts`

Layer types:
- Issue catalog: static catalog.
- Contract shell: boundary contract.
- Validation result object: inert object guardrail reused by real v1 behavior.
- Validator: inert object guardrail.
- Readiness summaries: readiness summaries.

### Draft Pick Object Guardrails

- `src/game/domain/newGMModeDraftPickObjectBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftPickObjectContractShell.ts`
- `src/game/domain/newGMModeDraftPickObject.ts`
- `src/game/domain/newGMModeDraftPickObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickObjectReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickCreationBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftPickCreationReadinessSummary.ts`

Layer types:
- Blocked reason catalog: static catalog.
- Contract and creation boundary shells: boundary contracts.
- Draft pick object: inert object guardrail reused by real v1 behavior.
- Validator: inert object guardrail.
- Readiness summaries: readiness summaries.

### Execution Result Guardrails

- `src/game/domain/newGMModeDraftPickExecutionBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftPickExecutionBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftPickExecutionReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultContractShell.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObject.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObjectReadinessSummary.ts`

Layer types:
- Blocked reason catalog: static catalog.
- Execution and result contract shells: boundary contracts.
- Execution readiness summary: readiness summary.
- Execution result object: inert object guardrail reused by real v1 behavior.
- Validator: inert object guardrail.
- Object readiness summary: readiness summary.

### Roster Assignment Result Guardrails

- `src/game/domain/newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultContractShell.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObject.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObjectReadinessSummary.ts`

Layer types:
- Blocked reason catalog: static catalog.
- Assignment and result contract shells: boundary contracts.
- Assignment readiness summary: readiness summary.
- Roster assignment result object: inert object guardrail reused by real v1 behavior.
- Validator: inert object guardrail.
- Object readiness summary: readiness summary.

### Roster State Guardrails

- `src/game/domain/newGMModeRosterStateBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeRosterStateBoundaryContractShell.ts`
- `src/game/domain/newGMModeRosterStateReadinessSummary.ts`
- `src/game/domain/newGMModeRosterStateContractShell.ts`
- `src/game/domain/newGMModeRosterStateObject.ts`
- `src/game/domain/newGMModeRosterStateObjectValidator.ts`
- `src/game/domain/newGMModeRosterStateObjectReadinessSummary.ts`

Layer types:
- Blocked reason catalog: static catalog.
- Boundary and contract shells: boundary contracts.
- Roster state readiness summary: readiness summary.
- Roster state object: inert object guardrail reused by real v1 behavior.
- Validator: inert object guardrail.
- Object readiness summary: readiness summary.

### Gameplay Start and Draft Completion Boundaries

- `src/game/domain/newGMModeGameplayStartBoundaryContractShell.ts`
- `src/game/domain/newGMModeGameplayStartReadinessSummary.ts`
- `src/game/domain/newGMModeDraftCompletionBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftCompletionBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftCompletionSummary.ts`

Layer types:
- Gameplay start boundary: boundary contract.
- Gameplay start readiness summary: readiness summary.
- Draft completion blocked reason catalog: static catalog.
- Draft completion boundary shell: boundary contract.
- Draft completion summary: real v1 domain behavior.

## Layer Classification

### Real v1 Domain Behavior

These files contain approved real deterministic in-memory draft-domain behavior:

- `src/game/domain/newGMModeDraftPickValidationService.ts`
- `src/game/domain/newGMModeDraftPickCreationService.ts`
- `src/game/domain/newGMModeDraftPickExecutionService.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentService.ts`
- `src/game/domain/newGMModeRosterStateCreationService.ts`
- `src/game/domain/newGMModeDraftCompletionSummary.ts`
- `src/game/domain/newGMModeInMemoryDraftFlow.ts`

### Inert Object Guardrails

These files define and validate object shapes that the real v1 services reuse:

- `src/game/domain/newGMModeDraftSelectionIntentObject.ts`
- `src/game/domain/newGMModeDraftSelectionIntentObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickCandidateObject.ts`
- `src/game/domain/newGMModeDraftPickCandidateObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObject.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickObject.ts`
- `src/game/domain/newGMModeDraftPickObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObject.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObjectValidator.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObject.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObjectValidator.ts`
- `src/game/domain/newGMModeRosterStateObject.ts`
- `src/game/domain/newGMModeRosterStateObjectValidator.ts`

### Boundary Contracts

These files define future boundaries that are still blocked:

- `src/game/domain/newGMModeDraftPickCreationBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftPickExecutionBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentBoundaryContractShell.ts`
- `src/game/domain/newGMModeRosterStateBoundaryContractShell.ts`
- `src/game/domain/newGMModeGameplayStartBoundaryContractShell.ts`
- `src/game/domain/newGMModeDraftCompletionBoundaryContractShell.ts`

### Readiness Summaries

These files summarize structural readiness without adding side effects:

- `src/game/domain/newGMModeDraftSelectionIntentReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickCandidateReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickValidationResultObjectReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickCreationReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickObjectReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickExecutionReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickExecutionResultObjectReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentReadinessSummary.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentResultObjectReadinessSummary.ts`
- `src/game/domain/newGMModeRosterStateReadinessSummary.ts`
- `src/game/domain/newGMModeRosterStateObjectReadinessSummary.ts`
- `src/game/domain/newGMModeGameplayStartReadinessSummary.ts`

### Static Catalogs

These files provide stable ordered IDs and blocked reason catalogs:

- `src/game/domain/newGMModeDraftPickValidationIssueCatalog.ts`
- `src/game/domain/newGMModeDraftPickObjectBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftPickExecutionBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeRosterStateBlockedReasonCatalog.ts`
- `src/game/domain/newGMModeDraftCompletionBlockedReasonCatalog.ts`

## Blocked Capabilities

The Real Draft System v1.0 can complete an in-memory draft pipeline and produce an in-memory roster state object. The following capabilities remain blocked:

- Gameplay start.
- Week 1 initialization.
- Persistence and gameplay save payloads.
- SQLite writes beyond the approved identity-only shells.
- UI and routes.
- Generated text.
- GenAI.
- Match, show, week, calendar, finance, fan, social, or business gameplay state.
- Championship or division assignment.

This means `createNewGMModeInMemoryDraftFlow()` is a domain pipeline, not a playable-mode entry point by itself.

## Next Playable New GM Mode Entry Points

The static Playable New GM Mode shell is visually stable. The next phase is controlled playable draft wiring, not a Real Draft System rebuild.

The safest path from the completed Real Draft System v1.0 toward Playable New GM Mode is:

1. Read-only draft room adapter
   - Project existing static candidate/readiness data into a UI-safe draft-board view model.
   - Display eligibility, availability, roster needs, and blocked reasons without creating a pick, executing a pick, assigning a roster, or creating roster state.
   - Do not call `createNewGMModeInMemoryDraftFlow()` in this slice.

2. Local-only setup state controller
   - Track only ephemeral screen/session state needed to move from Landing through Select Brand into Initial Draft.
   - Keep selected GM, selected brand, setup basics, assistant choice, and current flow step in memory only.
   - Do not create save payloads, browser storage, SQLite writes, routes, or backend calls.

3. Selection intent preview
   - Convert a UI candidate click into an in-memory `Draft Selection Intent` preview.
   - Validate the intent only through the existing v1 validation service path after that slice is explicitly approved.
   - Keep validation output as a UI-safe status; do not execute the draft pick yet.

4. Explicit in-memory draft action
   - Invoke the existing Real Draft System v1.0 pipeline from one approved player action.
   - Prefer `createNewGMModeInMemoryDraftFlow()` for the one-shot local draft path, or compose the v1 services in the documented order if the UI needs a step-by-step draft loop.
   - Keep the result local to the page lifetime.

5. Draft Recap projection
   - Transition from Initial Draft to Draft Recap only after the in-memory draft completion summary reports the approved completed-draft status.
   - Render the player's drafted roster from the in-memory roster state object and roster assignment result projection.
   - Group the roster by safe display buckets such as men's division, women's division, tag teams, prospects, and unassigned/TBD only when those buckets are available from approved static metadata.

6. Blocked post-recap handoff
   - Brand Dashboard / Week 1 Setup may show a blocked next-step state.
   - Gameplay start, Week 1 initialization, booking, show execution, fan/social/business systems, persistence, generated text, GenAI, championship assignment, and division assignment remain blocked until separately approved.

## Do Not Rebuild

Do not recreate the Real Draft System through new parallel draft pick objects, execution result objects, roster assignment objects, or roster state objects.

The completed v1.0 path already reuses the guardrail object layer and extends it with approved real deterministic statuses. Future work should compose these existing services:

- `createNewGMModeDraftPickValidationService()`
- `createNewGMModeDraftPickCreationService()`
- `createNewGMModeDraftPickExecutionService()`
- `createNewGMModeDraftPickRosterAssignmentService()`
- `createNewGMModeRosterStateCreationService()`
- `createNewGMModeDraftCompletionSummary()`
- `createNewGMModeInMemoryDraftFlow()`

If a future feature needs a broader flow, add a narrow orchestration layer around the existing services instead of introducing a second draft-system model.

## Minimum Local-Only Draft State

The first playable draft wiring should keep state minimal and disposable:

- `flowStep`: current screen, current setup step, and whether the player is in setup, draft, recap, or blocked post-draft handoff.
- `setupDraft`: selected GM archetype ID, selected brand ID, setup basics choices, assistant setup choice, and local-only draft session label.
- `draftBoard`: candidate IDs, availability/eligibility projection, roster need hints, selected candidate ID, and validation status.
- `draftResult`: completed pick result, roster assignment projection, in-memory roster state object, and draft completion summary after the approved action runs.
- `uiOnly`: filters, focused row, confirmation modal state, and non-persisted presentation toggles.

All of this state resets on reload. It must not use URL hash state, `localStorage`, `sessionStorage`, `indexedDB`, save payload mutation, SQLite, or backend calls.

## First Recommended Implementation Slice

Build a read-only draft room adapter and UI projection.

That slice should:

- Reuse existing static candidate/readiness data.
- Produce a UI-safe draft-board model for Initial Draft.
- Prove through focused tests that the adapter does not execute picks, assign rosters, create roster state, write saves, call storage, call backend APIs, or call GenAI.
- Leave all player draft actions disabled or preview-only.

It should not call `createNewGMModeInMemoryDraftFlow()` yet. The one-shot in-memory draft action should wait for a separate explicitly approved slice.
