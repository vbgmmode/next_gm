import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityVerificationShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const VERIFY_DATABASE = "data/saves/__durable-verify-identity-test.sqlite";
const METADATA_DATABASE = "data/saves/__durable-verify-metadata-test.sqlite";
const MISMATCH_DATABASE = "data/saves/__durable-verify-mismatch-test.sqlite";
const CLEANUP_DATABASE = "data/saves/__durable-verify-cleanup-test.sqlite";
const ENGINE_CHECK_DATABASE = "data/saves/__durable-verify-engine-check-test.sqlite";

const TEST_DATABASES = Object.freeze([
  VERIFY_DATABASE,
  METADATA_DATABASE,
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

describe("SQLite Durable Save Identity Verification Shell v0.1", () => {
  beforeEach(() => {
    cleanupTestDatabases();
  });

  afterEach(() => {
    cleanupTestDatabases();
  });

  it("verifies an inserted save identity row for an allowed durable path", () => {
    const verification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-v0-1",
      requestedDatabasePath: VERIFY_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(verification, {
      status: "diagnostics-only",
      verificationAttempted: true,
      databaseTarget: VERIFY_DATABASE,
      pathBoundaryStatus: "allowed",
      initializationStatus: "initialized",
      insertStatus: "inserted",
      verifiedSaveId: "save-identity-001",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY,
      savesRowCount: 1,
      saveMetadataRowCount: 1,
      schemaMigrationRows: 1,
      identityMatchesRequest: true,
      metadataMatchesRequest: true,
      durableStorageUsed: true,
      repositoryBehaviorEnabled: false,
      executionStatus: "verified",
      diagnosticsOnly: true,
      playerFacing: false,
      issues: [],
      databaseOpened: true,
      databaseClosed: true,
      mismatchSeedApplied: false,
      repositoryMethodsAvailable: false,
      fullRepositoryImplementationAvailable: false,
      createSaveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      draftStateVerified: false,
      rosterStateVerified: false,
      matchStateVerified: false,
      showStateVerified: false,
      businessStateVerified: false,
      fanSocialStateVerified: false,
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

    assert.deepEqual(readDurableCounts(VERIFY_DATABASE), {
      schemaMigrationRows: 1,
      savesRows: 1,
      saveMetadataRows: 1
    });
  });

  it("verifies one minimal save_metadata row deterministically", () => {
    const firstVerification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-metadata",
      requestedDatabasePath: METADATA_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });
    const metadataRow = readSaveMetadataRow(
      METADATA_DATABASE,
      COMPLETE_SAVE_IDENTITY.saveId
    );

    cleanupTestDatabases();

    const secondVerification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: " durable-save-identity-verification-metadata ",
      requestedDatabasePath: ` ${METADATA_DATABASE} `,
      request: {
        ...COMPLETE_SAVE_IDENTITY,
        saveId: " save-identity-001 ",
        saveSlotId: " slot-001 "
      }
    });

    assert.deepEqual(secondVerification, firstVerification);
    assert.deepEqual({ ...metadataRow }, {
      saveId: COMPLETE_SAVE_IDENTITY.saveId,
      schemaVersion: COMPLETE_SAVE_IDENTITY.schemaVersion,
      createdAt: COMPLETE_SAVE_IDENTITY.createdAt,
      updatedAt: COMPLETE_SAVE_IDENTITY.updatedAt
    });
  });

  it("keeps schema_migrations separate from verified save data", () => {
    createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-separate",
      requestedDatabasePath: VERIFY_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    const counts = readDurableCounts(VERIFY_DATABASE);

    assert.equal(counts.schemaMigrationRows, 1);
    assert.equal(counts.savesRows, 1);
    assert.equal(counts.saveMetadataRows, 1);
  });

  it("reports mismatched identity deterministically", () => {
    const verification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-mismatch",
      requestedDatabasePath: MISMATCH_DATABASE,
      request: COMPLETE_SAVE_IDENTITY,
      seedMismatchedSaveIdentity: true
    });

    assert.equal(verification.verificationAttempted, true);
    assert.equal(verification.executionStatus, "mismatch");
    assert.equal(verification.identityMatchesRequest, false);
    assert.equal(verification.metadataMatchesRequest, true);
    assert.equal(verification.verifiedSaveId, COMPLETE_SAVE_IDENTITY.saveId);
    assert.equal(verification.savesRowCount, 1);
    assert.equal(verification.saveMetadataRowCount, 1);
    assert.equal(verification.schemaMigrationRows, 1);
    assert.equal(verification.mismatchSeedApplied, true);
    assert.deepEqual(verification.issues, ["save-identity-mismatch"]);
  });

  it("blocks unsafe paths before verification is attempted", () => {
    const verification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-unsafe",
      requestedDatabasePath: "C:\\outside\\next-gm-save.sqlite",
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(verification.verificationAttempted, false);
    assert.equal(verification.databaseTarget, "C:/outside/next-gm-save.sqlite");
    assert.equal(verification.pathBoundaryStatus, "blocked");
    assert.equal(verification.initializationStatus, "blocked");
    assert.equal(verification.insertStatus, "blocked");
    assert.equal(verification.executionStatus, "blocked");
    assert.deepEqual(verification.issues, [
      "durable-path-boundary-blocked",
      "durable-initialization-not-ready",
      "durable-save-identity-insert-not-ready"
    ]);
    assert.equal(verification.durableStorageUsed, false);
    assert.equal(verification.databaseOpened, false);
    assert.equal(verification.databaseClosed, false);
  });

  it("keeps repository behavior disabled and exposes no load/list/delete/update surface", () => {
    const verification = createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-no-surface",
      requestedDatabasePath: VERIFY_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(verification.repositoryBehaviorEnabled, false);
    assert.equal(verification.repositoryMethodsAvailable, false);
    assert.equal(verification.fullRepositoryImplementationAvailable, false);
    assert.equal(verification.createSaveBehaviorAvailable, false);
    assert.equal(verification.loadBehaviorAvailable, false);
    assert.equal(verification.listBehaviorAvailable, false);
    assert.equal(verification.deleteBehaviorAvailable, false);
    assert.equal(verification.metadataUpdateBehaviorAvailable, false);
    assert.equal(verification.status, "diagnostics-only");
    assert.equal(verification.diagnosticsOnly, true);
    assert.equal(verification.playerFacing, false);
    assert.equal(verification.gameplayStarted, false);
    assert.equal(verification.weekAdvanced, false);
    assert.equal(verification.draftExecuted, false);
    assert.equal(verification.rosterAssigned, false);
    assert.equal(verification.matchOutcomesCreated, false);
    assert.equal(verification.showOutcomesCreated, false);
    assert.equal(verification.businessSystemsRun, false);
    assert.equal(verification.fanSocialOutputCreated, false);
    assert.equal(verification.generatedTextCreated, false);
    assert.equal(verification.genAIUsed, false);
    assert.equal(Object.hasOwn(verification, "createSave"), false);
    assert.equal(Object.hasOwn(verification, "loadSave"), false);
    assert.equal(Object.hasOwn(verification, "listSaves"), false);
    assert.equal(Object.hasOwn(verification, "deleteSave"), false);
    assert.equal(Object.hasOwn(verification, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(verification, "saveRepository"), false);
    assert.equal(Object.hasOwn(verification, "advanceWeek"), false);
    assert.equal(Object.hasOwn(verification, "generatedText"), false);
  });

  it("cleans up durable verification test database files", () => {
    createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-cleanup",
      requestedDatabasePath: CLEANUP_DATABASE,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(existsSync(CLEANUP_DATABASE), true);

    cleanupTestDatabases();

    assert.equal(existsSync(CLEANUP_DATABASE), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-shm`), false);
    assert.equal(existsSync(`${CLEANUP_DATABASE}-wal`), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-save-identity-verification-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityVerificationShell({
      durablePathBoundaryId: "durable-save-identity-verification-engine-check",
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
  if (!databasePath.startsWith("data/saves/__durable-verify-")) {
    throw new Error(`Refusing to remove unexpected test database path: ${databasePath}`);
  }

  rmSync(databasePath, { force: true });
}
