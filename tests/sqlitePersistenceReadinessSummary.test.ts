import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
  createSaveDataShapeExpectationsShell,
  createSaveProgressionContractShell,
  createSQLiteAdapterRefinementShell,
  createSQLiteMigrationExpectationsShell,
  createSQLitePersistenceReadinessSummary,
  createSQLiteSchemaExpectationsShell,
  createStorageAdapterInterfaceExpectationsShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import { createSimulationContext } from "../src/game/simulation/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const REQUIRED_OPERATIONS = ["save", "load", "list", "delete"] as const;

const REQUIRED_STORAGE_CAPABILITIES = [
  "adapter-contract-id",
  "save-slot-reference",
  "storage-target",
  "save-progression-reference",
  "replay-reference",
  "seed-reference"
] as const;

const EXPECTED_SAVE_SECTIONS = [
  "identity",
  "replay",
  "progression",
  "setup",
  "adapter",
  "metadata"
] as const;

const REQUIRED_IDENTITY_FIELDS = [
  "saveContractId",
  "saveSlotId",
  "setupId",
  "selectedBrandId",
  "playerManagerId",
  "adapterContractId"
] as const;

const REQUIRED_REPLAY_FIELDS = ["replayId", "seedLabel"] as const;
const REQUIRED_PROGRESSION_FIELDS = ["progressionStatus", "persistenceStatus"] as const;

const EXPECTED_SQLITE_TABLES = [
  "save_slots",
  "save_identity",
  "save_replay",
  "save_progression",
  "save_metadata",
  "adapter_metadata"
] as const;

const REQUIRED_SQLITE_PRIMARY_KEYS = [
  "save_slots.id",
  "save_identity.save_contract_id",
  "save_replay.save_contract_id",
  "save_progression.save_contract_id",
  "save_metadata.save_contract_id",
  "adapter_metadata.adapter_contract_id"
] as const;

const REQUIRED_SQLITE_INDEXES = [
  "save_slots.requested_save_slot_id",
  "save_identity.setup_id",
  "save_replay.replay_id",
  "save_replay.seed_label",
  "save_progression.progression_status",
  "adapter_metadata.adapter_contract_id"
] as const;

const REQUIRED_MIGRATION_STEPS = [
  "create-save-slots-table",
  "create-save-identity-table",
  "create-save-replay-table",
  "create-save-progression-table",
  "create-save-metadata-table",
  "create-adapter-metadata-table",
  "add-save-replay-indexes",
  "add-save-progression-indexes"
] as const;

const REQUIRED_SQLITE_CAPABILITIES = [
  "sqlite-adapter-kind",
  "sqlite-storage-target",
  "schema-reference",
  "migration-reference",
  "operation-contract"
] as const;

const REQUIRED_SCHEMA_SUPPORT = [
  "schema-expectations-id",
  "expected-tables",
  "primary-keys",
  "indexes"
] as const;

const REQUIRED_MIGRATION_SUPPORT = [
  "migration-expectations-id",
  "migration-version",
  "migration-steps",
  "rollback-support"
] as const;

describe("SQLite Persistence Readiness Summary Shell v0.1", () => {
  it("creates a structurally-ready SQLite persistence summary from complete inputs", () => {
    const stack = createCompletePersistencePlanningStack();
    const summary = createSQLitePersistenceReadinessSummary(stack);

    assert.deepEqual(summary, {
      status: "diagnostics-only",
      saveContractReadiness: "structurally-ready",
      adapterContractReadiness: "structurally-ready",
      storageExpectationReadiness: "structurally-ready",
      saveShapeReadiness: "structurally-ready",
      sqliteSchemaReadiness: "structurally-ready",
      sqliteMigrationReadiness: "structurally-ready",
      sqliteAdapterRefinementReadiness: "structurally-ready",
      missingPersistencePieces: [],
      warningSummary: {
        status: "diagnostics-only",
        saveContractWarnings: [],
        adapterContractWarnings: [],
        storageExpectationWarnings: [],
        saveShapeWarnings: [],
        sqliteSchemaWarnings: [],
        sqliteMigrationWarnings: [],
        sqliteAdapterRefinementWarnings: [],
        allWarnings: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      overallSQLitePersistenceReadiness: "structurally-ready",
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing persistence pieces deterministically", () => {
    const summary = createSQLitePersistenceReadinessSummary({});

    assert.deepEqual(summary.missingPersistencePieces, [
      "missing:save-progression-contract",
      "missing:persistence-adapter-contract",
      "missing:storage-adapter-interface-expectations",
      "missing:save-data-shape-expectations",
      "missing:sqlite-schema-expectations",
      "missing:sqlite-migration-expectations",
      "missing:sqlite-adapter-refinement"
    ]);
    assert.deepEqual(summary.warningSummary.allWarnings, []);
    assert.equal(summary.saveContractReadiness, "missing");
    assert.equal(summary.adapterContractReadiness, "missing");
    assert.equal(summary.storageExpectationReadiness, "missing");
    assert.equal(summary.saveShapeReadiness, "missing");
    assert.equal(summary.sqliteSchemaReadiness, "missing");
    assert.equal(summary.sqliteMigrationReadiness, "missing");
    assert.equal(summary.sqliteAdapterRefinementReadiness, "missing");
    assert.equal(summary.overallSQLitePersistenceReadiness, "missing-persistence-pieces");
  });

  it("aggregates structural warnings in deterministic order without gameplay behavior", () => {
    const stack = createWarningPersistencePlanningStack();
    const firstSummary = createSQLitePersistenceReadinessSummary(stack);
    const secondSummary = createSQLitePersistenceReadinessSummary(stack);

    assert.deepEqual(secondSummary, firstSummary);
    assert.deepEqual(firstSummary.warningSummary.allWarnings, [
      "missing-save-contract-id",
      "missing-adapter-contract-id",
      "missing-expectations-id",
      "unsupported-operation:load",
      "missing-capability:adapter-contract-id",
      "missing-capability:save-slot-reference",
      "missing-capability:storage-target",
      "missing-capability:replay-reference",
      "missing-capability:seed-reference",
      "missing-save-shape-expectations-id",
      "missing-section:identity",
      "missing-section:replay",
      "missing-section:setup",
      "missing-identity-field:saveContractId",
      "missing-identity-field:saveSlotId",
      "missing-identity-field:setupId",
      "missing-replay-field:replayId",
      "missing-replay-field:seedLabel",
      "missing-sqlite-schema-expectations-id",
      "missing-table:save_identity",
      "missing-primary-key:save_identity.save_contract_id",
      "missing-index:save_identity.setup_id",
      "missing-migration-expectations-id",
      "missing-migration-step:create-save-identity-table",
      "missing-rollback-support",
      "missing-sqlite-adapter-refinement-id",
      "adapter-kind-mismatch:memory-placeholder",
      "missing-sqlite-capability:sqlite-storage-target",
      "missing-schema-support:expected-tables",
      "missing-migration-support:migration-version",
      "missing-operation-support:load"
    ]);
    assert.deepEqual(firstSummary.missingPersistencePieces, []);
    assert.equal(firstSummary.saveContractReadiness, "structural-issues");
    assert.equal(firstSummary.adapterContractReadiness, "structural-issues");
    assert.equal(firstSummary.storageExpectationReadiness, "structural-issues");
    assert.equal(firstSummary.saveShapeReadiness, "structural-issues");
    assert.equal(firstSummary.sqliteSchemaReadiness, "structural-issues");
    assert.equal(firstSummary.sqliteMigrationReadiness, "structural-issues");
    assert.equal(firstSummary.sqliteAdapterRefinementReadiness, "structural-issues");
    assert.equal(firstSummary.overallSQLitePersistenceReadiness, "structural-issues");
    assert.equal(Object.hasOwn(firstSummary, "sqlite"), false);
    assert.equal(Object.hasOwn(firstSummary, "database"), false);
    assert.equal(Object.hasOwn(firstSummary, "adapterMethod"), false);
    assert.equal(Object.hasOwn(firstSummary, "migration"), false);
    assert.equal(Object.hasOwn(firstSummary, "save"), false);
    assert.equal(Object.hasOwn(firstSummary, "load"), false);
    assert.equal(Object.hasOwn(firstSummary, "list"), false);
    assert.equal(Object.hasOwn(firstSummary, "delete"), false);
    assert.equal(Object.hasOwn(firstSummary, "advanceWeek"), false);
    assert.equal(Object.hasOwn(firstSummary, "generatedText"), false);
  });

  it("keeps summary output diagnostics-only and not player-facing", () => {
    const summary = createSQLitePersistenceReadinessSummary(
      createCompletePersistencePlanningStack()
    );

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.warningSummary.status, "diagnostics-only");
    assert.equal(summary.warningSummary.gameplayAffecting, false);
    assert.equal(summary.warningSummary.playerFacing, false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-persistence-readiness-summary-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLitePersistenceReadinessSummary(createCompletePersistencePlanningStack());

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompletePersistencePlanningStack() {
  const saveProgressionContract = createSaveProgressionContractShell({
    saveContractId: "save-contract-new-game",
    requestedSaveSlotId: "slot-autosave-1",
    setupId: "setup-new-game",
    selectedBrandId: "brand-apex",
    playerManagerId: "manager-player",
    replayId: "replay-sqlite-readiness",
    seedLabel: "sqlite-readiness",
    progressionStatus: "ready-placeholder",
    persistenceStatus: "not-wired-placeholder"
  });
  const adapterContract = createPersistenceAdapterContractShell({
    adapterContractId: "adapter-contract-sqlite",
    adapterKind: "sqlite-placeholder",
    supportedOperations: REQUIRED_OPERATIONS,
    persistenceReadiness: "contract-ready-placeholder",
    storageTarget: "local-profile-placeholder",
    saveProgressionContract,
    simulationContext: createSimulationContext({
      seed: "sqlite-readiness-adapter",
      seedLabel: "sqlite-readiness-adapter",
      replay: { replayId: "replay-sqlite-readiness-adapter" }
    })
  });
  const storageExpectations = createStorageAdapterInterfaceExpectationsShell({
    expectationsId: "storage-expectations-local",
    adapterContract,
    saveProgressionContract,
    expectedOperations: REQUIRED_OPERATIONS,
    requiredCapabilities: REQUIRED_STORAGE_CAPABILITIES
  });
  const saveShapeExpectations = createSaveDataShapeExpectationsShell({
    saveShapeExpectationsId: "save-shape-expectations-local",
    saveProgressionContract,
    adapterContract,
    storageExpectations,
    expectedSaveSections: EXPECTED_SAVE_SECTIONS,
    requiredIdentityFields: REQUIRED_IDENTITY_FIELDS,
    requiredReplayFields: REQUIRED_REPLAY_FIELDS,
    requiredProgressionFields: REQUIRED_PROGRESSION_FIELDS
  });
  const sqliteSchemaExpectations = createSQLiteSchemaExpectationsShell({
    sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
    saveShapeExpectations,
    adapterContract,
    storageExpectations,
    expectedTables: EXPECTED_SQLITE_TABLES,
    requiredPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
    requiredIndexes: REQUIRED_SQLITE_INDEXES,
    requiredReplayColumns: ["save_replay.replay_id", "save_replay.seed_label"],
    requiredProgressionColumns: [
      "save_progression.progression_status",
      "save_progression.persistence_status"
    ],
    presentTables: EXPECTED_SQLITE_TABLES,
    presentPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
    presentIndexes: REQUIRED_SQLITE_INDEXES
  });
  const sqliteMigrationExpectations = createSQLiteMigrationExpectationsShell({
    migrationExpectationsId: "sqlite-migration-expectations-local",
    sqliteSchemaExpectations,
    saveShapeExpectations,
    adapterContract,
    expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
    requiredMigrationSteps: REQUIRED_MIGRATION_STEPS,
    completedMigrationSteps: REQUIRED_MIGRATION_STEPS,
    requiredRollbackSupport: "required-placeholder",
    rollbackSupportProvided: true
  });
  const sqliteAdapterRefinement = createSQLiteAdapterRefinementShell({
    sqliteAdapterRefinementId: "sqlite-adapter-refinement-local",
    adapterContract,
    storageExpectations,
    sqliteSchemaExpectations,
    sqliteMigrationExpectations,
    expectedAdapterKind: "sqlite-placeholder",
    requiredSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
    providedSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
    requiredSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
    providedSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
    requiredMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
    providedMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
    requiredOperationSupport: REQUIRED_OPERATIONS
  });

  return {
    saveProgressionContract,
    adapterContract,
    storageExpectations,
    saveShapeExpectations,
    sqliteSchemaExpectations,
    sqliteMigrationExpectations,
    sqliteAdapterRefinement
  };
}

function createWarningPersistencePlanningStack() {
  const saveProgressionContract = createSaveProgressionContractShell({
    saveContractId: " ",
    progressionStatus: "blocked-placeholder",
    persistenceStatus: "unavailable-placeholder"
  });
  const adapterContract = createPersistenceAdapterContractShell({
    adapterContractId: " ",
    adapterKind: "memory-placeholder",
    supportedOperations: ["save"],
    saveProgressionContract
  });
  const storageExpectations = createStorageAdapterInterfaceExpectationsShell({
    expectationsId: " ",
    adapterContract,
    saveProgressionContract,
    expectedOperations: ["save", "load"],
    requiredCapabilities: REQUIRED_STORAGE_CAPABILITIES
  });
  const saveShapeExpectations = createSaveDataShapeExpectationsShell({
    saveShapeExpectationsId: " ",
    saveProgressionContract,
    adapterContract,
    storageExpectations,
    expectedSaveSections: ["identity", "replay", "setup"],
    requiredIdentityFields: ["saveContractId", "saveSlotId", "setupId"],
    requiredReplayFields: REQUIRED_REPLAY_FIELDS,
    requiredProgressionFields: REQUIRED_PROGRESSION_FIELDS
  });
  const sqliteSchemaExpectations = createSQLiteSchemaExpectationsShell({
    sqliteSchemaExpectationsId: " ",
    saveShapeExpectations,
    adapterContract,
    storageExpectations,
    expectedTables: ["save_slots", "save_identity"],
    requiredPrimaryKeys: ["save_slots.id", "save_identity.save_contract_id"],
    requiredIndexes: [
      "save_slots.requested_save_slot_id",
      "save_identity.setup_id"
    ],
    presentTables: ["save_slots"],
    presentPrimaryKeys: ["save_slots.id"],
    presentIndexes: ["save_slots.requested_save_slot_id"]
  });
  const sqliteMigrationExpectations = createSQLiteMigrationExpectationsShell({
    migrationExpectationsId: " ",
    sqliteSchemaExpectations,
    saveShapeExpectations,
    adapterContract,
    expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
    requiredMigrationSteps: [
      "create-save-slots-table",
      "create-save-identity-table"
    ],
    completedMigrationSteps: ["create-save-slots-table"],
    requiredRollbackSupport: "required-placeholder",
    rollbackSupportProvided: false
  });
  const sqliteAdapterRefinement = createSQLiteAdapterRefinementShell({
    sqliteAdapterRefinementId: " ",
    adapterContract,
    storageExpectations,
    sqliteSchemaExpectations,
    sqliteMigrationExpectations,
    expectedAdapterKind: "sqlite-placeholder",
    requiredSQLiteCapabilities: ["sqlite-adapter-kind", "sqlite-storage-target"],
    providedSQLiteCapabilities: ["sqlite-adapter-kind"],
    requiredSchemaSupport: ["schema-expectations-id", "expected-tables"],
    providedSchemaSupport: ["schema-expectations-id"],
    requiredMigrationSupport: ["migration-expectations-id", "migration-version"],
    providedMigrationSupport: ["migration-expectations-id"],
    requiredOperationSupport: ["save", "load"]
  });

  return {
    saveProgressionContract,
    adapterContract,
    storageExpectations,
    saveShapeExpectations,
    sqliteSchemaExpectations,
    sqliteMigrationExpectations,
    sqliteAdapterRefinement
  };
}
