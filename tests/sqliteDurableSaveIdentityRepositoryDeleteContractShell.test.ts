import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell,
  createSQLiteDurableSaveIdentityRepositoryDeleteContractShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const CONTRACT_DATABASE = "data/saves/__durable-delete-contract-test.sqlite";
const ROWS_DATABASE = "data/saves/__durable-delete-contract-rows-test.sqlite";
const METADATA_DATABASE = "data/saves/__durable-delete-contract-metadata-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-delete-contract-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-delete-contract-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  CONTRACT_DATABASE,
  ROWS_DATABASE,
  METADATA_DATABASE,
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

describe("SQLite Durable Save Identity Repository Delete Contract Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("reports create, read, and list identity capabilities as enabled", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-contract",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.createIdentityShellAvailable, true);
    assert.equal(contract.readIdentityShellAvailable, true);
    assert.equal(contract.listIdentityShellAvailable, true);
    assert.equal(contract.repositoryCreateEnabled, true);
    assert.equal(contract.repositoryReadEnabled, true);
    assert.equal(contract.repositoryListEnabled, true);
    assert.equal(contract.createSaveBehaviorAvailable, true);
    assert.equal(contract.readSaveIdentityBehaviorAvailable, true);
    assert.equal(contract.listSaveIdentityBehaviorAvailable, true);
  });

  it("reports delete and update identity behavior as disabled", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-disabled",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.deleteIdentityBehaviorImplemented, false);
    assert.equal(contract.updateIdentityBehaviorImplemented, false);
    assert.equal(contract.repositoryDeleteEnabled, false);
    assert.equal(contract.repositoryUpdateEnabled, false);
    assert.equal(contract.deleteBehaviorAvailable, false);
    assert.equal(contract.metadataUpdateBehaviorAvailable, false);
    assert.equal(contract.executionStatus, "delete-not-implemented");
    assert.deepEqual(contract.deleteBlockedReasons, [
      "delete-save-identity-not-implemented",
      "delete-transaction-boundary-not-approved",
      "delete-save-metadata-cascade-not-approved",
      "schema-migrations-mutation-not-approved"
    ]);
    assert.deepEqual(contract.issues, [
      "delete-save-identity-not-implemented",
      "delete-transaction-boundary-not-approved",
      "delete-save-metadata-cascade-not-approved",
      "schema-migrations-mutation-not-approved",
      "update-save-identity-not-implemented"
    ]);
  });

  it("keeps contract output diagnostics-only and not player-facing", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-diagnostics",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayStarted, false);
    assert.equal(contract.weekAdvanced, false);
    assert.equal(contract.draftExecuted, false);
    assert.equal(contract.rosterAssigned, false);
    assert.equal(contract.matchOutcomesCreated, false);
    assert.equal(contract.showOutcomesCreated, false);
    assert.equal(contract.businessSystemsRun, false);
    assert.equal(contract.fanSocialOutputCreated, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(contract.gameplayAffecting, false);
  });

  it("does not perform DB deletion or execute SQL", () => {
    createDurableSaveIdentity(ROWS_DATABASE);
    const beforeCounts = readDurableCounts(ROWS_DATABASE);

    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-no-sql",
      requestedDatabasePath: ROWS_DATABASE
    });

    const afterCounts = readDurableCounts(ROWS_DATABASE);

    assert.equal(contract.databaseOpened, false);
    assert.equal(contract.databaseClosed, false);
    assert.equal(contract.sqlExecuted, false);
    assert.equal(contract.deleteSqlExecuted, false);
    assert.equal(contract.saveRowsDeleted, false);
    assert.equal(contract.saveMetadataRowsDeleted, false);
    assert.equal(contract.schemaMigrationsMutated, false);
    assert.deepEqual(afterCounts, beforeCounts);
  });

  it("leaves existing saves and save_metadata rows untouched", () => {
    createDurableSaveIdentity(ROWS_DATABASE);
    const beforeCounts = readDurableCounts(ROWS_DATABASE);

    createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-rows-untouched",
      requestedDatabasePath: ROWS_DATABASE
    });

    const afterCounts = readDurableCounts(ROWS_DATABASE);

    assert.equal(beforeCounts.savesRows, 1);
    assert.equal(beforeCounts.saveMetadataRows, 1);
    assert.equal(afterCounts.savesRows, 1);
    assert.equal(afterCounts.saveMetadataRows, 1);
    assert.deepEqual(afterCounts, beforeCounts);
  });

  it("keeps schema_migrations separate and untouched", () => {
    createDurableSaveIdentity(METADATA_DATABASE);
    const beforeCounts = readDurableCounts(METADATA_DATABASE);

    createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-schema-untouched",
      requestedDatabasePath: METADATA_DATABASE
    });

    const afterCounts = readDurableCounts(METADATA_DATABASE);

    assert.deepEqual(beforeCounts, {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
    assert.deepEqual(afterCounts, beforeCounts);
  });

  it("rejects unsafe paths before DB work", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite"
    });

    assert.equal(contract.deleteContractEvaluated, false);
    assert.equal(contract.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(contract.pathBoundaryStatus, "blocked");
    assert.equal(contract.executionStatus, "blocked");
    assert.equal(contract.repositoryCreateEnabled, false);
    assert.equal(contract.repositoryReadEnabled, false);
    assert.equal(contract.repositoryListEnabled, false);
    assert.equal(contract.repositoryDeleteEnabled, false);
    assert.equal(contract.repositoryUpdateEnabled, false);
    assert.equal(contract.databaseOpened, false);
    assert.equal(contract.sqlExecuted, false);
    assert.deepEqual(contract.issues, ["durable-path-boundary-blocked"]);
  });

  it("does not expose gameplay payloads, full repository object, or callable delete method", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-no-surface",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.repositoryObjectAvailable, false);
    assert.equal(contract.repositoryMethodsAvailable, false);
    assert.equal(contract.fullRepositoryImplementationAvailable, false);
    assert.equal(contract.gameplayPayloadBehaviorAvailable, false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "deleteSave"), false);
    assert.equal(Object.hasOwn(contract, "updateSave"), false);
    assert.equal(Object.hasOwn(contract, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(contract, "gameplayPayload"), false);
    assert.equal(Object.hasOwn(contract, "draftPayload"), false);
    assert.equal(Object.hasOwn(contract, "rosterPayload"), false);
    assert.equal(Object.hasOwn(contract, "matchPayload"), false);
    assert.equal(Object.hasOwn(contract, "showPayload"), false);
    assert.equal(Object.hasOwn(contract, "businessPayload"), false);
    assert.equal(Object.hasOwn(contract, "fanSocialPayload"), false);
  });

  it("cleans up durable repository delete contract test database files", () => {
    createDurableSaveIdentity(CLEANUP_DATABASE);

    assert.equal(existsSync(CLEANUP_DATABASE), true);

    cleanupTestDatabases();

    assert.equal(existsSync(CLEANUP_DATABASE), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-shm`), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-wal`), false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-repository-delete-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityRepositoryDeleteContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-delete-engine-check",
      requestedDatabasePath: ENGINE_CHECK_DATABASE
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createDurableSaveIdentity(databaseTarget: string): void {
  const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
    durablePathBoundaryId: "durable-save-identity-repository-delete-contract-fixture",
    requestedDatabasePath: databaseTarget,
    request: COMPLETE_SAVE_IDENTITY
  });

  assert.equal(createResult.executionStatus, "created");
}

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
  if (!databasePath.startsWith("data/saves/__durable-delete-contract-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
