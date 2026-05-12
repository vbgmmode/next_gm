import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createInitialMiniDraftProgress,
  executeAutoFillMinimumRoster,
  executeLocalFinishDraft,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import {
  completeLocalChampionshipSetup,
  completeLocalRivalrySetup,
  createChampionshipSetupProjection,
  createInitialLocalPostDraftSetupState,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "../ui/playable-new-gm-mode/localPostDraftSetupController.js";
import {
  addLocalWeekOneBookingSegment,
  advanceLocalWeek,
  createInitialLocalWeekOneBookingState,
  createInitialLocalWeeklyLoopState,
  createLocalSeasonCalendarProjection,
  createLocalRosterHistorySnapshot,
  createWeeklyHqProjection,
  createWeekOneBookingProjection,
  runLocalWeeklyShow,
} from "../ui/playable-new-gm-mode/localWeekOneBookingController.js";
import { shouldShowDock } from "../ui/playable-new-gm-mode/screenShellState.js";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});

describe("Playable New GM Mode local Week 1 booking builder", () => {
  it("keeps booking locked before Week 1 HQ unlock", () => {
    const projection = createWeekOneBookingProjection({
      selectedBrand,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
      setupState: createInitialLocalPostDraftSetupState(),
      bookingState: createInitialLocalWeekOneBookingState(),
    });
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
      setupState: createInitialLocalPostDraftSetupState(),
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "singles-match",
        wrestlerAId: "missing-a",
        wrestlerBId: "missing-b",
      },
    });

    assert.equal(projection.locked, true);
    assert.equal(projection.status.segmentCount, 0);
    assert.equal(result.actionStatus, "week-one-booking-locked");
  });

  it("makes booking available after draft, championship, and rivalry setup complete", () => {
    const { miniDraftProgress, setupState } = createCompletedWeekOneSetup();
    const projection = createWeekOneBookingProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
    });

    assert.equal(projection.locked, false);
    assert.equal(projection.brandLabel, "Raw");
    assert.equal(projection.signedRosterCount, 16);
    assert.equal(projection.champions.length, 4);
    assert.equal(projection.rivalries.length, 1);
    assert.equal(projection.displayLabels.statusLine, "Build the Week 1 local show card.");
  });

  it("wires Week 1 HQ to the local booking screen", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="week-one-booking"/);
    assert.match(html, /data-go-to="week-one-booking"/);
    assert.match(html, /week-one-hq-booking-action/);
    assert.match(appSource, /createWeeklyHqProjection/);
    assert.match(appSource, /updateWeekOneBookingSurface/);
    assert.match(appSource, /createInitialLocalWeekOneBookingState/);
    assert.equal(shouldShowDock("week-one-booking"), true);
  });

  it("adds a valid singles match from signed talent", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "singles-match",
        wrestlerAId: rosterIds[0],
        wrestlerBId: rosterIds[1],
      },
    });

    assert.equal(result.actionStatus, "week-one-booking-segment-added");
    assert.equal(result.projection.status.segmentCount, 1);
    assert.equal(result.projection.status.hasMainEvent, false);
    assert.equal(result.projection.segments[0]?.typeLabel, "Singles Match");
    assert.match(result.projection.segments[0]?.talentLine || "", / vs /);
  });

  it("blocks same-wrestler singles matches", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "singles-match",
        wrestlerAId: rosterIds[0],
        wrestlerBId: rosterIds[0],
      },
    });

    assert.equal(result.actionStatus, "week-one-booking-same-wrestler-blocked");
    assert.equal(result.displayLabels.statusLine, "Same wrestler cannot face themselves.");
    assert.equal(result.projection.status.segmentCount, 0);
  });

  it("blocks missing wrestler match segments", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "singles-match",
        wrestlerAId: rosterIds[0],
        wrestlerBId: "",
      },
    });

    assert.equal(result.actionStatus, "week-one-booking-missing-wrestler");
    assert.equal(result.displayLabels.statusLine, "Choose signed talent for both sides.");
  });

  it("adds a promo with signed talent", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "promo",
        featuredWrestlerId: rosterIds[2],
      },
    });

    assert.equal(result.actionStatus, "week-one-booking-segment-added");
    assert.equal(result.projection.segments[0]?.typeLabel, "Promo");
    assert.match(result.projection.segments[0]?.talentLine || "", / promo$/);
  });

  it("adds a main event and marks the show card ready to run", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const bookingState = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      segmentInput: {
        segmentType: "promo",
        featuredWrestlerId: rosterIds[2],
      },
    }).bookingState;
    const result = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      segmentInput: {
        segmentType: "main-event-singles-match",
        wrestlerAId: rosterIds[3],
        wrestlerBId: rosterIds[4],
      },
    });

    assert.equal(result.projection.status.segmentCount, 2);
    assert.equal(result.projection.status.hasMainEvent, true);
    assert.equal(result.projection.status.readyToRun, true);
    assert.equal(result.projection.displayLabels.readyLine, "Ready to Run");
    assert.equal(result.projection.segments[1]?.mainEvent, true);
  });

  it("keeps Run Show locked until the card has a valid segment and main event", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const emptyResult = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const bookingState = addLocalWeekOneBookingSegment({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createInitialLocalWeekOneBookingState(),
      weeklyState: createInitialLocalWeeklyLoopState(),
      segmentInput: {
        segmentType: "singles-match",
        wrestlerAId: rosterIds[0],
        wrestlerBId: rosterIds[1],
      },
    }).bookingState;
    const noMainEventResult = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });

    assert.equal(emptyResult.actionStatus, "local-show-run-card-incomplete");
    assert.equal(noMainEventResult.actionStatus, "local-show-run-card-incomplete");
    assert.equal(noMainEventResult.displayLabels.statusLine, "Add at least one segment and a main event before running the show.");
  });

  it("runs a deterministic local show recap with grade, spotlight, and consequences", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const bookingState = createReadyShowCard({
      miniDraftProgress,
      setupState,
      rosterIds,
    });
    const result = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });

    assert.equal(result.actionStatus, "local-weekly-show-ran");
    assert.equal(result.recap.weekNumber, 1);
    assert.match(result.recap.showGrade, /^[ABCD]$/);
    assert.match(result.recap.bestSegmentLine, /Main Event Singles Match/);
    assert.match(result.recap.championSpotlight, /^Champion Spotlight:/);
    assert.match(result.recap.rivalrySpotlight, /^Rivalry Spotlight:/);
    assert.match(result.recap.momentumNote, /^Momentum:/);
    assert.match(result.recap.fanResponseNote, /^Fan Response:/);
    assert.equal(result.recap.segmentResults.length, 3);
    assert.equal(result.weeklyState.lastShowRecap?.recapId, "local-week-1-recap");
    assert.equal(result.weeklyState.rosterHistorySnapshots.length, 1);
    assert.equal(
      result.weeklyState.rosterHistorySnapshots[0]?.displayLine,
      "Roster History: Week 1 - 16 signed, Momentum: Up"
    );
  });

  it("backs local show recap with the Show Engine shell deterministically", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const bookingState = createReadyShowCard({
      miniDraftProgress,
      setupState,
      rosterIds,
    });
    const firstResult = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const secondResult = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });

    assert.equal(firstResult.recap.simulationBacked, true);
    assert.equal(firstResult.recap.cardReadinessLine, "Card Status: Processed");
    assert.match(firstResult.recap.fanResponseNote, /^Fan Response: /);
    assert.notEqual(firstResult.recap.fanResponseNote, "Fan Response: Strong");
    assert.match(firstResult.recap.socialBuzzNote, /^Social Buzz: /);
    assert.deepEqual(secondResult.recap, firstResult.recap);
    assert.equal(
      firstResult.recap.segmentResults.some((segment) =>
        segment.resultLine.includes("crowd")
      ),
      true
    );
    assert.equal(
      firstResult.recap.segmentResults.every((segment) =>
        segment.matchRatingLabel.includes("Rating:")
      ),
      true
    );
    assert.equal(
      firstResult.recap.segmentResults.every((segment) =>
        segment.crowdResponseLine.startsWith("Crowd Response:")
      ),
      true
    );
    assert.equal(
      firstResult.recap.segmentResults.every((segment) =>
        segment.momentumSignalLine.startsWith("Momentum Signal:")
      ),
      true
    );
  });

  it("advances to Week 2 HQ and reuses the local booking loop for the next week", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const weekOneRun = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: createReadyShowCard({ miniDraftProgress, setupState, rosterIds }),
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const advance = advanceLocalWeek({ weeklyState: weekOneRun.weeklyState });
    const hqProjection = createWeeklyHqProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      weeklyState: advance.weeklyState,
    });
    const weekTwoBookingState = createReadyShowCard({
      miniDraftProgress,
      setupState,
      rosterIds,
      weeklyState: advance.weeklyState,
    });
    const weekTwoRun = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: weekTwoBookingState,
      weeklyState: advance.weeklyState,
    });

    assert.equal(advance.actionStatus, "local-week-advanced");
    assert.equal(advance.weeklyState.currentWeekNumber, 2);
    assert.equal(hqProjection.displayLabels.titleLine, "Week 2 HQ");
    assert.equal(hqProjection.displayLabels.bookingLine, "Book Week 2 Show");
    assert.match(hqProjection.displayLabels.lastShowLine, /^Last Show: [ABCD] \//);
    assert.equal(hqProjection.seasonCalendar.nextSpecialEventWeek, 4);
    assert.equal(hqProjection.displayLabels.calendarLine, "Road To Special Event: Week 4 Special Event in 2 weeks");
    assert.equal(hqProjection.displayLabels.showHistoryLine, "Show History: 1 show logged");
    assert.equal(hqProjection.displayLabels.rosterHistoryLine, "Roster History: Week 1 - 16 signed, Momentum: Up");
    assert.equal(weekTwoRun.actionStatus, "local-weekly-show-ran");
    assert.equal(weekTwoRun.recap.weekNumber, 2);
  });

  it("creates deterministic local roster history snapshots for weekly HQ", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const bookingState = createReadyShowCard({
      miniDraftProgress,
      setupState,
      rosterIds,
    });
    const run = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const explicitSnapshot = createLocalRosterHistorySnapshot({
      projection: createWeekOneBookingProjection({
        selectedBrand,
        miniDraftProgress,
        setupState,
        bookingState,
        weeklyState: createInitialLocalWeeklyLoopState(),
      }),
      recap: run.recap,
    });

    assert.deepEqual(run.weeklyState.rosterHistorySnapshots[0], explicitSnapshot);
    assert.equal(explicitSnapshot.snapshotId, "local-week-1-roster-snapshot");
    assert.equal(explicitSnapshot.deltaLine, "Roster Delta: 16 signed, Momentum: Up");
  });

  it("projects a deterministic local season calendar and road to special event", () => {
    const initialCalendar = createLocalSeasonCalendarProjection({
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const eventWeekCalendar = createLocalSeasonCalendarProjection({
      weeklyState: {
        currentWeekNumber: 4,
        completedShowRecaps: [],
      },
    });
    const postEventCalendar = createLocalSeasonCalendarProjection({
      weeklyState: {
        currentWeekNumber: 5,
        completedShowRecaps: [],
      },
    });

    assert.equal(initialCalendar.specialEventLabel, "Week 4 Special Event");
    assert.equal(initialCalendar.displayLabels.titleDefenseLine, "Title Defense Window: Opens Week 4");
    assert.equal(eventWeekCalendar.displayLabels.titleDefenseLine, "Title Defense Window: Open");
    assert.equal(eventWeekCalendar.displayLabels.rivalryPayoffLine, "Rivalry Payoff: Available");
    assert.equal(postEventCalendar.specialEventLabel, "Week 8 Special Event");
  });

  it("labels special event weeks in HQ and booking surfaces", () => {
    const { miniDraftProgress, setupState } = createCompletedWeekOneSetup();
    const specialEventWeeklyState = {
      currentWeekNumber: 4,
      completedShowRecaps: [],
      rosterHistorySnapshots: [],
    };
    const hqProjection = createWeeklyHqProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      weeklyState: specialEventWeeklyState,
    });
    const bookingProjection = createWeekOneBookingProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      weeklyState: specialEventWeeklyState,
    });

    assert.equal(hqProjection.specialEventActive, true);
    assert.equal(hqProjection.displayLabels.titleLine, "Week 4 Special Event HQ");
    assert.equal(hqProjection.displayLabels.bookingLine, "Book Week 4 Special Event");
    assert.equal(hqProjection.displayLabels.bookingNoteLine, "Build the Week 4 Special Event card.");
    assert.equal(bookingProjection.specialEventActive, true);
    assert.equal(bookingProjection.displayLabels.titleLine, "Week 4 Special Event Booking");
    assert.equal(bookingProjection.displayLabels.statusLine, "Build the Week 4 Special Event local card.");
  });

  it("wires Run Show, Show Recap, and Week 2 advancement in the UI", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="booking-run-show-action" type="button" disabled>Run Show Locked<\/button>/);
    assert.match(html, /id="booking-run-show-footer-action" disabled>Run Show Locked<\/button>/);
    assert.match(html, /id="show-recap"/);
    assert.match(html, /id="show-recap-advance-week"/);
    assert.match(html, /id="show-recap-social"/);
    assert.match(html, /id="week-one-hq-calendar-tile"/);
    assert.match(html, /id="week-one-hq-title-defense-tile"/);
    assert.match(html, /id="week-one-hq-rivalry-payoff-tile"/);
    assert.match(html, /id="week-one-hq-history-tile"/);
    assert.match(html, /id="week-one-hq-roster-history-tile"/);
    assert.match(appSource, /runLocalWeeklyShow/);
    assert.match(appSource, /advanceLocalWeek/);
    assert.match(appSource, /showSection\("show-recap"\)/);
    assert.match(appSource, /calendarTile/);
    assert.match(appSource, /titleDefenseTile/);
    assert.match(appSource, /rivalryPayoffTile/);
    assert.match(appSource, /historyTile/);
    assert.match(appSource, /rosterHistoryTile/);
    assert.match(appSource, /socialBuzzNote/);
    assert.match(appSource, /matchRatingLabel/);
    assert.match(appSource, /crowdResponseLine/);
    assert.match(appSource, /momentumSignalLine/);
    assert.match(html, /Local Session Only/);
    assert.match(html, /Not Saved Yet/);
    assert.equal(shouldShowDock("show-recap"), true);
  });

  it("uses only scoped Show, Fan Reaction, and Social Discourse shells without forbidden storage or randomness", () => {
    const changedUiSource = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("styles.css"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("localWeekOneBookingController.js"),
      readPlayableUiFile("localPostDraftSetupController.js"),
      readPlayableUiFile("screenShellState.js"),
    ].join("\n");
    const forbiddenSnippets = [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "XMLHttpRequest",
      "INSERT INTO",
      "UPDATE ",
      "DELETE ",
      "sqlite",
      "OpenAI",
      "api key",
      "canUseGenAI: true",
      "createAutoDraft",
      "AutoDraftService",
      "fan-reaction-engine-v0",
      "social-discourse-engine-v0",
      "businessEngine",
      ["Math", "random"].join("."),
    ];

    assert.match(changedUiSource, /runShowFanReactionSmokePipeline/);
    assert.match(changedUiSource, /runRegisteredSocialDiscourseEngine/);
    assert.doesNotMatch(changedUiSource, /fanReactionEngine\.run/);
    assert.doesNotMatch(changedUiSource, /socialDiscourseEngine\.run/);

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedUiSource.includes(snippet), false, snippet);
    }
  });
});

function createCompletedWeekOneSetup() {
  const miniDraftProgress = createFinishedLocalDraftProgress();
  const rosterIds = miniDraftProgress.completedPickSummaries
    .slice(0, 5)
    .map((summary) => summary.candidateId);
  const championRosterIds = createChampionRosterIds(miniDraftProgress);
  let setupState = createInitialLocalPostDraftSetupState();

  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMainChampionId",
    candidateId: championRosterIds.mensMainChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMidcardChampionId",
    candidateId: championRosterIds.mensMidcardChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMainChampionId",
    candidateId: championRosterIds.womensMainChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMidcardChampionId",
    candidateId: championRosterIds.womensMidcardChampionId,
  });

  const championship = completeLocalChampionshipSetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  assert.equal(championship.actionStatus, "championship-setup-complete");

  setupState = updateLocalRivalrySlot({
    setupState: championship.setupState,
    slotIndex: 0,
    wrestlerAId: rosterIds[3],
    wrestlerBId: rosterIds[4],
    rivalryType: "Grudge",
    intensity: "Medium",
  });

  const rivalry = completeLocalRivalrySetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  assert.equal(rivalry.actionStatus, "rivalry-setup-complete");

  return {
    miniDraftProgress,
    setupState: rivalry.setupState,
    rosterIds,
  };
}

function createChampionRosterIds(
  miniDraftProgress: ReturnType<typeof createFinishedLocalDraftProgress>
) {
  const projection = createChampionshipSetupProjection({
    selectedBrand,
    miniDraftProgress,
    setupState: createInitialLocalPostDraftSetupState(),
  });
  const used = new Set<string>();
  const selectedIds: Record<string, string> = {};

  for (const card of projection.championCards) {
    const candidate = card.eligibleRosterOptions.find(
      (option) => !used.has(option.candidateId)
    );

    assert.ok(candidate, `Missing eligible champion option for ${card.slotId}`);
    used.add(candidate.candidateId);
    selectedIds[card.slotId] = candidate.candidateId;
  }

  return selectedIds as {
    mensMainChampionId: string;
    mensMidcardChampionId: string;
    womensMainChampionId: string;
    womensMidcardChampionId: string;
  };
}

function createReadyShowCard({
  miniDraftProgress,
  setupState,
  rosterIds,
  weeklyState = createInitialLocalWeeklyLoopState(),
}) {
  const promo = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: createInitialLocalWeekOneBookingState(),
    weeklyState,
    segmentInput: {
      segmentType: "promo",
      featuredWrestlerId: rosterIds[2],
    },
  });
  const match = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: promo.bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "singles-match",
      wrestlerAId: rosterIds[0],
      wrestlerBId: rosterIds[1],
    },
  });
  const mainEvent = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: match.bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "main-event-singles-match",
      wrestlerAId: rosterIds[3],
      wrestlerBId: rosterIds[4],
    },
  });

  assert.equal(mainEvent.projection.status.readyToRun, true);
  return mainEvent.bookingState;
}

function createFinishedLocalDraftProgress() {
  const autoFill = executeAutoFillMinimumRoster({
    selectedBrand,
    selectedGm,
    miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
  });
  const finished = executeLocalFinishDraft({
    selectedBrand,
    selectedGm,
    miniDraftProgress: autoFill.miniDraftProgress,
  });

  assert.equal(finished.actionStatus, "local-draft-finished");
  return finished.miniDraftProgress;
}

function readPlayableUiFile(fileName: string): string {
  return readFileSync(
    join("ui", "playable-new-gm-mode", fileName),
    "utf8"
  );
}
