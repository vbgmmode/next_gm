import assert from "node:assert/strict";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityRepositoryListShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const EMPTY_DATABASE = "data/saves/__durable-list-empty-test.sqlite";
const ONE_DATABASE = "data/saves/__durable-list-one-test.sqlite";
const MULTIPLE_DATABASE = "data/saves/__durable-list-multiple-test.sqlite";
const INVALID_DATABASE = "data/saves/__durable-list-invalid-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-list-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-list-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  EMPTY_DATABASE,
  ONE_DATABASE,
  MULTIPLE_DATABASE,
  INVALID_DATABASE,
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

describe("SQLite Durable Save Identity Repository List Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("lists an empty durable save identity set after initialization", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-empty",
      requestedDatabasePath: EMPTY_DATABASE
    });

    assert.deepEqual(listResult, {
      status: "diagnostics-only",
      listSaveIdentitiesAttempted: true,
      databaseTarget: EMPTY_DATABASE,
      pathBoundaryStatus: "allowed",
      initializationStatus: "initialized",
      createStatuses: [],
      requestedCreateCount: 0,
      listedSaveIdentities: [],
      listedSaveCount: 0,
      saveMetadataRowCount: 0,
      schemaMigrationRows: 1,
      identityFieldsPresent: true,
      metadataFieldsPresent: true,
      saveMetadataMatchesSaves: true,
      ordering: "createdAt-asc-saveId-asc",
      repositoryCreateEnabled: true,
      repositoryReadEnabled: true,
      repositoryListEnabled: true,
      repositoryDeleteEnabled: false,
      repositoryUpdateEnabled: false,
      durableStorageUsed: true,
      executionStatus: "listed",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      databaseOpened: true,
      databaseClosed: true,
      repositoryObjectAvailable: false,
      repositoryMethodsAvailable: false,
      fullRepositoryImplementationAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: true,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      draftStateRead: false,
      rosterStateRead: false,
      matchStateRead: false,
      showStateRead: false,
      businessStateRead: false,
      fanSocialStateRead: false,
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
  });

  it("lists one durable save identity after create", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-one",
      requestedDatabasePath: ONE_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.equal(listResult.executionStatus, "listed");
    assert.deepEqual(listResult.createStatuses, ["created"]);
    assert.equal(listResult.requestedCreateCount, 1);
    assert.equal(listResult.listedSaveCount, 1);
    assert.equal(listResult.saveMetadataRowCount, 1);
    assert.equal(listResult.schemaMigrationRows, 1);
    assert.deepEqual(listResult.listedSaveIdentities, [
      {
        saveId: "save-identity-001",
        saveSlotId: "slot-001",
        setupId: "setup-001",
        selectedBrandId: "brand-red",
        playerManagerId: "manager-001",
        seedLabel: "seed-opening-night",
        replayId: "replay-001",
        createdAt: "2026-05-08T12:00:00.000Z",
        updatedAt: "2026-05-08T12:00:00.000Z",
        schemaVersion: "sqlite-save-schema-v0.1",
        saveMetadataPresent: true,
        metadataSchemaVersion: "sqlite-save-schema-v0.1",
        metadataCreatedAt: "2026-05-08T12:00:00.000Z",
        metadataUpdatedAt: "2026-05-08T12:00:00.000Z"
      }
    ]);
  });

  it("lists multiple durable save identities with stable deterministic ordering", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-multiple",
      requestedDatabasePath: MULTIPLE_DATABASE,
      requests: [
        {
          ...COMPLETE_SAVE_IDENTITY,
          saveId: "save-zeta",
          saveSlotId: "slot-zeta",
          createdAt: "2026-05-08T12:02:00.000Z",
          updatedAt: "2026-05-08T12:02:00.000Z"
        },
        {
          ...COMPLETE_SAVE_IDENTITY,
          saveId: "save-beta",
          saveSlotId: "slot-beta",
          createdAt: "2026-05-08T12:01:00.000Z",
          updatedAt: "2026-05-08T12:01:00.000Z"
        },
        {
          ...COMPLETE_SAVE_IDENTITY,
          saveId: "save-alpha",
          saveSlotId: "slot-alpha",
          createdAt: "2026-05-08T12:01:00.000Z",
          updatedAt: "2026-05-08T12:01:00.000Z"
        }
      ]
    });

    assert.equal(listResult.executionStatus, "listed");
    assert.equal(listResult.ordering, "createdAt-asc-saveId-asc");
    assert.deepEqual(
      listResult.listedSaveIdentities.map((identity) => identity.saveId),
      ["save-alpha", "save-beta", "save-zeta"]
    );
    assert.deepEqual(listResult.createStatuses, ["created", "created", "created"]);
    assert.equal(listResult.listedSaveCount, 3);
    assert.equal(listResult.saveMetadataRowCount, 3);
    assert.equal(listResult.schemaMigrationRows, 1);
  });

  it("rejects unsafe paths deterministically before listing", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite",
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.equal(listResult.listSaveIdentitiesAttempted, false);
    assert.equal(listResult.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(listResult.pathBoundaryStatus, "blocked");
    assert.equal(listResult.initializationStatus, "blocked");
    assert.equal(listResult.executionStatus, "blocked");
    assert.equal(listResult.repositoryCreateEnabled, false);
    assert.equal(listResult.repositoryReadEnabled, false);
    assert.equal(listResult.repositoryListEnabled, false);
    assert.equal(listResult.durableStorageUsed, false);
    assert.deepEqual(listResult.issues, ["durable-path-boundary-blocked"]);
  });

  it("handles missing and invalid durable DB state deterministically", () => {
    const missingStateResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-missing-state",
      requestedDatabasePath: EMPTY_DATABASE
    });

    writeFileSync(INVALID_DATABASE, "not a sqlite database", "utf8");

    const invalidStateResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-invalid-state",
      requestedDatabasePath: INVALID_DATABASE
    });

    assert.equal(missingStateResult.executionStatus, "listed");
    assert.equal(missingStateResult.listedSaveCount, 0);
    assert.equal(invalidStateResult.listSaveIdentitiesAttempted, false);
    assert.equal(invalidStateResult.initializationStatus, "failed");
    assert.equal(invalidStateResult.executionStatus, "blocked");
    assert.deepEqual(invalidStateResult.issues, ["durable-initialization-not-ready"]);
  });

  it("does not expose gameplay payloads", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-no-payload",
      requestedDatabasePath: ONE_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.deepEqual(Object.keys(listResult.listedSaveIdentities[0]), [
      "saveId",
      "saveSlotId",
      "setupId",
      "selectedBrandId",
      "playerManagerId",
      "seedLabel",
      "replayId",
      "createdAt",
      "updatedAt",
      "schemaVersion",
      "saveMetadataPresent",
      "metadataSchemaVersion",
      "metadataCreatedAt",
      "metadataUpdatedAt"
    ]);
    assert.equal(Object.hasOwn(listResult, "gameplayPayload"), false);
    assert.equal(Object.hasOwn(listResult, "draftPayload"), false);
    assert.equal(Object.hasOwn(listResult, "rosterPayload"), false);
    assert.equal(Object.hasOwn(listResult, "matchPayload"), false);
    assert.equal(Object.hasOwn(listResult, "showPayload"), false);
    assert.equal(Object.hasOwn(listResult, "businessPayload"), false);
    assert.equal(Object.hasOwn(listResult, "fanSocialPayload"), false);
  });

  it("does not enable delete or update behavior", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-no-delete-update",
      requestedDatabasePath: ONE_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.equal(listResult.repositoryCreateEnabled, true);
    assert.equal(listResult.repositoryReadEnabled, true);
    assert.equal(listResult.repositoryListEnabled, true);
    assert.equal(listResult.repositoryDeleteEnabled, false);
    assert.equal(listResult.repositoryUpdateEnabled, false);
    assert.equal(listResult.repositoryObjectAvailable, false);
    assert.equal(listResult.repositoryMethodsAvailable, false);
    assert.equal(listResult.fullRepositoryImplementationAvailable, false);
    assert.equal(listResult.deleteBehaviorAvailable, false);
    assert.equal(listResult.metadataUpdateBehaviorAvailable, false);
    assert.equal(Object.hasOwn(listResult, "deleteSave"), false);
    assert.equal(Object.hasOwn(listResult, "updateSave"), false);
    assert.equal(Object.hasOwn(listResult, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(listResult, "saveRepository"), false);
  });

  it("keeps schema_migrations separate from saves and save_metadata", () => {
    createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-separate",
      requestedDatabasePath: ONE_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    const counts = readDurableCounts(ONE_DATABASE);

    assert.deepEqual(counts, {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
  });

  it("cleans up durable repository list test database files", () => {
    createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-cleanup",
      requestedDatabasePath: CLEANUP_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.equal(existsSync(CLEANUP_DATABASE), true);

    cleanupTestDatabases();

    assert.equal(existsSync(CLEANUP_DATABASE), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-shm`), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-wal`), false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const listResult = createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-diagnostics",
      requestedDatabasePath: ONE_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
    });

    assert.equal(listResult.status, "diagnostics-only");
    assert.equal(listResult.diagnosticsOnly, true);
    assert.equal(listResult.playerFacing, false);
    assert.equal(listResult.gameplayStarted, false);
    assert.equal(listResult.weekAdvanced, false);
    assert.equal(listResult.draftExecuted, false);
    assert.equal(listResult.rosterAssigned, false);
    assert.equal(listResult.matchOutcomesCreated, false);
    assert.equal(listResult.showOutcomesCreated, false);
    assert.equal(listResult.businessSystemsRun, false);
    assert.equal(listResult.fanSocialOutputCreated, false);
    assert.equal(listResult.generatedTextCreated, false);
    assert.equal(listResult.genAIUsed, false);
    assert.equal(listResult.gameplayAffecting, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-repository-list-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityRepositoryListShell({
      durablePathBoundaryId: "durable-save-identity-repository-list-engine-check",
      requestedDatabasePath: ENGINE_CHECK_DATABASE,
      requests: [COMPLETE_SAVE_IDENTITY]
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
  if (!databasePath.startsWith("data/saves/__durable-list-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
