import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteMigrationRunnerShell,
  createSQLiteSaveIdentitySchemaMigrationShell,
  createSQLiteSaveRepositoryContractShell,
  SQLITE_SAVE_REPOSITORY_OPERATIONS,
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS,
  SQLITE_SAVE_REPOSITORY_REQUIRED_TABLES
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("SQLite Save Repository Contract Shell v0.1", () => {
  it("creates a structurally-ready repository contract summary from complete inputs", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const contract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-v0-1",
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      schemaMigration,
      connectionHealth,
      migrationRunner: schemaMigration.runnerSummary
    });

    assert.deepEqual(contract, {
      status: "diagnostics-only",
      repositoryContractId: "sqlite-save-repository-contract-v0-1",
      supportedOperations: [
        "createSave",
        "loadSave",
        "listSaves",
        "deleteSave",
        "updateSaveMetadata"
      ],
      requiredOperations: [
        "createSave",
        "loadSave",
        "listSaves",
        "deleteSave",
        "updateSaveMetadata"
      ],
      requiredTables: [
        "saves",
        "save_metadata",
        "schema_migrations"
      ],
      requiredIdentityFields: [
        "saveId",
        "saveSlotId",
        "setupId",
        "selectedBrandId",
        "playerManagerId",
        "seedLabel",
        "replayId",
        "createdAt",
        "updatedAt",
        "schemaVersion"
      ],
      schemaMigrationReadiness: "structurally-ready",
      connectionHealthReadiness: "structurally-ready",
      migrationRunnerReadiness: "structurally-ready",
      missingRepositoryPieces: [],
      overallRepositoryReadiness: "structurally-ready",
      structurallyUsable: true,
      repositoryMethodsAvailable: false,
      sqlExecuted: false,
      databaseOpened: false,
      databaseRead: false,
      databaseWritten: false,
      tablesCreated: false,
      tablesAltered: false,
      saveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      metadataUpdateBehaviorAvailable: false,
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing operations, tables, and fields deterministically", () => {
    const firstContract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: " ",
      supportedOperations: ["createSave"],
      requiredOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      requiredTables: ["saves", "save_metadata"],
      requiredIdentityFields: ["saveId", "saveSlotId"]
    });
    const secondContract = createSQLiteSaveRepositoryContractShell({
      supportedOperations: ["createSave"],
      requiredOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      requiredTables: ["saves", "save_metadata"],
      requiredIdentityFields: ["saveId", "saveSlotId"]
    });

    assert.deepEqual(secondContract, firstContract);
    assert.deepEqual(firstContract.missingRepositoryPieces, [
      "missing-repository-contract-id",
      "missing-operation:loadSave",
      "missing-operation:listSaves",
      "missing-operation:deleteSave",
      "missing-operation:updateSaveMetadata",
      "missing-table:saves",
      "missing-table:save_metadata",
      "missing-identity-field:saveId",
      "missing-identity-field:saveSlotId",
      "missing-schema-migration",
      "missing-connection-health"
    ]);
    assert.equal(firstContract.repositoryContractId, "");
    assert.deepEqual(firstContract.supportedOperations, ["createSave"]);
    assert.equal(firstContract.schemaMigrationReadiness, "missing");
    assert.equal(firstContract.connectionHealthReadiness, "missing");
    assert.equal(firstContract.migrationRunnerReadiness, "missing");
    assert.equal(firstContract.overallRepositoryReadiness, "missing-pieces");
    assert.equal(firstContract.structurallyUsable, false);
  });

  it("summarizes schema migration and connection health readiness without repository methods", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: "file:future-save.sqlite"
    });
    const migrationRunner = createSQLiteMigrationRunnerShell({
      migrationId: "sqlite-save-repository-contract-runner-warning",
      migrationVersion: "sqlite-save-schema-v0.1",
      migrationName: "Repository contract migration runner warning",
      requiredSteps: ["inspect-save-repository-contract-metadata"],
      rollbackSupported: false,
      connectionHealth
    });
    const contract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-warning",
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      requiredTables: SQLITE_SAVE_REPOSITORY_REQUIRED_TABLES,
      requiredIdentityFields: SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS,
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      connectionHealth,
      migrationRunner
    });

    assert.equal(contract.schemaMigrationReadiness, "structurally-ready");
    assert.equal(contract.connectionHealthReadiness, "structural-issues");
    assert.equal(contract.migrationRunnerReadiness, "structural-issues");
    assert.deepEqual(contract.missingRepositoryPieces, [
      "connection-health-not-ready",
      "migration-runner-not-ready"
    ]);
    assert.equal(contract.overallRepositoryReadiness, "structural-issues");
    assert.equal(contract.repositoryMethodsAvailable, false);
    assert.equal(contract.sqlExecuted, false);
    assert.equal(contract.databaseOpened, false);
    assert.equal(contract.databaseRead, false);
    assert.equal(contract.databaseWritten, false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const contract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-boundary",
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      connectionHealth: createSQLiteConnectionHealthShell({ connectionTarget: ":memory:" })
    });

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.repositoryMethodsAvailable, false);
    assert.equal(contract.sqlExecuted, false);
    assert.equal(contract.databaseOpened, false);
    assert.equal(contract.databaseRead, false);
    assert.equal(contract.databaseWritten, false);
    assert.equal(contract.tablesCreated, false);
    assert.equal(contract.tablesAltered, false);
    assert.equal(contract.saveBehaviorAvailable, false);
    assert.equal(contract.loadBehaviorAvailable, false);
    assert.equal(contract.listBehaviorAvailable, false);
    assert.equal(contract.deleteBehaviorAvailable, false);
    assert.equal(contract.metadataUpdateBehaviorAvailable, false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "loadSave"), false);
    assert.equal(Object.hasOwn(contract, "listSaves"), false);
    assert.equal(Object.hasOwn(contract, "deleteSave"), false);
    assert.equal(Object.hasOwn(contract, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(contract, "execute"), false);
    assert.equal(Object.hasOwn(contract, "openDatabase"), false);
    assert.equal(Object.hasOwn(contract, "advanceWeek"), false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-save-repository-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-engine-check",
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      connectionHealth: createSQLiteConnectionHealthShell({ connectionTarget: ":memory:" })
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
