# Playable New GM Mode Roadmap

## Current Baseline

- Foundation is snapshotted and stable at 100/100.
- Real Draft System v1.0 is snapshotted and stable at 100/100.
- Playable New GM Mode starts from 20/100 after the baseline commit.
- The next work must remain static/mock-first until read-only integration is explicitly approved.

## Source Doctrine

`docs/ui-ux-doctrine.md` establishes the first player-facing path:

1. Compact macOS Dock-inspired bottom dock, not a top rail, side rail, or full-width website navbar.
2. Game Landing / Title Screen as the first screen, not Save Selection or Dashboard.
3. Title-screen actions: Start New Game -> Contract Signing, Select Save / Continue -> Save Selection, Settings -> Settings.
4. Multi-screen New Game setup: Contract Signing, Setup Basics, optional Assistant Setup, Choose GM, Select Brand.
5. Initial Draft as the active draft broadcast surface.
6. Draft Recap as the first post-draft surface.
7. Brand Dashboard / Week 1 Setup as the post-draft home base.
8. Read-only integration only after approval.
9. Real mutations only after explicit approval.

The visual doctrine locks the prototype to a premium dark wrestling/sports-broadcast identity:

1. Raw, SmackDown, NXT, and AEW brand palettes are implemented through CSS variables and `body.brand-*` classes.
2. The app keeps one shared layout, typography, navigation, and component system across all brands.
3. Brand colors affect hero lighting, selected states, active nav, major CTAs, borders, and screen identity.
4. Dense management screens stay neutral/dark with brand accents.
5. Anti-botch rules are hard requirements: no full-page scrolling, no text overflow, no bubbly/circle-heavy cards, no pill overload, no generic SaaS look, and no scattered hardcoded colors.

`docs/new-gm-real-draft-system-architecture.md` establishes the draft boundary:

1. The Real Draft System v1.0 is approved real domain behavior only inside pure deterministic in-memory flow.
2. Playable mode must not treat draft completion as approval for gameplay start, Week 1, persistence payloads, UI wiring, generated text, or GenAI.
3. Future work should compose the existing draft services instead of rebuilding draft objects or parallel services.

## First Safe Vertical Slice

The safest first implementation slice is UI shell-only, static/mock-first:

- Create a minimal viewport-first app shell with the compact bottom dock.
- Refine the dock into a compact bottom-centered glass control surface that keeps icons visible, shows the active section label, expands on hover/focus, overlays the viewport, and never pushes content up or down.
- Add a static Game Landing / Title Screen as the default startup screen.
- Add static Save Selection screen affordances using clearly fake save-card data.
- Add static Contract Signing, Setup Basics, optional Assistant Setup, Choose GM, and Select Brand placeholders.
- Add a static Initial Draft surface using mock talent, pick order, roster needs, and confirmation preview.
- Add a static Draft Recap surface focused on the player's grouped roster.
- Add a static Brand Dashboard / Week 1 Setup surface with the guided checklist.
- Add a tokenized Raw / SmackDown / NXT / AEW visual palette system.
- Keep all screens viewport-first with contained scrolling only.
- Use sharper sports-broadcast/glass panels instead of bubbly dashboard cards.
- Do not call draft services from UI.
- Do not create routes until separately approved.
- Do not create save payload persistence.
- Do not mutate gameplay state.
- Add or use `npm run preview:playable-ui` for local static preview and report the URL, first screen, manual/browser QA, Git branch, commit, ahead/behind origin, worktree state, and push status after every UI slice.

## Locked Static Flow Direction

Current static UI work must preserve this order:

Game Landing / Title Screen -> Select Save / Continue -> Save Selection -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft -> Draft Recap -> Brand Dashboard / Week 1 Setup.

Start New Game from the title screen may go directly to Contract Signing. The player must be able to start a new game without an existing save.

The Assistant Setup step is optional and skippable. It may preview assistant activation and privacy controls, but it must not call AI services or persist keys.

Select Brand is a fantasy/story choice only. All brands begin with the same money, prestige, resources, and baseline difficulty.

Draft Preview is only pre-draft/during-draft language. After the initial draft, the correct surface is Draft Recap first, then Brand Dashboard / Week 1 Setup.

This slice proves player-facing structure without crossing into gameplay execution.

Future Codex UI work must preserve the anti-botch visual rules:

- No text overflow.
- No full-page scrolling.
- No bubbly cards.
- No circle-heavy UI.
- No pill overload.
- No generic SaaS look.
- Use viewport-first contained panels.
- Use CSS variables/tokens.
- Preserve premium wrestling/sports broadcast identity.
- Use Raw/SmackDown/NXT/AEW brand palettes.
- Avoid hardcoded random colors.

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
- Normalize static UI colors through base and brand CSS variables.

### 50/100: Static Setup Review And Draft-Night Preview

- Add setup review summary.
- Add draft-night preview shell.
- Show transition affordance without draft execution.
- Keep draft action disabled or mock-only.
- Ensure Draft Preview language appears only before or during draft, never after Draft Recap.

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
