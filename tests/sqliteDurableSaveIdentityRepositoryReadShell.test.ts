import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityRepositoryReadShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const READ_DATABASE = "data/saves/__durable-read-identity-test.sqlite";
const MISSING_SAVE_ID_DATABASE = "data/saves/__durable-read-missing-save-id-test.sqlite";
const MISMATCH_DATABASE = "data/saves/__durable-read-mismatch-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-read-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-read-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  READ_DATABASE,
  MISSING_SAVE_ID_DATABASE,
  MISMATCH_DATABASE,
  CLEANUP_DATABASE,
  ENGINE_CHECK_DATABASE
]);

const COMPLETE_SAVE_IDENTITY = {
  saveId: "save-identity-001",
  saveSlotId: "slot-001",
  setupId: "setup-001",
  selectedBrandId: "brand-red",
  playerManagerId: "manager-001",
  seedLabel: "seed-opening-night",
  replayId: "replay-001",
  createdAt: "2026-05-08T12:00:00.000Z",
  updatedAt: "2026-05-08T12:00:00.000Z",
  schemaVersion: "sqlite-save-schema-v0.1"
} as const;

describe("SQLite Durable Save Identity Repository Read Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("reads one durable save identity record through the repository-facing shell", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-v0-1",
      requestedDatabasePath: READ_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(readResult, {
      status: "diagnostics-only",
      readSaveAttempted: true,
      databaseTarget: READ_DATABASE,
      pathBoundaryStatus: "allowed",
      createStatus: "created",
      requestedSaveId: "save-identity-001",
      foundSaveId: "save-identity-001",
      saveFound: true,
      saveMetadataFound: true,
      schemaMigrationRows: 1,
      identityMatchesRequest: true,
      identityFieldsPresent: true,
      metadataFieldsPresent: true,
      repositoryReadEnabled: true,
      repositoryCreateEnabled: true,
      repositoryListEnabled: false,
      repositoryDeleteEnabled: false,
      repositoryUpdateEnabled: false,
      durableStorageUsed: true,
      executionStatus: "read",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      databaseOpened: true,
      databaseClosed: true,
      repositoryObjectAvailable: false,
      repositoryMethodsAvailable: false,
      fullRepositoryImplementationAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      draftStateRead: false,
      rosterStateRead: false,
      matchStateRead: false,
      showStateRead: false,
      businessStateRead: false,
      fanSocialStateRead: false,
      gameplayStarted: false,
      weekAdvanced: false,
      draftExecuted: false,
      rosterAssigned: false,
      matchOutcomesCreated: false,
      showOutcomesCreated: false,
      businessSystemsRun: false,
      fanSocialOutputCreated: false,
      generatedTextCreated: false,
      genAIUsed: false,
      gameplayAffecting: false
    });

    assert.deepEqual(readDurableCounts(READ_DATABASE), {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
  });

  it("reports missing saveId deterministically", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-missing-id",
      requestedDatabasePath: MISSING_SAVE_ID_DATABASE,
      request: {
        ...COMPLETE_SAVE_IDENTITY,
        saveId: " "
      }
    });

    assert.equal(readResult.readSaveAttempted, false);
    assert.equal(readResult.executionStatus, "blocked");
    assert.equal(readResult.requestedSaveId, "");
    assert.equal(readResult.createStatus, "blocked");
    assert.equal(readResult.repositoryReadEnabled, false);
    assert.equal(readResult.repositoryCreateEnabled, false);
    assert.equal(readResult.durableStorageUsed, false);
    assert.deepEqual(readResult.issues, ["missing-requested-save-id"]);
    assert.equal(existsSync(MISSING_SAVE_ID_DATABASE), false);
  });

  it("reports mismatched saveId deterministically", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-mismatch",
      requestedDatabasePath: MISMATCH_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      requestedSaveId: "save-identity-missing"
    });

    assert.equal(readResult.readSaveAttempted, true);
    assert.equal(readResult.createStatus, "created");
    assert.equal(readResult.requestedSaveId, "save-identity-missing");
    assert.equal(readResult.foundSaveId, "");
    assert.equal(readResult.saveFound, false);
    assert.equal(readResult.saveMetadataFound, false);
    assert.equal(readResult.schemaMigrationRows, 1);
    assert.equal(readResult.identityMatchesRequest, false);
    assert.equal(readResult.identityFieldsPresent, false);
    assert.equal(readResult.metadataFieldsPresent, false);
    assert.equal(readResult.executionStatus, "mismatch");
    assert.deepEqual(readResult.issues, [
      "save-identity-not-found",
      "save-metadata-not-found",
      "save-identity-field-missing",
      "save-metadata-field-missing",
      "save-id-mismatch"
    ]);
  });

  it("keeps schema_migrations separate from read save data", () => {
    createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-separate",
      requestedDatabasePath: READ_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const counts = readDurableCounts(READ_DATABASE);

    assert.equal(counts.schemaMigrationRows, 1);
    assert.equal(counts.savesRows, 1);
    assert.equal(counts.saveMetadataRows, 1);
  });

  it("blocks unsafe paths before read is attempted", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite",
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(readResult.readSaveAttempted, false);
    assert.equal(readResult.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(readResult.pathBoundaryStatus, "blocked");
    assert.equal(readResult.createStatus, "blocked");
    assert.equal(readResult.executionStatus, "blocked");
    assert.equal(readResult.repositoryReadEnabled, false);
    assert.equal(readResult.repositoryCreateEnabled, false);
    assert.equal(readResult.durableStorageUsed, false);
    assert.deepEqual(readResult.issues, ["durable-path-boundary-blocked"]);
  });

  it("keeps list, delete, and update disabled", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-no-surface",
      requestedDatabasePath: READ_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(readResult.repositoryReadEnabled, true);
    assert.equal(readResult.repositoryCreateEnabled, true);
    assert.equal(readResult.repositoryListEnabled, false);
    assert.equal(readResult.repositoryDeleteEnabled, false);
    assert.equal(readResult.repositoryUpdateEnabled, false);
    assert.equal(readResult.repositoryObjectAvailable, false);
    assert.equal(readResult.repositoryMethodsAvailable, false);
    assert.equal(readResult.fullRepositoryImplementationAvailable, false);
    assert.equal(readResult.listBehaviorAvailable, false);
    assert.equal(readResult.deleteBehaviorAvailable, false);
    assert.equal(readResult.metadataUpdateBehaviorAvailable, false);
    assert.equal(Object.hasOwn(readResult, "listSaves"), false);
    assert.equal(Object.hasOwn(readResult, "deleteSave"), false);
    assert.equal(Object.hasOwn(readResult, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(readResult, "saveRepository"), false);
  });

  it("cleans up durable repository read test database files", () => {
    createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-cleanup",
      requestedDatabasePath: CLEANUP_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(existsSync(CLEANUP_DATABASE), true);

    cleanupTestDatabases();

    assert.equal(existsSync(CLEANUP_DATABASE), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-shm`), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-wal`), false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const readResult = createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-diagnostics",
      requestedDatabasePath: READ_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(readResult.status, "diagnostics-only");
    assert.equal(readResult.diagnosticsOnly, true);
    assert.equal(readResult.playerFacing, false);
    assert.equal(readResult.gameplayStarted, false);
    assert.equal(readResult.weekAdvanced, false);
    assert.equal(readResult.draftExecuted, false);
    assert.equal(readResult.rosterAssigned, false);
    assert.equal(readResult.matchOutcomesCreated, false);
    assert.equal(readResult.showOutcomesCreated, false);
    assert.equal(readResult.businessSystemsRun, false);
    assert.equal(readResult.fanSocialOutputCreated, false);
    assert.equal(readResult.generatedTextCreated, false);
    assert.equal(readResult.genAIUsed, false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-repository-read-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityRepositoryReadShell({
      durablePathBoundaryId: "durable-save-identity-repository-read-engine-check",
      requestedDatabasePath: ENGINE_CHECK_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function readDurableCounts(databaseTarget: string): {
  readonly schemaMigrationRows: number;
  readonly savesRows: number;
  readonly saveMetadataRows: number;
} {
  const database = new DatabaseSync(databaseTarget, { readOnly: true });

  try {
    return Object.freeze({
      schemaMigrationRows: readRowCount(database, "schema_migrations"),
      savesRows: readRowCount(database, "saves"),
      saveMetadataRows: readRowCount(database, "save_metadata")
    });
  } finally {
    database.close();
  }
}

function readRowCount(
  database: DatabaseSync,
  tableName: "saves" | "save_metadata" | "schema_migrations"
): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount FROM ${tableName}`
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function cleanupTestDatabases(): void {
  for (const databasePath of TEST_DATABASES) {
    removeControlledTestFile(databasePath);
    removeControlledTestFile(`${databasePath}-shm`);
    removeControlledTestFile(`${databasePath}-wal`);
  }
}

function removeControlledTestFile(databasePath: string): void {
  if (!databasePath.startsWith("data/saves/__durable-read-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
