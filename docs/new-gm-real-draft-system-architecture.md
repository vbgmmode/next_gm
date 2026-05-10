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

The safest path from the completed Real Draft System v1.0 toward Playable New GM Mode is:

1. Save selection/read-only setup screen planning
   - Use the existing identity-only persistence boundary.
   - Do not introduce gameplay save payload persistence.
   - Keep save selection and setup screen plans read-only until explicitly approved.

2. New GM setup domain-to-UI handoff
   - Define what setup data the UI can safely display.
   - Keep setup state non-mutating unless a separate setup persistence slice is approved.

3. Static/mock Draft Board UI using `docs/ui-ux-doctrine.md`
   - Build draft-board layout and interaction affordances with mock/dev fixture data.
   - Do not wire real draft execution from UI yet.

4. Read-only domain-backed Draft Board
   - Read from the static candidate object set and readiness summaries.
   - Display candidate availability and eligibility without mutating draft state.

5. Player-triggered selection intent wiring
   - Convert a UI selection into a `Draft Selection Intent` object.
   - Keep the result in memory unless persistence is explicitly approved.

6. In-memory draft flow button/action
   - Invoke `createNewGMModeInMemoryDraftFlow()` from an explicitly approved UI action.
   - Keep gameplay start, Week 1 initialization, persistence, generated text, and GenAI blocked.

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

## Git Snapshot Recommendation

The current worktree has many modified and untracked files across docs, domain code, engines, persistence, tests, skills, and package metadata. Before starting a major new implementation phase, stage or snapshot the current Real Draft System work so future changes can be reviewed against a stable baseline.

This is especially important before UI work, playable-mode wiring, or any persistence-adjacent slice.
