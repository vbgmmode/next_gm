import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityInsertShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const INSERT_DATABASE = "data/saves/__durable-insert-identity-test.sqlite";
const METADATA_DATABASE = "data/saves/__durable-insert-metadata-test.sqlite";
const DUPLICATE_DATABASE = "data/saves/__durable-insert-duplicate-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-insert-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  INSERT_DATABASE,
  METADATA_DATABASE,
  DUPLICATE_DATABASE,
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

describe("SQLite Durable Save Identity Insert Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("inserts exactly one save identity row for an allowed durable path", () => {
    const insert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-v0-1",
      requestedDatabasePath: INSERT_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(insert, {
      status: "diagnostics-only",
      saveInsertAttempted: true,
      databaseTarget: INSERT_DATABASE,
      pathBoundaryStatus: "allowed",
      initializationStatus: "initialized",
      insertedSaveRows: 1,
      insertedSaveMetadataRows: 1,
      schemaMigrationRows: 1,
      savesRowCount: 1,
      saveMetadataRowCount: 1,
      insertedSaveId: "save-identity-001",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY,
      durableStorageUsed: true,
      repositoryBehaviorEnabled: false,
      executionStatus: "inserted",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      databaseOpened: true,
      databaseClosed: true,
      repositoryMethodsAvailable: false,
      fullRepositoryImplementationAvailable: false,
      createSaveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      draftStatePersisted: false,
      rosterStatePersisted: false,
      matchStatePersisted: false,
      showStatePersisted: false,
      businessStatePersisted: false,
      fanSocialStatePersisted: false,
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

    assert.deepEqual(readDurableSaveIdentityCounts(INSERT_DATABASE), {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
  });

  it("inserts one minimal save_metadata row deterministically", () => {
    const firstInsert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-metadata",
      requestedDatabasePath: METADATA_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });
    const metadataRow = readSaveMetadataRow(
      METADATA_DATABASE,
      COMPLETE_SAVE_IDENTITY.saveId
    );

    cleanupTestDatabases();

    const secondInsert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: " durable-save-identity-insert-metadata ",
      requestedDatabasePath: ` ${METADATA_DATABASE} `,
      request: {
        ...COMPLETE_SAVE_IDENTITY,
        saveId: " save-identity-001 ",
        saveSlotId: " slot-001 "
      }
    });

    assert.deepEqual(secondInsert, firstInsert);
    assert.deepEqual({ ...metadataRow }, {
      saveId: COMPLETE_SAVE_IDENTITY.saveId,
      schemaVersion: COMPLETE_SAVE_IDENTITY.schemaVersion,
      createdAt: COMPLETE_SAVE_IDENTITY.createdAt,
      updatedAt: COMPLETE_SAVE_IDENTITY.updatedAt
    });
  });

  it("keeps schema_migrations separate from save data writes", () => {
    createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-separate-tracking",
      requestedDatabasePath: INSERT_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const counts = readDurableSaveIdentityCounts(INSERT_DATABASE);

    assert.equal(counts.schemaMigrationRows, 1);
    assert.equal(counts.savesRows, 1);
    assert.equal(counts.saveMetadataRows, 1);
  });

  it("handles duplicate save identity deterministically", () => {
    const firstInsert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });
    const duplicateInsert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(firstInsert.executionStatus, "inserted");
    assert.equal(duplicateInsert.saveInsertAttempted, true);
    assert.equal(duplicateInsert.executionStatus, "duplicate-save-identity");
    assert.deepEqual(duplicateInsert.issues, ["duplicate-save-identity"]);
    assert.equal(duplicateInsert.insertedSaveRows, 0);
    assert.equal(duplicateInsert.insertedSaveMetadataRows, 0);
    assert.equal(duplicateInsert.schemaMigrationRows, 1);
    assert.equal(duplicateInsert.savesRowCount, 1);
    assert.equal(duplicateInsert.saveMetadataRowCount, 1);
    assert.equal(duplicateInsert.insertedSaveId, "");
    assert.equal(duplicateInsert.repositoryBehaviorEnabled, false);
  });

  it("blocks unsafe paths before save insert is attempted", () => {
    const insert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite",
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(insert.saveInsertAttempted, false);
    assert.equal(insert.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(insert.pathBoundaryStatus, "blocked");
    assert.equal(insert.initializationStatus, "blocked");
    assert.equal(insert.executionStatus, "blocked");
    assert.deepEqual(insert.issues, [
      "durable-path-boundary-blocked",
      "durable-initialization-not-ready"
    ]);
    assert.equal(insert.insertedSaveRows, "not-checked");
    assert.equal(insert.insertedSaveMetadataRows, "not-checked");
    assert.equal(insert.schemaMigrationRows, "not-checked");
    assert.equal(insert.durableStorageUsed, false);
    assert.equal(insert.databaseOpened, false);
    assert.equal(insert.databaseClosed, false);
  });

  it("keeps repository behavior disabled and exposes no load/list/delete/update surface", () => {
    const insert = createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-no-surface",
      requestedDatabasePath: INSERT_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(insert.repositoryBehaviorEnabled, false);
    assert.equal(insert.repositoryMethodsAvailable, false);
    assert.equal(insert.fullRepositoryImplementationAvailable, false);
    assert.equal(insert.createSaveBehaviorAvailable, false);
    assert.equal(insert.loadBehaviorAvailable, false);
    assert.equal(insert.listBehaviorAvailable, false);
    assert.equal(insert.deleteBehaviorAvailable, false);
    assert.equal(insert.metadataUpdateBehaviorAvailable, false);
    assert.equal(insert.status, "diagnostics-only");
    assert.equal(insert.diagnosticsOnly, true);
    assert.equal(insert.playerFacing, false);
    assert.equal(insert.gameplayStarted, false);
    assert.equal(insert.weekAdvanced, false);
    assert.equal(insert.draftExecuted, false);
    assert.equal(insert.rosterAssigned, false);
    assert.equal(insert.matchOutcomesCreated, false);
    assert.equal(insert.showOutcomesCreated, false);
    assert.equal(insert.businessSystemsRun, false);
    assert.equal(insert.fanSocialOutputCreated, false);
    assert.equal(insert.generatedTextCreated, false);
    assert.equal(insert.genAIUsed, false);
    assert.equal(Object.hasOwn(insert, "createSave"), false);
    assert.equal(Object.hasOwn(insert, "loadSave"), false);
    assert.equal(Object.hasOwn(insert, "listSaves"), false);
    assert.equal(Object.hasOwn(insert, "deleteSave"), false);
    assert.equal(Object.hasOwn(insert, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(insert, "saveRepository"), false);
    assert.equal(Object.hasOwn(insert, "advanceWeek"), false);
    assert.equal(Object.hasOwn(insert, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-save-identity-insert-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityInsertShell({
      durablePathBoundaryId: "durable-save-identity-insert-engine-check",
      requestedDatabasePath: ENGINE_CHECK_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function readDurableSaveIdentityCounts(databaseTarget: string): {
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

function readSaveMetadataRow(
  databaseTarget: string,
  saveId: string
): {
  readonly saveId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
} {
  const database = new DatabaseSync(databaseTarget, { readOnly: true });

  try {
    return database.prepare(
      `SELECT
  saveId,
  schemaVersion,
  createdAt,
  updatedAt
FROM save_metadata
WHERE saveId = ?`
    ).get(saveId) as {
      readonly saveId: string;
      readonly schemaVersion: string;
      readonly createdAt: string;
      readonly updatedAt: string;
    };
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
  if (!databasePath.startsWith("data/saves/__durable-insert-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
