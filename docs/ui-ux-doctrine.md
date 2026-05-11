# Next GM UI/UX Doctrine

## 1. Current UI Phase

UI/UX planning is complete enough to begin durable documentation. This document is the first player-facing UI doctrine layer, not the start of real gameplay UI wiring.

The project is not ready for live gameplay screens yet. The next UI work should move in this order: documentation first, static/mock screens second, read-only integration only after approval, and real mutations only after explicit approval.

The first player-facing screens should be Save Selection and New GM Setup. All early UI work must use mock data, dev fixture data, or clearly labeled fake states only.

Early UI must not create real save mutation, gameplay execution, week advancement, draft execution, roster assignment, match state, show state, week state, persistence payloads, SQLite writes, or GenAI calls. The UI can show the intended shape of those experiences, but it cannot start them.

## 1A. Locked Playable New GM Mode Flow And Shell Decisions

These decisions are binding for the Playable New GM Mode prototype and future implementation prompts unless the product owner explicitly changes them.

### Art Direction / Visual Authenticity

Next GM should read as a serious premium wrestling GM management game, not a generic web dashboard. The visual blend is WWE 2K-style wrestling mode familiarity, ESPN/NFL Draft-style broadcast polish, and premium sports franchise menu clarity.

The base UI mood is dark, polished, readable, and management-focused. Everyday management screens should be calm and usable. Big moments such as draft night, PLEs, title changes, rivalry turns, show recaps, and major IWC/social fallout should receive stronger dramatic staging.

Avoid SaaS dashboard tells: bubbly cards, soft blob decoration, oversized rounded cards, pill overload, random color accents, full-page scrolling, and equal-weight card walls. Use sharp sports-broadcast rectangles, lower-third language, glass-panel surfaces, LED/titantron texture, controlled glow, and brand-led lighting.

### App Shell And Navigation

- Primary navigation is a compact macOS Dock-inspired top dock, not a side rail.
- The dock should appear as a thin always-visible top glass control surface, not a full-width website menu strip.
- Collapsed/default state shows compact icons plus the active top-level section label.
- Hover/focus state may expand to show icon plus section names only.
- Expanded navigation should overlay the screen with subtle blur or dim behind it and must not push content down.
- Icons may lift, scale, or glow slightly on hover/focus, but the treatment should stay premium and restrained.
- Navigation should adapt by screen size and must never clip labels.
- Do not use breadcrumbs for the player-facing game flow.
- Header/status shell should stay lightweight: brand logo/name plus current week/date.
- Budget, fans, next show/deadline, brand health, and major alerts belong mostly inside the Brand Dashboard hero or screen-specific command areas, not the top rail.
- No full-page scrolling. Screens must be viewport-first, with scrolling only inside contained panels.

### Locked Game Start Flow

The player experience starts with Save Selection, not Dashboard.

The early flow is:

1. Save Selection.
2. New Game / Contract Signing.
3. Setup Basics.
4. Optional Assistant / LLM Setup.
5. Choose GM.
6. Select Brand.
7. Draft Dynamics / Initial Draft.
8. Draft Recap.
9. Brand Dashboard / Week 1 Setup.

Save Selection must feel like a clean sports/wrestling game mode and save-slot screen. It should support preview states for Continue Save, New Game, Empty Slot, and invalid/corrupt save recovery. Save Selection must not look like the main dashboard.

### New Game Setup Flow

- Contract Signing should feel like a league office / GM office / brand-launch moment.
- Setup Basics should include difficulty, save name, and optional assistant setup.
- Optional assistant setup may mention an OpenAI API key or LLM setup as a skippable technical/privacy step, but core gameplay must work without AI.
- No key persistence or GenAI calls are approved in static/mock UI.
- Choose GM should use fictionalized real-world-inspired GM archetypes, not real people.
- Select Brand is a story/fantasy choice only. All brands start with the same money, prestige, resources, and baseline difficulty.
- Draft Dynamics begin only after the setup flow.

### Dashboard And GM Alerts

- The post-load home base is a cinematic Brand Dashboard.
- Dashboard hero should blend brand identity, this week's show, the biggest alert, and key status numbers.
- The main dashboard CTA should be Book / Continue This Week's Show.
- The closest secondary dashboard action should be GM Alerts.
- Dashboard density should be moderate: one cinematic hero plus a few important panels, not an analytics/admin dashboard.
- Hero background direction is contextual:
  - Weekly/dashboard: arena, crowd, stage, titantron, and broadcast energy.
  - Draft: war room, draft desk, board graphics.
  - PLE: poster-style premium event art.
  - Setup: contract signing, GM office, brand launch.
  - Major rivalry/title moment: dramatic promo-package treatment.
  - Analytics/finance: cleaner command-center style.
- GM Alerts should feel like a game objective list, not an executive briefing.
- Alert severity should support optional, important, urgent, and blocked.
- Alerts must answer what is happening, why it matters, and what the player can do next.
- Technical/gameplay risks can be clear, but creative/story alerts should stay narrative and game-like.

### Draft And Post-Draft Flow

- Draft Dynamics should feel like a sports draft broadcast on top, with GM war room controls underneath.
- The draft screen should keep visible: best available talent, roster needs by division, pick order, and rival brand picks.
- Draft picks should expose clear traits, notes, and uncertainty/ranges rather than exact hidden values.
- Player pick confirmation should be dramatic but quick: select wrestler, broadcast-style confirmation, roster fit summary, confirm pick, then immediately move to the next pick.
- Rival/AI picks should show pick result plus brand logo only by default.
- Draft Preview is pre-draft only.
- Draft Recap is post-draft only.
- After the initial draft, show Draft Recap first, then continue to Brand Dashboard / Week 1 Setup.
- Draft Recap's first view should focus on the player's full roster, grouped by division, with pick order visible inside each card.
- After draft completion, Draft Preview must not remain a primary surface.

### Post-Draft Week 1, Championships, And Rivalries

- First post-draft Brand Dashboard / Week 1 Setup should include a guided checklist: review roster, set champions/divisions, start rivalries, and book first show.
- The Week 1 checklist is recommended, not required. It can be closed at any time.
- Once closed, the checklist hides completely unless reopened manually from Settings / Help.
- Championship setup after the draft starts with manual assignment.
- Optional title recommendations may exist, but the flow must be ask for recommendations, review suggested champions, edit if needed, then confirm.
- No silent auto-assignment of champions is allowed.
- Championship setup should include champion plus division/title scene.
- Rivalries can be manually created after draft and can also emerge naturally from booking over time.
- There is no hard limit on rivalries; the UI must organize them clearly so unlimited rivalry count does not become chaos.

### Visual Style Lock

- Cards should use sharp sports-broadcast rectangles with subtle glass-panel treatment.
- Avoid bubbly, circle-heavy, pill-heavy, overly rounded UI.
- Use tactical glass as the default premium material: dark translucent layers, sharp 1px borders, inner highlights, subtle scanlines, and brand-colored under-glow.
- Dashboard hero metrics should feel like backstage monitors or production-control surfaces, not generic SaaS KPI cards.
- GM Alerts can borrow dirt-sheet leak, ticker, and taped-note visual language when severity warrants it, while staying readable and action-oriented.
- Buttons should lean premium glass/outline, with primary actions large and cinematic in hero areas and compact in dense command screens.
- Wrestler imagery should be mixed by screen:
  - Roster cards: portrait/headshot style.
  - Profiles: larger hero portrait.
  - Draft/scouting: prospect portrait cards.
  - PLE/title/rivalry moments: poster-style cutouts.
  - Early UI: intentional premium silhouettes/placeholders are acceptable.

### Brand Palette System

The initial playable brand palettes are Raw, SmackDown, NXT, and AEW. These are brand-inspired UI palettes for static/mock UI and later implementation. They must share the same layout system, typography system, navigation behavior, core components, and interaction patterns.

Base UI tokens:

- `--bg-app: #080A0F`
- `--bg-surface: #10141D`
- `--bg-surface-2: #171D29`
- `--bg-glass: rgba(18, 24, 36, 0.72)`
- `--border-subtle: rgba(255, 255, 255, 0.10)`
- `--border-strong: rgba(255, 255, 255, 0.22)`
- `--text-primary: #F4F7FB`
- `--text-secondary: #AAB4C3`
- `--text-muted: #6F7A8A`
- `--warning: #F5B942`
- `--danger: #E5484D`
- `--success: #35C46A`
- `--info: #4DB4FF`

Brand classes:

- `body.brand-raw`: `--brand-primary: #D71920`, `--brand-secondary: #8B0000`, `--brand-accent: #FFB3B3`.
- `body.brand-smackdown`: `--brand-primary: #005BFF`, `--brand-secondary: #003A99`, `--brand-accent: #58A6FF`.
- `body.brand-nxt`: `--brand-primary: #F5C518`, `--brand-secondary: #111827`, `--brand-accent: #FFFFFF`.
- `body.brand-aew`: `--brand-primary: #C9A227`, `--brand-secondary: #111111`, `--brand-accent: #F8E7A1`.

Brand color should strongly affect hero lighting, active navigation, card headers, selected states, borders, major CTA accents, and major screen identity. Dense screens stay mostly neutral/dark with brand accents. Do not use full-screen solid brand-color backgrounds, unreadable glowing text, official logos without approved local assets, or scattered hardcoded random colors.

### Anti-Botch Visual Rules

- No text overflow outside cards, buttons, nav items, table rows, draft rows, save slots, or panels.
- No full-page scrolling for major player-facing screens.
- Use viewport-first app shell regions and contained panel scrolling.
- No bubbly cards, circle-heavy UI, pill overload, random blobs, or generic SaaS grids.
- Use CSS variables/tokens before adding heavy CSS.
- Preserve premium wrestling/sports broadcast identity on every screen.
- Keep glow moderate and purposeful.
- Use truncation, line clamping, and contained overflow for long names, show titles, labels, and wrestler names.
- Draft Preview is pre-draft only; Draft Recap is post-draft only.
- Early UI remains static/mock-first and must not wire gameplay, persistence, draft execution, roster mutation, week advancement, generated text, or GenAI.

## 2. Product Experience North Star

Next GM should feel like a living wrestling broadcast universe. The player is not filling out forms in a generic management app. The player is running a wrestling brand inside a universe that has ratings pressure, social heat, locker room tension, rival brands, business tradeoffs, and unpredictable audience reaction.

The experience should blend:

- Premium dark broadcast UI.
- Clean sports analytics dashboard structure.
- Video game menu energy.
- Wrestling dirt sheet and social universe flavor.
- Corporate GM command center management layers.

Next GM is not:

- A spreadsheet simulator.
- A generic SaaS dashboard.
- A mobile-first casual app.
- A pure wrestling booking form.

The UI should make the player feel like a promotion executive, TV producer, talent evaluator, and wrestling fan all at once.

## 3. Design Pillars

### Broadcast Energy

Big moments should feel dramatic. Draft night, show results, title changes, PLEs, major turns, breakout performances, and major social reactions should get stronger staging than everyday management.

### GM Control

The player should feel like the decision-maker. The UI can warn, summarize, advise, and organize information, but it should not take control away or quietly make creative decisions.

### Clarity Before Depth

Important decisions should be readable immediately. Deeper detail belongs in tabs, expansion panels, details pages, comparison views, and secondary screens.

### Wrestling Logic Over Spreadsheet Logic

Rankings, title scenes, social reactions, rivalries, momentum, morale, and business outcomes should feel like wrestling logic. The UI should avoid exposing formulas as if the game were an accounting worksheet.

### Consequences After Action

The UI should not predict show ratings, fan reaction, match grades, rivalry gains, morale movement, title prestige movement, social buzz, or business impact before the player runs the show. Creative feedback is retrospective.

### Static First, Real Wiring Later

Early UI work should prove layout, feel, navigation, hierarchy, and screen behavior before connecting real backend systems. Static screens should be treated as product proofs, not throwaway sketches.

## 4. App Shell and Navigation Doctrine

The locked top-level sections are:

1. Dashboard
2. Booking
3. Roster
4. Scouting
5. Calendar
6. Management
7. Settings

Navigation should use a hover-revealed top navigation or compact hidden navigation pattern to preserve usable screen space. Main movement should also happen through dashboard cards and screen-specific actions.

Do not use breadcrumbs. Use strong screen headers, tabs, and explicit back buttons instead. Navigation should feel like a game hub, not an enterprise admin app.

Playable New GM Mode uses a top-positioned dock pattern: compact glass capsule, icon-first collapsed state, active section label, and hover/focus expansion to icon plus section name. The dock must not show budget, fan count, alerts, metrics, breadcrumbs, long descriptions, or notification copy. It should remain viewport-first on 11-13 inch laptop screens and should never become a side rail or full-width SaaS navbar.

The global app header should stay lightweight and should always make only these basics visible:

- Brand logo/name or placeholder mark.
- Current week, season, or date.

Budget, fan count, next show/deadline, brand health, and major alerts belong mostly inside the Brand Dashboard hero or screen-specific command areas.

Sub-section organization:

Booking:

- Book Show.
- Show Results / Recent Shows, if needed.

Roster:

- Wrestlers.
- Rivalries.
- Championships.
- Divisions.
- Contracts.
- Health/Morale.

Scouting:

- Draft.
- Prospects.
- Free Agents.
- Scout Reports.

Management:

- Social/IWC.
- Analytics.
- Finance.

### No Full-Page Scrolling / Viewport-First Layout

Player-facing screens should feel like a fixed premium wrestling GM cockpit, not a scrolling webpage or SaaS dashboard. Each major screen should fit inside the visible app viewport, especially on 11-13 inch laptop screens.

The app shell, global header, and primary navigation should remain fixed or visually stable while the player moves through a screen. Full-page vertical scrolling is not the default interaction model. If a screen needs more content than the viewport can show, the extra content belongs inside contained panels, tabs, sub-tabs, drawers, modals, or progressive disclosure.

Allowed internal scroll areas:

- IWC/social feed.
- Draft talent pool.
- Roster tables/lists.
- Analytics report panels.
- Calendar/event lists.
- Scouting reports.
- Save lists when many saves exist.
- Debug/diagnostic detail panels.

Implementation guidance:

- Use fixed-height screen regions that are sized from the app viewport.
- Contain overflow inside cards, panels, drawers, modals, and data regions.
- Do not allow text to spill outside cards or controls.
- Compress cards responsively on laptop widths before adding page scroll.
- Use truncation or ellipsis for long names, labels, show titles, and wrestler names.
- Add internal scrollbars where dense data requires them.
- Use tabs, sub-tabs, drawers, modals, and progressive disclosure instead of long pages.
- Avoid layouts that depend on full-page vertical scrolling.
- Preserve readable hierarchy without letting cards stretch endlessly.

Codex implementation warning: future UI prompts must treat full-page scrolling as a design bug unless explicitly approved. If a screen needs more content than the viewport allows, use contained panel scrolling, tabs, drawers, modals, or progressive disclosure.

## 5. First UI Implementation Priority

Implementation order:

1. UI/UX doctrine document.
2. Static app shell mock.
3. Static save selection mock.
4. Static New GM setup mock.
5. Static setup review/summary mock.
6. Static draft-night preview shell.
7. Read-only backend integration only after static screens are approved.
8. Real mutations only after explicit approval.

The first player-facing screens are Save Selection and New GM Setup.

### Save Selection

The default view should be save cards. A list mode can exist later for players with many saves.

Save cards show:

- Brand.
- GM name.
- Season, week, and date.
- Difficulty.
- Last played.
- Next show.
- Next PLE.

Save cards should not show champions. Champions are part of loaded-game context, not save-picker identity.

Save thumbnails should be poster-style branded visuals. They should sell the fantasy of a living promotion without implying live gameplay state that has not been safely loaded.

Invalid or corrupted saves should show:

- Error code.
- Missing data.
- Schema/version issue.
- Save identity issue.
- Suggested safe action.
- Ask AI to Help Fix option.

Normal save UI should hide technical details unless a save is invalid or corrupted.

### New GM Setup

The setup fantasy is contract signing into draft night.

Phase 1: Contract Signing:

- Promotion/company.
- Brand.
- GM identity.
- Difficulty.
- Starting expectations.

Phase 2: War Room Setup:

- Draft rules.
- Roster needs.
- Championships/divisions.
- AI competitors.
- Calendar / first PLE path.

Phase 3: Draft Night Preview:

- Transition toward the first major playable moment.
- No draft execution yet.

## 6. Visual Design System

Default look:

- Dark mode first.
- Light mode is not an early prototype requirement.
- Premium broadcast command center.
- Sports graphic energy.
- Clean sports-broadcast panel structure.
- Light glassmorphism as an accent.
- Selective neon.
- No full-screen solid brand-color backgrounds.
- Brand color used moderately.
- Contextual hero areas, not mandatory hero areas everywhere.
- Raw, SmackDown, NXT, and AEW palettes are implemented through CSS variables and body classes.
- Avoid scattered hardcoded colors; extend tokens instead.

Typography:

- Bold sports-broadcast headlines.
- Clean readable body text.
- Clear numeric/data typography.
- Avoid overly decorative fonts for dense data.

Cards:

- Character-facing cards should use imagery and identity.
- Management-heavy cards should prioritize readable data.
- Warnings should be subtle unless truly critical.
- Empty states should be plain and functional.

Animation:

- Game-like transitions for big moments.
- Business-app-like transitions for everyday management.
- Selective animation only.
- Reduce-motion setting should exist later.

## 7. Data Density Doctrine

Data density is screen-dependent. The interface should be able to become dense where comparison matters, but the default player experience should not feel like a wall of controls.

Dense screens:

- Analytics.
- Finance.
- Roster table mode.
- Contracts.
- Scouting comparison.
- Draft filtering/comparison.
- Dev diagnostics.

Cleaner screens:

- Dashboard.
- Booking.
- Show Results.
- Week Review.
- Calendar.
- Social/IWC.
- Match cards.
- Wrestler profile dashboard.

Rules:

- Decision-critical information stays visible.
- Advanced information can be expandable.
- Do not overload default cards.
- Dense table mode should exist mainly for Roster, Draft, Scouting, and Free Agents/Prospects.
- Dashboard should be curated, not endlessly customizable at first.
- Tooltip/help content should explain metrics only when needed.
- Do not show uncertain values as precise facts.

## 8. Warning and Feedback Doctrine

Pre-show warnings should be minimal. They exist to prevent impossible, invalid, or obviously risky states, not to teach the player how to book.

Allowed pre-show warnings:

- Injured or unavailable wrestler.
- Runtime over limit.
- Duplicate segment conflict.
- Champion not booked.
- Rivalry absent from show.
- Technical/impossible state.

Do not show before running a show:

- Predicted ratings.
- Predicted fan reaction.
- Predicted social buzz.
- Predicted match grade.
- Predicted rivalry gain/loss.
- Predicted morale movement.
- Predicted title prestige movement.
- Predicted show quality.
- Predicted mechanical impact.

Rules:

- Only technical/impossible states block.
- Most warnings should not block.
- Warnings state the issue only.
- Warnings should not become booking lessons.
- Consequences are revealed after the show.
- Creative feedback is retrospective, not predictive.

## 9. Dashboard Doctrine

The post-load home base should be a Brand Dashboard.

It should answer:

"Here's your brand. Here's this week's show. Here's what could go wrong."

The dashboard hero command strip should blend:

- This Week's Show.
- Brand Health.
- GM Alerts.

Feature cards underneath can include:

- Book Show.
- Rivalries.
- Roster.
- Championships.
- IWC Pulse.
- Analytics.
- Calendar / Road to PLE.

Dashboard density should adapt:

- Standard view: clean cards, key metrics, simple warnings.
- Detailed view later: deeper charts, trends, roster/rivalry/ratings breakdowns.

## 10. Booking Screen Doctrine

Booking should feel like a hybrid production timeline. The player should feel like both a GM and a TV producer.

Center:

- Production timeline.
- Opening segment.
- Match slots.
- Promo slots.
- Backstage segments.
- Main event.
- Runtime/pacing.

Side/context panels:

- Active rivalries.
- Champions.
- Top contenders.
- Available wrestlers.
- Suggested matches.
- Roster fatigue/morale warnings.
- Segment risk/context.

Interaction model:

- Mostly click-to-add.
- Drag-and-drop only for rearranging show order.
- Every drag-and-drop action needs a non-drag alternative.
- Booking should feel visual, not fiddly.

Hard rule: the booking screen supports decisions, but does not reveal simulated outcomes before the show runs.

## 11. Show Results and Week Review Doctrine

Show Results should feel like a broadcast recap plus GM consequence screen.

First view:

- Overall show grade.
- Biggest moment.
- Top match.
- Fan/crowd reaction.
- Major story consequence.
- Major business consequence, if relevant.

Segment details underneath:

- Winner/result.
- Rating or impact label.
- Crowd reaction.
- Story impact.
- Momentum changes.
- Rivalry impact.
- Fatigue/injury impact.
- Morale effects.
- Social/IWC reaction.
- Business/merch impact, if notable.

Promos and non-match segments use impact labels instead of star ratings:

- Hot.
- Effective.
- Flat.
- Confusing.
- Viral.
- Memorable.
- Story Progressed.

Week Review loop:

Book Show -> Run/Sim Show -> Show Results -> Week Review -> Advance Week

Week Review should be a hybrid recap dashboard:

- Sports-style recap at top.
- Business cards.
- Rivalry cards.
- Roster updates.
- Scouting updates.
- AI brand highlights.
- Next-week alerts.

## 12. Social/IWC Doctrine

Social/IWC should feel like a hybrid social pulse dashboard. It should unlock after the first show.

Before the first show, show this empty state:

"No buzz yet. Book your first show and let the internet react."

Social screen includes:

- Trending topics.
- Most talked-about wrestler.
- Most debated booking choice.
- Biggest viral moment.
- Brand buzz comparison, if relevant.
- Mixed feed underneath.

Feed content can include:

- Fan posts.
- IWC arguments.
- Dirt sheet rumors.
- Superstar posts.
- Insider reports.
- Conspiracy theories.
- Booker criticism.
- Fantasy booking.
- Memes.
- Analyst takes.
- Viral threads.
- Star-rating debates.
- Buried discourse.
- Push complaints.
- Title scene arguments.

Tone:

- Spicy.
- Funny.
- Emotional.
- Analytical.
- Conspiratorial.
- Occasionally toxic, but not unusably toxic.

GenAI boundary:

- Simulation decides what happened.
- GenAI may eventually write flavor.
- GenAI must not invent gameplay outcomes.
- GenAI must not change state.
- No real GenAI calls in early UI implementation.

## 13. Roster and Wrestler Profile Doctrine

Roster default:

- Hybrid cards/table.
- Card-forward default.
- Sortable table for deeper management.

Default grouping:

- World title scene.
- Midcard title scene.
- Women's division.
- Tag division.
- Prospects/developmental.
- Unassigned.

Push levels visible inside groups:

- Main event.
- Upper midcard.
- Midcard.
- Lower card.
- Prospect.

Roster card fields:

- Name.
- Image/avatar.
- Popularity.
- Momentum.
- Win/loss record.
- Star power.
- Role.

Status badges only when relevant:

- Fatigue Risk.
- Injured.
- Unavailable.
- Morale Concern.
- Contract Tension.
- Overexposed.
- Hasn't Been Booked.
- Needs TV Time.

Wrestler profile default:

Dashboard-style character command center.

Roster wrestler profile tabs:

- Dashboard.
- Performance.
- Creative.
- Championships.
- Health/Morale.
- Social Buzz.
- Contract.
- History/archive when relevant.

External/prospect profile tabs:

- Dashboard.
- Scouting.
- Market/Contract.
- Social Buzz, if relevant.
- History, if known.

## 14. Championship and Division Doctrine

Championship screens should use a champion spotlight at the top and a contender/division board underneath.

Champion spotlight includes:

- Title name.
- Champion.
- Champion image/avatar.
- Reign length.
- Recent defenses.
- Momentum.
- Prestige.
- Current rivalry/title story, if relevant.

Contender/division board includes:

- Top contenders.
- Eligible wrestlers.
- Division depth.
- Recent title challengers.
- Next title match, if scheduled.
- Weak division warnings, if relevant.

Sorting uses Brand Priority Sort.

Default sort:

1. Player brand titles first.
2. Normal title importance.
3. Active heat/business relevance can override hierarchy.

Title prestige:

- Low Prestige.
- Solid Prestige.
- Strong Prestige.
- Elite Prestige.

No visible title prestige trend.

Contender rankings:

- Full ranking ladder.
- No manual override.
- No formula explanation.
- Player influences rankings through booking.

Tag teams use a light tag team system:

- Team name.
- Members.
- Alignment.
- Chemistry.
- Tag division status.
- Basic momentum/standing.
- Tag title relevance.

## 15. Finance and Analytics Doctrine

Finance should be WWE 2K-style:

- Clear.
- Gamey.
- Decision-focused.
- Light-to-moderate.
- Not an accounting sim.

Finance is the source of truth for money.

Finance shows:

- Current budget.
- Revenue.
- Expenses.
- Profit/loss.
- Ticket revenue.
- Merch revenue.
- TV/media revenue.
- Production costs.
- Venue costs.
- Marketing spend.
- Budget/revenue trends.
- Financial warnings.

Finance should not focus on:

- Taxes.
- Sponsorships.
- Full accounting ledgers.
- Deep payroll tracking.
- TV deal negotiation.
- Venue management.
- Detailed old financial archives.

Analytics explains performance drivers.

Analytics can show:

- Which wrestlers drive merch.
- Which rivalries create revenue spikes.
- Which shows convert buzz into attendance.
- Which brand is growing faster.
- How ratings, IWC buzz, attendance, and revenue connect.

Finance reports business outcomes. Analytics explains why outcomes happened.

## 16. Calendar and Season Flow Doctrine

Calendar should be a Road to PLE orientation tool, not a full management cockpit.

Main view:

- Road to PLE timeline.

Secondary view:

- Month-grid fallback.

Calendar shows:

- Weekly shows.
- Fixed PLEs.
- Go-home week label.
- PLE endpoint.
- Major structural milestones.
- Current week/date/season.

Calendar does not show:

- Contracts.
- Injuries.
- Scouting report dates.
- Finance alerts.
- Rivalry milestones.
- PLE card progress.
- Brand rankings.
- AI competitor events.

Rules:

- Road to PLE shows time remaining only, not story readiness.
- PLEs are fixed schedule.
- PLEs are booked from Book Show, not Calendar.
- Current-season past weeks can be clicked for review.
- Older history moves to archive/history screens.

## 17. Assistant and AI UX Doctrine

The assistant should feel like a hybrid staff panel, not one generic chatbot.

Assistant modes:

- Assistant GM.
- Creative.
- Analyst.
- Scout.
- Producer.

Rules:

- Assistant recommendations are ask-only.
- No proactive assistant UI.
- No auto-fill unless the player explicitly asks.
- The player can ask "Book my show."
- Auto-booked cards are editable, reviewable, and clearly labeled as assistant-generated.
- Recommendation logic must be deterministic.
- GenAI can eventually phrase/explain recommendations, but must not decide strategy.
- The player has final approval over all suggestions.

No real GenAI calls are allowed in early UI implementation.

## 18. Accessibility and Usability Doctrine

Primary target:

- Laptop-first.
- 11-13 inch screens considered.
- Desktop/laptop first.
- Tablet considered early.
- Mobile ignored for now.

Rules:

- Text scales responsively based on layout.
- Critical statuses need more than color:
  - Label.
  - Icon.
  - Text cue.
- Every drag-and-drop action needs a non-drag alternative.
- Keyboard navigation matters broadly.
- Reduce-motion setting should exist later.
- Dense tables must remain readable without zooming.

## 19. Diagnostics UI Doctrine

Diagnostics should support both development and player troubleshooting.

Two modes can exist later:

### Dev diagnostics mode

Can show:

- Contract readiness.
- Persistence status.
- Feature flags.
- Blocked reasons.
- Test fixtures.
- Save identity state.
- Draft readiness.
- Roster/championship readiness.
- Shell outputs.
- Schema/version info.
- Internal debug state.

### Player advanced/debug mode

Can show:

- Save health.
- Version/schema info.
- Invalid/corrupt save details.
- Feature availability.
- Blocked feature explanations.
- Persistence health summary.
- AI help/explanation options.

Rules:

- Diagnostics should match the main game style.
- Diagnostics should not look like a raw console.
- Diagnostics mostly do not leak into normal gameplay.
- Exceptions:
  - Corrupted saves.
  - Blocked features.
  - Recovery/help screens.
  - Advanced/debug mode.
- Build diagnostics UI alongside player UI, not as a huge separate project.

## 20. Component System Doctrine

The component system should be layered:

- Generic primitives underneath.
- Game-specific components on top.

Do not overbuild generic primitives too early.

Early shared components:

- App shell/header.
- Hover-revealed top nav.
- Save card.
- Poster thumbnail frame.
- Setup option card.
- Status badge.
- Warning card.
- Empty state.
- Modal/confirmation dialog.
- Diagnostics card.
- Section header.
- Primary/secondary button.

Game-specific components:

- WrestlerCard.
- MatchCard.
- RivalryCard.
- ChampionshipCard.
- DraftPickCard.
- SaveCard.
- SetupOptionCard.
- WarningPanel.
- HeatMeter.
- MomentumTrend.
- ShowTimelineSlot.
- SocialPostCard.
- DiagnosticsCard.

Most reusable components should eventually have visual/mock fixtures.

## 21. Hard Boundaries for Early UI Work

This section is non-negotiable.

Early UI work must not:

- Implement gameplay simulation.
- Wire real GenAI calls.
- Create SQLite writes from UI.
- Start gameplay loops.
- Advance weeks.
- Execute drafts.
- Assign rosters.
- Create match/show/week state.
- Use real save mutation.
- Persist player-facing save payloads.
- Replace diagnostics-only/domain-first backend boundaries.
- Create hidden side effects.
- Use Math.random.
- Generate player-facing outcomes not backed by deterministic state.

Allowed early UI work:

- Static screens.
- Mock/dev fixture data.
- Visual hierarchy.
- Layout.
- Navigation shell.
- Design system exploration.
- Clearly labeled fake states.
- Manual verification steps.
- Read-only integration only after approval.

## 22. Definition of Done for This Document

This task is complete when:

- `docs/ui-ux-doctrine.md` exists.
- It is structured and readable.
- It is not just a raw pasted handoff.
- It clearly separates doctrine, rules, and future implementation sequence.
- It clearly states that Save Selection and New GM Setup are the first UI screens.
- It clearly states that early UI is static/mock-first.
- It clearly preserves no-gameplay/no-persistence/no-GenAI boundaries.
- No files outside `docs/ui-ux-doctrine.md` are changed unless the docs folder itself must be created.
