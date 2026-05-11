# Simulation Gaps Dossier

Last inspected: 2026-05-11

## Executive Summary

The simulation stack feels like shells today because it has the correct deterministic spine, engine boundaries, hidden/player-facing separation, and handoff contracts, but it intentionally stops before durable gameplay consequences. The current system can say a match was structurally processed, a show was sequenced, fan reaction had enough handoff data to form placeholder reads, and social discourse has deterministic output containers. It does not yet decide winners, apply finish results, move popularity, evolve rivalries, persist gameplay state, advance weeks, generate text, run business outcomes, or let the player feel accumulating pressure.

Exists today:

- `src/game/simulation/randomService.ts` provides seeded `RandomService.next()`, `chance()`, `integer()`, and `weightedChoice()`.
- `src/game/simulation/simulationContext.ts` and `src/game/engines/engineContext.ts` route randomness through `SimulationContext` / `SimulationEngineContext`.
- `src/game/engines/matchEngine.ts`, `showEngine.ts`, `fanReactionEngine.ts`, and `socialDiscourseEngine.ts` all implement the shared `SimulationEngine.run(input, context, options?)` shape from `simulationEngine.ts`.
- `src/game/simulation/signalInterpreter.ts` and `src/game/engines/engineSignals.ts` preserve the doctrine that player-facing output is signal-based rather than formula/roll-based.

Shell exists but does not execute:

- `matchEngine.ts` prepares `resultShell`, `resultExecutionGate`, and `resultIntentClassification`, but does not execute a winner, finish, rating, injury, title change, morale change, or consequence payload.
- `showEngine.ts` runs match shells and creates `fanSocialHandoff`, but explicitly does not call Fan Reaction or Social Discourse inside the show engine.
- `fanReactionEngine.ts` creates audience-read and show-output shells, but does not produce real fan scores, sentiment deltas, popularity changes, or backlash consequences.
- `socialDiscourseEngine.ts` creates readiness buckets and an output shell, but returns `producedNarratives: []`.

Explicitly blocked by roadmap/doctrine:

- `docs/design/simulation-doctrine.md` blocks full gameplay persistence, gameplay payload persistence, real match outcomes, title changes, injuries, morale changes, business systems, generated text, UI wiring, gameplay start, and week advancement.
- `docs/playable-new-gm-mode-roadmap.md` blocks Week 1 initialization, booking/show/match/fan/social/business execution from playable mode, save payload persistence, backend calls, browser storage, generated text, GenAI, and gameplay start until later approval.
- `AGENTS.md` repeats the same foundation-mode limits and requires stochastic behavior to stay routed through `SimulationContext`, `SimulationEngineContext`, or `RandomService`.

Missing entirely:

- A longitudinal world-state delta contract for hidden simulation effects.
- A non-mutating consequence preview contract that describes possible pressure without applying it.
- A cross-engine causal map that explains which hidden reads can later feed which downstream systems.
- A deterministic telemetry/tuning surface that records shell readiness, signal bands, and blocked reasons across engine chains without exposing formulas to players.

## Engine-Level Gaps

### Seeded RNG and Simulation Context

Exists today:

- `RandomService` normalizes string/number seeds and exposes deterministic draws through `next()`, bounded `integer()`, boolean `chance()`, and `weightedChoice()`.
- `createSimulationContext()` freezes `seed`, `seedLabel`, `random`, replay metadata, diagnostics, and a `createRandomService(seedOverride)` factory.
- `createSimulationEngineContext()` wraps the simulation context with `week` and optional `debug`.
- Tests assert same-seed replay, different-seed divergence, shared context usage, and absence of direct `Math.random`.

What is stochastic now:

- Match, Fan Reaction, and Social Discourse consume `context.random.next()` directly.
- Show consumes stochastic match results by passing the same `SimulationEngineContext` into each match run.

What is placeholder:

- Replay metadata exists but is not yet a complete replay transcript.
- Diagnostics metadata exists but is not yet a structured tuning/telemetry envelope.

What is missing:

- Named per-engine random streams. Today, downstream roll order depends on which engines run first against the shared context.
- A contract for deterministic draw labels such as `match.performanceVariance`, `fan.segmentVariance`, or `social.rumorVolatility`.
- A replay-facing trace that can verify draw ordering without exposing rolls in normal player-facing output.

Allowed now:

- Docs/tests/contracts for named draw labels, stream strategy, and non-player-facing replay diagnostics.

Blocked now:

- Any gameplay mutation or persistence based on the random draws.

### Match Engine

Exists today:

- `matchEngine` metadata is `match-engine-v0` / `0.9.0`.
- `runMatchEngineV0()` reads `matchRoll`, `injuryRiskRoll`, and `momentumRoll` from `context.random`.
- It computes hidden reads: `plannedMinutes`, `skillBalanceGap`, `chemistryEstimate`, `crowdEngagementRead`, and `fatiguePressure`.
- It composes `createMatchTalentRead()`, `createMatchReadSummary()`, `validateMatchFinishIntent()`, `createMatchFinishReadSummary()`, `createMatchResultShell()`, `createMatchResultExecutionGate()`, and `classifyMatchResultIntent()`.
- It emits non-numeric `EngineSignal` labels such as `competitive`, `crowd was engaged`, `chemistry concern`, `momentum shift`, `overdelivered`, and `injury scare`.

What is stochastic now:

- `matchRoll` nudges chemistry and crowd reads.
- `injuryRiskRoll` affects hidden fatigue pressure.
- `momentumRoll` can trigger a player-facing momentum signal.

What is placeholder:

- `resultShell` and `resultExecutionGate` are readiness gates, not result execution.
- `finishIntent` affects hidden finish-read/status classification, not an actual finish.
- `injury scare` is a signal label, not an injury system.
- Talent profiles are read as optional bands without applying a full match formula.

What is missing:

- No winner/loser/result object.
- No star rating, match grade, or crowd result payload.
- No title change, injury application, morale change, popularity change, rivalry change, or wrestler trajectory update.
- No style matchup, match-type risk model, chemistry history, character alignment, crowd segment fit, or performance consistency memory.
- No causal handoff that tells Fan Reaction why a finish felt protected, stolen, clean, forced, or botched beyond structural status fields.

Allowed now:

- Contract/test slices for hidden `MatchConsequencePreviewShell`, deterministic finish-read shape tests, and richer non-player-facing result-read readiness.

Blocked now:

- Real match outcomes, title changes, injuries, morale changes, popularity deltas, rivalry progression, and gameplay persistence.

### Show Engine

Exists today:

- `showEngine` metadata is `show-engine-v0` / `0.8.0`.
- `createShowEngine()` accepts an injectable `MatchSimulationEngine`.
- `runShowEngineV0()` validates booking, creates execution order, runs each booked match through Match Engine, collects `ShowMatchRunSummary`, builds `runSummary`, creates and validates `fanSocialHandoff`, creates `fanSocialOrchestrationSummary`, and aggregates match readiness.
- `runShowEngineV0()` emits a show-level signal such as `card processed`, `card needs matches`, `card needs attention`, or `show shell needs attention`.

What is stochastic now:

- Show has no direct show-level random draw.
- Its stochastic behavior comes from ordered Match Engine calls using the same `SimulationEngineContext`.

What is placeholder:

- `fanSocialHandoff` contains ordered match summaries, opener/main-event flags, result shell status, result gate status, and finish validation status.
- `fanSocialOrchestrationSummary` reports structural readiness only.
- Show readiness is a shell status, not a show grade or audience/business outcome.

What is missing:

- No show-level rating, attendance, revenue, pacing grade, crowd burnout, segment flow, broadcast quality, rival show pressure, venue/city context, or business pressure.
- No promos, angles, backstage segments, run-ins, commercial timing, or card-shape logic beyond match order.
- No show-to-fan orchestration that actually calls Fan Reaction from within the show engine. The separate smoke pipeline does that safely outside the engine.
- No durable show history or week-over-week show memory.

Allowed now:

- Docs/tests/contracts for `ShowPressureReadShell`, show-to-fan handoff completeness matrices, and non-mutating card-shape readiness.

Blocked now:

- Show grades, business systems, attendance/revenue, week advancement, booking execution from playable mode, and persisted show history.

### Fan Reaction Engine

Exists today:

- `fanReactionEngine` metadata is `fan-reaction-engine-v0` / `0.6.0`.
- `runFanReactionEngineV0()` reads `reactionRoll`, `segmentVarianceRoll`, and `tractionRoll`.
- It classifies segment reads with `classifySegmentRead()` using fan segment kind, company trust, meta awareness, and the shared reaction roll.
- It summarizes input mode through `createInputValidationSummary()`: `no-handoff`, `match-only`, `show-handoff`, or `match-and-show-handoff`.
- It derives `audienceReadSummary` from `createFanAudienceRead()` and `showOutputShell` from `createFanReactionShowOutputShell()`.
- It emits signal labels like `crowd was engaged`, `audience is cooling`, `casual fans interested`, `hardcore fans skeptical`, `overexposure concern`, `storyline gained traction`, `divisive reaction`, `push feels forced`, and `momentum is building`.

What is stochastic now:

- `reactionRoll` influences segment read classification.
- `tractionRoll` influences rivalry signal direction.
- `segmentVarianceRoll` is captured in hidden state but is not yet used for differentiated segment outcomes.

What is placeholder:

- `audienceReadSummary` is mostly a structural interpretation of show handoff readiness, opener/main-event presence, match failures, and blocked result gates.
- `showOutputShell` maps audience readiness into discourse-ready reads, but those reads are still shell categories.
- `priorSocialNarratives` are counted but do not influence reaction.

What is missing:

- No fan sentiment score, segment-specific delta, popularity/momentum/morale consequence, backlash model, trust evolution, or fatigue decay.
- No actual booking-intent perception model for pushes, burials, protection, screwjobs, overexposure, or audience rejection.
- No feedback from Social Discourse back into fan segments or promotion trust.
- No longitudinal fan memory by segment, market, wrestler, rivalry, or company.
- No tuning surface for segment weights or signal thresholds beyond the small current `FAN_TUNING` reads.

Allowed now:

- Contracts/tests for segment-read explanation shells, prior narrative input readiness, and fan-output shape validation.

Blocked now:

- Real fan score formulas, popularity deltas, trust mutation, durable fan/social state, generated text, and public narrative output.

### Social Discourse Engine

Exists today:

- `socialDiscourseEngine` metadata is `social-discourse-engine-v0` / `0.5.0`.
- `runSocialDiscourseEngineV0()` reads `discourseRoll`, `rumorRoll`, and `fragmentationRoll`.
- It accepts optional Match, Fan Reaction, and `FanSocialDiscourseHandoff` inputs.
- It maps show-output readiness into five buckets: `iwcPulseReadiness`, `mediaNarrativeReadiness`, `lockerRoomBuzzReadiness`, `fanDebateReadiness`, and `trendVolatilityReadiness`.
- It creates a non-player-facing `discourseOutputShell`.
- It returns signal labels like `discourse is fragmented`, `praise cycle building`, `pushback forming`, `rumor mill active`, `IWC discourse rising`, `superstar narrative gaining traction`, `booking decision under scrutiny`, `fans are fantasy-booking alternatives`, and `viral moment potential`.

What is stochastic now:

- `discourseRoll` determines broad discourse read.
- `rumorRoll` can make rumor activity dominant.
- `fragmentationRoll` can make discourse fragmented.

What is placeholder:

- `producedNarratives` is always an empty array.
- `updatedNarrativeIds` mirrors existing narrative IDs but does not evolve narrative content.
- Readiness buckets are structural categories, not generated discourse or persistent conversation state.

What is missing:

- No narrative creation, no narrative mutation, no rumor lifecycle, no source credibility, no media/IWC/locker-room channel differentiation beyond bucket names.
- No decay, amplification, quote/reaction memory, or feedback into fan trust.
- No link between discourse outputs and player-facing report surfaces.
- No moderation of noisy public discourse into safe player-facing signal summaries.

Allowed now:

- Contracts/tests for discourse readiness inputs, narrative lifecycle blocked reasons, and non-generative signal-summary DTOs.

Blocked now:

- Generated tweets, reports, articles, rumors, prompt builders, GenAI, persistent social narratives, and gameplay effects from social discourse.

## Cross-Engine Gaps

### Handoffs

Exists today:

- Match emits `changedWrestlerIds`, `changedRivalryIds`, result shell status, result gate status, and finish-read summaries.
- Show packages match summaries through `createShowFanSocialHandoff()` and validates them through `validateShowFanSocialHandoff()`.
- Fan Reaction converts show handoff readiness into `FanReactionShowOutputShell`.
- `createFanSocialDiscourseHandoff()` validates the fan show-output shell into a DTO Social Discourse can consume.
- `createEnginePipelineStructuralSummary()` reports stage readiness across show, match, fan, handoff, and social stages.

Shell exists but does not execute:

- `runMatchFanSocialSmokePipeline()` and `runShowFanReactionSmokePipeline()` prove sequencing only. Comments explicitly say they must not advance time, mutate state, persist saves, create fan outcomes, call Social Discourse in the show-fan smoke path, or make booking decisions.

Missing entirely:

- A full Show -> Fan Reaction -> Social Discourse smoke path that starts with show input, carries validated show output all the way into social discourse, and remains structural only.
- A causal payload vocabulary for "why" a reaction happened, separate from formulas and rolls.
- A standard blocked-reason taxonomy shared across match, show, fan, and social shells.

### Propagation

Exists today:

- IDs propagate from match to fan/social through result fields and handoffs.
- Structural readiness propagates from show to fan to social.

Missing entirely:

- Consequence propagation is not modeled. There is no approved `WorldDelta`, `SimulationDelta`, `PressureDelta`, or `SignalDelta` contract.
- Longitudinal state is absent. There is no week-to-week memory for fatigue, injuries, popularity, fan trust, morale, rivalry heat, discourse arcs, business pressure, or company momentum.
- No engine currently records "this result should matter later" in a way that is durable but non-mutating.

### Tuning and Telemetry

Exists today:

- `MATCH_TUNING` and `FAN_TUNING` provide limited constants.
- Debug traces can include hidden rolls when explicitly enabled and are marked `playerFacing: false`.

Missing entirely:

- No per-engine tuning manifest documenting current knobs, expected signal ranges, and future ownership.
- No telemetry event contract for deterministic shell runs.
- No test fixture matrix covering low/high trust, forced push, protected finish, overexposed star, hot rivalry, cold crowd, or split audience cases across all engine shells.

Allowed now:

- Non-player-facing telemetry contracts, fixture matrices, snapshot tests for readiness/status/signals, and docs describing future tuning ownership.

Blocked now:

- Live telemetry persistence, business analytics, player-facing formulas, or UI wiring.

## Gameplay Simulation-Vibe Gaps

The player still cannot feel consequences because current outputs are isolated reads, not durable pressure loops.

What the player cannot feel yet:

- A risky match finish paying off or backfiring across multiple weeks.
- A fanbase splitting because hardcore fans see a push as forced while casual fans get invested.
- A wrestler getting hot through happy accidents.
- A rivalry gaining mythic momentum through match quality, finish controversy, and social amplification.
- A stale act becoming overexposed and hurting show trust.
- A protected finish preserving one wrestler while frustrating another audience segment.
- Backstage politics changing cooperation, morale, leaks, or consistency.
- Rival companies creating scheduling, talent, market-share, or discourse pressure.
- Business pressure tightening booking choices without becoming an exposed spreadsheet.
- The game remembering "what fans believe happened" separately from "what actually happened."

The current shell stack is still valuable because it draws the right boundary: hidden state can be numeric and stochastic, while player-facing output remains signals. The next work should make those shells better at describing causal readiness and future consequences without executing gameplay progression.

## Top 10 Gap List

| Rank | Gap | Impact (player-facing) | Risk (architecture) | Effort | Boundary |
| --- | --- | --- | --- | --- | --- |
| 1 | Non-mutating consequence preview contract for Match -> Show -> Fan/Social | Lets future UI/reporting explain possible consequences without applying them | Medium: must avoid becoming real outcome execution | M | Allowed now as docs/tests/contracts |
| 2 | Shared causal reason taxonomy across engines | Makes "why fans reacted" coherent without exposing formulas | Medium: taxonomy can become too broad if not scoped | M | Allowed now as contract/doc slice |
| 3 | Show -> Fan -> Social structural smoke path | Proves full card-level handoff readiness instead of only match-level full path or show-to-fan partial path | Low/Medium: sequencing can be mistaken for orchestration | S/M | Allowed now if smoke-only and non-mutating |
| 4 | Named deterministic draw labels/stream policy | Improves replay debugging and protects engine-order determinism | Medium: changing streams can alter existing shell outputs | M | Allowed now as docs/tests first; behavior changes require care |
| 5 | Segment-specific fan readiness matrix | Makes crowd reads feel less generic before real fan formulas exist | Low: can stay shape-only | S/M | Allowed now as fixtures/contracts |
| 6 | Prior narrative/discourse input readiness shell | Sets up social memory without generating text | Low/Medium: avoid narrative generation creep | S | Allowed now as docs/tests/contracts |
| 7 | Match finish-causality handoff fields | Gives fan/social systems future context for clean/protected/controversial finishes | Medium: close to result execution | M | Allowed now only as inert readiness/read shape |
| 8 | Tuning manifest for match/fan/social shell knobs | Makes future balancing intentional and testable | Low | S | Allowed now as docs-only or static contract |
| 9 | Longitudinal memory boundary contract | Defines how future arcs persist without implementing persistence now | High: easy to cross into gameplay payload persistence | M/L | Docs-only allowed; implementation blocked |
| 10 | Player-facing report DTO boundary | Translates hidden signal groups into future reports without formulas | Medium: can drift into UI or generated text | M | Contract/tests allowed; UI/generated text blocked |

## Suggested Next 3 Slices Within Current Boundaries

### 1. Engine Causal Reason Taxonomy Shell

Allowed scope:

- Add docs and tests for a shared hidden-only taxonomy such as `finish-protection`, `crowd-fit`, `booking-trust`, `overexposure`, `structural-readiness`, `social-fragmentation`, and `handoff-missing-context`.
- Prove stable ordering and no player-facing formulas.
- Keep it as a contract/readiness shell only.

Do not do:

- Do not calculate outcomes, fan scores, popularity deltas, or morale.
- Do not persist causal reasons.
- Do not surface exact numeric weights to players.

Testable acceptance:

- Same input yields the same ordered causal reason IDs.
- Player-facing signals do not include hidden roll names, formulas, or numeric deltas.
- `rg "Math\\.random" src tests` stays clean.

### 2. Show -> Fan Reaction -> Social Discourse Structural Smoke Pipeline

Allowed scope:

- Add a smoke-only helper parallel to `runShowFanReactionSmokePipeline()` that carries a show-level fan output shell into `createFanSocialDiscourseHandoff()` and `socialDiscourseEngine.run()`.
- Add tests proving the helper is deterministic, non-mutating, non-persistent, non-generative, and still returns `producedNarratives: []`.
- Keep comments explicit that this is not weekly orchestration.

Do not do:

- Do not call this from UI or save flows.
- Do not create show grades, attendance, business outputs, fan outcomes, or week advancement.
- Do not generate social text.

Testable acceptance:

- The pipeline status is structural only.
- The same seed/input replay is equal.
- A different seed only changes hidden/debug stochastic reads where currently expected.
- Social output remains shell-only and non-player-facing.

### 3. Simulation Tuning and Telemetry Dossier Contract

Allowed scope:

- Document current knobs in `MATCH_TUNING`, `FAN_TUNING`, `RandomService`, and engine signal thresholds.
- Add a static non-player-facing telemetry contract that can describe engine ID, version, seed label, readiness status, signal counts, blocked reasons, and handoff availability.
- Add tests that the telemetry DTO excludes formulas, roll values by default, and gameplay mutation fields.

Do not do:

- Do not persist telemetry.
- Do not expose telemetry in UI.
- Do not add analytics/business systems.

Testable acceptance:

- Telemetry can summarize shell readiness without hidden numeric internals.
- Debug roll traces remain opt-in and `playerFacing: false`.
- No gameplay state, save payload, or week advancement fields appear.

## Boundary Notes

The strongest near-term path is not "implement match results." It is to make the existing shells better at proving what they know, what they do not know, and what future systems may consume. That gives the simulation-vibe work a testable runway while respecting foundation mode.

The first hard boundary to keep visible in every next slice:

- Contracts can describe future consequence shape.
- Tests can prove deterministic readiness and absence of forbidden behavior.
- Docs can map engine responsibilities.
- Shells can carry hidden, non-player-facing readiness signals.
- Nothing should apply gameplay consequences, persist gameplay payloads, advance weeks, wire UI, generate text, or expose formulas until that boundary is explicitly opened.
