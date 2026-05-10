import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityInitializationShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const INITIALIZATION_DATABASE =
  "data/saves/__durable-init-identity-test.sqlite";
const EMPTY_TABLES_DATABASE =
  "data/saves/__durable-init-empty-tables-test.sqlite";
const ENGINE_CHECK_DATABASE =
  "data/saves/__durable-init-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  INITIALIZATION_DATABASE,
  EMPTY_TABLES_DATABASE,
  ENGINE_CHECK_DATABASE
]);

describe("SQLite Durable Save Identity Initialization Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("initializes the approved identity schema for an allowed durable path", () => {
    const initialization = createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-v0-1",
      requestedDatabasePath: INITIALIZATION_DATABASE
    });

    assert.deepEqual(initialization, {
      status: "diagnostics-only",
      initializationAttempted: true,
      databaseTarget: INITIALIZATION_DATABASE,
      pathBoundaryStatus: "allowed",
      schemaExecutionStatus: "executed",
      migrationTrackingStatus: "inserted",
      createdTables: ["saves", "save_metadata", "schema_migrations"],
      schemaVersion: "sqlite-save-schema-v0.1",
      durableStorageUsed: true,
      repositoryBehaviorEnabled: false,
      executionStatus: "initialized",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      insertedTrackingRows: 1,
      schemaMigrationRowCount: 1,
      savesRowCount: 0,
      saveMetadataRowCount: 0,
      databaseOpened: true,
      databaseClosed: true,
      saveIdentityRowsInserted: false,
      saveMetadataRowsInserted: false,
      repositoryMethodsAvailable: false,
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
    assert.equal(existsSync(INITIALIZATION_DATABASE), true);
  });

  it("writes the approved migration tracking row and no save rows", () => {
    createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-empty-tables",
      requestedDatabasePath: EMPTY_TABLES_DATABASE
    });

    const counts = readDurableIdentityCounts(EMPTY_TABLES_DATABASE);

    assert.deepEqual(counts, {
      schemaMigrationRows: 1,
      approvedMigrationRows: 1,
      savesRows: 0,
      saveMetadataRows: 0
    });
  });

  it("blocks unsafe paths before opening a database", () => {
    const initialization = createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm.sqlite"
    });

    assert.equal(initialization.initializationAttempted, false);
    assert.equal(initialization.databaseTarget, "C:/outside/next-gm.sqlite");
    assert.equal(initialization.pathBoundaryStatus, "blocked");
    assert.equal(initialization.schemaExecutionStatus, "blocked");
    assert.equal(initialization.migrationTrackingStatus, "blocked");
    assert.equal(initialization.executionStatus, "blocked");
    assert.deepEqual(initialization.issues, [
      "durable-path-boundary-blocked"
    ]);
    assert.equal(initialization.durableStorageUsed, false);
    assert.equal(initialization.databaseOpened, false);
    assert.equal(initialization.databaseClosed, false);
    assert.equal(existsSync("C:\\outside\\next-gm.sqlite"), false);
  });

  it("keeps repository behavior disabled", () => {
    const initialization = createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-no-repository",
      requestedDatabasePath: INITIALIZATION_DATABASE
    });

    assert.equal(initialization.repositoryBehaviorEnabled, false);
    assert.equal(initialization.repositoryMethodsAvailable, false);
    assert.equal(initialization.createSaveBehaviorAvailable, false);
    assert.equal(initialization.loadBehaviorAvailable, false);
    assert.equal(initialization.listBehaviorAvailable, false);
    assert.equal(initialization.deleteBehaviorAvailable, false);
    assert.equal(initialization.metadataUpdateBehaviorAvailable, false);
    assert.equal(initialization.saveIdentityRowsInserted, false);
    assert.equal(initialization.saveMetadataRowsInserted, false);
  });

  it("does not expose create, load, list, delete, or update surface", () => {
    const initialization = createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-no-surface",
      requestedDatabasePath: INITIALIZATION_DATABASE
    });

    assert.equal(initialization.status, "diagnostics-only");
    assert.equal(initialization.diagnosticsOnly, true);
    assert.equal(initialization.playerFacing, false);
    assert.equal(initialization.gameplayStarted, false);
    assert.equal(initialization.weekAdvanced, false);
    assert.equal(initialization.draftExecuted, false);
    assert.equal(initialization.rosterAssigned, false);
    assert.equal(initialization.matchOutcomesCreated, false);
    assert.equal(initialization.showOutcomesCreated, false);
    assert.equal(initialization.businessSystemsRun, false);
    assert.equal(initialization.fanSocialOutputCreated, false);
    assert.equal(initialization.generatedTextCreated, false);
    assert.equal(initialization.genAIUsed, false);
    assert.equal(Object.hasOwn(initialization, "createSave"), false);
    assert.equal(Object.hasOwn(initialization, "loadSave"), false);
    assert.equal(Object.hasOwn(initialization, "listSaves"), false);
    assert.equal(Object.hasOwn(initialization, "deleteSave"), false);
    assert.equal(Object.hasOwn(initialization, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(initialization, "saveRepository"), false);
    assert.equal(Object.hasOwn(initialization, "advanceWeek"), false);
    assert.equal(Object.hasOwn(initialization, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-save-identity-init-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityInitializationShell({
      durablePathBoundaryId: "durable-save-identity-initialization-engine-check",
      requestedDatabasePath: ENGINE_CHECK_DATABASE
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function readDurableIdentityCounts(databaseTarget: string): {
  readonly schemaMigrationRows: number;
  readonly approvedMigrationRows: number;
  readonly savesRows: number;
  readonly saveMetadataRows: number;
} {
  const database = new DatabaseSync(databaseTarget, { readOnly: true });

  try {
    return Object.freeze({
      schemaMigrationRows: readRowCount(database, "schema_migrations"),
      approvedMigrationRows: readApprovedMigrationCount(database),
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

function readApprovedMigrationCount(database: DatabaseSync): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount
FROM schema_migrations
WHERE migrationId = ?`
  ).get("sqlite-save-identity-schema-v0-1") as { readonly rowCount: number };

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
  if (!databasePath.startsWith("data/saves/__durable-init-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
