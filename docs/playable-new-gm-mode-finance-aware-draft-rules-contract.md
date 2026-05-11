# Playable New GM Mode Finance-Aware Draft Rules Contract v0.1

## 1. Purpose

This contract defines the future product rules for turning the initial draft into a talent-signing experience. The intended direction is that each drafted superstar eventually costs budget, and the player uses a starting draft budget to sign talent.

This document is planning and contract only. It does not implement pricing, budget deduction, persistence, save payloads, gameplay finance, roster mutation, Week 1 setup, booking, or any runtime behavior.

The 3-pick mini draft was the proof-of-play flow. The next playable direction is a finance-limited local draft where budget and candidate availability decide how long signing can continue. Sixteen superstars is a minimum roster viability and budget calibration principle, not a hard draft completion cap.

## 2. Approved Product Direction

- Drafting a superstar means signing them against the player's starting budget.
- If the player has enough budget, they can sign the superstar.
- The game should start with enough budget to sign at least 16 superstars plus leave money for the beginning of booking.
- The signed superstar count should be decided by finance and availability, not by a hard roster cap.
- Superstar cost should vary by star power and value.
- Example only: Roman Reigns should cost significantly more than Grayson Waller.
- Exact pricing formulas, salary tiers, contract rules, and budget numbers are deferred.

The player-facing experience should feel like draft-night roster building, not accounting work. The draft board can communicate cost, affordability, and risk, but it must not expose hidden formulas or internal scoring.

## 3. Budget Concepts

These are future product concepts, not implemented fields or runtime requirements in this slice.

### Starting Draft Budget

The budget available at the start of the initial draft/signing flow. It should be large enough to let the player sign at least 16 superstars when following reasonable roster-building choices and still preserve early booking flexibility.

### Remaining Draft Budget

The draft budget left after completed signings. It should help the player understand tradeoffs during the draft without implying a full finance simulation before that system is approved.

### Superstar Signing Cost

The future cost assigned to a superstar for draft/signing purposes. Cost should reflect star power and value, but exact formulas and numbers remain deferred.

### Affordability State

The player-facing status that tells whether a superstar can be signed with the current remaining draft budget. This should be expressed as clear states, not raw calculations.

### Minimum Viable Roster Count

The minimum number of superstars required before the player can finish the local draft. This is not a hard cap. Reaching it should mark the roster as viable while still allowing more manual signings if budget and available affordable candidates remain.

### Minimum Viable Roster Principle

The starting budget must support signing at least 16 superstars and leave an approved booking reserve target. This principle protects the player from a budget setup that makes a basic roster impossible or leaves the first booking step starved by default.

### Overspend Prevention

The future Make Pick or Sign action should block unaffordable signings. This should eventually happen before any budget deduction, roster assignment, persistence, or post-draft transition.

### Optional Future Reserve Budget

The amount the draft experience tries to leave available for early booking and post-draft flexibility. Reserve awareness can warn the player when a signing dips below the target. Auto-fill should preserve this reserve in v0.1 instead of silently spending it.

## 4. Cost Tier Language

Cost tiers are UI-safe labels only. They do not define exact prices, salary bands, formulas, or hidden thresholds.

| Cost Tier | Intended Player-Facing Meaning | Balancing Risk |
| --- | --- | --- |
| Franchise | A promotion-defining superstar who can anchor the brand identity but consumes a major share of budget. | If too cheap, every draft becomes top-heavy. If too expensive, marquee signings feel punished. |
| Main Event | A top-card talent expected to carry major programs and headline major shows. | If too many fit here, the tier stops feeling special. If too few fit here, the board may feel shallow. |
| Upper Card | A strong featured talent who can support main events or lead major divisions. | If priced too close to Main Event, players may skip them. If priced too close to Mid Card, they become automatic value picks. |
| Mid Card | A reliable roster builder with useful upside, depth, or weekly TV value. | If too cheap, budget pressure disappears. If too expensive, balanced roster construction becomes frustrating. |
| Prospect | A lower-cost developmental or upside signing who may not carry the brand immediately. | If upside is too strong, prospects become a dominant strategy. If too weak, players ignore them. |
| Specialist | A talent with a focused role such as tag depth, character utility, faction fit, veteran stability, or niche division support. | If the role is unclear, the tier feels like a dumping ground. If too efficient, specialists crowd out broader roster builders. |

The UI should prefer these labels or similarly player-safe terms over exposing exact hidden star-power math.

## 5. Affordability States

Affordability states should explain what the player can do without exposing raw formulas, hidden scores, or backend diagnostics.

### Affordable

The superstar can be signed with the current remaining draft budget. The UI should make the action available if all other draft rules are satisfied.

### Expensive But Affordable

The superstar can be signed, but the signing would create meaningful budget pressure. The player should understand that choosing this talent may limit roster flexibility later in the draft.

### Not Affordable

The superstar cannot be signed with the current remaining draft budget. The action should be blocked with player-facing language that explains the budget constraint.

### Locked Pending Rules

The superstar or signing action is blocked because the required product rules are not approved yet. This is useful during staged implementation and should not look like a gameplay penalty.

### Already Drafted/Signed

The superstar is no longer available because they were already selected in the current draft/session. The UI should treat them as unavailable without exposing raw internal IDs or validation objects.

## 6. Draft Board UI Implications

The future finance-aware draft board should eventually show:

- Current budget.
- Remaining budget.
- Cost tier or estimated cost.
- Affordability status.
- Warning when signing a superstar would limit roster flexibility.
- Warning when signing a superstar would dip into the booking reserve target.
- Clear blocked state for unaffordable talent.
- Minimum roster viability status, separate from draft completion.

The future finance-aware draft board should not show:

- Hidden star power formulas.
- Raw engine values.
- Internal validation objects.
- Backend diagnostics.
- Raw hidden scores.
- Salary formulas or tuning thresholds.
- Runtime debug traces.

The player should understand the decision without being invited to reverse-engineer the system.

## 7. Staged Implementation Path

Each stage requires separate approval before implementation. The listed files are likely touch points, not pre-approval to edit them.

| Stage | Expected Tier | Likely Files | What It Adds | What Remains Blocked |
| --- | --- | --- | --- | --- |
| Stage A: Read-only cost tier projection | Tier 2 if UI-local only, Tier 3 if sourced from domain data | `ui/playable-new-gm-mode/*`, possible read-only adapter, docs | Shows UI-safe tier labels without prices or budget math. | Budget deduction, affordability blocking, persistence, full draft, Week 1, booking. |
| Stage B: UI-only budget preview | Tier 2 | `ui/playable-new-gm-mode/app.js`, preview state helpers, styles, docs | Shows mock or local-only budget preview language to test layout and comprehension. | Real finance rules, real deduction, domain budget state, persistence. |
| Stage C: Controlled in-memory affordability check | Tier 3 | UI draft adapter/controller plus existing Real Draft System path or approved narrow domain helper | Checks whether a selected talent is affordable inside the page lifetime. | Budget deduction, save payloads, SQLite writes, Week 1, gameplay start. |
| Stage D: Controlled in-memory budget deduction on Make Pick | Tier 3 | UI controller, draft action controller, focused tests, approved domain composition path | Deducts local in-memory draft budget after a successful approved pick/sign action. | Persistence, full finance system, full roster draft, booking, gameplay finance. |
| Stage E: Finance-limited local draft with minimum viability | Tier 4 | Existing playable UI controller, draft action controller, finance projection helper, focused tests, docs | Replaces the 3-pick proof cap with budget-limited local signing, minimum viability status, reserve warnings, optional deterministic Auto-Fill toward 16, and local Finish Draft. | Persistence, saved roster state, Week 1, booking, gameplay finance, full roster fill beyond approved local draft. |
| Stage F: Roster target/composition rules | Tier 3 or Tier 4 depending on whether it remains draft-only or crosses gameplay roster validation | Draft rules docs, possible domain contract helpers, UI warning states | Defines composition guidance and future roster quality checks without treating 16 as a hard cap. | Championship setup, divisions, booking, calendar, gameplay roster persistence. |
| Stage G: Decision point before full draft or hybrid roster fill | Tier 1 for docs, Tier 3 or Tier 4 for implementation depending on selected path | Decision docs, roadmap, future UI/domain contracts | Chooses whether to expand into full draft or hybrid key-pick plus controlled fill. | Any implementation until product path is approved. |
| Stage H: Persistence/save payloads only after explicit approval | Tier 4 | Future persistence contracts, save payload docs, SQLite gameplay schema, tests | Persists approved draft/signing results only after gameplay persistence is approved. | Any persistence before explicit approval, browser storage shortcuts, partial save payloads. |

The recommended path is staged local-only expansion before any durable gameplay: prove finance projection, then in-memory spend, then finance-limited continuation, and only later decide whether to expand into a full draft, hybrid roster fill, or persistence. Stage H is explicitly out of scope until gameplay persistence is approved.

## 8. Non-Negotiable Boundaries

- No durable gameplay finance logic without explicit approval.
- No persistent budget deduction or saved payroll without explicit approval.
- No final prices in the v0.1 placeholder economy.
- No salary formulas in the v0.1 placeholder economy.
- No persistence or save payloads.
- No browser storage.
- No SQLite gameplay writes.
- No Week 1 initialization.
- No booking.
- No gameplay start.
- No match, show, fan, social, or business engine calls.
- No generated text or GenAI.
- No duplicate draft systems.
- No hidden formulas or raw values in player-facing UI.

Finance-aware drafting should be staged from product rules to local-only previews to controlled in-memory checks before any durable gameplay or persistence surface is introduced.
