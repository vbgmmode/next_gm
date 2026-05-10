# Simulation Doctrine

## Vision

This is a procedural wrestling industry simulator about booking in an unstable attention economy. The player is not solving a transparent optimization puzzle. They are managing incomplete information, conflicting audience expectations, budget pressure, superstar ambition, backstage politics, market competition, and entertainment outcomes that can surprise everyone.

The core fantasy is being the best booker: building stars, reading the room, outmaneuvering rivals, surviving bad luck, spotting happy accidents, and making audiences believe the next show matters.

## Core Beliefs

Match quality matters, but perception matters just as much. A technically excellent match can land flat if fans reject the story, resent the push, or believe the finish insulted them. A messy match can become iconic if it feels urgent, surprising, authentic, or perfectly timed.

Booking creates probability, not certainty. Strong setup should improve the odds of a great outcome, but it should never guarantee one. Poor setup should increase risk without making success impossible.

Fans are meta-aware. They react to perceived booking intent, pushes, burials, overexposure, backstage reputation, social media discourse, contract rumors, company trust, and whether the promotion seems to understand its own audience.

Rivalries are multimedia narratives. A feud is not only a chain of matches. It can develop through promos, backstage appearances, match results, fan discourse, tweets, press rumors, and contrast with rival-company programming.

## Hidden State And Public Signal

Internal simulation values may be numeric. Player-facing output should usually be signal-based:

- Reports.
- Rumors.
- Tweets.
- Segment summaries.
- Crowd trends.
- Locker-room notes.
- Press narratives.
- Fan discourse patterns.
- Confidence ranges.

The player should infer and decide. Do not expose exact formulas, exact fan-segment weights, exact morale deltas, or exact random rolls in normal play.

## Uncertainty Model

Uncertainty should come from several sources:

- Performance variance.
- Audience segment disagreement.
- Social amplification.
- Rival-company movement.
- Wrestler morale and backstage politics.
- Timing, fatigue, overexposure, and injuries.
- Imperfect scouting and reporting.

The simulation should support polarized outcomes. A forced push may work, backfire, or split the audience. A risky underdog win may launch a star, create resentment, or be ignored if the setup was weak.

## Progression

Wrestlers should evolve and decay over time. Popularity, skill, health, confidence, mystique, credibility, and audience freshness should be dynamic. A wrestler's trajectory should be shaped by booking, match outcomes, character fit, backstage perception, aging, and luck.

Companies should diverge from a shared baseline through their choices and outcomes. Market share, profitability, star power, momentum, fan trust, and brand identity should move in response to repeated booking patterns rather than a single isolated result.

## Backstage Politics

Backstage politics should be a moderate management layer. It should matter enough to create tradeoffs and tension, but not so much that it overwhelms booking. Politics should influence morale, cooperation, leaks, performance consistency, and willingness to accept creative direction.

## Current Foundation Boundary

The foundation phase now includes approved backend shells, but they are still
bounded foundation work rather than gameplay systems.

Approved foundation exceptions:

- Production shell engines exist for Match, Show, Fan Reaction, and Social
  Discourse. They provide deterministic structural outputs, hidden state, and
  player-facing signal boundaries only.
- Hidden/player-facing boundaries are part of the current backend contract.
- Seeded randomness through `SimulationContext` and `RandomService` is approved.
- SQLite identity-only persistence probes are approved.
- SQLite initialization/migration scaffolding is approved only for the current
  identity schema.
- Durable SQLite save identity create, read, and list shells are approved for
  identity records only.
- Minimal `save_metadata` row usage is approved only as identity support.
- `schema_migrations` tracking is approved for the identity schema.
- Diagnostics-only capability and status reporting is approved for the durable
  identity boundary.

Important distinction: identity persistence is approved only for durable save
identity records and the minimal metadata needed to prove identity
round-tripping. Gameplay persistence is still not approved.

Still not approved unless separately scoped:

- Full gameplay persistence.
- Gameplay payload persistence.
- Draft, roster, championship, division, calendar, week, match, show, rivalry,
  business, fan/social, generated-text, or GenAI persistence.
- Full save repository object behavior.
- Full save load/list behavior beyond identity-only read/list.
- Save update behavior.
- Save delete behavior.
- Player-facing save management.
- UI save/load/list wiring.
- Frontend UI wiring.
- Generated text or GenAI.
- Business systems.
- Real match outcomes, title changes, injuries, morale changes, or consequence
  systems.
- Gameplay start or week advancement.
- Gameplay features beyond the current foundation shells.
