# Next GM Agent Guidance

## Project Identity

Next GM is a procedural wrestling industry simulator. The player fantasy is becoming the best booker in an unstable attention economy while managing rival companies, budget pressure, superstar expectations, fan and IWC expectations, imperfect information, and stochastic entertainment outcomes.

Wrestling quality matters, but perception matters just as much. The simulation should model the difference between what happened, what insiders believe happened, what fans think happened, and what the player can confidently know.

## Current Phase

This repository is in foundation mode. Do not build gameplay features yet.

Allowed work:

- Documentation and operating guidance.
- Architecture sketches and engine boundaries.
- Deterministic test scaffolding and approved production shell engines when explicitly requested.
- Lightweight placeholder types only when needed to support agreed design work.
- Hidden/player-facing backend contract boundaries.
- Seeded randomness through `SimulationContext` and `RandomService`.
- SQLite identity-only probes.
- SQLite initialization/migration scaffolding for the approved identity schema.
- Durable SQLite save identity create, read, and list shell work that remains diagnostics-only and identity-only.
- Minimal `save_metadata` row usage only as identity support.
- `schema_migrations` tracking for the approved identity schema.
- Diagnostics-only capability and status reporting for the durable identity boundary.

Blocked work until explicitly requested:

- Full gameplay persistence.
- Draft, roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated-text, or GenAI persistence.
- Full save repository objects.
- Full save load/list behavior beyond identity-only read/list.
- Gameplay payload persistence.
- Save update behavior.
- Save delete behavior.
- Player-facing save management.
- UI save/load/list wiring.
- Frontend UI.
- AI-generated text features.
- Live gameplay loops.
- Gameplay start or week advancement.
- Business systems.
- Real match outcomes, title changes, injuries, morale changes, or consequence systems.
- Full match, fan, social, economy, or rival-company implementations.

## Simulation Principles

- Great booking creates opportunity, not certainty.
- Forced pushes can work, backfire, or polarize.
- Happy accidents should occasionally outperform planning.
- Wrestlers evolve and decay over time.
- Rivalries are multimedia narratives across matches, promos, backstage appearances, tweets, fan discourse, and match results.
- Backstage politics matter as a moderate management layer, not as pure chaos.
- Rival companies start from the same baseline and diverge through booking quality, stars, market share, momentum, profitability, and fan perception.
- The player should manage uncertainty, not solve visible formulas.

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

- `docs/design/simulation-doctrine.md` defines the project philosophy and player-facing information model.
- `docs/systems/match-engine.md` defines the future match simulation boundaries.
- `docs/systems/fan-reaction-engine.md` defines perception, audience segment, and booking-intent reactions.
- `docs/systems/social-discourse-engine.md` defines noisy public discourse and IWC-style feedback loops.
- `docs/architecture/sqlite-first-persistence.md` defines the SQLite identity-only foundation boundary.
- `docs/architecture/sqlite-implementation-boundary-decision.md` defines approved and blocked persistence scope.
- `docs/architecture/sqlite-isolated-identity-flow-completion.md` records the isolated-to-durable identity flow reconciliation.
- `skills/gm-backend-simulation-architect/SKILL.md` defines how Codex should approach future backend simulation work.

## Agent Working Style

Before changing simulation code, read the relevant design and system docs. If a requested feature conflicts with these docs, call out the conflict and propose an update rather than quietly implementing against the doctrine.

When creating future simulation systems, describe:

- Hidden state inputs.
- Player-facing outputs.
- Seeded randomness needs.
- Tuning constants.
- Determinism and replay expectations.
- Test boundaries.
