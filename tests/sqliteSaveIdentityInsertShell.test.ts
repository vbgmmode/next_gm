import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteSaveIdentityInsertShell,
  createSQLiteSaveIdentitySchemaMigrationShell
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

describe("SQLite Save Identity Insert Shell v0.1", () => {
  it("inserts exactly one save identity row in controlled SQLite", () => {
    const insert = createSQLiteSaveIdentityInsertShell({
      connectionTarget: ":memory:",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(insert, {
      status: "diagnostics-only",
      saveInsertAttempted: true,
      insertedSaveRows: 1,
      insertedSaveMetadataRows: 1,
      schemaMigrationRows: 1,
      savesRowCount: 1,
      saveMetadataRowCount: 1,
      insertedSaveId: "save-identity-001",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY,
      persisted: "test-safe-memory-only",
      connectionTarget: ":memory:",
      schemaExecutionStatus: "executed",
      migrationTrackingStatus: "inserted",
      executionStatus: "inserted",
      issues: [],
      diagnosticsOnly: true,
      databaseOpened: true,
      databaseClosed: true,
      duplicateSeedApplied: false,
      durableDatabasePathAvailable: false,
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
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("keeps schema_migrations tracking separate from save data writes", () => {
    const insert = createSQLiteSaveIdentityInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(insert.schemaExecutionStatus, "executed");
    assert.equal(insert.migrationTrackingStatus, "inserted");
    assert.equal(insert.schemaMigrationRows, 1);
    assert.equal(insert.insertedSaveRows, 1);
    assert.equal(insert.savesRowCount, 1);
    assert.equal(insert.insertedSaveId, COMPLETE_SAVE_IDENTITY.saveId);
  });

  it("keeps save_metadata behavior deterministic", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const firstInsert = createSQLiteSaveIdentityInsertShell({
      connectionHealth,
      schemaMigration,
      request: COMPLETE_SAVE_IDENTITY
    });
    const secondInsert = createSQLiteSaveIdentityInsertShell({
      connectionHealth,
      schemaMigration,
      request: {
        ...COMPLETE_SAVE_IDENTITY,
        saveId: " save-identity-001 ",
        saveSlotId: " slot-001 "
      }
    });

    assert.deepEqual(secondInsert, firstInsert);
    assert.equal(firstInsert.insertedSaveMetadataRows, 1);
    assert.equal(firstInsert.saveMetadataRowCount, 1);
  });

  it("blocks unsafe targets before save insert is attempted", () => {
    const insert = createSQLiteSaveIdentityInsertShell({
      connectionTarget: "file:future-save.sqlite",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: "file:future-save.sqlite"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(insert.saveInsertAttempted, false);
    assert.equal(insert.executionStatus, "blocked");
    assert.equal(insert.schemaExecutionStatus, "blocked");
    assert.equal(insert.migrationTrackingStatus, "blocked");
    assert.deepEqual(insert.issues, [
      "unsupported-connection-target",
      "schema-execution-not-ready",
      "migration-tracking-not-ready"
    ]);
    assert.equal(insert.insertedSaveRows, "not-checked");
    assert.equal(insert.insertedSaveMetadataRows, "not-checked");
    assert.equal(insert.schemaMigrationRows, "not-checked");
    assert.equal(insert.persisted, false);
    assert.equal(insert.databaseOpened, false);
    assert.equal(insert.databaseClosed, false);
  });

  it("handles duplicate save identity deterministically", () => {
    const insert = createSQLiteSaveIdentityInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY,
      seedDuplicateSaveIdentity: true
    });

    assert.equal(insert.saveInsertAttempted, true);
    assert.equal(insert.executionStatus, "duplicate-save-identity");
    assert.deepEqual(insert.issues, ["duplicate-save-identity"]);
    assert.equal(insert.insertedSaveRows, 0);
    assert.equal(insert.insertedSaveMetadataRows, 0);
    assert.equal(insert.savesRowCount, 1);
    assert.equal(insert.saveMetadataRowCount, 1);
    assert.equal(insert.schemaMigrationRows, 1);
    assert.equal(insert.insertedSaveId, "");
    assert.equal(insert.persisted, false);
    assert.equal(insert.duplicateSeedApplied, true);
  });

  it("does not expose load, list, delete, or update behavior", () => {
    const insert = createSQLiteSaveIdentityInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(insert.status, "diagnostics-only");
    assert.equal(insert.diagnosticsOnly, true);
    assert.equal(insert.playerFacing, false);
    assert.equal(insert.durableDatabasePathAvailable, false);
    assert.equal(insert.fullRepositoryImplementationAvailable, false);
    assert.equal(insert.loadBehaviorAvailable, false);
    assert.equal(insert.listBehaviorAvailable, false);
    assert.equal(insert.deleteBehaviorAvailable, false);
    assert.equal(insert.metadataUpdateBehaviorAvailable, false);
    assert.equal(insert.draftStatePersisted, false);
    assert.equal(insert.rosterStatePersisted, false);
    assert.equal(insert.matchStatePersisted, false);
    assert.equal(insert.showStatePersisted, false);
    assert.equal(insert.businessStatePersisted, false);
    assert.equal(insert.fanSocialStatePersisted, false);
    assert.equal(insert.gameplayStarted, false);
    assert.equal(insert.weekAdvanced, false);
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
    const contextSeed = "sqlite-save-identity-insert-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveIdentityInsertShell({
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
