# Playable New GM Mode UI Shell Checklist

Manual verification target:

`C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html`

Local preview target:

`npm run preview:playable-ui`

Expected local URL style:

`http://localhost:5173/ui/playable-new-gm-mode/`

## Local Preview And Reporting QA

- Confirm `npm run preview:playable-ui` starts a local static preview server.
- Confirm the actual local preview URL is reported after the UI slice.
- Confirm opening the local preview URL starts on Game Landing / Title Screen.
- Confirm Save Selection is not the default startup screen.
- Confirm no browser storage, URL routing, backend call, or persistence is used to remember the active screen.
- Confirm the future UI update report includes:
  - Local Preview command.
  - Local Preview URL.
  - First screen.
  - Browser/manual QA.
  - Git branch.
  - Commit.
  - Ahead/behind origin.
  - Worktree clean.
  - Push status.

## Flow QA

- Confirm the first screen is Game Landing / Title Screen, not Save Selection, Dashboard, or Brand HQ.
- Confirm first-load labels all agree with Game Landing / Title Screen:
  - `active-screen-label` reads Game Landing.
  - `phase-label` reads Title Screen.
  - Dock active label reads Game Landing while the dock is hidden/minimal on Landing.
  - No dock tab is active or marked `aria-current` before the player leaves Landing.
  - Only `#game-landing` is visible and all other screens are hidden.
- Confirm Landing shows the Next GM game identity/logo text prominently.
- Confirm Landing feels like a premium wrestling GM title screen, not a SaaS/admin dashboard.
- Confirm Start New Game goes directly to Contract Signing.
- Confirm Select Save / Continue goes to Save Selection.
- Confirm Settings goes to the Settings screen/section.
- Confirm title-screen branching updates labels consistently:
  - Start New Game updates the active label to Contract Signing and phase to New Game Setup.
  - Select Save / Continue updates the active label to Save Selection and phase to Pre-Draft.
  - Settings updates the active label to Settings, phase to Title Options, and marks only the Settings dock item active.
- Confirm a player can start a new game without an existing save file.
- Confirm Save Selection feels like a save-management screen with large campaign/save-slot panels.
- Confirm the visible early flow is Game Landing / Title Screen -> Select Save / Continue -> Save Selection -> Contract Signing -> Setup Basics -> Assistant Setup -> Choose GM -> Select Brand -> Initial Draft -> Draft Recap -> Brand Dashboard.
- Confirm choosing static controls only switches visible mock sections.
- Confirm choosing a GM card updates the highlighted GM card in memory only.
- Confirm choosing a brand updates the selected brand, brand bug, and brand-name display in memory only.
- Confirm Contract Signing feels like a league office / GM office launch moment.
- Confirm Setup Basics includes difficulty, save name, and optional assistant setup without saving anything.
- Confirm Assistant Setup is skippable and clearly optional.
- Confirm Choose GM uses 12 fictional archetypes, not real people.
- Confirm every GM archetype card includes a GM name, archetype title, short fantasy description, numerical ratings, and compact stat bars/meters.
- Confirm Select Brand says brands are fantasy choices with equal starting baselines.
- Confirm Initial Draft feels like the active draft broadcast surface.
- Confirm Initial Draft visibly communicates the read-only draft projection boundary.
- Confirm Initial Draft candidate names match the project-backed read-only projection contract.
- Confirm clicking a draft candidate updates the selected candidate card and a UI-only selection intent preview.
- Confirm the selection intent preview shows selected candidate, selected brand, Round 1 / Pick 1 placeholder, and preview-only locked status.
- Confirm selecting Ivan North reports preview-only unavailable status and still does not create a pick.
- Confirm Make Pick and Auto Draft stay disabled after selecting any candidate.
- Confirm Draft Recap does not unlock from the candidate preview.
- Confirm Draft Recap appears as the first post-draft state.
- Confirm Brand Dashboard becomes the primary Week 1 / post-draft surface.
- Confirm Draft Preview is not presented as the primary surface after Draft Recap.

## Visual QA

- Confirm the UI feels like a premium wrestling GM game cockpit, not a SaaS/admin dashboard.
- Confirm the mood reads as Premium Dark Broadcast meets Underground Wrestling: darker command room, serious GM cockpit, controlled brand glow, and no bright SaaS panel fills.
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
- Confirm darkened glass surfaces still have enough readable contrast and do not collapse into muddy black-on-black.
- Confirm brand lighting feels like arena/stage flare behind glass, not a cyberpunk wallpaper or flat solid brand background.
- Confirm tags, badges, and lock states read as compact broadcast labels instead of rounded SaaS pills.
- Confirm panels use sharper sports TV geometry, hard frames, bars, plates, and lower-third treatments.
- Confirm Save Selection feels like a real sports/wrestling game campaign entry screen.
- Confirm New GM Setup and Setup Review feel like contract packet / league office / war-room surfaces.
- Confirm Draft Room feels like a draft broadcast with ON THE CLOCK drama, board energy, and scouting desk framing.
- Confirm selected talent reads as a broadcast profile card, not a generic info card.
- Confirm Make Pick and Auto Draft are visible but locked.
- Confirm Post-Draft Brand HQ centers Week 1 Setup, Book Show, Roster, Rivalries, Championships, Calendar, IWC Pulse, and Analytics instead of Draft Preview.
- Confirm Brand Dashboard hero prioritizes This Week's Show, Brand Health, and GM Alerts.
- Confirm Budget, Fans, and Momentum do not dominate the Brand Dashboard hero command strip.
- Confirm Brand Dashboard hero reads as a backstage monitor stack or production-control wall, not a generic KPI row.
- Confirm GM Alerts read like readable dirt-sheet leaks, objective fragments, or broadcast ticker pressure rather than a plain SaaS task list.
- Confirm visual accents feel purposeful and brand-driven, not random decorative shapes.
- Confirm the screen does not read as a generic SaaS/admin dashboard.

## Typography QA

- Confirm the static UI defines `--font-display`, `--font-ui`, `--font-data`, and `--font-ticker`.
- Confirm no external font imports, Google Fonts, CDN links, or bundled font files were added.
- Confirm Game Landing title, major section headers, brand names, and command strip titles use the display role.
- Confirm body text and controls remain readable through the UI role.
- Confirm ratings, stat labels, percentages, budgets, dates, and status labels use the data/meta role.
- Confirm IWC Pulse, alert fragments, social/ticker copy, and dirt-sheet pressure labels use the ticker role where appropriate.
- Confirm display headings feel game/broadcast-heavy without causing text overflow.
- Confirm GM card stat numbers and dashboard metric text remain easy to scan.

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

- Confirm the primary nav is a compact macOS Dock-inspired bottom dock, not a top rail or side rail.
- Confirm the dock remains visible in collapsed/default state as a compact bottom-centered glass control surface.
- Confirm collapsed/default state is icon-first and the active top-level section remains clear.
- Confirm hover/focus expands the dock into icon plus section name only.
- Confirm expanded labels do not overflow, wrap, or clip at laptop widths.
- Confirm the expanded dock overlays the screen and does not push content up or down.
- Confirm the overlay subtly dims or blurs the app behind it.
- Confirm keyboard focus expands the dock and has a visible focus state.
- Confirm selecting a dock item by pointer switches sections and immediately collapses the dock.
- Confirm activating a dock item by keyboard Enter or Space switches sections and immediately collapses the dock.
- Confirm selecting any dock item clears expanded dock presentation state and leaves only the target dock item active when a dock section exists.
- Confirm Escape collapses the expanded dock without trapping focus.
- Confirm pointer leave collapses the expanded dock after a short tasteful delay.
- Confirm clicking the main screen can collapse the dock, but is not required after selecting a dock item.
- Confirm active nav state is obvious without relying only on color.
- Confirm the dock remains usable at smaller laptop width.
- Confirm the dock does not cover Save Selection actions or other critical bottom controls.
- Confirm the dock is hidden or minimal on Landing and does not cover Landing CTAs.
- Confirm bottom safe-area spacing remains sufficient on laptop widths.
- Confirm nav actions switch between Save Selection, Contract Signing, Setup Basics, Assistant Setup, Choose GM, Select Brand, Initial Draft, Draft Recap, and Brand Dashboard without page reload.
- Confirm the dock never shows budget, fan count, alerts, mini metrics, breadcrumbs, long descriptions, notification text, or status copy.
- Confirm breadcrumbs are absent.

## Viewport And Overflow QA

- Confirm the page itself does not vertically scroll at desktop/laptop sizes.
- Confirm the app shell, header, and bottom dock remain stable.
- Confirm each active screen fits inside the visible viewport at common laptop sizes, including roughly 1366x768 and 1280x720.
- Confirm 1366x768, 1280x800, and 1440x900 do not introduce full-page scroll.
- Confirm only contained panels scroll when needed.
- Confirm the draft board and scouting feed use contained scrolling.
- Confirm long save names, wrestler names, labels, pills, buttons, and metadata truncate or wrap safely inside their boxes.
- Confirm no text spills outside cards, panels, buttons, pills, or board rows.
- Confirm cards do not stretch endlessly to create a scrolling webpage feel.
- Confirm long nav labels appear only in the expanded overlay and do not clip in collapsed state.
- Confirm nav label, card, hero, and button text does not overflow at 1366x768, 1280x800, or 1440x900.
- Confirm Choose GM uses contained internal scrolling for the card area if 12 cards cannot fit, without creating full-page scrolling.
- Confirm GM stat labels, bars, and numerical ratings do not overflow cards.
- Confirm Dashboard, Choose GM, and Landing CTAs are not covered by the bottom dock.

## Static/Mock Boundary QA

- Confirm Continue Save and Empty Slot remain locked/mock-only.
- Confirm Landing actions do not load a save, create a save, or persist a startup choice.
- Confirm invalid/corrupt save recovery remains a mock visual state only.
- Confirm setup choices are hardcoded visual placeholders.
- Confirm assistant setup does not save keys, make calls, or activate live AI.
- Confirm Draft Room controls remain disabled, including Make Pick and Auto Draft.
- Confirm clicking a talent row only updates the selected talent card in the DOM.
- Confirm clicking a talent row only updates local JS memory and the UI-only selection intent preview.
- Confirm reload resets current screen, selected GM, selected brand, selected candidate, and selection intent preview to the static defaults.
- Confirm Draft Recap and Brand Dashboard are preview states only.
- Confirm no save payloads are created.
- Confirm no database writes are triggered.
- Confirm no browser storage is used.
- Confirm no network calls are used.
- Confirm the browser UI does not import or call draft services or gameplay services.
- Confirm the domain read-only projection boundary has tests proving draft actions remain locked.
- Confirm real draft execution is still not wired.
- Confirm the next approved runtime step is selection intent preview, not pick execution.
- Confirm no draft pick, roster state, Week 1 state, show state, match state, fan/social state, business state, or AI flavor output is created.

## Rejection Criteria

- Reject if the game starts directly on a generic Dashboard.
- Reject if Save Selection feels like just another dashboard card.
- Reject if the primary navigation is a side rail or uses breadcrumbs.
- Reject if the dock clips labels, wraps into multiple lines, covers critical CTAs, or consumes too much usable screen space.
- Reject if budget/fans/deadline/health appear in the dock instead of living in Dashboard command areas.
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
