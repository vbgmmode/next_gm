# Playable New GM Mode Roadmap

## Current Baseline

- Foundation is snapshotted and stable at 100/100.
- Real Draft System v1.0 is snapshotted and stable at 100/100.
- Playable New GM Mode now has a visually stable static/mock shell.
- The current branch includes the landing/title screen flow, expanded GM archetypes, dashboard command hero, bottom dock shell, and dark broadcast typography pass.
- The next work must move through controlled read-only and local-only draft wiring before any player-triggered in-memory draft action is approved.

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

## Completed Static Shell Baseline

The first safe UI shell slice is complete and remains the player-facing baseline:

- Create a minimal viewport-first app shell with the compact bottom dock.
- Refine the dock into a compact bottom-centered glass control surface that keeps icons visible, shows the active section label, expands on hover/focus, overlays the viewport, and never pushes content up or down.
- Add a static Game Landing / Title Screen as the default startup screen.
- Add static Save Selection screen affordances using clearly fake save-card data.
- Add static Contract Signing, Setup Basics, optional Assistant Setup, Choose GM, and Select Brand placeholders.
- Choose GM presents 12 fictional GM archetypes with compact numerical stat meters.
- Add a static Initial Draft surface using mock talent, pick order, roster needs, and confirmation preview.
- Add a static Draft Recap surface focused on the player's grouped roster.
- Add a static Brand Dashboard / Week 1 Setup surface with the guided checklist.
- Brand Dashboard hero prioritizes This Week's Show, Brand Health, and GM Alerts before supporting budget/fan/momentum context.
- Add a tokenized Raw / SmackDown / NXT / AEW visual palette system.
- Keep all screens viewport-first with contained scrolling only.
- Use sharper sports-broadcast/glass panels instead of bubbly dashboard cards.
- Do not call draft services from UI.
- Do not create routes until separately approved.
- Do not create save payload persistence.
- Do not mutate gameplay state.
- Add or use `npm run preview:playable-ui` for local static preview and report the URL, first screen, manual/browser QA, Git branch, commit, ahead/behind origin, worktree state, and push status after every UI slice.

## Next Phase: Controlled Playable Draft Wiring Plan

The next phase should consume Real Draft System v1.0 in stages. It must not rebuild the draft system and must not jump directly from static UI into persistence, gameplay start, or Week 1 behavior.

### Existing Services To Reuse

Future implementation should compose these existing services:

- `createNewGMModeDraftPickValidationService()`
- `createNewGMModeDraftPickCreationService()`
- `createNewGMModeDraftPickExecutionService()`
- `createNewGMModeDraftPickRosterAssignmentService()`
- `createNewGMModeRosterStateCreationService()`
- `createNewGMModeDraftCompletionSummary()`
- `createNewGMModeInMemoryDraftFlow()`

`createNewGMModeInMemoryDraftFlow()` is the canonical one-shot in-memory draft pipeline. It should be used only after the UI has a safe local-only draft session boundary and the slice explicitly approves a player-triggered in-memory draft action.

### Screens That Become State-Aware First

1. Contract Signing, Setup Basics, Assistant Setup, Choose GM, and Select Brand should become local setup-state screens before draft execution is introduced.
2. Initial Draft should become state-aware as a read-only draft board first: candidate rows, eligibility, availability, roster need hints, selected candidate preview, and blocked action status.
3. Draft Recap should become a projection target for the in-memory draft completion result only after the approved draft action exists.
4. Brand Dashboard / Week 1 Setup should remain a blocked post-draft handoff until gameplay start is separately approved.

Landing, Save Selection, and Settings can remain static/mock during the first playable wiring slice. Save Selection must not become real save/load behavior.

### Minimum In-Memory State

The first playable wiring phase needs only disposable local state:

- `flowStep`: current screen and whether the player is in setup, draft, recap, or blocked post-draft handoff.
- `setupDraft`: selected GM archetype ID, selected brand ID, setup basics choices, assistant setup choice, and local-only draft session label.
- `draftBoard`: candidate IDs, availability/eligibility projection, roster need hints, selected candidate ID, and validation status.
- `draftResult`: completed pick result, roster assignment projection, in-memory roster state object, and draft completion summary after the approved action runs.
- `uiOnly`: focused row, filter toggles, confirmation modal state, and presentation-only selections.

This state must reset on reload. It must not use URL routing, URL hash state, `localStorage`, `sessionStorage`, `indexedDB`, save payload mutation, SQLite, or backend calls.

### What Stays Mock Or Blocked First

The first playable wiring slice should keep these static, disabled, or blocked:

- Real Save Selection / Continue behavior.
- Settings persistence and API key persistence.
- Assistant behavior, generated text, GenAI, or OpenAI calls.
- Budget/fans/momentum calculations.
- Championship assignment, division assignment, rivalries, promises, injuries, morale, and contracts.
- Week 1 initialization, booking, show execution, match engine, fan reaction, social discourse, finance, business, calendar, and progression.
- Any roster mutation outside the approved local in-memory draft result.

### Initial Draft To Draft Recap Transition

Initial Draft should transition to Draft Recap only after an approved local-only in-memory draft action returns a draft completion summary with the completed in-memory roster-created status.

Draft Recap should display the player's drafted roster grouped by safe display buckets:

- Men's division.
- Women's division.
- Tag teams.
- Prospects/developmental.
- Unassigned/TBD when approved static metadata does not support a cleaner grouping.

The recap may show pick order, wrestler/candidate identity, role, brand fit, and roster need coverage from approved static/domain data. It must not assign championships, initialize divisions, start Week 1, create a save payload, or persist the roster.

### Recommended First Implementation Slice

Build a read-only draft room adapter and Initial Draft UI projection.

The slice should:

- Reuse existing static candidate/readiness data.
- Produce a UI-safe draft-board view model.
- Replace mock Initial Draft rows with read-only projected candidate rows.
- Keep player selection disabled or preview-only.
- Add focused tests proving no draft execution, roster assignment, roster state creation, save writes, browser storage, backend calls, or GenAI calls occur.

The slice should not call `createNewGMModeInMemoryDraftFlow()` yet. That belongs in a later explicit in-memory draft action slice.

## Locked Flow Direction

Playable New GM Mode must preserve these entry paths:

- Landing / Title Screen -> Start New Game -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft -> Draft Recap -> Brand Dashboard / Week 1 Setup.
- Landing / Title Screen -> Select Save / Continue -> Save Selection.
- Landing / Title Screen -> Settings -> Settings.

The player must be able to start a new game without an existing save.

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

## Roadmap To Playable New GM Mode v0

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

### 60/100: Read-Only Draft Room Adapter

- Define and implement a narrow adapter contract for safe display data.
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
