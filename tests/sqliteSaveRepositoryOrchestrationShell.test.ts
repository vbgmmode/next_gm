import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteSaveIdentitySchemaMigrationShell,
  createSQLiteSaveRepositoryContractShell,
  createSQLiteSaveRepositoryOrchestrationShell,
  SQLITE_SAVE_REPOSITORY_OPERATIONS
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

describe("SQLite Save Repository Orchestration Shell v0.1", () => {
  it("summarizes the full isolated save identity flow", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      connectionTarget: ":memory:",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: ":memory:"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.deepEqual(orchestration, {
      status: "diagnostics-only",
      orchestrationAttempted: true,
      repositoryContractReadiness: "structurally-ready",
      schemaExecutionStatus: "executed",
      migrationTrackingStatus: "inserted",
      saveIdentityInsertStatus: "inserted",
      saveIdentityVerificationStatus: "verified",
      verifiedSaveId: "save-identity-001",
      persisted: "test-safe-memory-only",
      durableStorageUsed: false,
      fullRepositoryBehaviorEnabled: false,
      executionStatus: "orchestrated",
      issues: [],
      diagnosticsOnly: true,
      playerFacing: false,
      repositoryMethodsAvailable: false,
      durableDatabasePathAvailable: false,
      createSaveBehaviorAvailable: false,
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
  });

  it("keeps durable storage and full repository behavior disabled", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(orchestration.durableStorageUsed, false);
    assert.equal(orchestration.durableDatabasePathAvailable, false);
    assert.equal(orchestration.fullRepositoryBehaviorEnabled, false);
    assert.equal(orchestration.repositoryMethodsAvailable, false);
    assert.equal(orchestration.persisted, "test-safe-memory-only");
    assert.equal(orchestration.executionStatus, "orchestrated");
  });

  it("reports missing identity substeps deterministically", () => {
    const firstOrchestration = createSQLiteSaveRepositoryOrchestrationShell({
      request: {
        saveId: "save-identity-001",
        setupId: "setup-001"
      }
    });
    const secondOrchestration = createSQLiteSaveRepositoryOrchestrationShell({
      request: {
        saveId: " save-identity-001 ",
        setupId: " setup-001 "
      }
    });

    assert.deepEqual(secondOrchestration, firstOrchestration);
    assert.equal(firstOrchestration.orchestrationAttempted, true);
    assert.equal(firstOrchestration.repositoryContractReadiness, "structurally-ready");
    assert.equal(firstOrchestration.schemaExecutionStatus, "executed");
    assert.equal(firstOrchestration.migrationTrackingStatus, "inserted");
    assert.equal(firstOrchestration.saveIdentityInsertStatus, "blocked");
    assert.equal(firstOrchestration.saveIdentityVerificationStatus, "blocked");
    assert.equal(firstOrchestration.executionStatus, "blocked");
    assert.deepEqual(firstOrchestration.issues, [
      "save-identity-insert-not-ready",
      "save-identity-verification-not-ready"
    ]);
    assert.equal(firstOrchestration.persisted, false);
    assert.equal(firstOrchestration.verifiedSaveId, "");
  });

  it("reports unsafe targets as blocked substeps deterministically", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      connectionTarget: "file:future-save.sqlite",
      connectionHealth: createSQLiteConnectionHealthShell({
        connectionTarget: "file:future-save.sqlite"
      }),
      schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(orchestration.repositoryContractReadiness, "structural-issues");
    assert.equal(orchestration.schemaExecutionStatus, "blocked");
    assert.equal(orchestration.migrationTrackingStatus, "blocked");
    assert.equal(orchestration.saveIdentityInsertStatus, "blocked");
    assert.equal(orchestration.saveIdentityVerificationStatus, "blocked");
    assert.equal(orchestration.executionStatus, "blocked");
    assert.deepEqual(orchestration.issues, [
      "repository-contract-not-ready",
      "schema-execution-not-ready",
      "migration-tracking-not-ready",
      "save-identity-insert-not-ready",
      "save-identity-verification-not-ready"
    ]);
    assert.equal(orchestration.durableStorageUsed, false);
    assert.equal(orchestration.persisted, false);
  });

  it("reports verification mismatch without enabling repository behavior", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      request: COMPLETE_SAVE_IDENTITY,
      seedMismatchedSaveIdentity: true
    });

    assert.equal(orchestration.repositoryContractReadiness, "structurally-ready");
    assert.equal(orchestration.saveIdentityInsertStatus, "inserted");
    assert.equal(orchestration.saveIdentityVerificationStatus, "mismatch");
    assert.equal(orchestration.executionStatus, "mismatch");
    assert.deepEqual(orchestration.issues, [
      "save-identity-verification-not-ready"
    ]);
    assert.equal(orchestration.verifiedSaveId, COMPLETE_SAVE_IDENTITY.saveId);
    assert.equal(orchestration.persisted, false);
    assert.equal(orchestration.fullRepositoryBehaviorEnabled, false);
  });

  it("reports repository contract issues deterministically", () => {
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const repositoryContract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: " ",
      supportedOperations: ["createSave"],
      schemaMigration,
      connectionHealth,
      migrationRunner: schemaMigration.runnerSummary
    });
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      connectionHealth,
      schemaMigration,
      repositoryContract,
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(orchestration.repositoryContractReadiness, "missing-pieces");
    assert.equal(orchestration.executionStatus, "blocked");
    assert.deepEqual(orchestration.issues, [
      "repository-contract-not-ready"
    ]);
    assert.equal(orchestration.schemaExecutionStatus, "executed");
    assert.equal(orchestration.migrationTrackingStatus, "inserted");
    assert.equal(orchestration.saveIdentityInsertStatus, "inserted");
    assert.equal(orchestration.saveIdentityVerificationStatus, "verified");
    assert.equal(orchestration.persisted, "test-safe-memory-only");
  });

  it("does not expose full load, list, delete, update, or repository methods", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(orchestration.status, "diagnostics-only");
    assert.equal(orchestration.diagnosticsOnly, true);
    assert.equal(orchestration.playerFacing, false);
    assert.equal(orchestration.repositoryMethodsAvailable, false);
    assert.equal(orchestration.fullRepositoryBehaviorEnabled, false);
    assert.equal(orchestration.createSaveBehaviorAvailable, false);
    assert.equal(orchestration.loadBehaviorAvailable, false);
    assert.equal(orchestration.listBehaviorAvailable, false);
    assert.equal(orchestration.deleteBehaviorAvailable, false);
    assert.equal(orchestration.metadataUpdateBehaviorAvailable, false);
    assert.equal(orchestration.draftStatePersisted, false);
    assert.equal(orchestration.rosterStatePersisted, false);
    assert.equal(orchestration.matchStatePersisted, false);
    assert.equal(orchestration.showStatePersisted, false);
    assert.equal(orchestration.businessStatePersisted, false);
    assert.equal(orchestration.fanSocialStatePersisted, false);
    assert.equal(orchestration.gameplayStarted, false);
    assert.equal(orchestration.weekAdvanced, false);
    assert.equal(Object.hasOwn(orchestration, "createSave"), false);
    assert.equal(Object.hasOwn(orchestration, "loadSave"), false);
    assert.equal(Object.hasOwn(orchestration, "listSaves"), false);
    assert.equal(Object.hasOwn(orchestration, "deleteSave"), false);
    assert.equal(Object.hasOwn(orchestration, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(orchestration, "openDatabase"), false);
    assert.equal(Object.hasOwn(orchestration, "saveRepository"), false);
    assert.equal(Object.hasOwn(orchestration, "advanceWeek"), false);
    assert.equal(Object.hasOwn(orchestration, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-save-repository-orchestration-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveRepositoryOrchestrationShell({
      request: COMPLETE_SAVE_IDENTITY
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });

  it("keeps repository operations as inert contract data only", () => {
    const orchestration = createSQLiteSaveRepositoryOrchestrationShell({
      repositoryContract: createSQLiteSaveRepositoryContractShell({
        repositoryContractId: "sqlite-save-repository-orchestration-contract-test",
        supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
        schemaMigration: createSQLiteSaveIdentitySchemaMigrationShell(),
        connectionHealth: createSQLiteConnectionHealthShell({
          connectionTarget: ":memory:"
        })
      }),
      request: COMPLETE_SAVE_IDENTITY
    });

    assert.equal(orchestration.repositoryContractReadiness, "structurally-ready");
    assert.equal(orchestration.fullRepositoryBehaviorEnabled, false);
    assert.equal(orchestration.repositoryMethodsAvailable, false);
  });
});
