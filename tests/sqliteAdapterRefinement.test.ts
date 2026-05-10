import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
  createSaveDataShapeExpectationsShell,
  createSaveProgressionContractShell,
  createSQLiteAdapterRefinementShell,
  createSQLiteMigrationExpectationsShell,
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

const REQUIRED_OPERATION_SUPPORT = ["save", "load", "list", "delete"] as const;

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

describe("SQLite Adapter Contract Refinement Shell v0.1", () => {
  it("creates valid SQLite adapter refinement shells", () => {
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);
    const storageExpectations = createCompleteStorageExpectations(
      adapterContract,
      saveProgressionContract
    );
    const saveShapeExpectations = createCompleteSaveShapeExpectations(
      saveProgressionContract,
      adapterContract,
      storageExpectations
    );
    const sqliteSchemaExpectations = createCompleteSQLiteSchemaExpectations(
      saveShapeExpectations,
      adapterContract,
      storageExpectations
    );
    const sqliteMigrationExpectations = createCompleteSQLiteMigrationExpectations(
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract
    );
    const refinement = createSQLiteAdapterRefinementShell({
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
      requiredOperationSupport: REQUIRED_OPERATION_SUPPORT
    });

    assert.deepEqual(refinement, {
      status: "diagnostics-only",
      sqliteAdapterRefinementId: "sqlite-adapter-refinement-local",
      adapterContractId: "adapter-contract-sqlite",
      expectedAdapterKind: "sqlite-placeholder",
      requiredSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
      requiredSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
      requiredMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
      requiredOperationSupport: REQUIRED_OPERATION_SUPPORT,
      adapterRefinementWarnings: [],
      adapterRefinementReadiness: "structurally-ready",
      adapterReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        adapterContractId: "adapter-contract-sqlite",
        adapterKind: "sqlite-placeholder",
        adapterReadiness: "structurally-ready",
        supportedOperations: ["save", "load", "list", "delete"],
        storageTarget: "local-profile-placeholder",
        adapterIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      storageExpectationReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        expectationsId: "storage-expectations-local",
        adapterContractId: "adapter-contract-sqlite",
        adapterReadiness: "structurally-ready",
        unsupportedOperationWarnings: [],
        missingCapabilityWarnings: [],
        expectationIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      schemaReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
        schemaReadiness: "structurally-ready",
        missingTableWarnings: [],
        missingKeyWarnings: [],
        missingIndexWarnings: [],
        schemaIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      migrationReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        migrationExpectationsId: "sqlite-migration-expectations-local",
        sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
        schemaVersionReadiness: "structurally-ready",
        migrationReadiness: "structurally-ready",
        missingMigrationStepWarnings: [],
        missingRollbackWarnings: [],
        migrationIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        adapterRefinementWarnings: [],
        adapterRefinementReadiness: "structurally-ready",
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing sqliteAdapterRefinementId structurally", () => {
    const refinement = createSQLiteAdapterRefinementShell({
      sqliteAdapterRefinementId: " "
    });

    assert.equal(refinement.sqliteAdapterRefinementId, "");
    assert.deepEqual(refinement.readiness.issues, [
      "missing-sqlite-adapter-refinement-id"
    ]);
    assert.equal(refinement.readiness.structurallyReady, false);
    assert.equal(refinement.adapterRefinementReadiness, "structural-issues");
    assert.deepEqual(refinement.adapterRefinementWarnings, []);
  });

  it("summarizes adapter, schema, and migration references deterministically", () => {
    const saveProgressionContract = createSaveProgressionContractShell({
      saveContractId: " ",
      requestedSaveSlotId: "slot-blocked",
      replayId: "replay-blocked",
      seedLabel: "seed-blocked",
      progressionStatus: "blocked-placeholder",
      persistenceStatus: "unavailable-placeholder"
    });
    const adapterContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-partial",
      adapterKind: "sqlite-placeholder",
      supportedOperations: ["save"],
      saveProgressionContract
    });
    const storageExpectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-partial",
      adapterContract,
      saveProgressionContract,
      expectedOperations: ["save", "load"],
      requiredCapabilities: ["adapter-contract-id", "save-slot-reference"]
    });
    const saveShapeExpectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-partial",
      saveProgressionContract,
      adapterContract,
      storageExpectations,
      expectedSaveSections: ["identity", "replay", "progression"],
      requiredIdentityFields: ["saveContractId", "saveSlotId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
    });
    const sqliteSchemaExpectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      saveShapeExpectations,
      adapterContract,
      storageExpectations,
      expectedTables: ["save_slots", "save_replay"],
      requiredPrimaryKeys: ["save_slots.id", "save_replay.save_contract_id"],
      requiredIndexes: ["save_slots.requested_save_slot_id", "save_replay.replay_id"],
      requiredReplayColumns: ["save_replay.replay_id"],
      requiredProgressionColumns: ["save_progression.progression_status"],
      presentTables: ["save_slots"],
      presentPrimaryKeys: ["save_slots.id"],
      presentIndexes: ["save_slots.requested_save_slot_id"]
    });
    const sqliteMigrationExpectations = createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: "sqlite-migration-expectations-partial",
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract,
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: ["create-save-slots-table", "create-save-replay-table"],
      completedMigrationSteps: ["create-save-slots-table"],
      requiredRollbackSupport: "not-required-placeholder"
    });
    const firstRefinement = createSQLiteAdapterRefinementShell({
      sqliteAdapterRefinementId: "sqlite-adapter-refinement-partial",
      adapterContract,
      storageExpectations,
      sqliteSchemaExpectations,
      sqliteMigrationExpectations,
      requiredOperationSupport: ["save", "load"]
    });
    const secondRefinement = createSQLiteAdapterRefinementShell({
      sqliteAdapterRefinementId: "sqlite-adapter-refinement-partial",
      adapterContract,
      storageExpectations,
      sqliteSchemaExpectations,
      sqliteMigrationExpectations,
      requiredOperationSupport: ["save", "load"]
    });

    assert.deepEqual(secondRefinement, firstRefinement);
    assert.deepEqual(firstRefinement.adapterReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      adapterContractId: "adapter-contract-partial",
      adapterKind: "sqlite-placeholder",
      adapterReadiness: "structurally-ready",
      supportedOperations: ["save"],
      storageTarget: "unassigned",
      adapterIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstRefinement.schemaReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      schemaReadiness: "structurally-ready",
      missingTableWarnings: ["missing-table:save_replay"],
      missingKeyWarnings: ["missing-primary-key:save_replay.save_contract_id"],
      missingIndexWarnings: ["missing-index:save_replay.replay_id"],
      schemaIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstRefinement.migrationReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      migrationExpectationsId: "sqlite-migration-expectations-partial",
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      schemaVersionReadiness: "structurally-ready",
      migrationReadiness: "structurally-ready",
      missingMigrationStepWarnings: [
        "missing-migration-step:create-save-replay-table"
      ],
      missingRollbackWarnings: [],
      migrationIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstRefinement.adapterRefinementWarnings, [
      "missing-operation-support:load"
    ]);
  });

  it("keeps refinement warnings diagnostics-only", () => {
    const adapterContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-warning",
      adapterKind: "memory-placeholder",
      supportedOperations: ["save"]
    });
    const refinement = createSQLiteAdapterRefinementShell({
      sqliteAdapterRefinementId: "sqlite-adapter-refinement-warning",
      adapterContract,
      expectedAdapterKind: "sqlite-placeholder",
      requiredSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
      providedSQLiteCapabilities: ["sqlite-adapter-kind"],
      requiredSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
      providedSchemaSupport: ["schema-expectations-id"],
      requiredMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
      providedMigrationSupport: ["migration-expectations-id"],
      requiredOperationSupport: ["save", "load", "delete"]
    });

    assert.equal(refinement.readiness.structurallyReady, true);
    assert.deepEqual(refinement.adapterRefinementWarnings, [
      "adapter-kind-mismatch:memory-placeholder",
      "missing-sqlite-capability:sqlite-storage-target",
      "missing-sqlite-capability:schema-reference",
      "missing-sqlite-capability:migration-reference",
      "missing-sqlite-capability:operation-contract",
      "missing-schema-support:expected-tables",
      "missing-schema-support:primary-keys",
      "missing-schema-support:indexes",
      "missing-migration-support:migration-version",
      "missing-migration-support:migration-steps",
      "missing-migration-support:rollback-support",
      "missing-operation-support:load",
      "missing-operation-support:delete"
    ]);
    assert.equal(refinement.status, "diagnostics-only");
    assert.equal(refinement.gameplayAffecting, false);
    assert.equal(refinement.playerFacing, false);
    assert.equal(refinement.readiness.gameplayAffecting, false);
    assert.equal(refinement.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(refinement, "sqlite"), false);
    assert.equal(Object.hasOwn(refinement, "database"), false);
    assert.equal(Object.hasOwn(refinement, "adapterMethod"), false);
    assert.equal(Object.hasOwn(refinement, "openDatabase"), false);
    assert.equal(Object.hasOwn(refinement, "readDatabase"), false);
    assert.equal(Object.hasOwn(refinement, "writeDatabase"), false);
    assert.equal(Object.hasOwn(refinement, "createTable"), false);
    assert.equal(Object.hasOwn(refinement, "alterTable"), false);
    assert.equal(Object.hasOwn(refinement, "runMigration"), false);
    assert.equal(Object.hasOwn(refinement, "save"), false);
    assert.equal(Object.hasOwn(refinement, "load"), false);
    assert.equal(Object.hasOwn(refinement, "list"), false);
    assert.equal(Object.hasOwn(refinement, "delete"), false);
    assert.equal(Object.hasOwn(refinement, "gameplayStart"), false);
    assert.equal(Object.hasOwn(refinement, "advanceWeek"), false);
    assert.equal(Object.hasOwn(refinement, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-adapter-refinement-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);
    const storageExpectations = createCompleteStorageExpectations(
      adapterContract,
      saveProgressionContract
    );
    const saveShapeExpectations = createCompleteSaveShapeExpectations(
      saveProgressionContract,
      adapterContract,
      storageExpectations
    );
    const sqliteSchemaExpectations = createCompleteSQLiteSchemaExpectations(
      saveShapeExpectations,
      adapterContract,
      storageExpectations
    );
    const sqliteMigrationExpectations = createCompleteSQLiteMigrationExpectations(
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract
    );

    createSQLiteAdapterRefinementShell({
      sqliteAdapterRefinementId: "sqlite-adapter-refinement-engine-check",
      adapterContract,
      storageExpectations,
      sqliteSchemaExpectations,
      sqliteMigrationExpectations,
      requiredSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
      providedSQLiteCapabilities: REQUIRED_SQLITE_CAPABILITIES,
      requiredSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
      providedSchemaSupport: REQUIRED_SCHEMA_SUPPORT,
      requiredMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
      providedMigrationSupport: REQUIRED_MIGRATION_SUPPORT,
      requiredOperationSupport: REQUIRED_OPERATION_SUPPORT
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteSaveProgressionContract() {
  return createSaveProgressionContractShell({
    saveContractId: "save-contract-new-game",
    requestedSaveSlotId: "slot-autosave-1",
    setupId: "setup-new-game",
    selectedBrandId: "brand-apex",
    playerManagerId: "manager-player",
    replayId: "replay-save-shape",
    seedLabel: "save-shape",
    progressionStatus: "ready-placeholder",
    persistenceStatus: "not-wired-placeholder"
  });
}

function createCompleteAdapterContract(
  saveProgressionContract: ReturnType<typeof createCompleteSaveProgressionContract>
) {
  return createPersistenceAdapterContractShell({
    adapterContractId: "adapter-contract-sqlite",
    adapterKind: "sqlite-placeholder",
    supportedOperations: ["save", "load", "list", "delete"],
    persistenceReadiness: "contract-ready-placeholder",
    storageTarget: "local-profile-placeholder",
    saveProgressionContract,
    simulationContext: createSimulationContext({
      seed: "sqlite-adapter-contract",
      seedLabel: "sqlite-adapter-contract",
      replay: { replayId: "replay-sqlite-adapter-contract" }
    })
  });
}

function createCompleteStorageExpectations(
  adapterContract: ReturnType<typeof createCompleteAdapterContract>,
  saveProgressionContract: ReturnType<typeof createCompleteSaveProgressionContract>
) {
  return createStorageAdapterInterfaceExpectationsShell({
    expectationsId: "storage-expectations-local",
    adapterContract,
    saveProgressionContract,
    expectedOperations: ["save", "load", "list", "delete"],
    requiredCapabilities: [
      "adapter-contract-id",
      "save-slot-reference",
      "storage-target",
      "save-progression-reference",
      "replay-reference",
      "seed-reference"
    ]
  });
}

function createCompleteSaveShapeExpectations(
  saveProgressionContract: ReturnType<typeof createCompleteSaveProgressionContract>,
  adapterContract: ReturnType<typeof createCompleteAdapterContract>,
  storageExpectations: ReturnType<typeof createCompleteStorageExpectations>
) {
  return createSaveDataShapeExpectationsShell({
    saveShapeExpectationsId: "save-shape-expectations-local",
    saveProgressionContract,
    adapterContract,
    storageExpectations,
    expectedSaveSections: ["identity", "replay", "progression", "setup", "adapter", "metadata"],
    requiredIdentityFields: [
      "saveContractId",
      "saveSlotId",
      "setupId",
      "selectedBrandId",
      "playerManagerId",
      "adapterContractId"
    ],
    requiredReplayFields: ["replayId", "seedLabel"],
    requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
  });
}

function createCompleteSQLiteSchemaExpectations(
  saveShapeExpectations: ReturnType<typeof createCompleteSaveShapeExpectations>,
  adapterContract: ReturnType<typeof createCompleteAdapterContract>,
  storageExpectations: ReturnType<typeof createCompleteStorageExpectations>
) {
  return createSQLiteSchemaExpectationsShell({
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
}

function createCompleteSQLiteMigrationExpectations(
  sqliteSchemaExpectations: ReturnType<typeof createCompleteSQLiteSchemaExpectations>,
  saveShapeExpectations: ReturnType<typeof createCompleteSaveShapeExpectations>,
  adapterContract: ReturnType<typeof createCompleteAdapterContract>
) {
  return createSQLiteMigrationExpectationsShell({
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
}
