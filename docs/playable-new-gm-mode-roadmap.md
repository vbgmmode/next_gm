# Playable New GM Mode Roadmap

## Current Baseline

- Foundation is snapshotted and stable at 100/100.
- Real Draft System v1.0 is snapshotted and stable at 100/100.
- Playable New GM Mode starts from 20/100 after the baseline commit.
- The next work must remain static/mock-first until read-only integration is explicitly approved.

## Source Doctrine

`docs/ui-ux-doctrine.md` establishes the first player-facing path:

1. App shell and navigation planning.
2. Static Save Selection.
3. Static New GM Setup.
4. Static setup review or draft-night preview.
5. Read-only integration only after approval.
6. Real mutations only after explicit approval.

`docs/new-gm-real-draft-system-architecture.md` establishes the draft boundary:

1. The Real Draft System v1.0 is approved real domain behavior only inside pure deterministic in-memory flow.
2. Playable mode must not treat draft completion as approval for gameplay start, Week 1, persistence payloads, UI wiring, generated text, or GenAI.
3. Future work should compose the existing draft services instead of rebuilding draft objects or parallel services.

## First Safe Vertical Slice

The safest first implementation slice is UI shell-only, static/mock-first:

- Create a minimal app shell plan and screen structure for the first playable flow.
- Add static Save Selection screen affordances using clearly fake save-card data.
- Add static New GM Setup screen affordances using clearly fake setup choices.
- Add a static setup review or draft-night preview placeholder.
- Do not call draft services from UI.
- Do not create routes until separately approved.
- Do not create save payload persistence.
- Do not mutate gameplay state.

This slice proves player-facing structure without crossing into gameplay execution.

## Roadmap From 20/100 To 100/100

### 25/100: Static Playable Flow Plan

- Create this roadmap.
- Confirm first slice scope, blocked capabilities, and later service consumption path.
- No source or test changes.

### 30/100: UI Shell File Scaffold Only

- Add frontend file structure for app shell and static screens.
- No route wiring if routing is not already present.
- No backend calls.
- No state mutation.

### 40/100: Static Save Selection And Setup Screens

- Build static/mock Save Selection.
- Build static/mock New GM Setup.
- Include invalid/corrupt save visual states as mock-only.
- Keep all data fake or fixture-labeled.

### 50/100: Static Setup Review And Draft-Night Preview

- Add setup review summary.
- Add draft-night preview shell.
- Show transition affordance without draft execution.
- Keep draft action disabled or mock-only.

### 60/100: Read-Only Domain Adapter Planning

- Define a narrow adapter contract for safe display data.
- Allow only read-only projection from existing setup/readiness/static candidate data.
- Do not call draft execution services yet.
- Do not persist gameplay payloads.

### 70/100: Read-Only Candidate And Readiness Display

- Consume static candidate/readiness data through an approved adapter.
- Display draft-board availability and setup readiness without mutation.
- Keep player selection inert or disabled.

### 80/100: Selection Intent Adapter

- Convert a player choice into an in-memory `Draft Selection Intent` object.
- Validate intent through the existing service path only after explicit approval.
- Do not execute draft pick or assign roster yet.

### 90/100: Approved In-Memory Draft Action

- Wire one explicit in-memory draft action to the existing v1 flow.
- Consume `createNewGMModeInMemoryDraftFlow()` instead of rebuilding the pipeline.
- Keep gameplay start, Week 1, persistence payloads, generated text, and GenAI blocked.

### 100/100: Playable New GM Mode v0 Boundary

- Complete the approved in-memory new-GM setup to draft completion path.
- Provide a clear blocked state after draft completion.
- Do not advance week, initialize booking, persist gameplay payloads, or run show/fan/social/business systems until separately approved.

## Existing Real Draft Services To Consume Later

Future implementation must reuse these services and must not recreate parallel versions:

- `createNewGMModeDraftPickValidationService()`
- `createNewGMModeDraftPickCreationService()`
- `createNewGMModeDraftPickExecutionService()`
- `createNewGMModeDraftPickRosterAssignmentService()`
- `createNewGMModeRosterStateCreationService()`
- `createNewGMModeDraftCompletionSummary()`
- `createNewGMModeInMemoryDraftFlow()`

## Recommended Next Slice

The next slice should be UI shell-only.

Recommended file targets, subject to existing app structure discovery:

- Static app shell entry point.
- Static Save Selection screen.
- Static New GM Setup screen.
- Static setup review or draft-night preview screen.
- Shared mock data file for clearly fake save/setup states.
- A short manual verification note or checklist if no test harness exists for UI yet.

The next slice should not touch backend source, tests, persistence, draft services, or gameplay systems unless discovery shows a minimal frontend boundary file is required.

## Blocked Until Later Approval

- React route wiring.
- Real save creation or save payload persistence.
- SQLite writes beyond identity-only foundation.
- Draft execution from UI.
- Roster assignment from UI.
- Gameplay start.
- Week 1 initialization.
- Calendar, booking, show, match, fan, social, finance, business, championship, or division behavior.
- Generated text or GenAI.
