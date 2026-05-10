import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell,
  createSQLiteDurableSaveIdentityRepositoryUpdateContractShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const CONTRACT_DATABASE = "data/saves/__durable-update-contract-test.sqlite";
const ROWS_DATABASE = "data/saves/__durable-update-contract-rows-test.sqlite";
const METADATA_DATABASE = "data/saves/__durable-update-contract-metadata-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-update-contract-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-update-contract-engine-check-test.sqlite";

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

describe("SQLite Durable Save Identity Repository Update Contract Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("reports create, read, and list identity capabilities as enabled", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-contract",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.createIdentityShellAvailable, true);
    assert.equal(contract.readIdentityShellAvailable, true);
    assert.equal(contract.listIdentityShellAvailable, true);
    assert.equal(contract.deleteContractShellAvailable, true);
    assert.equal(contract.repositoryCreateEnabled, true);
    assert.equal(contract.repositoryReadEnabled, true);
    assert.equal(contract.repositoryListEnabled, true);
    assert.equal(contract.createSaveBehaviorAvailable, true);
    assert.equal(contract.readSaveIdentityBehaviorAvailable, true);
    assert.equal(contract.listSaveIdentityBehaviorAvailable, true);
  });

  it("reports delete and update identity behavior as disabled", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-disabled",
      requestedDatabasePath: CONTRACT_DATABASE
    });

    assert.equal(contract.deleteIdentityBehaviorImplemented, false);
    assert.equal(contract.updateIdentityBehaviorImplemented, false);
    assert.equal(contract.repositoryDeleteEnabled, false);
    assert.equal(contract.repositoryUpdateEnabled, false);
    assert.equal(contract.deleteBehaviorAvailable, false);
    assert.equal(contract.metadataUpdateBehaviorAvailable, false);
    assert.equal(contract.executionStatus, "update-not-implemented");
    assert.deepEqual(contract.updateBlockedReasons, [
      "update-save-identity-not-implemented",
      "update-transaction-boundary-not-approved",
      "update-field-allowlist-not-approved",
      "save-metadata-update-not-approved",
      "schema-migrations-mutation-not-approved"
    ]);
    assert.deepEqual(contract.issues, [
      "update-save-identity-not-implemented",
      "update-transaction-boundary-not-approved",
      "update-field-allowlist-not-approved",
      "save-metadata-update-not-approved",
      "schema-migrations-mutation-not-approved",
      "delete-save-identity-not-implemented"
    ]);
  });

  it("keeps contract output diagnostics-only and not player-facing", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-diagnostics",
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

  it("does not perform DB updates or execute SQL", () => {
    createDurableSaveIdentity(ROWS_DATABASE);
    const beforeSnapshot = readDurableSnapshot(ROWS_DATABASE);

    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-no-sql",
      requestedDatabasePath: ROWS_DATABASE
    });

    const afterSnapshot = readDurableSnapshot(ROWS_DATABASE);

    assert.equal(contract.databaseOpened, false);
    assert.equal(contract.databaseClosed, false);
    assert.equal(contract.sqlExecuted, false);
    assert.equal(contract.updateSqlExecuted, false);
    assert.equal(contract.saveRowsUpdated, false);
    assert.equal(contract.saveMetadataRowsUpdated, false);
    assert.equal(contract.schemaMigrationsMutated, false);
    assert.deepEqual(afterSnapshot, beforeSnapshot);
  });

  it("leaves existing saves and save_metadata rows untouched", () => {
    createDurableSaveIdentity(ROWS_DATABASE);
    const beforeSnapshot = readDurableSnapshot(ROWS_DATABASE);

    createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-rows-untouched",
      requestedDatabasePath: ROWS_DATABASE
    });

    const afterSnapshot = readDurableSnapshot(ROWS_DATABASE);

    assert.deepEqual(beforeSnapshot.savesRows, [COMPLETE_SAVE_IDENTITY]);
    assert.deepEqual(beforeSnapshot.saveMetadataRows, [
      {
        saveId: COMPLETE_SAVE_IDENTITY.saveId,
        schemaVersion: COMPLETE_SAVE_IDENTITY.schemaVersion,
        createdAt: COMPLETE_SAVE_IDENTITY.createdAt,
        updatedAt: COMPLETE_SAVE_IDENTITY.updatedAt
      }
    ]);
    assert.deepEqual(afterSnapshot.savesRows, beforeSnapshot.savesRows);
    assert.deepEqual(afterSnapshot.saveMetadataRows, beforeSnapshot.saveMetadataRows);
  });

  it("keeps schema_migrations separate and untouched", () => {
    createDurableSaveIdentity(METADATA_DATABASE);
    const beforeSnapshot = readDurableSnapshot(METADATA_DATABASE);

    createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-schema-untouched",
      requestedDatabasePath: METADATA_DATABASE
    });

    const afterSnapshot = readDurableSnapshot(METADATA_DATABASE);

    assert.deepEqual(beforeSnapshot.counts, {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
    assert.deepEqual(afterSnapshot.schemaMigrationRows, beforeSnapshot.schemaMigrationRows);
    assert.deepEqual(afterSnapshot.counts, beforeSnapshot.counts);
  });

  it("rejects unsafe paths before contract evaluation", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite"
    });

    assert.equal(contract.updateContractEvaluated, false);
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

  it("does not expose gameplay payloads, full repository object, or callable update method", () => {
    const contract = createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-no-surface",
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

  it("cleans up durable repository update contract test database files", () => {
    createDurableSaveIdentity(CLEANUP_DATABASE);

    assert.equal(existsSync(CLEANUP_DATABASE), true);

    cleanupTestDatabases();

    assert.equal(existsSync(CLEANUP_DATABASE), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-shm`), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-wal`), false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-repository-update-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityRepositoryUpdateContractShell({
      durablePathBoundaryId: "durable-save-identity-repository-update-engine-check",
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
    durablePathBoundaryId: "durable-save-identity-repository-update-contract-fixture",
    requestedDatabasePath: databaseTarget,
    request: COMPLETE_SAVE_IDENTITY
  });

  assert.equal(createResult.executionStatus, "created");
}

function readDurableSnapshot(databaseTarget: string): DurableSnapshot {
  const database = new DatabaseSync(databaseTarget, { readOnly: true });

  try {
    const savesRows = database.prepare(
      `SELECT
  saveId,
  saveSlotId,
  setupId,
  selectedBrandId,
  playerManagerId,
  seedLabel,
  replayId,
  createdAt,
  updatedAt,
  schemaVersion
FROM saves
ORDER BY saveId`
    ).all() as readonly SaveIdentityRow[];
    const saveMetadataRows = database.prepare(
      `SELECT
  saveId,
  schemaVersion,
  createdAt,
  updatedAt
FROM save_metadata
ORDER BY saveId`
    ).all() as readonly SaveMetadataRow[];
    const schemaMigrationRows = database.prepare(
      `SELECT
  migrationId,
  migrationVersion,
  migrationName,
  createdAt
FROM schema_migrations
ORDER BY migrationId`
    ).all() as readonly SchemaMigrationRow[];

    return Object.freeze({
      savesRows: Object.freeze(savesRows.map(normalizeSaveIdentityRow)),
      saveMetadataRows: Object.freeze(saveMetadataRows.map(normalizeSaveMetadataRow)),
      schemaMigrationRows: Object.freeze(schemaMigrationRows.map(normalizeSchemaMigrationRow)),
      counts: Object.freeze({
        schemaMigrationRows: schemaMigrationRows.length,
        savesRows: savesRows.length,
        saveMetadataRows: saveMetadataRows.length
      })
    });
  } finally {
    database.close();
  }
}

function normalizeSaveIdentityRow(row: SaveIdentityRow): SaveIdentityRow {
  return Object.freeze({
    saveId: row.saveId,
    saveSlotId: row.saveSlotId,
    setupId: row.setupId,
    selectedBrandId: row.selectedBrandId,
    playerManagerId: row.playerManagerId,
    seedLabel: row.seedLabel,
    replayId: row.replayId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    schemaVersion: row.schemaVersion
  });
}

function normalizeSaveMetadataRow(row: SaveMetadataRow): SaveMetadataRow {
  return Object.freeze({
    saveId: row.saveId,
    schemaVersion: row.schemaVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

function normalizeSchemaMigrationRow(row: SchemaMigrationRow): SchemaMigrationRow {
  return Object.freeze({
    migrationId: row.migrationId,
    migrationVersion: row.migrationVersion,
    migrationName: row.migrationName,
    createdAt: row.createdAt
  });
}

function cleanupTestDatabases(): void {
  for (const databasePath of TEST_DATABASES) {
    removeControlledTestFile(databasePath);
    removeControlledTestFile(`${databasePath}-shm`);
    removeControlledTestFile(`${databasePath}-wal`);
  }
}

function removeControlledTestFile(databasePath: string): void {
  if (!databasePath.startsWith("data/saves/__durable-update-contract-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}

interface DurableSnapshot {
  readonly savesRows: readonly SaveIdentityRow[];
  readonly saveMetadataRows: readonly SaveMetadataRow[];
  readonly schemaMigrationRows: readonly SchemaMigrationRow[];
  readonly counts: {
    readonly schemaMigrationRows: number;
    readonly savesRows: number;
    readonly saveMetadataRows: number;
  };
}

interface SaveIdentityRow {
  readonly saveId: string;
  readonly saveSlotId: string;
  readonly setupId: string;
  readonly selectedBrandId: string;
  readonly playerManagerId: string;
  readonly seedLabel: string;
  readonly replayId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaVersion: string;
}

interface SaveMetadataRow {
  readonly saveId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface SchemaMigrationRow {
  readonly migrationId: string;
  readonly migrationVersion: string;
  readonly migrationName: string;
  readonly createdAt: string;
}
