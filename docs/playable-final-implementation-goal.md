# Playable Final Implementation Goal

## 1. Objective

Finish the rough local playable implementation of Next GM.

Target player flow:

Start New Game
→ Pick brand
→ Draft roster with budget
→ Finish draft
→ Assign brand-specific champions
→ Create rivalries
→ Open Week 1 HQ
→ Book Week 1 Show
→ Run Show
→ See Show Recap
→ Apply local consequences
→ Advance to Week 2 HQ
→ Book another weekly show
→ Continue a rough local GM loop

The goal is not perfect UI. The goal is a working local playable game loop that proves the product can be played.

## 2. Current Known Working State

Based on the current playable UI files and focused playable tests:

- player can draft with budget
- player can finish draft
- drafted talent is signed to the selected player brand
- source roster appears only as Drafted From / Source Pool metadata
- player can assign brand-specific champions
- player can create rivalries
- setup is local-only and reload-reset
- persistence/save/load is not implemented
- Week 1 booking/run-show loop is the next major gameplay unlock

## 3. Definition of Finished for This Goal

This goal is complete when a player can do this in one local browser session:

1. Start a new game.
2. Select a brand.
3. Draft a minimum viable roster using the finance-limited draft.
4. Finish the draft.
5. Assign required brand-specific champions.
6. Create at least one rivalry.
7. Reach Week 1 HQ.
8. Book a Week 1 show card.
9. Run the Week 1 show.
10. See a show recap with player-friendly results.
11. See local roster/rivalry/champion/fan/budget/momentum consequences.
12. Advance to Week 2 HQ.
13. Book at least one more weekly show using the same local loop, or clearly land on Week 2 with Book Week 2 available if safe reuse is not possible in one pass.

This is local-only and reload-reset.

## 4. Hard Stop Boundaries

Stop and report instead of implementing if work requires:

- persistence
- browser storage
- save payloads
- SQLite gameplay writes
- backend/network calls
- GenAI/generated text/OpenAI/API key behavior
- CPU brand drafting
- other-brand booking or simulation
- real save/load
- live roster scraping
- broad draft-system refactor
- duplicate draft system
- exposing hidden formulas, raw rolls, engine internals, or backend diagnostics in player-facing UI

Do not use Math.random.
If variance is tempting, skip it for now or use deterministic placeholder logic only.

## 5. Allowed for This Goal

Allowed:

- UI-local/page-lifetime state
- reload reset
- simple local controllers
- simple deterministic placeholder scoring
- simple local show recap
- simple local consequence updates
- simple weekly advancement
- focused tests
- rough but usable UI
- contained scrolling if needed
- pragmatic layout fixes only when they block usability

Expected tier:

- Tier 2 if all work stays UI-local/page-lifetime.
- Tier 3 only if existing pure domain logic must be reused.
- Do not cross into Tier 4.

## 6. Implementation Milestone A: Week 1 Booking Builder

Add or complete local Week 1 Booking.

Requirements:

- Booking unlocks only after draft finish + championship setup complete + rivalry setup complete.
- Use signed roster from existing local draft progress.
- Use champion/rivalry setup from localPostDraftSetupController state or current local setup state.
- Add a Week 1 Booking screen/panel from Week 1 HQ.
- Keep it page-lifetime only.

Segment types:

- Singles Match
- Promo
- Main Event Singles Match

Singles Match:

- choose Wrestler A from signed roster
- choose Wrestler B from signed roster
- block missing wrestlers
- block same wrestler vs self

Promo:

- choose one featured signed wrestler
- block missing wrestler

Main Event Singles Match:

- same as Singles Match
- visually mark as Main Event
- satisfies main event requirement

Show card display:

- segment number/order
- segment type
- selected talent
- main event badge
- segment count
- main event status
- optional remove button if low-risk

Run Show availability:

- locked until at least one valid segment exists
- locked until a main event exists
- player-facing disabled state explains what is missing

## 7. Implementation Milestone B: Run Show v0.1

Add rough local-only Run Show behavior.

This is not the full simulation engine.
Do not call match/show/fan/social/business engines.

When the player runs the show:

- produce a deterministic local recap from the booked card
- show segment results
- show a player-facing show grade
- show best segment
- show weak segment if applicable
- show champion involvement notes if applicable
- show rivalry involvement notes if applicable
- show local fan/crowd read
- show Local Session Only / Not Saved Yet

Simple deterministic rules are acceptable:

- main event helps the show grade
- champion involvement helps the show grade slightly
- rivalry involvement helps the show grade slightly
- promos and matches can have simple fixed base values
- more than zero valid segments required
- keep all results player-friendly

Do not show:

- raw formulas
- raw scores with decimals
- hidden weights
- random rolls
- engine handoff
- diagnostic scoring

Player-facing examples:

- Show Grade: B
- Best Segment: Main Event Singles Match
- Rivalry Spotlight: Cody Rhodes vs Randy Orton
- Champion Spotlight: World Heavyweight Champion appeared
- Crowd Read: Strong / Solid / Mixed
- Momentum Note: Roster gained momentum heading into Week 2

## 8. Implementation Milestone C: Local Consequences v0.1

After running a show, apply simple local consequences.

Keep it deterministic and player-friendly.

Add a local consequences summary with:

- roster momentum note
- rivalry heat note
- champion spotlight note
- fan response note
- budget/fan summary note

Allowed consequence style:

- small labeled deltas
- player-facing summaries
- simple deterministic changes stored in local page-lifetime state

Do not add:

- deep simulation
- hidden formulas in UI
- injuries
- morale system depth
- finance engine
- fan/social engine calls
- IWC generated posts
- random variance

Examples:

- Momentum: Up
- Rivalry Heat: Cody Rhodes vs Randy Orton gained heat
- Champion Spotlight: Women’s World Champion carried the show
- Fan Response: Strong
- Budget: No major change in this local preview

## 9. Implementation Milestone D: Advance to Week 2 HQ

After show recap, allow the player to advance to Week 2 HQ.

Week 2 HQ should show:

- selected brand
- Week 2 label
- roster count
- champions summary
- rivalries summary
- last show grade
- top segment
- local consequence summary
- remaining budget summary
- Local Session Only / Not Saved Yet
- CTA: Book Week 2 Show

If safe, reuse the Week 1 Booking Builder as a generic weekly booking screen that supports Week 2.
If that creates too much risk, show Book Week 2 Show — Coming Next and stop after proving advancement.

Preferred if feasible:

- Generic weekly booking screen
- current week number in local state
- after Week 2 show, advance to Week 3 HQ using the same rough loop

Do not overbuild calendar/PLE systems in this goal.

## 10. Implementation Milestone E: Rough Repeatable Weekly Loop

If Milestones A-D are stable and still within boundaries, make the weekly loop repeatable locally:

Week HQ
→ Book Show
→ Run Show
→ Recap
→ Apply local consequences
→ Advance Week

Requirements:

- Keep current week number in page-lifetime state.
- Reuse the same booking screen.
- Reuse the same recap pattern.
- Show last show summary on each week HQ.
- Keep Local Session Only / Not Saved Yet visible.

Stop before adding:

- persistence
- season database
- full calendar
- PLE system
- CPU brands
- other-brand simulations

## 11. Preserve Existing Working Systems

Do not break:

- draft budget flow
- manual drafting
- auto-fill toward minimum roster
- finish draft
- brand-specific championship setup
- rivalry creation
- post-draft command page
- roster nav behavior
- drafted talent signed-brand context
- source pool as Drafted From / Source Pool only
- local-only reload-reset behavior

If something breaks, fix it before moving on.

## 12. Player-Facing Language

Use:

- Book Week 1 Show
- Week 1 Booking
- Run Show
- Show Recap
- Advance to Week 2
- Week 2 HQ
- Show Grade
- Best Segment
- Rivalry Spotlight
- Champion Spotlight
- Local Consequences
- Momentum
- Fan Response
- Local Session Only
- Not Saved Yet
- Drafted From
- Signed to [Brand]
- Booking Coming Next

Avoid:

- backend
- diagnostic
- payload
- domain
- service
- object
- readiness
- projection
- engine handoff
- in-memory
- local progress object
- hidden roll
- raw score
- static seed
- selection intent

## 13. Visual Guidance

The UI does not need to be perfect for this goal.
Prioritize working flow.

Follow the repo’s visual direction:

- premium wrestling GM game
- not SaaS/admin/debug UI
- sharp broadcast panels
- clear hierarchy
- readable controls
- no full-page scrolling where practical
- contained scrolling is acceptable
- avoid text overflow
- avoid giant diagnostic panels
- fix only usability-blocking layout issues

## 14. Tests to Add or Update

Add/update focused playable tests for:

- booking locked before setup complete
- booking available after draft + champions + rivalries
- valid singles match can be added
- same-wrestler match is blocked
- missing wrestler segment is blocked
- promo can be added
- main event can be added
- Run Show locked without valid card/main event
- Run Show available with valid card/main event
- running show produces recap
- recap includes show grade and best segment
- local consequences are produced
- advance to Week 2 works
- Week 2 HQ shows last show summary
- repeatable weekly loop works if implemented
- no persistence/storage/network/GenAI/engine calls

## 15. Validation

Use docs/playable-new-gm-mode-lean-validation-strategy.md.

Run:

- node --check changed JS files
- focused playable tests
- git diff --check
- forbidden scan on changed UI files for:
  - localStorage
  - sessionStorage
  - indexedDB
  - fetch
  - XMLHttpRequest
  - sqlite
  - database writes
  - OpenAI
  - API key
  - GenAI
  - generated text calls
  - CPU drafting
  - other-brand booking
  - match/show/fan/social/business engine calls
  - Math.random

Run full npm test only if shared behavior, domain code, test infrastructure, or broad imports changed, or if focused tests suggest broader breakage.

## 16. Manual QA

Use the active local preview. Recent active URL:
http://localhost:4173/ui/playable-new-gm-mode/

Manual flow:

1. Start new game.
2. Pick brand.
3. Draft or auto-fill to minimum roster.
4. Finish draft.
5. Assign champions.
6. Create rivalry.
7. Open Week 1 HQ.
8. Book Week 1 Show.
9. Add singles match.
10. Add promo.
11. Add main event.
12. Run show.
13. View recap.
14. Review local consequences.
15. Advance to Week 2 HQ.
16. Book Week 2 if implemented.
17. Confirm Local Session Only / Not Saved Yet.
18. Refresh and confirm reload reset is still expected.

## 17. Committing

Logical commits preferred:

1. Booking Builder
2. Run Show + Recap
3. Local Consequences + Week Advancement
4. Repeatable Weekly Loop if implemented

One clean commit is acceptable if the implementation is tightly connected:
Complete rough local playable GM loop

## 18. Final Report

Report:

1. Tier classification and why.
2. Pre-edit git status.
3. Repo docs/files read.
4. Files changed.
5. Milestones completed.
6. What was implemented.
7. What was intentionally not added.
8. Tests added/updated.
9. Validation results.
10. Manual QA notes.
11. Boundary scan summary.
12. Known limitations.
13. Whether the target player flow works.
14. Commit hash or final git status.
