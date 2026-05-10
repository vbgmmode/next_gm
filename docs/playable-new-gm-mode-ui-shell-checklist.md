# Playable New GM Mode UI Shell Checklist

Manual verification for the static shell:

- Open `ui/playable-new-gm-mode/index.html` directly in a browser.
- Confirm the left navigation lists Dashboard, Save Selection, New GM Setup, Draft Room, Roster, Rivalries, Championships, Calendar, IWC, Analytics, and Settings.
- Confirm Save Selection shows Continue Save, New GM Mode, and Empty Slot as mock-only cards.
- Confirm New GM Setup shows Choose Brand, Choose GM Identity, Difficulty / Experience, Draft Setup, and Review Setup as static sections.
- Confirm Setup Review shows selected brand, GM identity, difficulty / experience, draft setup, and blocked-state labels.
- Confirm Draft-Night Preview shows a mock draft board, mock talent pool, mock pick order, and mock readiness panel.
- Confirm the player flow is visually clear: Save Selection -> New GM Setup -> Setup Review -> Draft Preview.
- Confirm nav rail clicks switch between Dashboard, Save Selection, New GM Setup, Setup Review, Draft Room, Roster, Rivalries, Championships, Calendar, IWC, Analytics, and Settings without a page reload.
- Confirm the active nav item and active screen label update after each section switch.
- Confirm the static next-step controls move through Save Selection -> New GM Setup -> Setup Review -> Draft Preview only as frontend DOM switching.
- Confirm locked future sections remain marked as placeholder/mock/future and do not expose functional systems.
- Confirm blocked labels remain visible for draft execution, roster assignment, gameplay start, persistence, SQLite writes, and GenAI.
- Confirm there are no backend calls, no draft service imports, no save writes, and no gameplay state mutation in this static scaffold.

## Manual UI QA

Open this local file directly in a browser:

`C:\Users\vinni\OneDrive\Documents\next_gm\ui\playable-new-gm-mode\index.html`

Screens and sections to inspect:

- Dashboard command board preview.
- Static player flow strip.
- Save Selection.
- New GM Setup.
- Setup Review.
- Draft-Night Preview.
- Roster placeholder.
- Rivalries placeholder.
- Championships placeholder.
- Calendar placeholder.
- IWC placeholder.
- Analytics placeholder.
- Settings placeholder.

Expected visual behavior:

- The screen should keep a premium dark command-center feel.
- The left nav should remain readable and hover-expand on laptop/desktop widths.
- The top command header should keep Brand, Calendar, Budget, Fans, and Deadline visible.
- The current step, next step, and blocked step labels should be visually distinct.
- Section switching should make the active screen obvious in the nav and header.
- Cards should have readable spacing at common laptop widths.

Expected mock/blocked behavior:

- Save cards must remain demo-only and disabled.
- New GM Setup must show static selections only.
- Setup Review must show demo summaries only.
- Draft-Night Preview must show demo board, talent pool, pick order, and readiness only.
- Draft action must remain disabled.
- Next-step controls must only switch visible static sections.
- Locked future areas must stay visibly non-functional.
- Blocked labels must remain visible for draft execution, roster assignment, gameplay start, persistence, SQLite writes, and GenAI.

Responsive/laptop-width checks:

- At roughly 1366px width, Save Selection should fit as a polished command surface.
- At roughly 1120px width, major card grids should collapse cleanly.
- At narrow widths, the nav should become usable without hiding text or overlapping content.
- Long disabled button labels should not overflow their cards.
- Section switching should not create layout jumps that hide the active section header.

Boundary checks:

- JavaScript may only perform frontend DOM section switching.
- No backend calls should exist.
- No draft service imports or calls should exist.
- No save persistence or SQLite writes should exist.
- No browser storage should exist.
- No generated text or GenAI behavior should exist.
