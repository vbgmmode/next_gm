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
  createRivalrySetupProjection,
  createWeekOneHqProjection,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "../ui/playable-new-gm-mode/localPostDraftSetupController.js";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});

describe("Playable New GM Mode local post-draft setup flow", () => {
  it("keeps championship setup locked before Finish Draft", () => {
    const projection = createChampionshipSetupProjection({
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
      setupState: createInitialLocalPostDraftSetupState(),
    });

    assert.equal(projection.locked, true);
    assert.equal(projection.canComplete, false);
    assert.equal(projection.complete, false);
    assert.equal(
      projection.displayLabels.statusLine,
      "Finish the draft before assigning champions."
    );
  });

  it("completes championship setup after assigning required unique champions", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 3)
      .map((summary) => summary.candidateId);
    let setupState = createInitialLocalPostDraftSetupState();

    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "worldChampionId",
      candidateId: rosterIds[0],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "womensChampionId",
      candidateId: rosterIds[1],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "midcardChampionId",
      candidateId: rosterIds[2],
    });

    const result = completeLocalChampionshipSetup({
      miniDraftProgress,
      setupState,
    });

    assert.equal(result.actionStatus, "championship-setup-complete");
    assert.equal(result.setupState.championshipSetupComplete, true);
    assert.equal(result.projection.complete, true);
    assert.equal(
      result.projection.displayLabels.statusLine,
      "Championship Setup Complete"
    );
  });

  it("blocks championship setup when the same wrestler is assigned twice", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 2)
      .map((summary) => summary.candidateId);
    let setupState = createInitialLocalPostDraftSetupState();

    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "worldChampionId",
      candidateId: rosterIds[0],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "womensChampionId",
      candidateId: rosterIds[0],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "midcardChampionId",
      candidateId: rosterIds[1],
    });

    const projection = createChampionshipSetupProjection({
      miniDraftProgress,
      setupState,
    });
    const result = completeLocalChampionshipSetup({
      miniDraftProgress,
      setupState,
    });

    assert.equal(projection.canComplete, false);
    assert.equal(projection.hasDuplicateSingles, true);
    assert.equal(result.actionStatus, "championship-setup-blocked");
  });

  it("keeps rivalry setup locked until championship setup is complete", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const projection = createRivalrySetupProjection({
      miniDraftProgress,
      setupState: createInitialLocalPostDraftSetupState(),
    });

    assert.equal(projection.locked, true);
    assert.equal(projection.canComplete, false);
    assert.equal(
      projection.displayLabels.statusLine,
      "Complete championship setup before creating rivalries."
    );
  });

  it("completes rivalry setup after adding one valid rivalry", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 5)
      .map((summary) => summary.candidateId);
    let setupState = createCompletedChampionshipState(miniDraftProgress, rosterIds);

    setupState = updateLocalRivalrySlot({
      setupState,
      slotIndex: 0,
      wrestlerAId: rosterIds[3],
      wrestlerBId: rosterIds[4],
      rivalryType: "Championship",
      intensity: "High",
    });

    const result = completeLocalRivalrySetup({
      miniDraftProgress,
      setupState,
    });

    assert.equal(result.actionStatus, "rivalry-setup-complete");
    assert.equal(result.setupState.rivalrySetupComplete, true);
    assert.equal(result.projection.complete, true);
    assert.equal(result.projection.validRivalries.length, 1);
    assert.equal(result.projection.validRivalries[0]?.rivalryType, "Championship");
  });

  it("keeps Week 1 HQ locked until draft, championship, and rivalry setup are complete", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 5)
      .map((summary) => summary.candidateId);
    const initialProjection = createWeekOneHqProjection({
      selectedBrand,
      miniDraftProgress,
      setupState: createInitialLocalPostDraftSetupState(),
    });
    const completedState = createCompletedRivalryState(miniDraftProgress, rosterIds);
    const unlockedProjection = createWeekOneHqProjection({
      selectedBrand,
      miniDraftProgress,
      setupState: completedState,
    });

    assert.equal(initialProjection.unlocked, false);
    assert.equal(initialProjection.displayLabels.titleLine, "Week 1 HQ Locked");
    assert.equal(unlockedProjection.unlocked, true);
    assert.equal(unlockedProjection.displayLabels.titleLine, "Week 1 HQ");
    assert.equal(unlockedProjection.signedRosterCount, 16);
    assert.equal(unlockedProjection.champions.length, 3);
    assert.equal(unlockedProjection.rivalries.length, 1);
    assert.equal(unlockedProjection.displayLabels.bookingLine, "Book Week 1 Show - Coming Next");
  });

  it("wires the local setup screens without storage, network, or gameplay calls", () => {
    const changedSource = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("styles.css"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("localPostDraftSetupController.js"),
    ].join("\n");

    assert.match(changedSource, /id="championship-setup"/);
    assert.match(changedSource, /id="rivalry-setup"/);
    assert.match(changedSource, /Week 1 HQ/);
    assert.match(changedSource, /Assign Champions/);
    assert.match(changedSource, /Create Rivalries/);

    for (const snippet of [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "fetch(",
      "XMLHttpRequest",
      "INSERT INTO",
      "UPDATE ",
      "DELETE ",
      "sqlite",
      "canUseGenAI: true",
      "createAutoDraft",
      "AutoDraftService",
      "match-engine-v0",
      "show-engine-v0",
      "fan-reaction-engine-v0",
      "social-discourse-engine-v0",
      "Math.random",
    ]) {
      assert.equal(changedSource.includes(snippet), false, snippet);
    }
  });
});

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

function createCompletedChampionshipState(
  miniDraftProgress: ReturnType<typeof createFinishedLocalDraftProgress>,
  rosterIds: string[]
) {
  let setupState = createInitialLocalPostDraftSetupState();

  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "worldChampionId",
    candidateId: rosterIds[0],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensChampionId",
    candidateId: rosterIds[1],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "midcardChampionId",
    candidateId: rosterIds[2],
  });

  const championship = completeLocalChampionshipSetup({
    miniDraftProgress,
    setupState,
  });

  assert.equal(championship.actionStatus, "championship-setup-complete");
  return championship.setupState;
}

function createCompletedRivalryState(
  miniDraftProgress: ReturnType<typeof createFinishedLocalDraftProgress>,
  rosterIds: string[]
) {
  let setupState = createCompletedChampionshipState(miniDraftProgress, rosterIds);

  setupState = updateLocalRivalrySlot({
    setupState,
    slotIndex: 0,
    wrestlerAId: rosterIds[3],
    wrestlerBId: rosterIds[4],
    rivalryType: "Grudge",
    intensity: "Medium",
  });

  const rivalry = completeLocalRivalrySetup({
    miniDraftProgress,
    setupState,
  });

  assert.equal(rivalry.actionStatus, "rivalry-setup-complete");
  return rivalry.setupState;
}

function readPlayableUiFile(fileName: string): string {
  return readFileSync(
    join("ui", "playable-new-gm-mode", fileName),
    "utf8"
  );
}
