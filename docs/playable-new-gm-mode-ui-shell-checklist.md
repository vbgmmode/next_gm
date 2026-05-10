# Playable New GM Mode UI Shell Checklist

Manual verification for the static shell:

- Open `ui/playable-new-gm-mode/index.html` directly in a browser.
- Confirm the left navigation lists Dashboard, Save Selection, New GM Setup, Draft Room, Roster, Rivalries, Championships, Calendar, IWC, Analytics, and Settings.
- Confirm Save Selection shows Continue Save, New GM Mode, and Empty Slot as mock-only cards.
- Confirm New GM Setup shows Choose Brand, Choose GM Identity, Difficulty / Experience, Draft Setup, and Review Setup as static sections.
- Confirm Setup Review shows selected brand, GM identity, difficulty / experience, draft setup, and blocked-state labels.
- Confirm Draft-Night Preview shows a mock draft board, mock talent pool, mock pick order, and mock readiness panel.
- Confirm the player flow is visually clear: Save Selection -> New GM Setup -> Setup Review -> Draft Preview.
- Confirm blocked labels remain visible for draft execution, roster assignment, gameplay start, persistence, SQLite writes, and GenAI.
- Confirm there are no backend calls, no draft service imports, no save writes, and no gameplay state mutation in this static scaffold.
