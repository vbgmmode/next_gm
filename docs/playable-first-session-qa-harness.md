# Playable First-Session QA Harness

Run the end-to-end playable smoke pass from the repository root:

```powershell
npm run qa:playable-first-session
```

The harness starts the existing playable preview server on a local test port, launches a headless Chromium-family browser, clicks through the first-session flow, captures screenshots, and writes a concise JSON report. If the local browser cannot attach in headless mode, it falls back to a controller-level first-session smoke pass and records screenshot/visual checks as skipped with the exact blocker.

Artifacts are local-only and ignored by Git:

```text
test-artifacts/playable-first-session/
```

## Screens Covered

- Title screen
- Setup basics
- Initial draft
- Post-draft Brand HQ
- Assign champions
- Create rivalries
- Week 1 HQ
- Booking
- Show recap
- Week 2 HQ

## Rules Covered

- Setup exposes brand, rivals, difficulty, and starting cash with real money labels.
- Draft shows rival brands, player budget, recent picks, and player signing cost movement.
- Post-draft HQ shows remaining budget, roster count, and Assign Champions as the next action.
- Championship selectors are split by men and women division eligibility.
- Rivalry and booking selectors avoid source-pool style labels.
- Rivalry types include multiple choices.
- Booking supports match and promo segment types, projected show cost, same-talent matchup blocking, and valid Run Show unlock.
- Recap shows match winners, promo fallout, business output, and fan/social pulse.
- Week 2 HQ shows the updated budget, last-show context, finance objective, and Book Week 2 Show action.

## Visual Checks

At 1366x768 and 1280x800, the harness checks major screens for horizontal page overflow, full-page vertical scrolling, visible primary CTAs, dock overlap, and obvious text overflow based on DOM bounds.

## Not Covered

This harness is not a pixel-baseline visual regression suite. It does not validate deep simulation quality, durable save behavior, external content, or long-season progression. It is meant to catch first-session wiring and obvious presentation regressions before manual review.
