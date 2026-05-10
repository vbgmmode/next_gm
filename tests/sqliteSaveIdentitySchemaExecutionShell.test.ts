import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteSaveIdentitySchemaExecutionShell,
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

describe("SQLite Save Identity Schema Execution Shell v0.1", () => {
  it("executes the approved identity schema against a controlled in-memory database", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const execution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionTarget: ":memory:",
      connectionHealth,
      schemaMigration
    });

    assert.deepEqual(execution, {
      status: "diagnostics-only",
      executionAttempted: true,
      executedMigrationId: "sqlite-save-identity-schema-v0-1",
      createdTables: [
        "saves",
        "save_metadata",
        "schema_migrations"
      ],
      schemaVersion: "sqlite-save-schema-v0.1",
      connectionTarget: ":memory:",
      connectionHealthReadiness: "structurally-ready",
      migrationRunnerReadiness: "structurally-ready",
      executionStatus: "executed",
      issues: [],
      diagnosticsOnly: true,
      databaseOpened: true,
      databaseClosed: true,
      sqlStatementCount: 3,
      approvedTableNames: [
        "saves",
        "save_metadata",
        "schema_migrations"
      ],
      saveRowCount: 0,
      saveMetadataRowCount: 0,
      schemaMigrationRowCount: 0,
      saveRowsInserted: false,
      saveMetadataRowsInserted: false,
      schemaMigrationRowsInserted: false,
      saveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
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

  it("creates only the approved identity tables", () => {
    const execution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.deepEqual(execution.createdTables, [
      "saves",
      "save_metadata",
      "schema_migrations"
    ]);
    assert.deepEqual(execution.approvedTableNames, execution.createdTables);
    assert.equal(execution.executionStatus, "executed");
    assert.equal(execution.databaseOpened, true);
    assert.equal(execution.databaseClosed, true);
  });

  it("keeps schema execution deterministic", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const firstExecution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionHealth,
      schemaMigration
    });
    const secondExecution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionHealth,
      schemaMigration
    });

    assert.deepEqual(secondExecution, firstExecution);
    assert.equal(firstExecution.executionAttempted, true);
    assert.equal(firstExecution.executionStatus, "executed");
    assert.deepEqual(firstExecution.issues, []);
  });

  it("does not insert save or migration rows", () => {
    const execution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(execution.saveRowCount, 0);
    assert.equal(execution.saveMetadataRowCount, 0);
    assert.equal(execution.schemaMigrationRowCount, 0);
    assert.equal(execution.saveRowsInserted, false);
    assert.equal(execution.saveMetadataRowsInserted, false);
    assert.equal(execution.schemaMigrationRowsInserted, false);
  });

  it("does not expose save/load/list/delete/update behavior", () => {
    const execution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(execution.status, "diagnostics-only");
    assert.equal(execution.diagnosticsOnly, true);
    assert.equal(execution.playerFacing, false);
    assert.equal(execution.saveBehaviorAvailable, false);
    assert.equal(execution.loadBehaviorAvailable, false);
    assert.equal(execution.listBehaviorAvailable, false);
    assert.equal(execution.deleteBehaviorAvailable, false);
    assert.equal(execution.metadataUpdateBehaviorAvailable, false);
    assert.equal(execution.gameplayStarted, false);
    assert.equal(execution.weekAdvanced, false);
    assert.equal(execution.draftExecuted, false);
    assert.equal(execution.rosterAssigned, false);
    assert.equal(execution.matchOutcomesCreated, false);
    assert.equal(execution.showOutcomesCreated, false);
    assert.equal(execution.businessSystemsRun, false);
    assert.equal(execution.fanSocialOutputCreated, false);
    assert.equal(execution.generatedTextCreated, false);
    assert.equal(execution.genAIUsed, false);
    assert.equal(Object.hasOwn(execution, "createSave"), false);
    assert.equal(Object.hasOwn(execution, "loadSave"), false);
    assert.equal(Object.hasOwn(execution, "listSaves"), false);
    assert.equal(Object.hasOwn(execution, "deleteSave"), false);
    assert.equal(Object.hasOwn(execution, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(execution, "insertSave"), false);
    assert.equal(Object.hasOwn(execution, "advanceWeek"), false);
    assert.equal(Object.hasOwn(execution, "generatedText"), false);
  });

  it("blocks execution when connection health is not structurally ready", () => {
    const execution = createSQLiteSaveIdentitySchemaExecutionShell({
      connectionTarget: "file:future-save.sqlite",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: "file:future-save.sqlite"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell()
    });

    assert.equal(execution.executionAttempted, false);
    assert.equal(execution.executionStatus, "blocked");
    assert.deepEqual(execution.createdTables, []);
    assert.deepEqual(execution.issues, [
      "unsupported-connection-target",
      "connection-health-not-ready"
    ]);
    assert.equal(execution.saveRowCount, "not-checked");
    assert.equal(execution.databaseOpened, false);
    assert.equal(execution.databaseClosed, false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-save-identity-schema-execution-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveIdentitySchemaExecutionShell({
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
