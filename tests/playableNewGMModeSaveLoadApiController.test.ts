import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createPlayableNewGMModeGameplayStateModel } from "../src/game/domain/index.ts";
import {
  continuePlayableNewGMModeGame,
  createPlayableSaveApiStatus,
  savePlayableNewGMModeGame,
} from "../dev/tools/playable-save-api-controller.js";

const TEST_DATABASE = "data/saves/__playable-save-api-controller.sqlite";

describe("Playable New GM Mode save/load preview API controller", () => {
  beforeEach(() => {
    cleanupTestDatabase();
  });

  afterEach(() => {
    cleanupTestDatabase();
  });

  it("reports the controlled local save API without browser storage", () => {
    const status = createPlayableSaveApiStatus();

    assert.equal(status.status, "available");
    assert.equal(status.saveId, "playable-new-gm-mode-autosave");
    assert.equal(status.browserStorageUsed, false);
    assert.equal(status.networkScope, "local preview server only");
  });

  it("saves and continues a gameplay state model through the local preview database", () => {
    const saveResult = savePlayableNewGMModeGame({
      databasePath: TEST_DATABASE,
      gameplayStateModel: createStateModel(2),
    });
    const continueResult = continuePlayableNewGMModeGame({
      databasePath: TEST_DATABASE,
    });

    assert.equal(saveResult.ok, true);
    assert.equal(saveResult.status, "saved");
    assert.equal(saveResult.selectedBrandName, "Raw");
    assert.equal(saveResult.currentWeek, 2);
    assert.equal(saveResult.browserStorageUsed, false);
    assert.equal(existsSync(TEST_DATABASE), true);
    assert.equal(continueResult.ok, true);
    assert.equal(continueResult.status, "loaded");
    assert.equal(continueResult.gameId, "game-raw-local-001");
    assert.equal(continueResult.selectedBrandName, "Raw");
    assert.equal(continueResult.currentWeek, 2);
    assert.equal(continueResult.gameplayStateModel?.selectedBrand.brandName, "Raw");
    assert.equal(continueResult.gameplayStateModel?.currentWeek, 2);
    assert.equal(continueResult.gameplayStateModel?.signedRoster[0]?.displayName, "Cody Rhodes");
    assert.equal(continueResult.browserStorageUsed, false);
  });

  it("blocks invalid save attempts before writing a local preview save", () => {
    const result = savePlayableNewGMModeGame({
      databasePath: TEST_DATABASE,
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: "",
        selectedBrandId: "raw",
        selectedBrandName: "Raw",
      }),
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, "blocked");
    assert.deepEqual(result.issues, ["gameplay-state-model-not-ready"]);
    assert.equal(existsSync(TEST_DATABASE), false);
  });

  it("keeps the preview save API free of browser storage, GenAI, randomness, and engine calls", () => {
    const changedSource = [
      readFileSync("dev/tools/playable-save-api-controller.js", "utf8"),
      readFileSync("dev/tools/playable-ui-preview-server.js", "utf8"),
    ].join("\n");
    const forbiddenSnippets = [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "XMLHttpRequest",
      "OpenAI",
      "api key",
      "canUseGenAI: true",
      "matchEngine.run",
      "showEngine.run",
      "fanReactionEngine.run",
      "socialDiscourseEngine.run",
      ["Math", "random"].join("."),
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedSource.includes(snippet), false, snippet);
    }
  });
});

function createStateModel(currentWeek: number) {
  return createPlayableNewGMModeGameplayStateModel({
    gameId: "game-raw-local-001",
    gameLabel: "Raw Local Preview",
    selectedBrandId: "raw",
    selectedBrandName: "Raw",
    currentWeek,
    budget: {
      startingBudget: 120,
      spentBudget: 96,
      remainingBudget: 24,
      bookingReserveTarget: 20,
    },
    signedRoster: [
      {
        wrestlerId: "cody-rhodes",
        displayName: "Cody Rhodes",
        signedBrandId: "raw",
        signedBrandName: "Raw",
        draftedFrom: "SmackDown",
      },
    ],
    weekHistory: [
      {
        weekNumber: currentWeek - 1,
        summaryLabel: `Raw reached Week ${currentWeek}`,
      },
    ],
  });
}

function cleanupTestDatabase(): void {
  rmSync(TEST_DATABASE, { force: true });
  rmSync(`${TEST_DATABASE}-shm`, { force: true });
  rmSync(`${TEST_DATABASE}-wal`, { force: true });
}
