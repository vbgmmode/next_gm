import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const CREATE_DATABASE = "data/saves/__durable-create-identity-test.sqlite";
const VERIFY_DATABASE = "data/saves/__durable-create-verify-test.sqlite";
const DUPLICATE_DATABASE = "data/saves/__durable-create-duplicate-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-create-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-create-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  CREATE_DATABASE,
  VERIFY_DATABASE,
  DUPLICATE_DATABASE,
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

describe("SQLite Durable Save Identity Repository Create Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("creates one durable save identity record through the repository-facing shell", () => {
    const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-v0-1",
      requestedDatabasePath: CREATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(createResult, {
      status: "diagnostics-only",
      createSaveAttempted: true,
      databaseTarget: CREATE_DATABASE,
      pathBoundaryStatus: "allowed",
      initializationStatus: "initialized",
      insertStatus: "inserted",
      verificationStatus: "verified",
      createdSaveId: "save-identity-001",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY,
      durableStorageUsed: true,
      repositoryCreateEnabled: true,
      repositoryLoadEnabled: false,
      repositoryListEnabled: false,
      repositoryDeleteEnabled: false,
      repositoryUpdateEnabled: false,
      executionStatus: "created",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      insertedSaveRows: 1,
      insertedSaveMetadataRows: 1,
      schemaMigrationRows: 1,
      savesRowCount: 1,
      saveMetadataRowCount: 1,
      verificationIdentityMatchesRequest: true,
      verificationMetadataMatchesRequest: true,
      repositoryObjectAvailable: false,
      repositoryMethodsAvailable: false,
      fullRepositoryImplementationAvailable: false,
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

    assert.deepEqual(readDurableCounts(CREATE_DATABASE), {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
  });

  it("uses verification to confirm the created save identity", () => {
    const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-verify",
      requestedDatabasePath: VERIFY_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(createResult.verificationStatus, "verified");
    assert.equal(createResult.createdSaveId, COMPLETE_SAVE_IDENTITY.saveId);
    assert.equal(createResult.verificationIdentityMatchesRequest, true);
    assert.equal(createResult.verificationMetadataMatchesRequest, true);
  });

  it("keeps schema_migrations separate from save data writes", () => {
    createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-separate",
      requestedDatabasePath: CREATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const counts = readDurableCounts(CREATE_DATABASE);

    assert.equal(counts.schemaMigrationRows, 1);
    assert.equal(counts.savesRows, 1);
    assert.equal(counts.saveMetadataRows, 1);
  });

  it("handles duplicate save identity deterministically", () => {
    const firstCreate = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });
    const duplicateCreate = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-duplicate",
      requestedDatabasePath: DUPLICATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(firstCreate.executionStatus, "created");
    assert.equal(duplicateCreate.createSaveAttempted, true);
    assert.equal(duplicateCreate.executionStatus, "duplicate-save-identity");
    assert.equal(duplicateCreate.insertStatus, "duplicate-save-identity");
    assert.equal(duplicateCreate.verificationStatus, "blocked");
    assert.equal(duplicateCreate.createdSaveId, "");
    assert.equal(duplicateCreate.insertedSaveRows, 0);
    assert.equal(duplicateCreate.insertedSaveMetadataRows, 0);
    assert.equal(duplicateCreate.schemaMigrationRows, 1);
    assert.equal(duplicateCreate.savesRowCount, 1);
    assert.equal(duplicateCreate.saveMetadataRowCount, 1);
    assert.deepEqual(duplicateCreate.issues, [
      "duplicate-save-identity",
      "durable-save-identity-verification-not-ready"
    ]);
  });

  it("blocks unsafe paths before repository-facing create is attempted", () => {
    const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite",
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(createResult.createSaveAttempted, false);
    assert.equal(createResult.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(createResult.pathBoundaryStatus, "blocked");
    assert.equal(createResult.initializationStatus, "blocked");
    assert.equal(createResult.insertStatus, "blocked");
    assert.equal(createResult.verificationStatus, "blocked");
    assert.equal(createResult.executionStatus, "blocked");
    assert.equal(createResult.durableStorageUsed, false);
    assert.equal(createResult.repositoryCreateEnabled, false);
    assert.deepEqual(createResult.issues, [
      "durable-path-boundary-blocked",
      "durable-initialization-not-ready",
      "durable-save-identity-insert-not-ready",
      "durable-save-identity-verification-not-ready"
    ]);
  });

  it("keeps load, list, delete, and update disabled", () => {
    const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-no-surface",
      requestedDatabasePath: CREATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(createResult.repositoryCreateEnabled, true);
    assert.equal(createResult.repositoryLoadEnabled, false);
    assert.equal(createResult.repositoryListEnabled, false);
    assert.equal(createResult.repositoryDeleteEnabled, false);
    assert.equal(createResult.repositoryUpdateEnabled, false);
    assert.equal(createResult.repositoryObjectAvailable, false);
    assert.equal(createResult.repositoryMethodsAvailable, false);
    assert.equal(createResult.fullRepositoryImplementationAvailable, false);
    assert.equal(createResult.loadBehaviorAvailable, false);
    assert.equal(createResult.listBehaviorAvailable, false);
    assert.equal(createResult.deleteBehaviorAvailable, false);
    assert.equal(createResult.metadataUpdateBehaviorAvailable, false);
    assert.equal(Object.hasOwn(createResult, "createSave"), false);
    assert.equal(Object.hasOwn(createResult, "loadSave"), false);
    assert.equal(Object.hasOwn(createResult, "listSaves"), false);
    assert.equal(Object.hasOwn(createResult, "deleteSave"), false);
    assert.equal(Object.hasOwn(createResult, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(createResult, "saveRepository"), false);
  });

  it("cleans up durable repository create test database files", () => {
    createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-cleanup",
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
    const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-diagnostics",
      requestedDatabasePath: CREATE_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(createResult.status, "diagnostics-only");
    assert.equal(createResult.diagnosticsOnly, true);
    assert.equal(createResult.playerFacing, false);
    assert.equal(createResult.gameplayStarted, false);
    assert.equal(createResult.weekAdvanced, false);
    assert.equal(createResult.draftExecuted, false);
    assert.equal(createResult.rosterAssigned, false);
    assert.equal(createResult.matchOutcomesCreated, false);
    assert.equal(createResult.showOutcomesCreated, false);
    assert.equal(createResult.businessSystemsRun, false);
    assert.equal(createResult.fanSocialOutputCreated, false);
    assert.equal(createResult.generatedTextCreated, false);
    assert.equal(createResult.genAIUsed, false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-repository-create-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityRepositoryCreateShell({
      durablePathBoundaryId: "durable-save-identity-repository-create-engine-check",
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
  if (!databasePath.startsWith("data/saves/__durable-create-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
