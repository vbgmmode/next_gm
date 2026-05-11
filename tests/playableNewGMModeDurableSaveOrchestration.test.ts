import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createPlayableNewGMModeGameplayStateModel
} from "../src/game/domain/index.ts";
import {
  createPlayableNewGMModeContinueSaveShell,
  createPlayableNewGMModeDurableNewSaveSlotShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const SAVE_DATABASE = "data/saves/__playable-durable-save-orchestration.sqlite";
const BLOCKED_DATABASE = "data/saves/__playable-durable-save-blocked.sqlite";
const ENGINE_DATABASE = "data/saves/__playable-durable-save-engine.sqlite";
const TEST_DATABASES = Object.freeze([
  SAVE_DATABASE,
  BLOCKED_DATABASE,
  ENGINE_DATABASE
]);

const COMPLETE_SAVE_IDENTITY = {
  saveId: "playable-save-raw-001",
  saveSlotId: "slot-raw-001",
  setupId: "setup-raw-001",
  selectedBrandId: "raw",
  playerManagerId: "manager-player",
  seedLabel: "seed-raw-local",
  replayId: "replay-raw-local",
  createdAt: "2026-05-11T12:00:00.000Z",
  updatedAt: "2026-05-11T12:00:00.000Z",
  schemaVersion: "sqlite-save-schema-v0.1"
} as const;

describe("Playable New GM Mode Durable Save Orchestration v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("creates a new durable save slot from the gameplay state model", () => {
    const result = createPlayableNewGMModeDurableNewSaveSlotShell({
      requestedDatabasePath: SAVE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      gameplayStateModel: createStateModel(2)
    });

    assert.equal(result.status, "playable-save-orchestration");
    assert.equal(result.newSaveSlotAttempted, true);
    assert.equal(result.requestedSaveId, "playable-save-raw-001");
    assert.equal(result.selectedBrandName, "Raw");
    assert.equal(result.currentWeek, 2);
    assert.equal(result.payloadContractReady, true);
    assert.equal(result.payloadSerialized, true);
    assert.equal(result.durableWriteStatus, "written");
    assert.equal(result.executionStatus, "saved");
    assert.equal(result.durableSaveAvailable, true);
    assert.equal(result.browserStorageUsed, false);
    assert.equal(result.networkUsed, false);
    assert.equal(result.simulationEnginesCalled, false);
    assert.deepEqual(result.issues, []);
    assert.equal(existsSync(SAVE_DATABASE), true);
  });

  it("continues a durable save by reading the stored payload summary", () => {
    createPlayableNewGMModeDurableNewSaveSlotShell({
      requestedDatabasePath: SAVE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      gameplayStateModel: createStateModel(3)
    });

    const result = createPlayableNewGMModeContinueSaveShell({
      requestedDatabasePath: SAVE_DATABASE,
      requestedSaveId: "playable-save-raw-001"
    });

    assert.equal(result.status, "playable-save-orchestration");
    assert.equal(result.continueSaveAttempted, true);
    assert.equal(result.requestedSaveId, "playable-save-raw-001");
    assert.equal(result.gameId, "game-raw-local-001");
    assert.equal(result.selectedBrandName, "Raw");
    assert.equal(result.currentWeek, 3);
    assert.equal(result.gameplayStateModel?.selectedBrand.brandName, "Raw");
    assert.equal(result.gameplayStateModel?.currentWeek, 3);
    assert.equal(result.durableReadStatus, "read");
    assert.equal(result.executionStatus, "loaded");
    assert.equal(result.durableSaveLoaded, true);
    assert.equal(result.browserStorageUsed, false);
    assert.equal(result.networkUsed, false);
    assert.deepEqual(result.issues, []);
  });

  it("blocks invalid gameplay state before creating a durable save slot", () => {
    const result = createPlayableNewGMModeDurableNewSaveSlotShell({
      requestedDatabasePath: BLOCKED_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: " ",
        selectedBrandId: "raw",
        selectedBrandName: "Raw"
      })
    });

    assert.equal(result.newSaveSlotAttempted, false);
    assert.equal(result.executionStatus, "blocked");
    assert.equal(result.durableSaveAvailable, false);
    assert.deepEqual(result.issues, ["gameplay-state-model-not-ready"]);
    assert.equal(existsSync(BLOCKED_DATABASE), false);
  });

  it("reports missing and not-found continue-save requests", () => {
    const missingId = createPlayableNewGMModeContinueSaveShell({
      requestedDatabasePath: SAVE_DATABASE,
      requestedSaveId: " "
    });
    const notFound = createPlayableNewGMModeContinueSaveShell({
      requestedDatabasePath: SAVE_DATABASE,
      requestedSaveId: "playable-save-missing"
    });

    assert.equal(missingId.continueSaveAttempted, false);
    assert.equal(missingId.executionStatus, "blocked");
    assert.deepEqual(missingId.issues, ["missing-save-id"]);
    assert.equal(notFound.continueSaveAttempted, true);
    assert.equal(notFound.executionStatus, "failed");
    assert.deepEqual(notFound.issues, ["durable-payload-read-not-ready"]);
  });

  it("does not add browser storage, network, GenAI, or simulation engine calls", () => {
    const source = readFileSync(
      "src/game/persistence/playableNewGMModeDurableSaveOrchestration.ts",
      "utf8"
    );
    const forbiddenSnippets = [
      ["local", "Storage"].join(""),
      ["session", "Storage"].join(""),
      "indexedDB",
      "fetch(",
      "XMLHttpRequest",
      "OpenAI",
      ["Math", "random"].join("."),
      "matchEngine.run",
      "showEngine.run",
      "fanReactionEngine.run",
      "socialDiscourseEngine.run"
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(source.includes(snippet), false, snippet);
    }
  });

  it("keeps existing engine behavior, IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "playable-durable-save-orchestration-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 23)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createPlayableNewGMModeDurableNewSaveSlotShell({
      requestedDatabasePath: ENGINE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      gameplayStateModel: createStateModel(2)
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 23)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
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
      bookingReserveTarget: 20
    },
    signedRoster: [
      {
        wrestlerId: "cody-rhodes",
        displayName: "Cody Rhodes",
        signedBrandId: "raw",
        signedBrandName: "Raw",
        draftedFrom: "SmackDown"
      }
    ],
    weekHistory: [
      {
        weekNumber: currentWeek - 1,
        summaryLabel: `Raw reached Week ${currentWeek}`
      }
    ]
  });
}

function cleanupTestDatabases(): void {
  for (const databasePath of TEST_DATABASES) {
    rmSync(databasePath, { force: true });
    rmSync(`${databasePath}-shm`, { force: true });
    rmSync(`${databasePath}-wal`, { force: true });
  }
}
