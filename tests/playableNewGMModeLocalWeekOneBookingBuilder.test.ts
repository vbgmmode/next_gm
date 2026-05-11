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
  createInitialLocalWeekOneBookingState,
  createWeekOneBookingProjection,
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
    assert.equal(projection.displayLabels.statusLine, "Build the first local Week 1 show card.");
  });

  it("wires Week 1 HQ to the local booking screen", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="week-one-booking"/);
    assert.match(html, /data-go-to="week-one-booking"/);
    assert.match(html, /week-one-hq-booking-action/);
    assert.match(appSource, /Book Week 1 Show/);
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

  it("adds a main event and marks the show card ready for the next slice", () => {
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
    assert.equal(result.projection.status.readyToRunComingNext, true);
    assert.equal(result.projection.displayLabels.readyLine, "Ready to Run: Coming Next");
    assert.equal(result.projection.segments[1]?.mainEvent, true);
  });

  it("keeps Run Show disabled and Coming Next in the UI", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(html, /id="booking-run-show-action" type="button" disabled>Run Show - Coming Next<\/button>/);
    assert.match(html, /id="booking-run-show-footer-action" disabled>Run Show - Coming Next<\/button>/);
    assert.match(html, /Local Session Only/);
    assert.match(html, /Not Saved Yet/);
  });

  it("does not add forbidden storage, network, randomness, or engine calls", () => {
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
      "fetch(",
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
      "match-engine-v0",
      "show-engine-v0",
      "fan-reaction-engine-v0",
      "social-discourse-engine-v0",
      ["Math", "random"].join("."),
    ];

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
