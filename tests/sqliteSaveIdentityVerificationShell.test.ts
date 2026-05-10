import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteSaveIdentitySchemaMigrationShell,
  createSQLiteSaveIdentityVerificationShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

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

describe("SQLite Save Identity Verification Shell v0.1", () => {
  it("verifies an inserted save identity in controlled SQLite", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionTarget: ":memory:",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(verification, {
      status: "diagnostics-only",
      verificationAttempted: true,
      verifiedSaveId: "save-identity-001",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY,
      savesRowCount: 1,
      saveMetadataRowCount: 1,
      schemaMigrationRows: 1,
      identityMatchesRequest: true,
      metadataMatchesRequest: true,
      persisted: "test-safe-memory-only",
      connectionTarget: ":memory:",
      schemaExecutionStatus: "executed",
      migrationTrackingStatus: "inserted",
      saveIdentityInsertStatus: "inserted",
      executionStatus: "verified",
      issues: [],
      diagnosticsOnly: true,
      databaseOpened: true,
      databaseClosed: true,
      mismatchSeedApplied: false,
      durableDatabasePathAvailable: false,
      fullRepositoryImplementationAvailable: false,
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
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("verifies save metadata deterministically", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const firstVerification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth,
      schemaMigration,
      request: COMPLETE_SAVE_IDENTITY
    });
    const secondVerification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth,
      schemaMigration,
      request: {
        ...COMPLETE_SAVE_IDENTITY,
        saveId: " save-identity-001 ",
        saveSlotId: " slot-001 "
      }
    });

    assert.deepEqual(secondVerification, firstVerification);
    assert.equal(firstVerification.metadataMatchesRequest, true);
    assert.equal(firstVerification.saveMetadataRowCount, 1);
  });

  it("keeps schema_migrations tracking separate from verified save data", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(verification.schemaExecutionStatus, "executed");
    assert.equal(verification.migrationTrackingStatus, "inserted");
    assert.equal(verification.saveIdentityInsertStatus, "inserted");
    assert.equal(verification.schemaMigrationRows, 1);
    assert.equal(verification.savesRowCount, 1);
    assert.equal(verification.saveMetadataRowCount, 1);
    assert.equal(verification.identityMatchesRequest, true);
    assert.equal(verification.metadataMatchesRequest, true);
  });

  it("reports missing identity fields deterministically", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: {
        saveId: "save-identity-001",
        setupId: "setup-001"
      }
    });

    assert.equal(verification.verificationAttempted, false);
    assert.equal(verification.executionStatus, "blocked");
    assert.equal(verification.saveIdentityInsertStatus, "blocked");
    assert.deepEqual(verification.issues, [
      "save-identity-insert-not-ready",
      "missing-save-identity-field:saveSlotId",
      "missing-save-identity-field:selectedBrandId",
      "missing-save-identity-field:playerManagerId",
      "missing-save-identity-field:seedLabel",
      "missing-save-identity-field:replayId",
      "missing-save-identity-field:createdAt",
      "missing-save-identity-field:updatedAt",
      "missing-save-identity-field:schemaVersion"
    ]);
    assert.equal(verification.identityMatchesRequest, "not-checked");
    assert.equal(verification.metadataMatchesRequest, "not-checked");
    assert.equal(verification.persisted, false);
  });

  it("reports mismatched identity deterministically", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY,
      seedMismatchedSaveIdentity: true
    });

    assert.equal(verification.verificationAttempted, true);
    assert.equal(verification.executionStatus, "mismatch");
    assert.deepEqual(verification.issues, ["save-identity-mismatch"]);
    assert.equal(verification.verifiedSaveId, COMPLETE_SAVE_IDENTITY.saveId);
    assert.equal(verification.savesRowCount, 1);
    assert.equal(verification.saveMetadataRowCount, 1);
    assert.equal(verification.schemaMigrationRows, 1);
    assert.equal(verification.identityMatchesRequest, false);
    assert.equal(verification.metadataMatchesRequest, true);
    assert.equal(verification.persisted, false);
    assert.equal(verification.mismatchSeedApplied, true);
  });

  it("blocks unsafe targets before verification is attempted", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionTarget: "file:future-save.sqlite",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: "file:future-save.sqlite"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(verification.verificationAttempted, false);
    assert.equal(verification.executionStatus, "blocked");
    assert.equal(verification.schemaExecutionStatus, "blocked");
    assert.equal(verification.migrationTrackingStatus, "blocked");
    assert.equal(verification.saveIdentityInsertStatus, "blocked");
    assert.deepEqual(verification.issues, [
      "unsupported-connection-target",
      "schema-execution-not-ready",
      "migration-tracking-not-ready",
      "save-identity-insert-not-ready"
    ]);
    assert.equal(verification.savesRowCount, "not-checked");
    assert.equal(verification.saveMetadataRowCount, "not-checked");
    assert.equal(verification.schemaMigrationRows, "not-checked");
    assert.equal(verification.persisted, false);
    assert.equal(verification.databaseOpened, false);
    assert.equal(verification.databaseClosed, false);
  });

  it("does not expose full load, list, delete, or update behavior", () => {
    const verification = createSQLiteSaveIdentityVerificationShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(verification.status, "diagnostics-only");
    assert.equal(verification.diagnosticsOnly, true);
    assert.equal(verification.playerFacing, false);
    assert.equal(verification.durableDatabasePathAvailable, false);
    assert.equal(verification.fullRepositoryImplementationAvailable, false);
    assert.equal(verification.loadBehaviorAvailable, false);
    assert.equal(verification.listBehaviorAvailable, false);
    assert.equal(verification.deleteBehaviorAvailable, false);
    assert.equal(verification.metadataUpdateBehaviorAvailable, false);
    assert.equal(verification.draftStateVerified, false);
    assert.equal(verification.rosterStateVerified, false);
    assert.equal(verification.matchStateVerified, false);
    assert.equal(verification.showStateVerified, false);
    assert.equal(verification.businessStateVerified, false);
    assert.equal(verification.fanSocialStateVerified, false);
    assert.equal(verification.gameplayStarted, false);
    assert.equal(verification.weekAdvanced, false);
    assert.equal(Object.hasOwn(verification, "loadSave"), false);
    assert.equal(Object.hasOwn(verification, "listSaves"), false);
    assert.equal(Object.hasOwn(verification, "deleteSave"), false);
    assert.equal(Object.hasOwn(verification, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(verification, "saveRepository"), false);
    assert.equal(Object.hasOwn(verification, "advanceWeek"), false);
    assert.equal(Object.hasOwn(verification, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-save-identity-verification-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveIdentityVerificationShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
