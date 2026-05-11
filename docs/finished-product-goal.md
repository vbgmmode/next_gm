# Finished Product Goal

## Objective

Build Next GM into a finished playable wrestling GM simulation game.

The finished product should let a player:

Start New Game
→ Select brand
→ Draft/sign roster with budget
→ Assign champions
→ Create and evolve rivalries
→ Book weekly shows
→ Run shows
→ See match, show, fan, social, finance, morale, momentum, fatigue, and rivalry consequences
→ Advance week to week
→ Build toward PLEs/special events
→ Save and load the game
→ Continue a persistent GM season

The goal is a finished product, not a temporary local prototype.

## Current State

Based on the current repo files and focused playable tests:

- Drafting with budget works.
- The full static roster universe exists and has broad Raw, SmackDown, NXT, and AEW coverage.
- Drafted talent is signed to the selected player brand.
- Source roster is only Drafted From / Source Pool metadata.
- Brand-specific championship setup works.
- Rivalry setup works.
- Week 1 HQ exists in the local playable flow.
- A local weekly booking builder exists and supports signed-talent matches, promos, main events, Run Show, Show Recap, local consequence summaries, Week 2 advancement, and repeatable local weekly booking.
- A non-persistent gameplay state model contract exists for the future save/session shape, including brand, week, budget, roster, champions, rivalries, show cards, results, superstar state, local consequences, and week history.
- An initial save payload contract exists around the gameplay state model, but it does not write, read, list, delete, or persist saves yet.
- A deterministic save payload serializer/parser exists for compatibility checks, but it still does not write to durable storage.
- A backend SQLite durable payload write/read shell exists for the serialized gameplay payload, scoped to controlled local save files.
- A backend durable save orchestration shell exists for creating a new save slot from the gameplay state model and continuing a save by reading the stored payload summary.
- The playable preview host exposes a local save API and the UI can request Save Current Session / Continue Last Save with basic rehydration for brand, roster, champions, rivalries, week state, saved show summaries, and current show cards.
- New game setup exposes local difficulty, active-brand-count, active-brand participant, and competing-GM metadata before brand selection, without CPU drafting or other-brand simulation yet.
- Initial Draft pick-order presentation now derives from the local active-brand setup and shows rival turns as preview-only context without executing rival picks.
- Local weekly show recaps now route booked match segments through the existing Show Engine shell, which in turn runs the Match Engine shell with seeded deterministic context, then passes structural handoffs into Fan Reaction and Social Discourse shells for player-facing fan-response and social-buzz labels without exposing hidden rolls, formulas, business engines, generated text, or backend diagnostics.
- Week HQ now derives and displays a local season calendar from the current week, including road-to-special-event timing, special-event week labels, title defense window labels, rivalry payoff prompts, show history counts, and local roster history snapshots.
- Draft and post-draft UI budget labels now display internal finance units as money-style amounts while preserving the existing finance math.
- Current flow is mostly UI-local/page-lifetime.
- Persistence and full gameplay loop are not finished yet.

## Implementation Philosophy

Do not stop at tiny slices if the next implementation step is clear.

Codex should keep progressing toward the finished product, milestone by milestone, while preserving architecture and tests.

Prioritize:

1. Working gameplay loop
2. Correct data/state model
3. Save/load durability
4. Simulation depth
5. UI polish
6. GenAI/social flavor

Do not chase perfect UI before gameplay works.

## Milestone Order

### Milestone 1: Complete Local Playable Loop

Finish the local gameplay loop first:

Week 1 HQ
→ Book Week 1 Show
→ Run Show
→ Show Recap
→ Apply local consequences
→ Advance to Week 2
→ Repeat weekly loop locally

Include:

- weekly booking builder
- match/promo segment creation
- main event requirement
- deterministic run-show result
- show grade
- best/worst segment
- champion spotlight
- rivalry spotlight
- local fan/crowd response
- local momentum/fatigue/rivalry/consequence summaries
- advance week

### Milestone 2: Real Gameplay State Model

Create a durable gameplay state model in code before persistence.

This should define the full save/session shape:

- game identity
- selected brand
- current week
- budget
- signed roster
- champions
- rivalries
- weekly show cards
- show results
- superstar current state
- roster momentum
- morale
- fatigue
- injury risk
- popularity
- rivalry heat
- champion/title state
- finance/fan summaries
- week history

Keep this deterministic and testable.

### Milestone 3: Persistence / Save Load

After the gameplay state model exists, implement real save/load.

Use the repo's persistence direction and existing SQLite identity foundation. Do not hack save/load through browser storage unless explicitly justified as a temporary dev-only bridge.

Add:

- save payload contract
- save/load UI
- durable save write
- durable save read
- continue save
- new save slot behavior
- compatibility/versioning guardrails

### Milestone 4: Real Run Show Simulation

Replace placeholder local results with the real simulation pipeline in the correct order.

Reuse existing architecture where appropriate:

- match engine
- show engine
- fan reaction engine
- social discourse engine
- business/finance logic when available

Do not expose hidden formulas, raw rolls, or backend diagnostics to the player.

Use deterministic logic and seeded randomness only. Do not use Math.random.

Player sees:

- show grade
- match ratings
- segment recap
- crowd response
- fan trust
- rivalry heat movement
- superstar momentum changes
- champion/title impact
- finance impact
- social/IWC summary when ready

### Milestone 5: Weekly Season Loop

Make the game playable over multiple weeks.

Add:

- reusable weekly booking
- week advancement
- calendar structure
- road to PLE/special event
- PLE booking
- title defenses
- rivalry payoff opportunities
- show history
- roster history snapshots/deltas

### Milestone 6: CPU Brands / Other Brands

After player-brand loop works and persistence is stable, add CPU brand systems.

Add:

- CPU roster handling
- other-brand weekly summaries
- other-brand champions
- other-brand movement
- market/competition context

Do not add CPU drafting or other-brand simulation before the player-brand loop works.

### Milestone 7: GenAI / IWC / Social Flavor

After core loop, persistence, and simulation are stable, add generated flavor.

GenAI should support:

- IWC reactions
- dirt sheet rumors
- superstar posts
- social discourse
- recap flavor
- media narratives

GenAI must not be required for core game logic. The game must remain playable without network/AI calls.

### Milestone 8: UI/UX Polish

Once gameplay is real, polish the UI.

Follow repo visual doctrine:

- premium wrestling GM sim
- not SaaS/admin/debug UI
- sharp sports broadcast panels
- clean dark glass
- brand identity
- no text overflow
- no full-page scrolling where practical
- contained scrolling inside panels
- no diagnostic/internal terms in player UI

## Product Rules

- Drafted talent belongs to the player's selected brand.
- Source roster is only Drafted From / Source Pool metadata.
- Finance-limited drafting remains central.
- 16-person roster is a minimum viability threshold, not a hard cap.
- Champions are brand-specific.
- Rivalries can be manually created and later emerge naturally.
- No hard rivalry cap long term.
- Player choices should compound week to week.
- Results should be mostly logic-driven with controlled seeded variance later.
- Never expose hidden internals to players.

## What Codex Should Do During /goal Runs

Codex should:

1. Ground itself in the repo.
2. Identify the next unfinished milestone.
3. Implement the next safest meaningful chunk.
4. Add/update focused tests.
5. Run validation appropriate to the tier.
6. Commit completed work when clean.
7. Continue to the next milestone if the next step is clear and still safe.
8. Stop only for true hard boundaries, broken architecture risk, or product decisions that cannot be inferred.

## Hard Stops

Stop and report before:

- broad architecture rewrite
- deleting/replacing existing draft system
- changing engine metadata IDs casually
- using Math.random
- exposing raw hidden formulas/rolls to players
- adding live scraping
- adding paid/network GenAI calls without explicit user approval
- adding destructive persistence changes
- adding large database schema without a save-state contract
- implementing CPU brands before player loop and persistence are stable

## Validation

Use lean validation tiers from the repo.

For each implementation chunk:

- run node --check on changed JS/TS where applicable
- run focused tests
- run git diff --check
- run boundary scans relevant to the milestone
- run full npm test when shared/domain/persistence/simulation behavior changes

Boundary scans should not mean "never add this." They should confirm that systems are only added in the milestone where they are intended.

Example:

- Before persistence milestone, storage/database writes are forbidden.
- During persistence milestone, storage/database writes are expected but must be tested and scoped.
- Before GenAI milestone, OpenAI/GenAI calls are forbidden.
- During GenAI milestone, they must be explicit, optional, and isolated.

## Final Product Definition

The product is considered finished enough when:

- A player can start a new game.
- Draft/sign a roster.
- Assign champions.
- Create rivalries.
- Book shows.
- Run shows.
- See results and consequences.
- Advance week to week.
- Save and load.
- Continue a season.
- Build toward major events.
- Understand what happened without seeing raw internals.
- Play without the UI breaking or overflowing.

## Reporting

Every /goal run should report:

1. Current milestone.
2. What was completed.
3. What remains.
4. Files changed.
5. Tests added/updated.
6. Validation results.
7. Boundary scan summary.
8. Manual QA notes if available.
9. Known limitations.
10. Commit hash.
11. Next milestone.
