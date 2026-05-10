# Match Engine

## Purpose

The match engine will eventually simulate wrestling matches as entertainment events, not only athletic contests. It should produce hidden outcome state and player-facing signals that describe how the match landed with wrestlers, fans, media, and the broader market.

The current approved baseline includes the production shell engine
`match-engine-v0` at metadata version `0.9.0`. This is a foundation exception:
the shell may validate inputs, classify structural result intent, use seeded
randomness through the shared engine context, and return hidden state plus
player-facing signal shells. It must not execute finishes, select winners, infer
real outcomes, or create consequences.

## Design Goals

- Model match quality and audience perception as related but distinct.
- Support stochastic outcomes through seeded randomness.
- Let good booking improve odds without guaranteeing success.
- Allow happy accidents, botches, chemistry spikes, polarizing finishes, and unexpected star-making moments.
- Preserve enough hidden state for downstream fan, social, rivalry, morale, and company systems.
- Keep player-facing results signal-based rather than formula-based.

## Future Inputs

Likely inputs include:

- Wrestler skill, stamina, health, confidence, popularity, credibility, and freshness.
- Match type, stipulations, length, placement, stakes, finish style, and expected winner.
- Story context, rivalry heat, recent booking history, and character alignment.
- Audience composition and company brand expectations.
- Backstage cooperation, morale, politics, and willingness to execute the plan.
- External pressure from rival shows, market trends, and social narratives.

## Future Hidden Outputs

The engine should eventually produce hidden structured values such as:

- Performance quality.
- Story execution.
- Chemistry.
- Crowd engagement.
- Finish acceptance.
- Momentum changes.
- Credibility changes.
- Injury or fatigue effects.
- Morale effects.
- Volatility and confidence metadata.

These values are for downstream engines and deterministic testing, not direct player display.

## Future Player-Facing Outputs

The player should see signals such as:

- Match recap.
- Crowd response summary.
- Announcer or press notes.
- Backstage reaction hints.
- Fan trend movement.
- Rumor-grade injury or morale notes when appropriate.
- Confidence-qualified scouting or analytics reports.

Avoid showing exact random rolls, exact quality formulas, or exact internal deltas.

## Randomness Rule

Do not use `Math.random` in this engine. The current shell and future scoped
match work must receive seeded randomness through `SimulationContext`,
`SimulationEngineContext`, or `RandomService`. The same seed and same inputs
should produce replayable simulation results.

## Tuning Rule

Use named tuning constants for weights, thresholds, variance bands, fatigue effects, chemistry effects, and finish modifiers. Do not bury magic numbers in match calculation code.

## Engine Boundary

The match engine should decide how the match performed and what changed immediately because of the match. It should not own:

- Long-term fan discourse.
- Full rivalry lifecycle.
- Company finances.
- Database persistence.
- UI formatting.
- AI-generated prose.
- Title changes.
- Injuries.
- Morale effects.
- Real consequence systems.

Those belong to adjacent systems.
