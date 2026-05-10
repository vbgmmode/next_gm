import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteMigrationTrackingInsertShell,
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

describe("SQLite Migration Tracking Insert Shell v0.1", () => {
  it("inserts the approved migration tracking row in controlled SQLite", () => {
    const tracking = createSQLiteMigrationTrackingInsertShell({
      connectionTarget: ":memory:",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.deepEqual(tracking, {
      status: "diagnostics-only",
      trackingInsertAttempted: true,
      trackedMigrationId: "sqlite-save-identity-schema-v0-1",
      schemaVersion: "sqlite-save-schema-v0.1",
      insertedTrackingRows: 1,
      savesRowCount: 0,
      saveMetadataRowCount: 0,
      schemaMigrationRowCount: 1,
      connectionTarget: ":memory:",
      schemaExecutionStatus: "executed",
      executionStatus: "inserted",
      issues: [],
      diagnosticsOnly: true,
      databaseOpened: true,
      databaseClosed: true,
      trackingInsertedAt: "1970-01-01T00:00:00.000Z",
      saveRowsInserted: false,
      saveMetadataRowsInserted: false,
      saveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      durableDatabasePathAvailable: false,
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

  it("creates exactly one schema_migrations row and no save rows", () => {
    const tracking = createSQLiteMigrationTrackingInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(tracking.insertedTrackingRows, 1);
    assert.equal(tracking.schemaMigrationRowCount, 1);
    assert.equal(tracking.savesRowCount, 0);
    assert.equal(tracking.saveMetadataRowCount, 0);
    assert.equal(tracking.saveRowsInserted, false);
    assert.equal(tracking.saveMetadataRowsInserted, false);
  });

  it("keeps migration tracking insert deterministic", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const firstTracking = createSQLiteMigrationTrackingInsertShell({
      connectionHealth,
      schemaMigration
    });
    const secondTracking = createSQLiteMigrationTrackingInsertShell({
      connectionHealth,
      schemaMigration
    });

    assert.deepEqual(secondTracking, firstTracking);
    assert.equal(firstTracking.executionStatus, "inserted");
    assert.equal(firstTracking.trackingInsertedAt, "1970-01-01T00:00:00.000Z");
  });

  it("blocks unsafe targets before tracking insert is attempted", () => {
    const tracking = createSQLiteMigrationTrackingInsertShell({
      connectionTarget: "file:future-save.sqlite",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: "file:future-save.sqlite"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(tracking.trackingInsertAttempted, false);
    assert.equal(tracking.executionStatus, "blocked");
    assert.equal(tracking.schemaExecutionStatus, "blocked");
    assert.deepEqual(tracking.issues, [
      "unsupported-connection-target",
      "schema-execution-not-ready"
    ]);
    assert.equal(tracking.insertedTrackingRows, "not-checked");
    assert.equal(tracking.savesRowCount, "not-checked");
    assert.equal(tracking.saveMetadataRowCount, "not-checked");
    assert.equal(tracking.databaseOpened, false);
    assert.equal(tracking.databaseClosed, false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const tracking = createSQLiteMigrationTrackingInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(tracking.status, "diagnostics-only");
    assert.equal(tracking.diagnosticsOnly, true);
    assert.equal(tracking.playerFacing, false);
    assert.equal(tracking.gameplayAffecting, false);
    assert.equal(tracking.durableDatabasePathAvailable, false);
    assert.equal(tracking.gameplayStarted, false);
    assert.equal(tracking.weekAdvanced, false);
    assert.equal(tracking.draftExecuted, false);
    assert.equal(tracking.rosterAssigned, false);
    assert.equal(tracking.matchOutcomesCreated, false);
    assert.equal(tracking.showOutcomesCreated, false);
    assert.equal(tracking.businessSystemsRun, false);
    assert.equal(tracking.fanSocialOutputCreated, false);
    assert.equal(tracking.generatedTextCreated, false);
    assert.equal(tracking.genAIUsed, false);
  });

  it("does not expose save, load, list, delete, or update behavior", () => {
    const tracking = createSQLiteMigrationTrackingInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(tracking.saveBehaviorAvailable, false);
    assert.equal(tracking.loadBehaviorAvailable, false);
    assert.equal(tracking.listBehaviorAvailable, false);
    assert.equal(tracking.deleteBehaviorAvailable, false);
    assert.equal(tracking.metadataUpdateBehaviorAvailable, false);
    assert.equal(Object.hasOwn(tracking, "createSave"), false);
    assert.equal(Object.hasOwn(tracking, "loadSave"), false);
    assert.equal(Object.hasOwn(tracking, "listSaves"), false);
    assert.equal(Object.hasOwn(tracking, "deleteSave"), false);
    assert.equal(Object.hasOwn(tracking, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(tracking, "insertSave"), false);
    assert.equal(Object.hasOwn(tracking, "saveRepository"), false);
    assert.equal(Object.hasOwn(tracking, "advanceWeek"), false);
    assert.equal(Object.hasOwn(tracking, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-migration-tracking-insert-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteMigrationTrackingInsertShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
