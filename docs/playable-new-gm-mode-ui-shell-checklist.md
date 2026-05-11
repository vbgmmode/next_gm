# Playable New GM Mode UI Shell Checklist

Manual verification for the static shell:

- Open `C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html` directly in a browser.
- Confirm the left navigation lists Dashboard, Save Selection, New GM Setup, Draft Room, Roster, Rivalries, Championships, Calendar, IWC, Analytics, and Settings.
- Confirm the Dashboard reads like a wrestling GM hub/front office cockpit, not a generic admin dashboard.
- Confirm the visual direction uses premium dark sports broadcast/game-panel energy with clear show identity.
- Confirm the app behaves as a viewport-first cockpit with no full-page scrolling on laptop-sized viewports.
- Confirm the header, nav, and flow strip remain visually stable while section content changes.
- Confirm Save Selection shows Continue Save, New GM Mode, and Empty Slot as mock-only cards.
- Confirm New GM Setup shows Choose Brand, Choose GM Identity, Difficulty / Experience, Draft Setup, and Review Setup as static sections.
- Confirm Setup Review shows selected brand, GM identity, difficulty / experience, draft setup, and blocked-state labels.
- Confirm Draft Room feels like a premium draft-night command screen, not a plain table.
- Confirm Draft Room shows the broadcast strip, read-only current pick panel, draft board, brand pick order, mock talent pool, selected talent preview, and readiness/status panel.
- Confirm Draft Room keeps the talent pool, draft board, pick order, and readiness reads inside contained panels instead of expanding the page.
- Confirm the locked Make Pick and Auto Draft actions remain disabled.
- Confirm clicking a mock talent updates only the selected talent preview panel.
- Confirm the selected talent card has an obvious selected state.
- Confirm the player flow is visually clear: Save Selection -> New GM Setup -> Setup Review -> Draft Preview.
- Confirm nav rail clicks switch between Dashboard, Save Selection, New GM Setup, Setup Review, Draft Room, Roster, Rivalries, Championships, Calendar, IWC, Analytics, and Settings without a page reload.
- Confirm the active nav item and active screen label update after each section switch.
- Confirm the static next-step controls move through Save Selection -> New GM Setup -> Setup Review -> Draft Preview only as frontend DOM switching.
- Confirm locked future sections remain marked as placeholder/mock/future and do not expose functional systems.
- Confirm Roster shows an empty post-draft placeholder state with roster assignment and gameplay start locked.
- Confirm Roster, Rivalries, and Championships feel visually connected as future roster-adjacent hubs.
- Confirm IWC, Analytics, and Calendar read as game systems with presentation value, not blank placeholders.
- Confirm long labels, buttons, wrestler names, and status pills truncate or compress instead of spilling outside cards.
- Confirm blocked labels remain visible for draft execution, roster assignment, gameplay start, persistence, SQLite writes, and GenAI.
- Confirm future draft integration notes say to consume existing Real Draft System v1.0 services instead of rebuilding draft services.
- Confirm the read-only draft integration boundary projects existing candidate/readiness data only.
- Confirm there are no backend calls, no draft service imports, no save writes, and no gameplay state mutation in this static scaffold.

## Manual UI QA

Open this local file directly in a browser:

`C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html`

Screens and sections to inspect:

- Dashboard command board preview.
- Dashboard GM hub, brand identity panel, status cards, alerts, upcoming draft board, roster spotlight, rivalry heat, championships, IWC, analytics, and calendar cues.
- Static player flow strip.
- Save Selection.
- New GM Setup.
- Setup Review.
- Draft Room command screen.
- Selected talent preview.
- Read-only draft integration boundary messaging.
- Roster placeholder.
- Rivalries placeholder.
- Championships placeholder.
- Calendar placeholder.
- IWC placeholder.
- Analytics placeholder.
- Settings placeholder.

Expected visual behavior:

- The screen should keep a premium dark command-center feel.
- The page itself should not vertically scroll at normal laptop sizes; scrolling should be contained inside approved panels only.
- The active major section should fit within the visible app viewport.
- Header, nav, and player-flow controls should remain stable and should not drift offscreen during section switching.
- Dashboard should feel like a playable wrestling management game hub with show identity, GM alerts, status cards, and next-event pressure.
- Draft Room should feel like a draft-night broadcast command desk rather than a plain admin table.
- Roster should feel like the future locker-room command hub, with Rivalries and Championships visually nearby.
- Rivalries should show heat-oriented game presentation even while locked.
- Championships should use title-desk presentation with clear future champion/title-scene slots.
- IWC should look like an audience pulse system waiting for the first show.
- Analytics should look like command intelligence previews, not raw diagnostics.
- Calendar should read as Road to PLE orientation, not a generic schedule widget.
- The left nav should remain readable and hover-expand on laptop/desktop widths.
- The top command header should keep Brand, Calendar, Budget, Fans, and Deadline visible.
- The current step, next step, and blocked step labels should be visually distinct.
- Section switching should make the active screen obvious in the nav and header.
- Mock/locked labels should feel like intentional preview-state badges, not raw developer diagnostics.
- Player-facing lock language should prefer Preview Mode, Locked for this build, Draft execution not enabled, and Coming after draft confirmation over raw technical phrasing.
- Cards should have readable spacing at common laptop widths.
- Cards should compress responsively and preserve hierarchy without stretching into long-page layouts.
- Text must not spill outside cards, buttons, status strips, pills, or table rows.

Expected mock/blocked behavior:

- Save cards must remain demo-only and disabled.
- New GM Setup must show static selections only.
- Setup Review must show demo summaries only.
- Draft Room must show demo board, current pick, talent pool, selected talent details, pick order, and readiness only.
- Draft Room readiness should clearly distinguish the read-only adapter boundary from locked draft execution.
- Talent clicks must update DOM text only.
- Make Pick must remain disabled.
- Auto Draft must remain disabled.
- Next-step controls must only switch visible static sections.
- Locked future areas must stay visibly non-functional.
- Blocked labels must remain visible for draft execution, roster assignment, gameplay start, persistence, SQLite writes, and GenAI.

Responsive/laptop-width checks:

- At roughly 1366px x 768px, the Dashboard should fit as a cockpit with no full-page vertical scrolling.
- At roughly 1366px x 768px, Draft Room should fit in the viewport with internal panel scrolling only.
- At roughly 1280px x 720px, the header, nav, flow strip, and active section should remain usable without overlap.
- At roughly 1366px width, Save Selection should fit as a polished command surface.
- At roughly 1366px width, Draft Room should keep the current pick, readiness, order, board, talent pool, and detail panel readable without feeling like a plain admin table.
- At roughly 1120px width, major card grids should collapse cleanly.
- At narrow widths, the nav should become usable without hiding text or overlapping content.
- Long disabled button labels should not overflow their cards.
- Section switching should not create layout jumps that hide the active section header.
- If content exceeds the viewport, only the relevant internal panel should scroll.

Boundary checks:

- JavaScript may only perform frontend DOM section switching.
- JavaScript may update selected talent preview text from static page data only.
- No backend calls should exist.
- No draft service imports or calls should exist.
- No real draft pick creation or draft execution should exist.
- No real roster assignment should exist.
- No new parallel Real Draft System services should exist.
- No save persistence or SQLite writes should exist.
- No browser storage should exist.
- No generated text or GenAI behavior should exist.
