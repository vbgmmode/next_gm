# Playable First-Session QA Harness

Run the end-to-end playable smoke pass from the repository root:

```powershell
npm run qa:playable-first-session
```

The default command runs browser QA first. It starts the existing playable preview server on a local test port, launches the local Chromium-family browser through Playwright dev tooling, clicks through the first-session flow, captures screenshots, runs visual anti-botch checks, and writes a concise JSON report.

Strict browser mode fails if screenshots cannot be captured:

```powershell
npm run qa:playable-first-session:browser
```

Fallback mode skips browser automation and runs deterministic controller-level product assertions only:

```powershell
npm run qa:playable-first-session:fallback
```

The default command may use fallback if browser startup fails, but the console and `report.json` must make that obvious with `browserVisualQa: "skipped"`, the exact `browserFailureReason`, and `screenshotsCaptured: 0`.

Artifacts are local-only and ignored by Git:

```text
test-artifacts/playable-first-session/
```

Screenshots are written directly into that folder as:

```text
01-title-screen.png
02-setup-basics.png
03-initial-draft.png
04-post-draft-brand-hq.png
05-assign-champions.png
06-create-rivalries.png
07-week-1-hq.png
08-booking.png
09-show-recap.png
10-week-2-hq.png
```

The report is written to:

```text
test-artifacts/playable-first-session/report.json
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

The browser pass also verifies that the active screen marker and title match the expected first-session flow step.

## How To Use In Future UI Slices

For player-facing Playable New GM Mode changes, run the strict browser command before reporting the work done. Inspect the PNGs and `report.json` when a visual check fails. Use fallback only to preserve product-rule coverage when the local browser itself is blocked, and report that limitation clearly.

Failing browser mode means screenshots, Playwright browser startup, product assertions, or visual anti-botch checks did not complete. It does not necessarily mean the gameplay/controller flow is broken; check `report.json` to distinguish browser startup failures from product assertion failures.

## Not Covered

This harness is not a pixel-baseline visual regression suite. It does not validate deep simulation quality, durable save behavior, external content, or long-season progression. It is meant to catch first-session wiring and obvious presentation regressions before manual review.
