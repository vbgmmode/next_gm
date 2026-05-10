# Social Discourse Engine

## Purpose

The social discourse engine will eventually simulate public wrestling conversation: social media reactions, IWC narratives, rumor spread, backlash cycles, memes, factional fan arguments, and the way discourse feeds back into perception.

The current approved baseline includes the production shell engine
`social-discourse-engine-v0` at metadata version `0.5.0`. This is a foundation
exception: the shell may consume hidden fan/social handoff DTOs, map structural
readiness buckets, use seeded randomness through the shared engine context, and
return hidden state plus player-facing signal shells. It must not generate
discourse, tweets, reports, rumors, narratives, GenAI, real sentiment, scoring,
or consequences.

## Design Goals

- Make discourse noisy, reactive, and sometimes unfair.
- Reflect meta-aware fans who discuss booking intent, backstage rumors, pushes, burials, and company trust.
- Let social narratives amplify or dampen fan reaction.
- Create imperfect information for the player through rumors, trends, summaries, and conflicting takes.
- Avoid direct AI-generated text until that feature is explicitly approved.

## Future Inputs

Likely inputs include:

- Fan reaction engine outputs.
- Match and segment outcomes.
- Rivalry events across matches, promos, backstage segments, and tweets.
- Wrestler popularity, credibility, controversy, and backstage perception.
- Company trust, brand identity, and recent booking patterns.
- Rival-company events and market pressure.
- Leak probability, rumor credibility, and media interest.

## Future Hidden Outputs

The engine may produce:

- Narrative topics.
- Sentiment by audience cluster.
- Volatility.
- Meme or trend strength.
- Rumor spread.
- Backlash risk.
- Discourse fatigue.
- Company trust pressure.
- Wrestler heat quality.

## Player-Facing Signals

Discourse should reach the player as:

- Trend summaries.
- Simulated tweet-like snippets only after non-AI text rules are defined.
- Rumor reports.
- Dirt-sheet style summaries.
- Fan forum temperature.
- Conflicting analyst takes.
- Warnings that a story is becoming polarizing, stale, beloved, mocked, or misunderstood.

During the foundation phase, keep examples descriptive and non-generated. Do not build AI text generation.

## Noise And Imperfect Information

Social discourse should not be a perfect truth oracle. Rumors can be wrong. Loud fan clusters can overrepresent minority views. A backlash can fade, harden, or become part of the act. Positive buzz can fail to convert into ratings or ticket sales.

## Randomness Rule

Do not use `Math.random` in this engine. Current and future scoped discourse
volatility, rumor spread, and amplification work must use `SimulationContext`,
`SimulationEngineContext`, or `RandomService`.

## Engine Boundary

The social discourse engine should model public conversation and its pressure on perception. It should not own:

- Core match simulation.
- Primary fan sentiment calculation.
- Persistence.
- UI rendering.
- AI-generated prose.
- Business systems.
- Fan/social save payloads.
- Real consequence systems unless separately scoped.
