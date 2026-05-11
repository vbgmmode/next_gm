# Playable New GM Mode UI Shell Checklist

Manual verification target:

`C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html`

## Flow QA

- Confirm the first screen is Save Selection, not Dashboard or Brand HQ.
- Confirm Save Selection feels like the game entry screen with large campaign/save-slot panels.
- Confirm the visible early flow is Save Selection -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft -> Draft Recap -> Brand Dashboard.
- Confirm choosing static controls only switches visible mock sections.
- Confirm Contract Signing feels like a league office / GM office launch moment.
- Confirm Setup Basics includes difficulty, save name, and optional assistant setup without saving anything.
- Confirm Assistant Setup is skippable and clearly optional.
- Confirm Choose GM uses fictional archetypes, not real people.
- Confirm Select Brand says brands are fantasy choices with equal starting baselines.
- Confirm Initial Draft feels like the active draft broadcast surface.
- Confirm Draft Recap appears as the first post-draft state.
- Confirm Brand Dashboard becomes the primary Week 1 / post-draft surface.
- Confirm Draft Preview is not presented as the primary surface after Draft Recap.

## Visual QA

- Confirm the UI feels like a premium wrestling GM game cockpit, not a SaaS/admin dashboard.
- Confirm the prototype leads with draft-night war room and wrestling TV package energy.
- Confirm there is no equal-card wall on Save Selection, Setup, Draft Room, or Brand HQ.
- Confirm Save Selection uses cinematic save-slot panels and poster/portrait-style placeholders.
- Confirm Draft Room is visually distinct from Brand HQ.
- Confirm Draft Room has big ON THE CLOCK staging, a broadcast board, a scouting feed, selected talent card, and lower-third/ticker treatment.
- Confirm Brand HQ uses larger game-mode tiles and one obvious next post-draft action.
- Confirm player-facing labels use Preview Build, Draft Controls Locked, Scouting Feed, Board Preview, Commissioner Desk, Brand HQ, and Week 1 Setup style language.
- Confirm raw backend/service wording is absent from normal player-facing UI.

## Visual Authenticity QA

- Confirm the UI does not look "Codex coded" or like an AI-generated dashboard skin.
- Confirm the visual system does not overuse circles, pills, bubbly cards, soft blobs, or decorative glow.
- Confirm cards read as sharp sports-broadcast rectangles, not oversized rounded SaaS cards.
- Confirm panel corners stay sharp and tactical instead of bubbly or startup-app rounded.
- Confirm tactical glass surfaces use subtle borders, scanlines, inner highlights, and brand-lit under-glow without hurting readability.
- Confirm brand lighting feels like arena/stage flare behind glass, not a cyberpunk wallpaper or flat solid brand background.
- Confirm tags, badges, and lock states read as compact broadcast labels instead of rounded SaaS pills.
- Confirm panels use sharper sports TV geometry, hard frames, bars, plates, and lower-third treatments.
- Confirm Save Selection feels like a real sports/wrestling game campaign entry screen.
- Confirm New GM Setup and Setup Review feel like contract packet / league office / war-room surfaces.
- Confirm Draft Room feels like a draft broadcast with ON THE CLOCK drama, board energy, and scouting desk framing.
- Confirm selected talent reads as a broadcast profile card, not a generic info card.
- Confirm Post-Draft Brand HQ centers Week 1 Setup, Book Show, Roster, Rivalries, Championships, Calendar, IWC Pulse, and Analytics instead of Draft Preview.
- Confirm Brand Dashboard hero reads as a backstage monitor stack or production-control wall, not a generic KPI row.
- Confirm GM Alerts read like readable dirt-sheet leaks, objective fragments, or broadcast ticker pressure rather than a plain SaaS task list.
- Confirm visual accents feel purposeful and brand-driven, not random decorative shapes.
- Confirm the screen does not read as a generic SaaS/admin dashboard.

## Brand Palette QA

- Confirm the static UI defines base CSS tokens for app background, surfaces, glass, borders, text, warning, danger, success, and info colors.
- Confirm `body.brand-raw`, `body.brand-smackdown`, `body.brand-nxt`, and `body.brand-aew` exist.
- Confirm Raw uses red/black prime-time energy.
- Confirm SmackDown uses blue electric sports-broadcast polish.
- Confirm NXT uses high-contrast black/gold energy.
- Confirm AEW uses premium black/gold fight-card energy.
- Confirm brand selection changes only color/presentation flavor in the static UI, not starting money, prestige, resources, or difficulty.
- Confirm dense screens remain neutral/dark with brand accents instead of becoming full-screen solid brand-color pages.
- Confirm no official logos are used unless approved local assets exist.
- Confirm colors are driven by CSS variables/tokens rather than scattered one-off hardcoded colors.

## Navigation QA

- Confirm the primary nav is a compact macOS Dock-inspired top dock, not a side rail.
- Confirm the dock remains visible in collapsed/default state as a thin glass control surface.
- Confirm collapsed/default state shows compact icons and the active top-level section label.
- Confirm hover/focus expands the dock into icon plus section name only.
- Confirm expanded labels do not overflow, wrap, or clip at laptop widths.
- Confirm the expanded dock overlays the screen and does not push content down.
- Confirm the top overlay subtly dims or blurs the app behind it.
- Confirm keyboard focus expands the dock and has a visible focus state.
- Confirm selecting a dock item by pointer switches sections and immediately collapses the dock.
- Confirm activating a dock item by keyboard Enter or Space switches sections and immediately collapses the dock.
- Confirm Escape collapses the expanded dock without trapping focus.
- Confirm pointer leave collapses the expanded dock after a short tasteful delay.
- Confirm clicking the main screen can collapse the dock, but is not required after selecting a dock item.
- Confirm active nav state is obvious without relying only on color.
- Confirm the dock remains usable at smaller laptop width.
- Confirm the top dock does not cover critical controls in a broken way.
- Confirm nav actions switch between Save Selection, Contract Signing, Setup Basics, Assistant Setup, Choose GM, Select Brand, Initial Draft, Draft Recap, and Brand Dashboard without page reload.
- Confirm the dock never shows budget, fan count, alerts, mini metrics, breadcrumbs, long descriptions, notification text, or status copy.
- Confirm breadcrumbs are absent.

## Viewport And Overflow QA

- Confirm the page itself does not vertically scroll at desktop/laptop sizes.
- Confirm the app shell, header, and top nav remain stable.
- Confirm each active screen fits inside the visible viewport at common laptop sizes, including roughly 1366x768 and 1280x720.
- Confirm 1366x768, 1280x800, and 1440x900 do not introduce full-page scroll.
- Confirm only contained panels scroll when needed.
- Confirm the draft board and scouting feed use contained scrolling.
- Confirm long save names, wrestler names, labels, pills, buttons, and metadata truncate or wrap safely inside their boxes.
- Confirm no text spills outside cards, panels, buttons, pills, or board rows.
- Confirm cards do not stretch endlessly to create a scrolling webpage feel.
- Confirm long nav labels appear only in the expanded top overlay and do not clip in collapsed state.
- Confirm nav label, card, hero, and button text does not overflow at 1366x768, 1280x800, or 1440x900.

## Static/Mock Boundary QA

- Confirm Continue Save and Empty Slot remain locked/mock-only.
- Confirm invalid/corrupt save recovery remains a mock visual state only.
- Confirm setup choices are hardcoded visual placeholders.
- Confirm assistant setup does not save keys, make calls, or activate live AI.
- Confirm Draft Room controls remain disabled.
- Confirm clicking a talent row only updates the selected talent card in the DOM.
- Confirm Draft Recap and Brand Dashboard are preview states only.
- Confirm no save payloads are created.
- Confirm no database writes are triggered.
- Confirm no browser storage is used.
- Confirm no network calls are used.
- Confirm no draft service or gameplay service is imported or called.
- Confirm no draft pick, roster state, Week 1 state, show state, match state, fan/social state, business state, or AI flavor output is created.

## Rejection Criteria

- Reject if the game starts directly on a generic Dashboard.
- Reject if Save Selection feels like just another dashboard card.
- Reject if the primary navigation is a side rail or uses breadcrumbs.
- Reject if the top rail clips labels or consumes too much vertical screen space.
- Reject if budget/fans/deadline/health overwhelm the top shell instead of living in Dashboard command areas.
- Reject if setup is compressed into one generic form screen instead of a multi-screen game flow.
- Reject if brands imply different starting money, prestige, resources, or baseline difficulty.
- Reject if Draft Room looks like another dashboard tab rather than a draft broadcast.
- Reject if Draft Preview remains prominent after the initial draft.
- Reject if Draft Recap does not focus first on the player's full roster grouped by division.
- Reject if Week 1 setup lacks a guided checklist concept.
- Reject if championship setup silently auto-assigns titles.
- Reject if rivalry UI implies a hard rivalry limit.
- Reject if pre-draft, active-draft, and post-draft states are not visually distinct.
- Reject if nav labels clip or the nav feels like an enterprise sidebar.
- Reject if the desktop/laptop page scrolls instead of containing overflow inside panels.
- Reject if the UI feels corporate, cramped, ugly, or generic.
- Reject if cards become bubbly/circle-heavy, pill-heavy, or look like a generic SaaS template.
- Reject if future Codex work adds hardcoded random colors instead of the Raw/SmackDown/NXT/AEW token system.
