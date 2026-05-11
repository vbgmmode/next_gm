# Next GM Agent Guidance

## Project Identity

Next GM is a procedural wrestling industry simulator. The player fantasy is becoming the best booker in an unstable attention economy while managing rival companies, budget pressure, superstar expectations, fan and IWC expectations, imperfect information, and stochastic entertainment outcomes.

Wrestling quality matters, but perception matters just as much. The simulation should model the difference between what happened, what insiders believe happened, what fans think happened, and what the player can confidently know.

## Current Phase

This repository is no longer pure foundation-only. The current phase is first-session playable compliance.

A rough playable loop exists in the current code and tests. Day-to-day work should prioritize making the first 20 minutes comply with `docs/next-gm-product-and-simulation-lock.md` while preserving deterministic simulation boundaries, save safety, and explicit scope control.

The required first-session flow is:

Title Screen -> Start New Game / Continue -> Choose GM -> Difficulty -> Active Brands / Competing GMs -> Player Brand -> Draft Rules and Budget Intro -> Multi-brand Draft -> Post-Draft Brand HQ -> Assign Champions -> Create Rivalries -> Week 1 HQ -> Book First Show -> Run Show -> Show Recap.

## Product Rules For Current Work

- The game should feel like a real GM universe, not static setup cards.
- Finance must use real money labels, not tokens.
- Rival brands must be visibly present in the draft.
- Drafted talent belongs to the drafting brand.
- Source roster/source pool is metadata only.
- Post-draft surfaces should move toward Brand HQ, champions, rivalries, Week 1 HQ, booking, run show, and recap.
- GenAI is optional flavor later, not core simulation truth.

## Work Allowed When Scoped

- UI work under `ui/playable-new-gm-mode` when it advances the first-session flow.
- Page-lifetime/local playable controller work already supported by current code/tests.
- Copy and presentation updates that make the first session feel like a real game.
- Focused tests for playable first-session behavior.
- Documentation and operating guidance.
- Architecture sketches and engine boundaries.
- Deterministic test scaffolding and approved production shell engines when explicitly requested.
- Hidden/player-facing backend contract boundaries.
- Seeded randomness through `SimulationContext`, `SimulationEngineContext`, or `RandomService`.
- SQLite identity-only probes and other approved persistence shells only when the task is explicitly scoped to that boundary.

## Work Blocked Unless Explicitly Scoped

- Broad persistence expansion.
- Destructive database/schema changes.
- Unapproved durable gameplay payload persistence.
- New backend service rewrites.
- Deep CPU GM strategy.
- Other-brand season simulation beyond visible deterministic draft participation.
- GenAI runtime integration.
- Live scraping.
- Randomness via `Math.random`.
- Engine ID or metadata changes unless directly required and approved.
- Full save repository rewrites.
- Save update/delete behavior unless directly approved.
- Business systems, full economy, or full rival-company implementations.
- Real match outcomes, title changes, injuries, morale changes, or consequence systems beyond the currently scoped playable/local preview behavior.

## Simulation Principles

- Great booking creates opportunity, not certainty.
- Forced pushes can work, backfire, or polarize.
- Happy accidents should occasionally outperform planning.
- Wrestlers evolve and decay over time.
- Rivalries are multimedia narratives across matches, promos, backstage appearances, tweets, fan discourse, and match results.
- Backstage politics matter as a moderate management layer, not as pure chaos.
- Rival companies start from the same baseline and diverge through booking quality, stars, market share, momentum, profitability, and fan perception.
- The player should manage uncertainty, not solve visible formulas.
- Deterministic game facts come first.
- Seeded variance comes later, when explicitly scoped.
- GenAI reactions come after facts, when explicitly scoped.
- GenAI must not decide winners, budget, injuries, standings, save-critical state, or canonical game facts.

## Implementation Rules

- Do not call `Math.random` directly in simulation engines.
- Route all stochastic behavior through `SimulationContext`, `SimulationEngineContext`, or `RandomService`.
- Prefer modular engines over giant services.
- Put tuning constants in named configuration objects instead of scattering magic numbers.
- Separate hidden internal simulation state from player-facing signal output.
- Keep formulas internal. Surface reports, rumors, tweets, summaries, trends, scouting notes, and confidence levels.
- Preserve deterministic replay as a design goal for simulation tests.
- Avoid hard-coding single-company assumptions; rival promotions should be first-class simulation peers.

## Documentation Map

- `docs/next-gm-product-and-simulation-lock.md` governs current product/simulation execution.
- `docs/finished-product-goal.md` defines the final destination.
- `docs/next-gm-docs-reconciliation-report.md` explains stale-doc and conflict handling.
- `docs/design/simulation-doctrine.md` defines the project philosophy and player-facing information model.
- `docs/systems/match-engine.md` defines the future match simulation boundaries.
- `docs/systems/fan-reaction-engine.md` defines perception, audience segment, and booking-intent reactions.
- `docs/systems/social-discourse-engine.md` defines noisy public discourse and IWC-style feedback loops.
- `docs/architecture/sqlite-first-persistence.md` defines the SQLite identity-only foundation boundary.
- `docs/architecture/sqlite-implementation-boundary-decision.md` records the earlier foundation/identity-only SQLite boundary and current persistence cautions.
- `docs/architecture/sqlite-isolated-identity-flow-completion.md` records the isolated-to-durable identity flow reconciliation.
- `skills/gm-backend-simulation-architect/SKILL.md` defines how Codex should approach future backend simulation work.

## Source-Of-Truth Precedence

1. Current code/tests are implementation truth.
2. `docs/next-gm-product-and-simulation-lock.md` governs product/simulation execution.
3. `docs/finished-product-goal.md` governs the final destination.
4. `docs/next-gm-docs-reconciliation-report.md` governs stale-doc/conflict handling.
5. `AGENTS.md` is the current day-to-day contributor instruction layer.
6. Older foundation/architecture docs remain valid only where they do not conflict with current code/tests, the lock, the finished goal, or the reconciliation report.

## Agent Working Style

Before changing simulation code, read the relevant current design and system docs. If a requested feature conflicts with implementation truth, the product/simulation lock, the finished goal, or the reconciliation report, call out the conflict and propose a reconciliation step rather than quietly implementing against stale doctrine.

When creating future simulation systems, describe:

- Hidden state inputs.
- Player-facing outputs.
- Seeded randomness needs.
- Tuning constants.
- Determinism and replay expectations.
- Test boundaries.
