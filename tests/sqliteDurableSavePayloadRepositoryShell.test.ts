import assert from "node:assert/strict";
import { existsSync, rmSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createPlayableNewGMModeGameplayStateModel,
  createPlayableNewGMModeSavePayloadContract,
  createPlayableNewGMModeSavePayloadSerializedSnapshot
} from "../src/game/domain/index.ts";
import {
  createSQLiteDurableSavePayloadRepositoryReadShell,
  createSQLiteDurableSavePayloadRepositoryWriteShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const WRITE_DATABASE = "data/saves/__durable-payload-write-test.sqlite";
const READ_DATABASE = "data/saves/__durable-payload-read-test.sqlite";
const DUPLICATE_DATABASE = "data/saves/__durable-payload-duplicate-test.sqlite";
const BLOCKED_DATABASE = "data/saves/__durable-payload-blocked-test.sqlite";
const ENGINE_DATABASE = "data/saves/__durable-payload-engine-test.sqlite";

const TEST_DATABASES = Object.freeze([
  WRITE_DATABASE,
  READ_DATABASE,
  DUPLICATE_DATABASE,
  BLOCKED_DATABASE,
  ENGINE_DATABASE
]);

const COMPLETE_SAVE_IDENTITY = {
  saveId: "save-raw-week-2",
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

describe("SQLite Durable Save Payload Repository Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("writes one durable gameplay payload row for an existing save identity flow", () => {
    const writeResult = createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-write-v0-1",
      requestedDatabasePath: WRITE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(2)
    });

    assert.equal(writeResult.status, "gameplay-payload-persistence");
    assert.equal(writeResult.writeAttempted, true);
    assert.equal(writeResult.executionStatus, "written");
    assert.equal(writeResult.createStatus, "created");
    assert.equal(writeResult.requestedSaveId, "save-raw-week-2");
    assert.equal(writeResult.payloadFormatVersion, "0.1.0");
    assert.equal(writeResult.payloadRowsWritten, 1);
    assert.equal(writeResult.payloadRowCount, 1);
    assert.equal(writeResult.durableStorageUsed, true);
    assert.equal(writeResult.repositoryWriteEnabled, true);
    assert.equal(writeResult.repositoryReadEnabled, false);
    assert.equal(writeResult.gameplayStatePersisted, true);
    assert.equal(writeResult.browserStorageUsed, false);
    assert.equal(writeResult.networkUsed, false);
    assert.equal(writeResult.simulationEnginesCalled, false);
    assert.equal(writeResult.genAIUsed, false);
    assert.equal(writeResult.playerFacing, false);
    assert.deepEqual(writeResult.issues, []);
    assert.deepEqual(readPayloadCounts(WRITE_DATABASE), {
      savesRows: 1,
      payloadRows: 1,
      payloadFormatVersion: "0.1.0"
    });
  });

  it("reads the durable gameplay payload and parses player-session summary fields", () => {
    createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-read-setup",
      requestedDatabasePath: READ_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(2)
    });

    const readResult = createSQLiteDurableSavePayloadRepositoryReadShell({
      durablePathBoundaryId: "durable-save-payload-read-v0-1",
      requestedDatabasePath: READ_DATABASE,
      requestedSaveId: "save-raw-week-2"
    });

    assert.equal(readResult.status, "gameplay-payload-persistence");
    assert.equal(readResult.readAttempted, true);
    assert.equal(readResult.executionStatus, "read");
    assert.equal(readResult.payloadFound, true);
    assert.equal(readResult.payloadFormatVersion, "0.1.0");
    assert.equal(readResult.parsedPayloadReady, true);
    assert.equal(readResult.gameId, "game-raw-local-001");
    assert.equal(readResult.selectedBrandName, "Raw");
    assert.equal(readResult.currentWeek, 2);
    assert.equal(readResult.repositoryReadEnabled, true);
    assert.equal(readResult.repositoryWriteEnabled, false);
    assert.equal(readResult.gameplayStateLoaded, true);
    assert.equal(readResult.browserStorageUsed, false);
    assert.equal(readResult.networkUsed, false);
    assert.equal(readResult.simulationEnginesCalled, false);
    assert.deepEqual(readResult.issues, []);
  });

  it("updates the payload row deterministically when the save identity already exists", () => {
    const firstWrite = createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(2)
    });
    const secondWrite = createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(3)
    });
    const readResult = createSQLiteDurableSavePayloadRepositoryReadShell({
      durablePathBoundaryId: "durable-save-payload-duplicate-read",
      requestedDatabasePath: DUPLICATE_DATABASE,
      requestedSaveId: "save-raw-week-2"
    });

    assert.equal(firstWrite.createStatus, "created");
    assert.equal(secondWrite.createStatus, "duplicate-save-identity");
    assert.equal(secondWrite.executionStatus, "written");
    assert.equal(secondWrite.payloadRowCount, 1);
    assert.equal(readResult.executionStatus, "read");
    assert.equal(readResult.currentWeek, 3);
  });

  it("blocks unsafe paths and invalid payloads before write behavior runs", () => {
    const unsafeWrite = createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-payload.sqlite",
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(2)
    });
    const invalidWrite = createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-invalid",
      requestedDatabasePath: BLOCKED_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createPlayableNewGMModeSavePayloadSerializedSnapshot(undefined)
    });

    assert.equal(unsafeWrite.writeAttempted, false);
    assert.equal(unsafeWrite.executionStatus, "blocked");
    assert.equal(unsafeWrite.durableStorageUsed, false);
    assert.deepEqual(unsafeWrite.issues, ["durable-path-boundary-blocked"]);
    assert.equal(invalidWrite.writeAttempted, false);
    assert.equal(invalidWrite.executionStatus, "blocked");
    assert.deepEqual(invalidWrite.issues, ["serialized-payload-not-ready"]);
    assert.equal(existsSync(BLOCKED_DATABASE), false);
  });

  it("blocks missing save IDs before read behavior runs", () => {
    const readResult = createSQLiteDurableSavePayloadRepositoryReadShell({
      durablePathBoundaryId: "durable-save-payload-read-missing-id",
      requestedDatabasePath: READ_DATABASE,
      requestedSaveId: " "
    });

    assert.equal(readResult.readAttempted, false);
    assert.equal(readResult.executionStatus, "blocked");
    assert.equal(readResult.repositoryReadEnabled, false);
    assert.deepEqual(readResult.issues, ["missing-save-id"]);
  });

  it("does not expose browser storage, network, GenAI, or simulation engine calls", () => {
    const source = readFileSync(
      "src/game/persistence/sqliteDurableSavePayloadRepositoryShell.ts",
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
    const contextSeed = "sqlite-durable-save-payload-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 19)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSavePayloadRepositoryWriteShell({
      durablePathBoundaryId: "durable-save-payload-engine",
      requestedDatabasePath: ENGINE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      serializedSnapshot: createSerializedSnapshot(2)
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 19)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createSerializedSnapshot(currentWeek: number) {
  return createPlayableNewGMModeSavePayloadSerializedSnapshot(
    createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-raw-local-001",
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
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
        weekHistory: [
          {
            weekNumber: currentWeek - 1,
            summaryLabel: `Raw reached Week ${currentWeek}`
          }
        ]
      }),
      createdAtLabel: "local-session-week"
    })
  );
}

function readPayloadCounts(databasePath: string): {
  readonly savesRows: number;
  readonly payloadRows: number;
  readonly payloadFormatVersion: string;
} {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const savesRows = readRowCount(database, "saves");
  const payloadRows = readRowCount(database, "save_gameplay_payloads");
  const payloadRow = database.prepare(
    "SELECT payloadFormatVersion FROM save_gameplay_payloads WHERE saveId = ?"
  ).get(COMPLETE_SAVE_IDENTITY.saveId) as {
    readonly payloadFormatVersion: string;
  };

  database.close();

  return {
    savesRows,
    payloadRows,
    payloadFormatVersion: payloadRow.payloadFormatVersion
  };
}

function readRowCount(database: DatabaseSync, tableName: string): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount FROM ${tableName}`
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function cleanupTestDatabases(): void {
  for (const databasePath of TEST_DATABASES) {
    rmSync(databasePath, { force: true });
    rmSync(`${databasePath}-shm`, { force: true });
    rmSync(`${databasePath}-wal`, { force: true });
  }
}
