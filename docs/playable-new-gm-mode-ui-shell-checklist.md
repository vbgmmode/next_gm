# Playable New GM Mode UI Shell Checklist

Manual verification target:

`C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html`

## Flow QA

- Confirm the first screen is Save Selection, not Dashboard or Brand HQ.
- Confirm Save Selection feels like the game entry screen with large campaign/save-slot panels.
- Confirm the visible early flow is Save Selection -> New GM Setup -> Setup Review -> Initial Draft -> Post-Draft Brand HQ.
- Confirm choosing static controls only switches visible mock sections.
- Confirm New GM Setup feels like contract signing / setup, not a dashboard card.
- Confirm Setup Review feels like a war-room launch packet.
- Confirm Initial Draft feels like the active draft broadcast surface.
- Confirm Post-Draft Brand HQ becomes the primary post-draft surface.
- Confirm Draft Preview is not presented as the primary surface in Post-Draft Brand HQ.

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
- Confirm tags, badges, and lock states read as compact broadcast labels instead of rounded SaaS pills.
- Confirm panels use sharper sports TV geometry, hard frames, bars, plates, and lower-third treatments.
- Confirm Save Selection feels like a real sports/wrestling game campaign entry screen.
- Confirm New GM Setup and Setup Review feel like contract packet / league office / war-room surfaces.
- Confirm Draft Room feels like a draft broadcast with ON THE CLOCK drama, board energy, and scouting desk framing.
- Confirm selected talent reads as a broadcast profile card, not a generic info card.
- Confirm Post-Draft Brand HQ centers Week 1 Setup, Book Show, Roster, Rivalries, Championships, Calendar, IWC Pulse, and Analytics instead of Draft Preview.
- Confirm visual accents feel purposeful and brand-driven, not random decorative shapes.

## Navigation QA

- Confirm the nav is hidden/hover or compact-overlay style, not a chunky always-visible sidebar.
- Confirm collapsed/default nav labels are not clipped.
- Confirm hover/focus reveals readable labels on desktop/laptop widths.
- Confirm active nav state is obvious.
- Confirm nav actions switch between Save Selection, New GM Setup, Setup Review, Initial Draft, and Brand HQ without page reload.

## Viewport And Overflow QA

- Confirm the page itself does not vertically scroll at desktop/laptop sizes.
- Confirm the app shell, header, nav, and flow board remain stable.
- Confirm each active screen fits inside the visible viewport at common laptop sizes, including roughly 1366x768 and 1280x720.
- Confirm only contained panels scroll when needed.
- Confirm the draft board and scouting feed use contained scrolling.
- Confirm long save names, wrestler names, labels, pills, buttons, and metadata truncate or wrap safely inside their boxes.
- Confirm no text spills outside cards, panels, buttons, pills, or board rows.

## Static/Mock Boundary QA

- Confirm Continue Save and Empty Slot remain locked/mock-only.
- Confirm setup choices are hardcoded visual placeholders.
- Confirm setup review only summarizes mock choices.
- Confirm Draft Room controls remain disabled.
- Confirm clicking a talent row only updates the selected talent card in the DOM.
- Confirm Post-Draft Brand HQ is a preview state only.
- Confirm no save payloads are created.
- Confirm no database writes are triggered.
- Confirm no browser storage is used.
- Confirm no network calls are used.
- Confirm no draft service or gameplay service is imported or called.
- Confirm no draft pick, roster state, Week 1 state, show state, match state, fan/social state, business state, or AI flavor output is created.

## Rejection Criteria

- Reject if the game starts directly on a generic Dashboard.
- Reject if Save Selection feels like just another dashboard card.
- Reject if Draft Room looks like another dashboard tab rather than a draft broadcast.
- Reject if Brand HQ keeps Draft Preview as the primary post-draft surface.
- Reject if pre-draft, active-draft, and post-draft states are not visually distinct.
- Reject if nav labels clip or the nav feels like an enterprise sidebar.
- Reject if the desktop/laptop page scrolls instead of containing overflow inside panels.
- Reject if the UI feels corporate, cramped, ugly, or generic.
