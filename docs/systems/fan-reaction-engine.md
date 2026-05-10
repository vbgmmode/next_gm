# Fan Reaction Engine

## Purpose

The fan reaction engine will eventually translate booking, match outcomes, wrestler trajectories, and company trust into audience perception. It should model fans as segmented, opinionated, and meta-aware rather than as one flat popularity score.

The current approved baseline includes the production shell engine
`fan-reaction-engine-v0` at metadata version `0.6.0`. This is a foundation
exception: the shell may consume structural handoff inputs, maintain hidden
audience readiness internals, use seeded randomness through the shared engine
context, and return player-facing signal shells. It must not create real fan
sentiment, scores, attendance, revenue, grades, generated text, or consequences.

## Design Goals

- Treat perception as a first-class simulation result.
- Model disagreement between fan segments.
- React to booking intent, not just match quality.
- Capture overexposure, forced pushes, burials, underdog energy, credibility, and audience fatigue.
- Convert hidden state into player-facing signals, trends, and reports.

## Audience Segments

Future audience modeling may include segments such as:

- Casual fans.
- Hardcore fans.
- IWC/meta-aware fans.
- Local market fans.
- Lapsed fans.
- Family or spectacle-focused fans.
- Workrate-focused fans.
- Character/story-focused fans.

Segments should have different tolerances for risk, pacing, finishes, star protection, novelty, and perceived company manipulation.

## Booking Intent Awareness

Fans should infer intent from patterns:

- Who keeps winning.
- Who gets protected.
- Who loses despite crowd support.
- Who receives screen time.
- Who is framed as important.
- Whether a story seems earned or forced.
- Whether the company appears to be listening.

The engine should support forced pushes that succeed, fail, or polarize based on setup, performer fit, audience mood, company trust, and outcome variance.

## Hidden Inputs

Likely inputs include:

- Match engine hidden outputs.
- Wrestler popularity, credibility, freshness, and recent booking.
- Rivalry context and story clarity.
- Company trust and brand identity.
- Audience segment weights.
- Social discourse pressure.
- Market and rival-company context.

## Hidden Outputs

Future outputs may include:

- Segment-specific sentiment.
- Momentum.
- Trust shifts.
- Heat quality.
- Push acceptance.
- Overexposure risk.
- Backlash risk.
- Polarization.
- Confidence levels.

## Player-Facing Signals

Expose signals such as:

- Crowd trend reports.
- Fan polling summaries.
- Chants, boos, silence, or split reactions.
- Analyst notes.
- "Fans are starting to notice..." style warnings.
- Segment-level summaries without exact formulas.

Do not show exact weights, exact thresholds, or exact sentiment math in normal play.

## Randomness Rule

Do not use `Math.random` in this engine. Current and future scoped stochastic
reaction work must use `SimulationContext`, `SimulationEngineContext`, or
`RandomService` so reaction runs are reproducible.

## Engine Boundary

The fan reaction engine should assess audience perception. It should not own:

- Match performance simulation.
- Social media propagation details.
- Database persistence.
- Frontend UI.
- AI-generated text.
- Business systems.
- Real fan/social persistence payloads.
- Consequence systems unless separately scoped.
