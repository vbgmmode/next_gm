# Playable New GM Mode Visual Design Contract

## Purpose

This contract defines the visual target for Playable New GM Mode before any further UI implementation. The current direction was rejected because it still reads as a generic dashboard. Future work must treat this document as the acceptance gate for player-facing UI composition.

Playable New GM Mode should feel like a premium wrestling GM game cockpit: a dark arena control room, draft-night war room, and franchise-mode hub built for fast decisions on laptop screens.

The next UI pass should not preserve the current layout if that layout conflicts with this contract. Recomposition is preferred over incremental polish when the existing structure still reads as corporate, cramped, card-heavy, or visually weak.

## Product Owner Visual Direction

The binding product direction is hybrid, but the visual lead is draft-night war room.

Required feel:

- Premium wrestling GM game plus draft-night broadcast.
- NFL/NBA draft presentation energy adapted to wrestling.
- Big "ON THE CLOCK" drama.
- Wrestling TV package intensity.
- Strong brand package and arena lighting.
- Game home screen for Dashboard.
- Broadcast command screen for Draft Room.

Current rejected problems:

- Too corporate/SaaS.
- Too many boxes/cards.
- Too cramped.
- Ugly or weak colors.
- Generic admin/dashboard composition.
- Overall experience feels off instead of playable.

Future implementation must solve those problems structurally, not by lightly restyling the same layout.

## Non-Negotiable Visual Direction

The UI must feel like:

- Premium wrestling GM game cockpit.
- Sports broadcast control room.
- WWE 2K GM Mode-style front office.
- Draft-night war room.
- NFL/NBA draft broadcast adapted to wrestling.
- Very stylized wrestling TV package.
- Console-game menu/HUD system.
- Dense but readable wrestling management surface.

The UI must not feel like:

- SaaS dashboard.
- Admin panel.
- Analytics product.
- Developer diagnostic screen.
- Flat wall of equal cards.
- Scrolling webpage.
- Corporate KPI board.
- Plain analytics dashboard.

If a screen can be mistaken for a business dashboard with wrestling labels, it fails this contract.

## Game Flow Contract

Playable New GM Mode must feel like a guided game flow, not a static dashboard with tabs.

The player experience starts with Save Selection, not Dashboard.

Required early flow:

1. Save Selection.
2. New Game / Contract Signing.
3. Setup Basics.
4. Optional Assistant Setup.
5. Choose GM.
6. Select Brand.
7. Draft Dynamics / Initial Draft.
8. Draft Recap.
9. Brand Dashboard / Week 1 Setup.

Save Selection requirements:

- It is the entry screen into the game.
- It should feel like a premium game start surface, not a card inside Dashboard.
- Continue, create, and empty save states should feel like mode-entry choices.
- After choosing or creating a save, the player moves into a new screen or flow step.

Pre-draft requirements:

- New GM Setup and Setup Review should feel like guided setup steps.
- Draft Preview is valid only before or during the initial draft.
- Draft Preview should prepare the player for the Initial Draft, not become a permanent hub.

Active-draft requirements:

- Initial Draft should use Draft Room composition.
- Draft Room should feel like the active draft broadcast surface.
- Draft execution can remain locked in mock/static UI until explicitly approved.

Post-draft requirements:

- After the initial draft is complete, Draft Preview must not remain a primary surface.
- The primary hub should shift toward Post-Draft Brand HQ.
- Post-draft surfaces should emphasize Brand HQ, Week 1 Setup, Book Show, Roster, Rivalries, Championships, Calendar, IWC Pulse, and Analytics.
- Draft Room may remain accessible as history or draft board review, but not as the main next action after draft completion.

Static/mock implementation guidance:

- Static UI may show the flow through states, labels, preview compositions, or disabled future states.
- Static UI may include post-draft preview compositions without executing the draft.
- Static UI must not wire real draft execution, gameplay start, persistence, storage, SQLite writes, generated text, GenAI, or network calls.
- The shell should make the player feel they are progressing through a game mode, not freely clicking unrelated dashboard tabs.

## Viewport-First Contract

Each major screen must fit inside the visible app viewport, especially on 11-13 inch laptops.

- No full-page scrolling on desktop/laptop unless explicitly approved.
- `html`, `body`, and the app shell should be viewport-bound.
- Header, navigation, and primary command areas should remain fixed or visually stable.
- Only contained panels may scroll.
- Long content must use tabs, drawers, modal-style details, progressive disclosure, or internal panel scrolling.
- Cards must compress, truncate, or scroll internally instead of expanding the page.
- Text spilling outside a card or panel is a design bug.

Allowed contained scroll regions:

- Draft talent pool.
- Draft board history.
- Brand pick order.
- Roster lists/tables.
- IWC/social feed.
- Analytics reports.
- Calendar/event list.
- Scouting reports.
- Save lists when many saves exist.
- Debug/diagnostic detail panels, when explicitly in a non-player-facing diagnostic area.

## App Shell Contract

The shell should feel like a game HUD, not a website header.

Required shell qualities:

- Compact top presence with brand/show identity plus week/date or phase.
- Strong visual identity using wrestling broadcast treatments.
- A compact top icon rail, not a side rail.
- Collapsed/default nav shows small icons plus the active section label.
- Hover/focus expands into a subtle overlay that shows icons and section names only.
- The top nav should feel like a macOS Dock adapted into a premium wrestling GM control dock: compact, glassy, icon-first, and top-positioned.
- Dock expansion must overlay the viewport with subtle blur/dim treatment and must not push screen content downward.
- Current player goal visible within two seconds.
- No stacked header/status/flow bands that consume the play area.
- No "static demo shell" wording in player-facing UI.
- No chunky always-visible sidebar that steals screen space.
- Budget, fans, health, deadline, and alerts belong in the dashboard hero or screen-specific command areas, not the expanded nav.

Preferred treatments:

- Scorebug-style status strip.
- Broadcast lower-third.
- Compact command bar.
- Arena-light accents.
- Brand-color edge highlights.
- Game-mode phase badge.
- Draft-night ticker.
- Poster-style mode tile.

## Navigation Contract

Navigation must feel like a premium game command menu, not an enterprise app rail.

Required nav behavior and appearance:

- No clipped labels in collapsed state.
- Default state maximizes screen space.
- Primary navigation is a thin top icon rail.
- Collapsed/default state is icon-first and shows the active section label.
- Hover or focus reveals polished top-overlay labels with subtle blur/dim behind the nav.
- Hover/focus may scale, lift, or glow icons slightly, similar to macOS Dock behavior, but the motion must stay subtle and premium.
- Active section is unmistakable through color, glow, marker, or physical selection treatment.
- Navigation should not look broken when narrow.
- Labels must stay short and player-facing.
- Expanded labels must not overflow, clip, wrap, or create page scroll at laptop widths.
- Avoid status labels, numbers, metrics, alert text, budget, or fan counts inside expanded nav.
- Avoid breadcrumbs and chunky side rails.

Primary nav items:

- Dashboard.
- Booking.
- Roster.
- Scouting.
- Calendar.
- Management.
- Settings.

## Brand Palette Contract

Playable New GM Mode uses one cohesive base UI system with brand palette classes for Raw, SmackDown, NXT, and AEW. Brand colors affect hero lighting, selected states, active nav, major CTAs, borders, and section identity. They must not turn each brand into a different app.

Required CSS token direction:

- Base tokens for app background, surfaces, glass, borders, text, warning, danger, success, and info.
- `body.brand-raw`, `body.brand-smackdown`, `body.brand-nxt`, and `body.brand-aew`.
- Raw: red/black prime-time energy.
- SmackDown: blue sports-broadcast polish.
- NXT: black/gold developmental pressure.
- AEW: black/gold premium fight-card tone.

Do not use full-screen solid brand-color backgrounds, unreadable glowing text, official logos without approved local assets, or scattered hardcoded random colors.

## Dashboard Composition Contract

The Dashboard is the player's game home screen and GM cockpit. It must not be a grid of equal widgets or an analytics/admin dashboard.

Required composition:

- Fewer, larger, more cinematic panels.
- One dominant mode tile or hero/action area for the current GM moment.
- One obvious next major action, such as entering the Draft Room.
- Strong brand/show identity moment.
- Compact secondary status, not generic KPI boxes.
- Budget, fans, momentum, and brand health should read as game HUD stats.
- GM alerts in a contained broadcast-style strip or panel.
- Draft or upcoming show preview as a mode tile, poster, or feature panel.
- Roster spotlight with portrait/card placeholders.
- Rivalry heat as a visual game module, not a table.
- Championships as title-picture presentation.
- IWC pulse as a social broadcast beat.
- Analytics preview as a compact scouting/brand intelligence module.
- Calendar/Road to PLE as a cinematic road panel.

Composition guidance:

- Use one large feature panel, two or three medium supporting panels, and compact strips/lists.
- Use status bars, chips, badges, and small metadata rows instead of paragraphs.
- The most important status/action should be readable in two seconds.
- Avoid equal-card walls.
- Avoid explanatory copy that reads like product documentation.
- Prefer big mode tiles, poster panels, lower-thirds, and spotlight cards over dashboard widgets.
- Dashboard density should be simpler and more cinematic than Draft Room density.

Player-facing examples:

- "Raw Draft Night"
- "Enter Draft Room"
- "Brand Heat"
- "Momentum"
- "Road to PLE"
- "IWC Pulse"
- "Roster Watch"
- "Title Picture"

## Draft Room Composition Contract

The Draft Room must be visually distinct from the Dashboard and feel like a premium draft-night broadcast screen. It can be denser than the Dashboard because it is a command/broadcast screen, but it must remain clean and contained.

Required composition:

- Dominant "ON THE CLOCK" command panel with real visual drama.
- Current pick spotlight.
- Pick clock/status area, even if static.
- Central broadcast draft board or commissioner desk panel.
- Talent/scouting feed in a contained scroll panel.
- Strong selected talent presentation with portrait/card placeholder.
- Brand pick order panel.
- Disabled Make Pick and Auto Draft actions.
- Lower-third or ticker-style strip for draft notes.
- Broadcast board energy: clear rounds, pick slots, brand order, and stage-like hierarchy.
- Scouting desk feel: compact attributes, archetype chips, and readiness labels.

Player-facing labels:

- "Preview Build"
- "Draft Controls Locked"
- "Board Preview"
- "Scouting Feed"
- "Commissioner Desk"
- "On The Clock"
- "Pick Preview"
- "Not enabled yet"

Avoid visible raw backend language:

- "read-only adapter online"
- "service contract"
- "candidate readiness"
- "integration boundary"
- "backend blocked"
- "diagnostic shell"

Those concepts may remain in docs or hidden QA notes, but player-facing UI should translate them into game language.

## Wrestler Visual Placeholder Contract

Use portrait/card placeholders now so the layout feels like a real game before real images exist.

Encouraged placeholder treatments:

- Framed wrestler portrait zones.
- Silhouette cards.
- Broadcast profile cards.
- Draft prospect cards.
- Roster spotlight cards.
- Championship contender cards.
- Brand-color frame accents.

Do not wait for real images to establish game feel. Empty text-only cards are not enough for a wrestling management game UI.

## Roster, Rivalries, And Championships Contract

Roster is a major hub. Rivalries and Championships should feel connected to roster management, not like unrelated dashboard tiles.

Roster should preview:

- Empty or locked roster state after draft.
- Roster slots or division bands.
- Spotlight cards.
- Role/status chips.
- "Coming after draft confirmation" labels.

Rivalries should preview:

- Heat meters.
- Feud cards.
- Brand conflict framing.
- Locked setup until roster and show systems exist.

Championships should preview:

- Title belts or title panels.
- Champion/vacant state.
- Contender lanes.
- Locked assignment until draft and roster confirmation.

## Future Hub Contract

Future systems must look like game systems, not blank placeholders.

IWC:

- Social pulse/feed panel.
- Heat/sentiment chips.
- Contained scroll only.
- No generated text or GenAI.

Analytics:

- Broadcast-style trend panels.
- Compact charts or bars using static CSS/HTML.
- No SaaS report-wall layout.

Calendar:

- Road to PLE structure.
- Upcoming milestone/event list.
- Contained scroll only when necessary.

Settings:

- Game options/menu feel.
- Compact sections.
- No long settings webpage.

## Copy Contract

Use short, player-facing labels.

Preferred language:

- "Preview Mode"
- "Preview Build"
- "Locked for this build"
- "Not enabled yet"
- "Coming after draft confirmation"
- "Draft Controls Locked"
- "Read-only draft board"
- "Scouting Feed"
- "Board Preview"

Avoid:

- Long explanatory paragraphs.
- Backend or architecture terms in visible UI.
- Developer diagnostics in player-facing panels.
- Raw blocked-state lists unless shown as polished game locks.

## Component And Layout Contract

Use varied visual weights.

Required component qualities:

- Mixed panel sizes.
- Strong hero/spotlight panel.
- Compact supporting cards.
- Lower-thirds/tickers where useful.
- Status chips and meters.
- Portrait/card placeholder zones.
- Big mode tiles where the player chooses the next step.
- Contained scroll panels.
- Truncated long names.
- Consistent focus and hover states.
- Disabled buttons that look intentionally locked, not broken.
- Bold enough color and lighting direction to feel like a wrestling TV package.

Avoid:

- Identical card grids across the whole screen.
- Large paragraph cards.
- Unbounded vertical growth.
- Clipped nav text.
- Floating SaaS cards with generic headings.
- Decorative clutter that reduces scan speed.
- Cramped card walls.
- Plain corporate KPI boxes.
- Weak, flat, or muddy color systems.

## Interaction Contract

Interactions may remain static/mock-only until real wiring is explicitly approved.

Allowed for static UI:

- Section switching.
- Active nav state.
- Hover/focus treatments.
- Static next-step navigation.
- Frontend-only selected talent preview.
- DOM-only UI state.

Not allowed without explicit approval:

- Real draft execution.
- Calling the in-memory draft flow from UI.
- Save payload persistence.
- SQLite writes.
- Browser storage.
- Network calls.
- Gameplay start.
- Week advancement.
- Generated text.
- GenAI behavior.
- Duplicate draft services.

## Visual Rejection Criteria

Reject an implementation if any of these are true:

- It looks like a generic SaaS/admin dashboard.
- It looks corporate.
- It feels ugly, visually weak, or off-brand for a wrestling game.
- It presents a flat wall of equal cards.
- It has too many boxes/cards.
- It feels cramped on laptop screens.
- The Dashboard lacks one obvious primary action.
- The Dashboard feels like an analytics/admin dashboard instead of a game home screen.
- The Dashboard preserves the rejected card-dashboard structure.
- The Draft Room does not feel visually different from the Dashboard.
- The Draft Room feels like another dashboard tab instead of a draft broadcast.
- Nav labels clip or look broken.
- Navigation behaves like a chunky enterprise sidebar.
- Player-facing UI uses raw diagnostic/backend wording.
- The page scrolls instead of contained panels scrolling.
- Text spills outside cards.
- Cards stretch endlessly to fit content.
- Laptop-width layout feels cramped, clipped, or unreadable.
- Disabled states feel accidental instead of intentionally locked.
- Wrestler/prospect areas are text-only when portrait/card placeholders would improve game feel.

## Flow Rejection Criteria

Reject an implementation if any of these are true:

- The game starts directly on a generic Dashboard.
- Save Selection feels like just another card inside Dashboard.
- Draft Preview remains prominent after the initial draft is completed.
- The UI does not clearly distinguish pre-draft, active-draft, and post-draft states.
- The shell feels like static dashboard navigation instead of a guided game flow.

## Implementation Acceptance Gate

Before future UI changes are accepted, Codex should verify:

- Main sections fit in the viewport.
- Body/full-page scrolling is absent on laptop/desktop layouts.
- Only intended internal panels scroll.
- Dashboard is rebuilt as a game home screen with fewer, larger cinematic panels.
- Dashboard has a dominant GM moment and one clear next action.
- Draft Room is rebuilt as a broadcast draft screen, not another dashboard tab.
- Draft Room has "ON THE CLOCK" drama, board energy, lower-third/ticker treatment, and scouting desk feel.
- Portrait/card placeholders are used where they increase wrestling game feel.
- Navigation defaults to hidden/hover or compact game-overlay behavior rather than a chunky sidebar.
- Roster/Rivalries/Championships feel like connected game hubs.
- IWC/Analytics/Calendar feel like game systems.
- Save Selection is the entry point.
- Early flow is Save Selection -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Draft Dynamics -> Draft Recap -> Brand Dashboard.
- Raw/SmackDown/NXT/AEW brand palettes are tokenized and body-class driven.
- Draft Preview is limited to pre-draft or active-draft presentation.
- Post-draft state shifts toward Brand HQ and Week 1 preparation.
- Labels are short, polished, and player-facing.
- Runtime boundaries remain intact.

## Codex Prompt Warning

Future UI prompts must treat full-page scrolling, equal-card dashboard composition, clipped navigation, corporate dashboard styling, cramped layouts, weak colors, and raw diagnostic wording as design bugs unless explicitly approved.

If a screen needs more content than the viewport allows, use contained panel scrolling, tabs, drawers, modal-style detail, or progressive disclosure. Do not solve the problem by making a long webpage.

If the existing UI structure conflicts with this contract, rebuild the composition instead of preserving it. The next implementation should prioritize a premium wrestling TV package and draft-night broadcast experience over continuity with the rejected layout.
