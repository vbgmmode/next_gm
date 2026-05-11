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
  createInitialLocalPostDraftSetupState,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "../ui/playable-new-gm-mode/localPostDraftSetupController.js";
import {
  addLocalWeekOneBookingSegment,
  advanceLocalWeek,
  createInitialLocalWeekOneBookingState,
  createInitialLocalWeeklyLoopState,
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
    assert.equal(weekTwoRun.actionStatus, "local-weekly-show-ran");
    assert.equal(weekTwoRun.recap.weekNumber, 2);
  });

  it("wires Run Show, Show Recap, and Week 2 advancement in the UI", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="booking-run-show-action" type="button" disabled>Run Show Locked<\/button>/);
    assert.match(html, /id="booking-run-show-footer-action" disabled>Run Show Locked<\/button>/);
    assert.match(html, /id="show-recap"/);
    assert.match(html, /id="show-recap-advance-week"/);
    assert.match(appSource, /runLocalWeeklyShow/);
    assert.match(appSource, /advanceLocalWeek/);
    assert.match(appSource, /showSection\("show-recap"\)/);
    assert.match(appSource, /matchRatingLabel/);
    assert.match(appSource, /crowdResponseLine/);
    assert.match(appSource, /momentumSignalLine/);
    assert.match(html, /Local Session Only/);
    assert.match(html, /Not Saved Yet/);
    assert.equal(shouldShowDock("show-recap"), true);
  });

  it("uses only the scoped Show to Fan Reaction path without forbidden storage, randomness, or adjacent engine calls", () => {
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
      "fanReactionEngine.run",
      "socialDiscourseEngine.run",
      "businessEngine",
      ["Math", "random"].join("."),
    ];

    assert.match(changedUiSource, /runShowFanReactionSmokePipeline/);
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
  let setupState = createInitialLocalPostDraftSetupState();

  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMainChampionId",
    candidateId: rosterIds[0],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMidcardChampionId",
    candidateId: rosterIds[1],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMainChampionId",
    candidateId: rosterIds[2],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMidcardChampionId",
    candidateId: rosterIds[3],
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
