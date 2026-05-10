import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
  createSaveDataShapeExpectationsShell,
  createSaveProgressionContractShell,
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

describe("SQLite Migration Expectations Shell v0.1", () => {
  it("creates valid migration expectation shells", () => {
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
    const expectations = createSQLiteMigrationExpectationsShell({
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

    assert.deepEqual(expectations, {
      status: "diagnostics-only",
      migrationExpectationsId: "sqlite-migration-expectations-local",
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: REQUIRED_MIGRATION_STEPS,
      requiredRollbackSupport: "required-placeholder",
      schemaVersionReadiness: "structurally-ready",
      missingMigrationStepWarnings: [],
      missingRollbackWarnings: [],
      migrationReadiness: "structurally-ready",
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
      saveShapeReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        saveShapeExpectationsId: "save-shape-expectations-local",
        saveContractId: "save-contract-new-game",
        adapterContractId: "adapter-contract-sqlite",
        saveShapeReadiness: "structurally-ready",
        saveShapeIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      adapterReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        adapterContractId: "adapter-contract-sqlite",
        adapterReadiness: "structurally-ready",
        storageTarget: "local-profile-placeholder",
        adapterIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        schemaVersionReadiness: "structurally-ready",
        migrationReadiness: "structurally-ready",
        missingMigrationStepWarnings: [],
        missingRollbackWarnings: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing migrationExpectationsId structurally", () => {
    const expectations = createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: " "
    });

    assert.equal(expectations.migrationExpectationsId, "");
    assert.deepEqual(expectations.readiness.issues, [
      "missing-migration-expectations-id"
    ]);
    assert.equal(expectations.readiness.structurallyReady, false);
    assert.equal(expectations.migrationReadiness, "structural-issues");
    assert.equal(expectations.schemaVersionReadiness, "missing-version");
    assert.deepEqual(expectations.missingMigrationStepWarnings, []);
    assert.deepEqual(expectations.missingRollbackWarnings, []);
  });

  it("summarizes SQLite schema references deterministically", () => {
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
    const saveShapeExpectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-partial",
      saveProgressionContract,
      adapterContract,
      expectedSaveSections: ["identity", "replay", "progression"],
      requiredIdentityFields: ["saveContractId", "saveSlotId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
    });
    const sqliteSchemaExpectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      saveShapeExpectations,
      adapterContract,
      expectedTables: ["save_slots", "save_replay"],
      requiredPrimaryKeys: ["save_slots.id", "save_replay.save_contract_id"],
      requiredIndexes: ["save_slots.requested_save_slot_id", "save_replay.replay_id"],
      requiredReplayColumns: ["save_replay.replay_id"],
      requiredProgressionColumns: ["save_progression.progression_status"],
      presentTables: ["save_slots"],
      presentPrimaryKeys: ["save_slots.id"],
      presentIndexes: ["save_slots.requested_save_slot_id"]
    });
    const firstExpectations = createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: "sqlite-migration-expectations-partial",
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract,
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: ["create-save-slots-table", "create-save-replay-table"],
      completedMigrationSteps: ["create-save-slots-table"],
      requiredRollbackSupport: "not-required-placeholder"
    });
    const secondExpectations = createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: "sqlite-migration-expectations-partial",
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract,
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: ["create-save-slots-table", "create-save-replay-table"],
      completedMigrationSteps: ["create-save-slots-table"],
      requiredRollbackSupport: "not-required-placeholder"
    });

    assert.deepEqual(secondExpectations, firstExpectations);
    assert.deepEqual(firstExpectations.schemaReference, {
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
    assert.deepEqual(firstExpectations.saveShapeReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      saveShapeExpectationsId: "save-shape-expectations-partial",
      adapterContractId: "adapter-contract-partial",
      saveShapeReadiness: "structurally-ready",
      saveShapeIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstExpectations.adapterReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      adapterContractId: "adapter-contract-partial",
      adapterReadiness: "structurally-ready",
      storageTarget: "unassigned",
      adapterIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstExpectations.missingMigrationStepWarnings, [
      "missing-migration-step:create-save-replay-table"
    ]);
  });

  it("keeps missing migration and rollback warnings diagnostics-only", () => {
    const expectations = createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: "sqlite-migration-expectations-warning",
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: [
        "create-save-slots-table",
        "create-save-replay-table",
        "add-save-replay-indexes"
      ],
      completedMigrationSteps: ["create-save-slots-table"],
      requiredRollbackSupport: "required-placeholder",
      rollbackSupportProvided: false
    });

    assert.equal(expectations.readiness.structurallyReady, true);
    assert.equal(expectations.schemaVersionReadiness, "missing-schema-reference");
    assert.deepEqual(expectations.missingMigrationStepWarnings, [
      "missing-migration-step:create-save-replay-table",
      "missing-migration-step:add-save-replay-indexes"
    ]);
    assert.deepEqual(expectations.missingRollbackWarnings, [
      "missing-rollback-support"
    ]);
    assert.equal(expectations.status, "diagnostics-only");
    assert.equal(expectations.gameplayAffecting, false);
    assert.equal(expectations.playerFacing, false);
    assert.equal(expectations.readiness.gameplayAffecting, false);
    assert.equal(expectations.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(expectations, "sqlite"), false);
    assert.equal(Object.hasOwn(expectations, "database"), false);
    assert.equal(Object.hasOwn(expectations, "migrate"), false);
    assert.equal(Object.hasOwn(expectations, "migrationFile"), false);
    assert.equal(Object.hasOwn(expectations, "createTable"), false);
    assert.equal(Object.hasOwn(expectations, "alterTable"), false);
    assert.equal(Object.hasOwn(expectations, "openDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "readDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "writeDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "save"), false);
    assert.equal(Object.hasOwn(expectations, "load"), false);
    assert.equal(Object.hasOwn(expectations, "list"), false);
    assert.equal(Object.hasOwn(expectations, "delete"), false);
    assert.equal(Object.hasOwn(expectations, "gameplayStart"), false);
    assert.equal(Object.hasOwn(expectations, "advanceWeek"), false);
    assert.equal(Object.hasOwn(expectations, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-migration-expectations-no-engine-change";
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

    createSQLiteMigrationExpectationsShell({
      migrationExpectationsId: "sqlite-migration-expectations-engine-check",
      sqliteSchemaExpectations,
      saveShapeExpectations,
      adapterContract,
      expectedMigrationVersion: "sqlite-save-schema-v0-placeholder",
      requiredMigrationSteps: REQUIRED_MIGRATION_STEPS,
      completedMigrationSteps: REQUIRED_MIGRATION_STEPS,
      requiredRollbackSupport: "required-placeholder",
      rollbackSupportProvided: true
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
