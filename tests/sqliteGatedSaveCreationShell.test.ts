import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteGatedSaveCreationShell,
  createSQLiteSaveIdentitySchemaMigrationShell,
  createSQLiteSaveRepositoryContractShell,
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

const COMPLETE_SAVE_IDENTITY_REQUEST = {
  saveId: "save-001",
  saveSlotId: "slot-a",
  setupId: "setup-001",
  selectedBrandId: "brand-red",
  playerManagerId: "manager-001",
  seedLabel: "seed-opening-night",
  replayId: "replay-001",
  createdAt: "2026-05-08T12:00:00.000Z",
  updatedAt: "2026-05-08T12:00:00.000Z",
  schemaVersion: "sqlite-save-schema-v0.1"
} as const;

describe("SQLite Gated Save Creation Shell v0.1", () => {
  it("creates gated save creation readiness from complete save identity input", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const repositoryContract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-v0-1",
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      schemaMigration,
      connectionHealth,
      migrationRunner: schemaMigration.runnerSummary
    });
    const saveCreation = createSQLiteGatedSaveCreationShell({
      saveCreationGateId: "sqlite-gated-save-creation-v0-1",
      request: COMPLETE_SAVE_IDENTITY_REQUEST,
      repositoryContract,
      schemaMigration,
      connectionHealth
    });

    assert.deepEqual(saveCreation, {
      status: "diagnostics-only",
      saveCreationGateId: "sqlite-gated-save-creation-v0-1",
      requestedSaveIdentity: COMPLETE_SAVE_IDENTITY_REQUEST,
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
      repositoryContractReadiness: "structurally-ready",
      schemaMigrationReadiness: "structurally-ready",
      connectionHealthReadiness: "structurally-ready",
      missingSaveCreationPieces: [],
      overallSaveCreationReadiness: "structurally-ready",
      saveIdentityResult: {
        status: "non-gameplay-save-identity",
        saveIdentity: COMPLETE_SAVE_IDENTITY_REQUEST,
        persisted: false,
        gameplayAffecting: false,
        playerFacing: false
      },
      saveCreationGated: true,
      saveIdentityOnly: true,
      sqlExecuted: false,
      databaseOpened: false,
      databaseRead: false,
      databaseWritten: false,
      tablesCreated: false,
      tablesAltered: false,
      fullRepositoryImplementationAvailable: false,
      savePersisted: false,
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
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing identity fields deterministically", () => {
    const firstSaveCreation = createSQLiteGatedSaveCreationShell({
      saveCreationGateId: " ",
      request: {
        saveId: " save-001 ",
        setupId: "setup-001"
      }
    });
    const secondSaveCreation = createSQLiteGatedSaveCreationShell({
      request: {
        saveId: "save-001",
        setupId: " setup-001 "
      }
    });

    assert.deepEqual(secondSaveCreation, firstSaveCreation);
    assert.deepEqual(firstSaveCreation.missingSaveCreationPieces, [
      "missing-save-creation-gate-id",
      "missing-save-identity-field:saveSlotId",
      "missing-save-identity-field:selectedBrandId",
      "missing-save-identity-field:playerManagerId",
      "missing-save-identity-field:seedLabel",
      "missing-save-identity-field:replayId",
      "missing-save-identity-field:createdAt",
      "missing-save-identity-field:updatedAt",
      "missing-save-identity-field:schemaVersion",
      "missing-repository-contract",
      "missing-schema-migration",
      "missing-connection-health"
    ]);
    assert.equal(firstSaveCreation.saveCreationGateId, "");
    assert.equal(firstSaveCreation.requestedSaveIdentity.saveId, "save-001");
    assert.equal(firstSaveCreation.requestedSaveIdentity.setupId, "setup-001");
    assert.equal(firstSaveCreation.overallSaveCreationReadiness, "blocked");
    assert.equal(firstSaveCreation.saveIdentityResult, "unavailable");
  });

  it("summarizes repository, schema, and connection readiness", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: "file:future-save.sqlite"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const repositoryContract = createSQLiteSaveRepositoryContractShell({
      repositoryContractId: "sqlite-save-repository-contract-incomplete",
      supportedOperations: ["createSave"],
      schemaMigration,
      connectionHealth,
      migrationRunner: schemaMigration.runnerSummary
    });
    const saveCreation = createSQLiteGatedSaveCreationShell({
      saveCreationGateId: "sqlite-gated-save-creation-readiness-warning",
      request: COMPLETE_SAVE_IDENTITY_REQUEST,
      repositoryContract,
      schemaMigration,
      connectionHealth
    });

    assert.equal(saveCreation.repositoryContractReadiness, "missing-pieces");
    assert.equal(saveCreation.schemaMigrationReadiness, "structurally-ready");
    assert.equal(saveCreation.connectionHealthReadiness, "structural-issues");
    assert.deepEqual(saveCreation.missingSaveCreationPieces, [
      "repository-contract-not-ready",
      "connection-health-not-ready"
    ]);
    assert.equal(saveCreation.overallSaveCreationReadiness, "blocked");
    assert.equal(saveCreation.saveIdentityResult, "unavailable");
  });

  it("does not expose load, list, delete, update, or persistence behavior", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const saveCreation = createSQLiteGatedSaveCreationShell({
      saveCreationGateId: "sqlite-gated-save-creation-boundary",
      request: COMPLETE_SAVE_IDENTITY_REQUEST,
      repositoryContract: createSQLiteSaveRepositoryContractShell({
        repositoryContractId: "sqlite-save-repository-contract-boundary",
        supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
        schemaMigration,
        connectionHealth
      }),
      schemaMigration,
      connectionHealth
    });

    assert.equal(saveCreation.status, "diagnostics-only");
    assert.equal(saveCreation.playerFacing, false);
    assert.equal(saveCreation.saveCreationGated, true);
    assert.equal(saveCreation.saveIdentityOnly, true);
    assert.equal(saveCreation.sqlExecuted, false);
    assert.equal(saveCreation.databaseOpened, false);
    assert.equal(saveCreation.databaseRead, false);
    assert.equal(saveCreation.databaseWritten, false);
    assert.equal(saveCreation.tablesCreated, false);
    assert.equal(saveCreation.tablesAltered, false);
    assert.equal(saveCreation.fullRepositoryImplementationAvailable, false);
    assert.equal(saveCreation.savePersisted, false);
    assert.equal(saveCreation.loadBehaviorAvailable, false);
    assert.equal(saveCreation.listBehaviorAvailable, false);
    assert.equal(saveCreation.deleteBehaviorAvailable, false);
    assert.equal(saveCreation.metadataUpdateBehaviorAvailable, false);
    assert.equal(saveCreation.draftStatePersisted, false);
    assert.equal(saveCreation.rosterStatePersisted, false);
    assert.equal(saveCreation.matchStatePersisted, false);
    assert.equal(saveCreation.showStatePersisted, false);
    assert.equal(saveCreation.businessStatePersisted, false);
    assert.equal(saveCreation.fanSocialStatePersisted, false);
    assert.equal(saveCreation.gameplayStarted, false);
    assert.equal(saveCreation.weekAdvanced, false);
    assert.equal(Object.hasOwn(saveCreation, "createSave"), false);
    assert.equal(Object.hasOwn(saveCreation, "loadSave"), false);
    assert.equal(Object.hasOwn(saveCreation, "listSaves"), false);
    assert.equal(Object.hasOwn(saveCreation, "deleteSave"), false);
    assert.equal(Object.hasOwn(saveCreation, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(saveCreation, "execute"), false);
    assert.equal(Object.hasOwn(saveCreation, "runSql"), false);
    assert.equal(Object.hasOwn(saveCreation, "openDatabase"), false);
    assert.equal(Object.hasOwn(saveCreation, "advanceWeek"), false);
    assert.equal(Object.hasOwn(saveCreation, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-gated-save-creation-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const schemaMigration = createSQLiteSaveIdentitySchemaMigrationShell();

    createSQLiteGatedSaveCreationShell({
      saveCreationGateId: "sqlite-gated-save-creation-engine-check",
      request: COMPLETE_SAVE_IDENTITY_REQUEST,
      repositoryContract: createSQLiteSaveRepositoryContractShell({
        repositoryContractId: "sqlite-save-repository-contract-engine-check",
        supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
        schemaMigration,
        connectionHealth
      }),
      schemaMigration,
      connectionHealth
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
