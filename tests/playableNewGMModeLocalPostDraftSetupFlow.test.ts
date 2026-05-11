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
  LOCAL_BRAND_TITLE_SETS,
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
      .slice(0, 4)
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

    const result = completeLocalChampionshipSetup({
      selectedBrand,
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
    assert.deepEqual(
      result.projection.championCards.map((card) => card.label),
      [
        "World Heavyweight Championship",
        "Intercontinental Championship",
        "Women's World Championship",
        "Women's Intercontinental Championship",
      ]
    );
  });

  it("makes championship setup available after Finish Draft and opens the setup route", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const projection = createChampionshipSetupProjection({
      selectedBrand,
      miniDraftProgress,
      setupState: createInitialLocalPostDraftSetupState(),
    });
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.equal(projection.locked, false);
    assert.equal(projection.localDraftFinished, true);
    assert.equal(projection.canComplete, false);
    assert.match(html, /data-go-to="championship-setup"/);
    assert.match(appSource, /showSection\("rivalry-setup"\);/);
  });

  it("blocks championship setup when the same wrestler is assigned twice", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 3)
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
      candidateId: rosterIds[0],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "womensMainChampionId",
      candidateId: rosterIds[1],
    });
    setupState = updateLocalChampionshipSelection({
      setupState,
      slotId: "womensMidcardChampionId",
      candidateId: rosterIds[2],
    });

    const projection = createChampionshipSetupProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
    });
    const result = completeLocalChampionshipSetup({
      selectedBrand,
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
      selectedBrand,
      miniDraftProgress,
      setupState,
    });

    assert.equal(result.actionStatus, "rivalry-setup-complete");
    assert.equal(result.setupState.rivalrySetupComplete, true);
    assert.equal(result.projection.complete, true);
    assert.equal(result.projection.validRivalries.length, 1);
    assert.equal(result.projection.validRivalries[0]?.rivalryType, "Championship");
  });

  it("makes rivalry setup available after championship setup completes", () => {
    const miniDraftProgress = createFinishedLocalDraftProgress();
    const rosterIds = miniDraftProgress.completedPickSummaries
      .slice(0, 5)
      .map((summary) => summary.candidateId);
    const completedState = createCompletedChampionshipState(
      miniDraftProgress,
      rosterIds
    );
    const projection = createRivalrySetupProjection({
      selectedBrand,
      miniDraftProgress,
      setupState: completedState,
    });

    assert.equal(projection.locked, false);
    assert.equal(projection.canComplete, false);
    assert.equal(
      projection.displayLabels.statusLine,
      "Create at least one valid rivalry to continue."
    );
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
    assert.equal(unlockedProjection.champions.length, 4);
    assert.equal(unlockedProjection.rivalries.length, 1);
    assert.equal(unlockedProjection.displayLabels.bookingLine, "Book Week 1 Show - Coming Next");
  });

  it("exposes brand-specific title sets for every playable brand", () => {
    assert.deepEqual(Object.keys(LOCAL_BRAND_TITLE_SETS), [
      "raw",
      "smackdown",
      "nxt",
      "aew",
    ]);

    for (const [brandId, expectedTitles] of Object.entries({
      raw: [
        "World Heavyweight Championship",
        "Intercontinental Championship",
        "Women's World Championship",
        "Women's Intercontinental Championship",
        "World Tag Team Championship",
        "Women's Tag Team Championship",
      ],
      smackdown: [
        "WWE Championship",
        "United States Championship",
        "WWE Women's Championship",
        "Women's United States Championship",
        "WWE Tag Team Championship",
        "Women's Tag Team Championship",
      ],
      nxt: [
        "NXT Championship",
        "NXT North American Championship",
        "NXT Women's Championship",
        "NXT Women's North American Championship",
        "NXT Tag Team Championship",
        "NXT Women's Tag Team Championship",
      ],
      aew: [
        "AEW World Championship",
        "AEW TNT Championship",
        "AEW Women's World Championship",
        "AEW TBS Championship",
        "AEW World Tag Team Championship",
        "AEW Women's Tag Team Championship",
      ],
    })) {
      const projection = createChampionshipSetupProjection({
        selectedBrand: { brandId, brandLabel: LOCAL_BRAND_TITLE_SETS[brandId].brandLabel },
        miniDraftProgress: createFinishedLocalDraftProgress({
          brandId,
          brandLabel: LOCAL_BRAND_TITLE_SETS[brandId].brandLabel,
        }),
        setupState: createInitialLocalPostDraftSetupState(),
      });

      assert.deepEqual(
        [
          ...projection.championCards.map((card) => card.label),
          ...projection.tagTitleCards.map((card) => card.label),
        ],
        expectedTitles
      );
    }
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
    assert.match(changedSource, /World Heavyweight Championship/);
    assert.match(changedSource, /Drafted From/);
    assert.match(changedSource, /Signed to/);

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
      ["Math", "random"].join("."),
    ]) {
      assert.equal(changedSource.includes(snippet), false, snippet);
    }
  });
});

function createFinishedLocalDraftProgress(brand = selectedBrand) {
  const autoFill = executeAutoFillMinimumRoster({
    selectedBrand: brand,
    selectedGm,
    miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand: brand }),
  });
  const finished = executeLocalFinishDraft({
    selectedBrand: brand,
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
    selectedBrand,
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
