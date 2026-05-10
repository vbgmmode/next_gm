---
name: gm-backend-simulation-architect
description: Use when designing, reviewing, or implementing backend simulation systems for the Next GM procedural wrestling industry simulator, especially match simulation, fan reaction, social discourse, rival companies, economy, morale, seeded randomness, hidden state, player-facing signals, deterministic replay, modular engine boundaries, and approved identity-only SQLite foundation shells. Do not use for frontend UI, full gameplay persistence, or AI-generated text unless the user explicitly expands scope.
---

# GM Backend Simulation Architect

Use this skill to protect the simulation doctrine while shaping backend systems for Next GM.

## First Moves

Read the relevant project guidance before proposing or changing code:

- `AGENTS.md`
- `docs/design/simulation-doctrine.md`
- `docs/systems/match-engine.md`
- `docs/systems/fan-reaction-engine.md`
- `docs/systems/social-discourse-engine.md`

If the requested work conflicts with those docs, identify the conflict and propose a doctrine update before implementation.

## Core Project Philosophy

Treat Next GM as a procedural wrestling industry simulator about booking in an unstable attention economy. Match quality matters, but perception matters just as much.

The player should manage uncertainty through reports, signals, rumors, summaries, trends, scouting notes, confidence language, and imperfect reads. Internal simulation values may be numeric, but player-facing output should remain signal-based and non-formulaic.

Use GenAI only as future dramatization over structured simulation truth when explicitly scoped. GenAI must not invent winners, ratings, reactions, rumors, injuries, morale changes, business outcomes, or any other simulation truth.

## Current Scope Guardrails

Approved foundation exceptions:

- Production shell engines exist for Match, Show, Fan Reaction, and Social Discourse.
- Hidden/player-facing boundaries are part of the current backend contract.
- Seeded randomness through `SimulationContext`, `SimulationEngineContext`, and `RandomService` is approved.
- SQLite identity-only persistence probes are approved.
- SQLite initialization/migration scaffolding for the approved identity schema is approved.
- Durable SQLite save identity create, read, and list shells are approved as diagnostics-only and identity-only.
- Minimal `save_metadata` row usage is approved only as identity support.
- `schema_migrations` tracking is approved for the identity schema.
- Diagnostics-only capability and status reporting is approved for the durable identity boundary.

Identity persistence is approved only for durable save identity records and minimal metadata needed to prove identity round-tripping. Gameplay persistence is still not approved.

Do not implement these unless the user explicitly requests them:

- Full gameplay persistence.
- Gameplay payload persistence.
- Draft, roster, championship, division, calendar, week, match, show, rivalry, business, fan/social, generated-text, or GenAI persistence.
- Full save repository object.
- Full save load/list behavior beyond identity-only read/list.
- Save update behavior.
- Save delete behavior.
- Player-facing save management.
- UI save/load/list wiring.
- Frontend UI.
- AI-generated text.
- Gameplay feature loops.
- Roster ingestion or real roster data.
- Business systems.
- Generated text or GenAI.
- Real match outcomes, title changes, injuries, morale changes, or consequence systems.
- Gameplay start or week advancement.
- Full match, fan, social, economy, or rival-company implementations.

Documentation, architecture guidance, deterministic type sketches, and tests are acceptable when requested.

## Current Backend Baseline

- Match Engine: `match-engine-v0`, metadata `0.9.0`.
- Show Engine: `show-engine-v0`, metadata `0.8.0`.
- Fan Reaction Engine: `fan-reaction-engine-v0`, metadata `0.6.0`.
- Social Discourse Engine: `social-discourse-engine-v0`, metadata `0.5.0`.

Fan Reaction currently supports optional Show handoff input and keeps these as hidden-only internals:

- `showInput`.
- `audienceReadSummary`.
- `showOutputShell`.

Fan Reaction show signal shells may use conservative structural reads such as `unavailable`, `pending`, `limited`, `neutral`, `needs-more-context`, or `structurally-ready`. These are readiness signals only, not sentiment, scoring, or consequences.

Social Discourse currently consumes the shared hidden `FanSocialDiscourseHandoff` DTO, including show-output readiness, show-signal readiness, hidden discourse readiness bucket summaries, and hidden structured discourse output shell containers only. Discourse readiness buckets and output shell containers are structural availability markers, not discourse generation, sentiment, scoring, or consequences. It must still not generate discourse, tweets, reports, rumors, narratives, GenAI, real sentiment, scores, attendance, revenue, grades, winners, or star ratings unless explicitly scoped.

Show Engine may summarize hidden fan/social orchestration structural readiness after a show run, but it must not execute, own, or synthesize Fan Reaction or Social Discourse behavior unless explicitly routed through existing orchestration helpers.

Engine pipeline structural summaries may expose hidden structural stage availability, including Show match readiness aggregation, but those summaries are orchestration diagnostics only and must not create or imply gameplay outcomes.

Match Engine result-intent classification is a hidden structural readiness layer over existing finish validation, finish reads, result shell, and execution gate data. It must not execute finishes, select winners, infer outcomes, or create consequences.

Show Engine match readiness aggregation may summarize Match Engine result-intent classifications after booked matches run, but it is a hidden card-level structural rollup only. It must not create match outcomes, execute finishes, or affect public show results.

## General Implementation Rules

- Keep each task small and scoped to the requested engine or boundary.
- Preserve stable engine IDs unless the user explicitly asks to change them.
- Bump metadata versions only for the engine being changed.
- Avoid broad refactors unless explicitly requested.
- Do not add gameplay systems outside the requested scope.
- Do not mutate input objects unless explicitly scoped.
- Use existing architecture, contracts, exports, fixtures, and helper patterns cleanly.
- Prefer tiny versioned engine changes over sweeping behavior changes.

## Randomness And Testing Rules

- Route all stochastic behavior through seeded `RandomService`.
- Never use `Math.random` in `src` or `tests`.
- Preserve deterministic replay as a design goal.
- Add or update focused tests for every implementation change.
- Run:

```powershell
node --test --experimental-strip-types "tests/**/*.test.ts"
rg "Math\.random" src tests
```

Expected clean validation is `0` failures and no `Math.random` matches. Report the actual local test count instead of relying on an older fixed baseline.

## Simulation Rules

- Keep internal numeric state separate from player-facing signal output.
- Prefer modular engines over giant services.
- Use named tuning constants instead of magic numbers.
- Treat rival companies as first-class simulation actors, not static modifiers.

## Modeling Doctrine

Model wrestling as an unstable attention economy.

Match quality matters, but perception matters just as much. Fans are meta-aware and react to perceived booking intent, pushes, burials, overexposure, backstage perception, and discourse. Great booking should create opportunity, not certainty.

Support outcomes where forced pushes work, backfire, or polarize. Allow happy accidents to outperform planning sometimes. Let wrestlers evolve and decay over time.

## Engine Design Checklist

For each engine, define:

- Hidden inputs.
- Hidden outputs.
- Player-facing signals.
- Seeded randomness needs.
- Tuning constants.
- Adjacent systems it reads from or writes to.
- Things it explicitly does not own.
- Deterministic test cases.

## Player-Facing Output Rule

Do not expose raw formulas as normal gameplay information. Prefer:

- Reports.
- Rumors.
- Tweets or tweet-like summaries only after text-generation scope is approved.
- Crowd trend summaries.
- Segment reactions.
- Analyst notes.
- Confidence ranges.

The player should manage uncertainty, not reverse-engineer visible math.

## Output Boundary Rules

- Hidden and debug state may include raw numbers when needed for deterministic testing and downstream engines.
- Player-facing outputs must not expose raw numbers, formulas, hidden bands, result shells, execution gates, internal validation reasons, or raw stat fields unless explicitly scoped.
- Player-facing outputs should use signal, report, summary, trend, rumor, confidence, or scouting language.
- Keep debug traces optional and explicitly non-player-facing.

## Match Engine Standing Rules

- Keep stable id `match-engine-v0` unless explicitly scoped.
- Keep raw `TalentProfile` numeric reads centralized in `matchTalentRead.ts`.
- Do not add winners, losers, star ratings, finish execution, move-by-move simulation, title changes, injuries, morale effects, momentum consequences, or persistence unless explicitly scoped.
- If adding match behavior, keep formulas internal and update only match-focused tests.

## Show Engine Standing Rules

- Keep stable id `show-engine-v0` unless explicitly scoped.
- The Show Engine may run booked matches through Match Engine when scoped.
- Do not add attendance, ticket revenue, TV revenue, production costs, show grades, fan/social orchestration, weekly orchestration, save mutation, or calendar advancement unless explicitly scoped.

## Fan, Social, And GenAI Standing Rules

- Do not generate tweets, reports, rumors, narratives, articles, promos, dirt-sheet items, or GenAI output unless explicitly scoped.
- Build structured simulation outputs before any GenAI dramatization layer.
- Do not change Fan Reaction or Social Discourse behavior unless explicitly scoped.
- If GenAI is later added, it may dramatize structured outputs only; it must not create simulation facts.

Recommended next backend step: continue only tiny Social Discourse v0.2 show-output handoff hardening while keeping output structural only.

## Review Questions

Before finalizing a simulation design or code change, ask:

- Can the same seed and inputs replay the same result?
- Are stochastic choices isolated behind an injectable random source?
- Are tuning values named and centralized?
- Is hidden state protected from direct player display?
- Does the system create tradeoffs rather than one optimal formula?
- Can rival companies use the same system without special casing?
- Is this still foundation-safe, or did it drift into gameplay, UI, persistence, or AI text?

## Required Response Format

For every implementation response, include:

- Files changed.
- Tests added or updated.
- Test result.
- `Math.random` grep result.
- `$agent-coordinator Review`.

## `$agent-coordinator Review` Expectations

Confirm:

- Scope stayed tight.
- Stable engine IDs were preserved.
- Metadata version changes were correct and limited to the changed engine.
- Player-facing boundaries were preserved.
- No forbidden systems were added.
- Fan, social, business, UI, persistence, roster ingestion, and GenAI behavior did not change unless explicitly scoped.
- Risks or tradeoffs.
- Recommended next backend step.
