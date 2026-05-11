# Next GM Product and Simulation Lock

Status: product and simulation execution contract.

This document does not replace `docs/finished-product-goal.md`. It refines that
destination into the product experience, data model, and simulation rules Codex
must follow while moving the current repo toward the finished game.

## 1. Relationship to Finished Product Goal

`docs/finished-product-goal.md` defines the destination: a finished playable
wrestling GM simulation game that supports starting a season, drafting/signing a
roster, assigning champions, creating rivalries, booking and running shows,
seeing consequences, advancing week to week, building toward PLEs/special events,
and saving/continuing a season.

`docs/next-gm-product-and-simulation-lock.md` defines the product experience,
simulation model, data model, and implementation rules Codex must follow to reach
that destination.

`docs/next-gm-docs-reconciliation-report.md` explains current documentation
status, historical contradictions, and which older documents are partially stale
or foundation-era.

Current code and tests remain implementation truth. If this lock conflicts with
actual implemented behavior, treat the conflict as a planning issue to reconcile,
not permission to rewrite runtime behavior without an explicit implementation
task.

## 2. Product North Star

Next GM is a premium wrestling GM simulation game where the player starts a
wrestling GM universe, competes against other brands and GMs, drafts or signs
talent under real budget pressure, assigns champions, creates and evolves
rivalries, books shows, runs shows, sees consequences, advances week to week,
builds toward PLEs and special events, and saves and continues a season.

Next GM is not:

- a SaaS dashboard
- a static screen flow
- a diagnostic shell
- GenAI making up the game
- an admin panel with wrestling labels

The product should feel like a wrestling GM universe coming alive. Rival brands,
championships, stars, money pressure, fan response, and future events should feel
present from the first session.

## 3. First 20 Minutes of Gameplay

The required first-session flow is:

1. Title Screen
2. Start New Game / Continue
3. Choose GM
4. Choose difficulty
5. Choose active brands / competing GMs
6. Choose player brand
7. Draft rules and budget intro
8. Multi-brand draft event
9. Post-draft Brand HQ
10. Assign champions
11. Create rivalries
12. Week 1 HQ
13. Book first show
14. Run show
15. Show recap

The player should feel like they are starting a real GM universe, not walking
through static setup cards. Other brands must exist visibly. The draft should
feel like an event, not solo list selection. Brand HQ should provide emotional
payoff after the draft by showing the player what they built and what now needs
attention. The next required action should always be obvious.

## 4. Game Setup Model

Game setup should define these durable concepts:

- GM identity
- difficulty: Easy, Normal, or Hard
- active brands count: 2, 3, or 4
- playable brands: Raw, SmackDown, NXT, AEW
- competing brands and GMs
- player brand
- starting budget by difficulty
- draft pool scope
- initial calendar

Difficulty v1 can begin as player-facing setup metadata. Later it should affect
starting budget, owner pressure, fan tolerance, injury and fatigue sensitivity,
and financial tightness.

The setup model must avoid single-brand assumptions. Even before deep CPU
simulation exists, the selected active brands should be modeled as participants
in the universe.

## 5. Finance Model

Player-facing finance must use real money-style labels, not tokens.

Use this display mapping unless a better repo-approved model replaces it:

| Internal budget unit | Player-facing display |
| --- | --- |
| 1 | $100,000 |
| 120 | $12,000,000 |
| 20 reserve | $2,000,000 reserve |

Finance concepts:

- starting budget
- remaining budget
- signing cost
- booking reserve
- weekly revenue later
- weekly expenses later
- merch later
- attendance later
- PLE/special event business impact later

Rules:

- Internal scaled units are acceptable.
- Player-facing UI should use money labels.
- Do not call budget "tokens."
- Finance should influence draft and booking decisions.
- Expensive stars should feel expensive.
- Roman Reigns should not look like "18 tokens"; he should look like a major
  contract.

Finance should create tradeoffs without turning the game into accounting. The
player should understand that choosing a franchise star can be worth it, but it
should constrain roster depth and future flexibility.

## 6. Draft Model

The draft is a real multi-brand drafting process:

- brands pick in order
- the player picks on their turn
- competing brands make deterministic picks
- drafted talent leaves the board
- drafted talent becomes signed to the drafting brand
- source roster is only Drafted From / Source Pool metadata
- no `Math.random`
- no deep CPU strategy in v1

The draft experience needs:

- On The Clock presentation
- visible pick order
- recent picks / ticker
- visible rival-brand picks
- budget pressure
- roster needs later
- player-drafted talent signed to the selected brand
- rival-drafted talent signed to the rival brand

V1 competing-brand logic:

- deterministic
- stable order
- simple affordability and tier logic
- no advanced CPU roster strategy yet

Draft implementation should preserve the existing direction that the source
roster is not roster ownership. Raw, SmackDown, NXT, or AEW source labels should
tell the player where the talent came from, not where that talent remains after
being drafted.

## 7. Roster and Wrestler Model

Stable base stats:

- `inRingSkill`
- `promoSkill`
- `starPower`
- `charisma`
- `stamina`
- `injuryResistance`
- `potential`
- `experience`
- `consistency`

Weekly/current state:

- `popularity`
- `momentum`
- `morale`
- `fatigue`
- `injuryRisk`
- `bookingProtection`
- `fanSupport`
- `socialBuzz`
- `championshipPrestigeBoost`

Base stats change rarely. Weekly/current state changes based on booking, show
results, rivalry usage, title usage, fan response, fatigue, and future business
systems. This separation is what makes choices compound over time: the same
wrestler can be a stable performer but have a hot, cold, exhausted, protected,
overexposed, or championship-elevated current state.

Player-facing screens should translate these concepts into readable signals
unless the task explicitly asks for debug-facing data.

## 8. Championship Model

Every active brand has:

- Men's Main title
- Men's Midcard title
- Women's Main title
- Women's Midcard title
- Men's Tag Team titles
- Women's Tag Team titles

Brand-specific titles:

| Brand | Men's Main | Men's Midcard | Women's Main | Women's Midcard | Men's Tag Team | Women's Tag Team |
| --- | --- | --- | --- | --- | --- | --- |
| Raw | World Heavyweight Championship | Intercontinental Championship | Women's World Championship | Women's Intercontinental Championship | World Tag Team Championship | Women's Tag Team Championship |
| SmackDown | WWE Championship | United States Championship | WWE Women's Championship | Women's United States Championship | WWE Tag Team Championship | Women's Tag Team Championship |
| NXT | NXT Championship | NXT North American Championship | NXT Women's Championship | NXT Women's North American Championship | NXT Tag Team Championship | NXT Women's Tag Team Championship |
| AEW | AEW World Championship | AEW TNT Championship | AEW Women's World Championship | AEW TBS Championship | AEW World Tag Team Championship | AEW Women's Tag Team Championship |

Championship systems should define:

- champion assignment
- title prestige
- title defenses
- title history later
- championship relevance in simulation

Title matches matter more when rivalry heat, event importance, and champion
prestige are high. Champions should create booking gravity: their appearances,
defenses, losses, absences, and rivalries should affect fan perception and future
show expectations.

## 9. Rivalry Model

Rivalry systems should support:

- manual rivalries
- emergent rivalries later
- no hard long-term rivalry cap
- rivalry heat
- participants
- type
- intensity
- payoff timing
- championship relevance
- rivalry progression through booking
- rivalry payoff opportunities at PLEs/special events

Manual rivalries are the starting control surface. Emergent rivalries come later
from repeated booking, surprise results, crowd reaction, social pressure, title
stakes, and compatible or clashing wrestler trajectories.

Rivalries should be more than labels. They should affect segment value, fan
expectations, championship stakes, show recap meaning, and PLE payoff logic.

## 10. Booking Model

Booking should model:

- weekly show card
- matches
- promos
- main event
- title matches
- rivalry segments
- champion appearances
- show pacing
- overuse/fatigue warnings

Not everything needs drag-and-drop in v1. The first good version can use direct
choices, simple segment creation, and strong next-action guidance.

Booking should eventually ask the player to think about:

- star power
- rivalry heat
- champion usage
- title stakes
- fatigue
- roster variety
- show pacing
- main event strength

Booking should not feel like filling a form. It should feel like shaping a live
wrestling broadcast under pressure.

## 11. Show Simulation Algorithm

Simulation is not GenAI-driven.

Core flow:

```text
static data + current game state + booking card
-> deterministic rules
-> seeded variance later
-> results
-> consequences
```

Segment scoring should happen through deterministic rules first. Seeded variance
can deepen outcomes later, but it must route through approved seeded randomness
boundaries, not raw `Math.random`.

Match quality should consider:

- in-ring skill
- star power
- rivalry heat
- title stakes
- placement on card
- fatigue
- chemistry later
- seeded variance later

Promo quality should consider:

- promo skill
- charisma
- star power
- rivalry relevance
- champion relevance
- momentum
- seeded variance later

Show grade should consider:

- segment quality
- main event strength
- champion use
- rivalry progression
- show pacing
- roster variety
- fan trust
- special event proximity later

Rules:

- No raw `Math.random`.
- Seeded variance comes later.
- Player-facing UI should explain outcomes without exposing formulas.
- GenAI must not decide the truth.

The player should see understandable result language: why a match worked, why a
promo landed, why the crowd cooled, or why a risky main event paid off. They
should not see hidden formulas as the normal gameplay interface.

## 12. Consequence Model

After each show, the game should update:

- momentum
- fatigue
- morale
- popularity
- rivalry heat
- champion prestige
- fan response
- budget/attendance/merch later
- social buzz later

The player should feel Week 2 is different because of Week 1 booking. Weekly
snapshots and deltas should eventually explain why things changed. Consequences
should be player-readable, not raw formula output.

Consequences should compound without becoming opaque punishment. A bad choice
should create a readable problem. A strong choice should create opportunity, not
certainty.

## 13. PLE / Calendar Model

Weekly shows build toward PLEs and special events. The event schedule exists as
part of the game universe, even if v1 starts with a simplified projection.

Calendar rules:

- weekly shows build toward PLE/special events
- event schedule exists
- rivalries can peak or pay off at PLEs
- title matches matter more at major events
- special events affect fan expectations and business impact
- initial v1 can use simplified calendar projection

Example events:

- WrestleMania
- SummerSlam
- Survivor Series
- Royal Rumble
- Money in the Bank
- AEW Revolution
- Double or Nothing
- All Out
- Full Gear
- NXT Stand & Deliver

Use these as game design placeholders. Legal/licensing naming can be revisited
later if needed.

## 14. GenAI Model

GenAI is optional flavor, not core truth.

Allowed later:

- IWC posts
- dirt sheet rumors
- superstar social posts
- recap flavor
- media narratives
- fan discourse flavor

Not allowed:

- GenAI decides winners
- GenAI decides budget
- GenAI decides injuries
- GenAI mutates save-critical game state
- GenAI is required for the game to run

Game facts come first. GenAI reacts to facts.

Recommended architecture:

- deterministic show/game facts become an input summary
- GenAI generates flavor from those facts
- non-AI fallback exists
- network/AI failure must not break gameplay

If GenAI is unavailable, the game should still produce deterministic recaps,
signals, consequences, and progression from structured rules.

## 15. Save/Load and Database Model

Eventual durable state:

- selected brand
- active brands
- current week
- budget
- roster
- champions
- rivalries
- calendar
- show history
- wrestler weekly state
- consequences
- save version

Likely future entities:

- `wrestlers`
- `brands`
- `gm_profiles`
- `difficulty_settings`
- `game_saves`
- `game_state`
- `contracts`
- `roster_assignments`
- `championships`
- `title_reigns`
- `rivalries`
- `shows`
- `show_segments`
- `matches`
- `match_results`
- `weekly_snapshots`
- `calendar_events`
- `ple_events`
- `finance_ledger`
- `fan_response_history`
- `social_buzz_history`

Existing save/load work is a bridge, not necessarily the final complete database
model. Future persistence should follow the locked data model. Do not add major
schema without a compatibility and versioning strategy.

Save compatibility should be treated as a product feature. A player who starts a
season should not lose that season because internal state names changed casually.

## 16. UI Experience Rules

The UI should be:

- not SaaS
- not a static dashboard
- not an admin panel
- not diagnostic
- fewer panels
- one obvious next action
- emotional after draft and show moments
- draft as an event
- Brand HQ as the feeling of running a brand
- show recap as a reward and consequence moment
- player-facing in language

Layout rules:

- no full-page scrolling where practical
- contained scrolling inside panels is acceptable
- no text overflow
- no raw backend/internal terms in normal UI

UI should reduce cognitive clutter. If a screen needs more information, use
prioritization, contained panels, progressive disclosure, or a focused next step
instead of presenting a wall of equal cards.

## 17. Current Repo Keep / Recompose / Replace Guidance

Based on current docs, local playable controllers, domain shape, and focused
tests, keep:

- static roster universe
- finance-limited draft mechanics
- brand-specific titles
- championship/rivalry setup
- booking/run show/week advancement prototypes
- save payload/preview save work
- deterministic doctrine/tests

Recompose:

- first-session flow
- draft event experience
- Brand HQ
- show recap presentation
- crowded dashboards/panels

Replace or deepen later:

- placeholder CPU behavior
- placeholder scoring/consequences
- incomplete database/content model
- token-like finance displays
- static-feeling setup flow

This is not permission to rewrite those areas in this documentation step. It is
the implementation direction for future approved slices.

## 18. Source of Truth Going Forward

Current code and tests are implementation truth.

`docs/next-gm-docs-reconciliation-report.md` explains documentation status and
historical contradictions.

`docs/finished-product-goal.md` defines the final destination.

`docs/next-gm-product-and-simulation-lock.md` defines the product/simulation
execution contract.

Older foundation docs are historical unless explicitly referenced by current
doctrine, the reconciliation report, or this lock.

## 19. Next Implementation Priorities

After this document, implementation should proceed in this order:

1. Make first 20 minutes comply with this lock.
2. Rebuild/recompose New Game Setup.
3. Rebuild/recompose multi-brand draft event.
4. Rebuild/recompose Post-Draft Brand HQ.
5. Convert finance display to money-style labels.
6. Deepen simulation/data model according to this lock.
7. Harden save/load against this state model.
8. Add GenAI flavor only after deterministic facts are stable.

Each implementation slice should preserve deterministic replay, avoid raw
`Math.random`, protect hidden/player-facing boundaries, and stay scoped to the
approved milestone.
