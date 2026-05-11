# Playable New GM Mode Initial Draft Experience Decision

## Purpose

This decision record defines how the initial playable draft should evolve after the current 3-pick mini draft preview. It is planning only. It does not approve runtime finance logic, full roster drafting, auto draft, persistence, Week 1 setup, booking, gameplay initialization, or new draft-system implementations.

The current 3-pick mini draft remains the proof-of-play slice. The next product question is not whether the draft can run, but what the first durable playable draft loop should become once the local-only preview is ready to expand.

## Current Baseline

Playable New GM Mode currently treats draft execution as a controlled, local-only, in-memory UI-to-domain flow. It must keep using the approved Real Draft System v1.0 composition path rather than creating duplicate draft services, parallel draft algorithms, or UI-owned draft logic.

The draft can prove player selection, candidate availability, recap projection, and post-draft locked transition language. It must not imply a saved game, full roster, persisted draft, Week 1 unlock, booking unlock, or gameplay milestone until those rules are separately approved.

## Option 1: Longer Manual Draft Preview

Example: expand the current preview from 3 manual picks to 5-10 manual picks.

### Pros

- Builds directly on the approved 3-pick mini draft loop.
- Keeps the scope smaller than a full roster draft.
- Gives the player more agency and a longer draft-night feel.
- Tests repeated pick selection, candidate availability, recap accumulation, and draft-slot progression without needing full game setup.
- Can remain browser-memory-only and reset on reload.

### Cons

- Still feels like a preview rather than a complete playable draft.
- More picks increase UI repetition without solving roster completeness.
- The player may expect the drafted talent to become a real roster.
- Recap language becomes harder to keep honest if the loop starts to feel like a real draft.
- The post-draft dashboard still needs locked language because Week 1 and booking remain unavailable.

### Risks

- Scope can drift from proof-of-play into implied roster construction.
- A longer preview can create pressure to add auto draft, rival picks, roster needs, or save payloads before those systems are approved.
- The UI could start showing incomplete roster claims, full roster categories, or future setup steps as if they are active.

### Implementation Implications

- Use the existing Real Draft System v1.0 flow and current UI-local progress model.
- Increase the approved pick count only after the 3-pick loop is stable.
- Keep all state local to the page lifetime.
- Keep recap and dashboard copy explicit that this is a local preview result.
- Do not introduce roster validation, persistence, Week 1 setup, or auto draft.

### Decision Read

This is the safest incremental path after the 3-pick mini draft, but it may still feel incomplete. It is best as a near-term expansion test, not the final playable v0.1 draft experience.

## Option 2: Simplified Full Roster Draft

Example: allow the player to draft or sign talent until a small roster size target is met.

### Pros

- Feels closer to a real playable draft.
- Gives the player a complete roster-building moment before the dashboard.
- Creates a natural bridge to roster review, divisions, championships, and Week 1 setup later.
- Gives finance and roster rules a clearer gameplay purpose once they are ready.

### Cons

- This is much larger than the current local preview loop.
- A full roster draft immediately raises questions about roster validity, divisions, championships, budget, contract rules, and save state.
- It can make the game feel broken if the player completes a roster but cannot start Week 1.
- It likely requires stronger UI states for roster needs, position/division balance, draft completion, and locked post-draft setup.

### Risks

- Premature roster validation rules.
- Premature division and championship setup.
- Premature auto-draft requirements to finish other brands or remaining slots.
- Premature roster completeness definitions.
- Premature finance rules and salary balancing.
- Premature persistence and save payload pressure.
- Premature Week 1 transitions, booking unlocks, or gameplay initialization.

### Implementation Implications

- Requires approved roster size targets before implementation.
- Requires approved draft completion criteria.
- Requires approved finance rules if draft picks become signings.
- Requires clear separation between in-memory preview roster and persisted gameplay roster.
- Should not start until the product rules for roster validity, budget, and post-draft setup are documented.

### Decision Read

This path is attractive because it feels complete, but it is the highest-risk next step. It should not be the immediate post-mini-draft expansion because it pulls too many locked systems forward at once.

## Option 3: Hybrid Key-Pick Draft

Example: the player manually signs a limited number of key roster anchors. A future controlled system can fill the remaining roster later, but that fill behavior is not part of this slice.

### Pros

- Preserves the most important player agency: choosing the top stars who define the brand.
- Avoids requiring a full roster draft in the first playable version.
- Gives finance-aware signing rules a natural role without needing the entire roster economy at once.
- Keeps the draft feeling meaningful because key picks affect identity, budget, and future roster shape.
- Can stage cleanly from the current 3-pick proof into a larger but still bounded draft flow.

### Cons

- Requires very clear player-facing language about what is complete and what remains locked.
- Needs approved rules for how many key picks the player makes.
- Still requires finance and cost-tier decisions before implementation.
- The eventual roster fill system must be designed later so the experience does not feel unfinished.

### Risks

- Players may expect remaining roster fill to happen immediately.
- Key-pick limits may feel arbitrary unless framed as a draft-night signing budget or anchor-round structure.
- Finance-aware signing can expose hidden formulas if the UI is not carefully designed.
- The path still needs guardrails against Week 1, booking, persistence, and full roster mutation before approval.

### Implementation Implications

- Keep manual picks limited and intentional.
- Treat draft choices as future talent signings once finance rules are approved.
- Define starting budget, roster size target, and cost tiers before coding price logic.
- Keep post-draft surfaces locked until full draft completion and finance rules are approved.
- Continue using the approved Real Draft System v1.0 path for draft actions rather than duplicating draft logic.

### Decision Read

The hybrid key-pick draft is the best eventual playable v0.1 direction. It keeps the first playable draft meaningful without forcing a full roster, persistence, booking, or Week 1 unlock too early. It still needs staged guardrails before implementation.

## Finance-Aware Draft Direction

The approved long-term direction is that the initial draft should eventually be tied to finances. Drafting a superstar should mean signing that superstar against a starting budget.

The player-facing rule should be simple: if the player has enough money, they can sign the superstar. The game should start with enough money to sign at least 16 superstars, but the cost of each superstar should vary by star power and value. Example only: Roman Reigns should cost significantly more than Grayson Waller.

Exact pricing formulas, salary tiers, budget numbers, contract rules, and balance targets must be decided later. This decision record does not approve finance logic implementation.

When finance-aware draft signing is eventually implemented, the UI should not expose hidden pricing formulas, hidden rolls, raw internal values, raw validation objects, or backend diagnostics. It should show understandable player-facing cost, affordability, budget impact, and signing consequence language.

## Recommended Staged Path

### Stage A: Keep Current 3-Pick Mini Draft As Proof-of-Play

Keep the current controlled in-memory mini draft as the proof that player selection, Make Pick, recap projection, and locked post-draft transition can work inside the approved local-only lane.

### Stage B: Define Draft-as-Signing Product Rules

Document what it means for a draft pick to become a signing. Define player-facing language for affordability, budget impact, roster commitment, unavailable candidates, and locked post-draft states.

### Stage C: Define Starting Budget And Roster Size Target

Define the starting budget and intended roster size target before implementation. The starting budget must be enough for the player to sign at least 16 superstars.

### Stage D: Define Superstar Cost Tiers Separately

Define cost tiers before coding price logic. Pricing should account for star power and value, but formulas and exact numbers should stay out of player-facing UI.

### Stage E: Expand To Finance-Aware Draft/Signing Flow

Only after Stages B-D are approved should the draft expand from mini draft preview into a finance-aware draft/signing flow.

### Stage F: Keep Post-Draft Setup Locked Until Approved

Post-draft setup stays locked until draft completion rules and finance rules are approved. Do not unlock Week 1, booking, roster mutation, save creation, or gameplay initialization simply because the player completed a draft preview.

## Decision

Use the hybrid key-pick draft as the target playable v0.1 direction, with the longer manual preview as a possible incremental test and the simplified full roster draft deferred until roster, finance, persistence, and Week 1 rules are approved.

The next approved planning work should define draft-as-signing product rules, starting budget principles, roster size target, and superstar cost tiers. Runtime implementation should wait until those decisions are made.

## Non-Negotiable Boundaries

- No code changes from this decision record.
- No UI changes from this decision record.
- No runtime finance logic.
- No full roster draft implementation.
- No auto draft implementation.
- No gameplay start.
- No Week 1 unlock.
- No booking unlock.
- No persistence or save payloads.
- No browser storage.
- No SQLite gameplay writes.
- No GenAI or generated text behavior.
- No match, show, fan, social, or business engine calls.
- No duplicate draft systems.
- No hidden formulas, rolls, raw internals, raw IDs, raw validation objects, or backend diagnostics in player-facing UI.
