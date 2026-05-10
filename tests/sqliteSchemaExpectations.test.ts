import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
  createSaveDataShapeExpectationsShell,
  createSaveProgressionContractShell,
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

const REQUIRED_REPLAY_COLUMNS = [
  "save_replay.replay_id",
  "save_replay.seed_label"
] as const;

const REQUIRED_PROGRESSION_COLUMNS = [
  "save_progression.progression_status",
  "save_progression.persistence_status"
] as const;

describe("SQLite Schema Expectations Shell v0.1", () => {
  it("creates valid SQLite schema expectation shells", () => {
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
    const expectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
      saveShapeExpectations,
      adapterContract,
      storageExpectations,
      expectedTables: EXPECTED_SQLITE_TABLES,
      requiredPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
      requiredIndexes: REQUIRED_SQLITE_INDEXES,
      requiredReplayColumns: REQUIRED_REPLAY_COLUMNS,
      requiredProgressionColumns: REQUIRED_PROGRESSION_COLUMNS,
      presentTables: EXPECTED_SQLITE_TABLES,
      presentPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
      presentIndexes: REQUIRED_SQLITE_INDEXES
    });

    assert.deepEqual(expectations, {
      status: "diagnostics-only",
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-local",
      adapterContractId: "adapter-contract-sqlite",
      saveShapeExpectationsId: "save-shape-expectations-local",
      expectedTables: EXPECTED_SQLITE_TABLES,
      requiredPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
      requiredIndexes: REQUIRED_SQLITE_INDEXES,
      requiredReplayColumns: REQUIRED_REPLAY_COLUMNS,
      requiredProgressionColumns: REQUIRED_PROGRESSION_COLUMNS,
      missingTableWarnings: [],
      missingKeyWarnings: [],
      missingIndexWarnings: [],
      schemaReadiness: "structurally-ready",
      saveShapeReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        saveShapeExpectationsId: "save-shape-expectations-local",
        saveContractId: "save-contract-new-game",
        adapterContractId: "adapter-contract-sqlite",
        saveShapeReadiness: "structurally-ready",
        missingSectionWarnings: [],
        missingFieldWarnings: [],
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
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        schemaReadiness: "structurally-ready",
        missingTableWarnings: [],
        missingKeyWarnings: [],
        missingIndexWarnings: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing sqliteSchemaExpectationsId structurally", () => {
    const expectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: " "
    });

    assert.equal(expectations.sqliteSchemaExpectationsId, "");
    assert.deepEqual(expectations.readiness.issues, [
      "missing-sqlite-schema-expectations-id"
    ]);
    assert.equal(expectations.readiness.structurallyReady, false);
    assert.equal(expectations.schemaReadiness, "structural-issues");
    assert.deepEqual(expectations.missingTableWarnings, []);
    assert.deepEqual(expectations.missingKeyWarnings, []);
    assert.deepEqual(expectations.missingIndexWarnings, []);
  });

  it("summarizes save shape and adapter references deterministically", () => {
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
      expectedSaveSections: ["identity", "replay", "progression", "adapter", "metadata"],
      requiredIdentityFields: ["saveContractId", "saveSlotId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
    });
    const firstExpectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      saveShapeExpectations,
      adapterContract,
      storageExpectations,
      expectedTables: ["save_slots", "save_identity"],
      requiredPrimaryKeys: ["save_slots.id"],
      requiredIndexes: ["save_slots.requested_save_slot_id"],
      requiredReplayColumns: ["save_replay.replay_id"],
      requiredProgressionColumns: ["save_progression.progression_status"],
      presentTables: ["save_slots", "save_identity"],
      presentPrimaryKeys: ["save_slots.id"],
      presentIndexes: ["save_slots.requested_save_slot_id"]
    });
    const secondExpectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-partial",
      saveShapeExpectations,
      adapterContract,
      storageExpectations,
      expectedTables: ["save_slots", "save_identity"],
      requiredPrimaryKeys: ["save_slots.id"],
      requiredIndexes: ["save_slots.requested_save_slot_id"],
      requiredReplayColumns: ["save_replay.replay_id"],
      requiredProgressionColumns: ["save_progression.progression_status"],
      presentTables: ["save_slots", "save_identity"],
      presentPrimaryKeys: ["save_slots.id"],
      presentIndexes: ["save_slots.requested_save_slot_id"]
    });

    assert.deepEqual(secondExpectations, firstExpectations);
    assert.deepEqual(firstExpectations.saveShapeReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      saveShapeExpectationsId: "save-shape-expectations-partial",
      adapterContractId: "adapter-contract-partial",
      saveShapeReadiness: "structurally-ready",
      missingSectionWarnings: ["missing-section:identity"],
      missingFieldWarnings: ["missing-identity-field:saveContractId"],
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
    assert.deepEqual(firstExpectations.storageExpectationReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      expectationsId: "storage-expectations-partial",
      adapterContractId: "adapter-contract-partial",
      adapterReadiness: "structurally-ready",
      unsupportedOperationWarnings: ["unsupported-operation:load"],
      missingCapabilityWarnings: [],
      expectationIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("keeps missing table, key, and index warnings diagnostics-only", () => {
    const expectations = createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-warning",
      expectedTables: ["save_slots", "save_replay", "save_progression", "adapter_metadata"],
      requiredPrimaryKeys: [
        "save_slots.id",
        "save_replay.save_contract_id",
        "adapter_metadata.adapter_contract_id"
      ],
      requiredIndexes: [
        "save_slots.requested_save_slot_id",
        "save_replay.replay_id",
        "save_progression.progression_status",
        "adapter_metadata.adapter_contract_id"
      ],
      requiredReplayColumns: ["save_replay.replay_id", "save_replay.seed_label"],
      requiredProgressionColumns: [
        "save_progression.progression_status",
        "save_progression.persistence_status"
      ],
      presentTables: ["save_slots"],
      presentPrimaryKeys: ["save_slots.id"],
      presentIndexes: ["save_slots.requested_save_slot_id"]
    });

    assert.equal(expectations.readiness.structurallyReady, true);
    assert.deepEqual(expectations.missingTableWarnings, [
      "missing-table:save_replay",
      "missing-table:save_progression",
      "missing-table:adapter_metadata"
    ]);
    assert.deepEqual(expectations.missingKeyWarnings, [
      "missing-primary-key:save_replay.save_contract_id",
      "missing-primary-key:adapter_metadata.adapter_contract_id"
    ]);
    assert.deepEqual(expectations.missingIndexWarnings, [
      "missing-index:save_replay.replay_id",
      "missing-index:save_progression.progression_status",
      "missing-index:adapter_metadata.adapter_contract_id"
    ]);
    assert.equal(expectations.status, "diagnostics-only");
    assert.equal(expectations.gameplayAffecting, false);
    assert.equal(expectations.playerFacing, false);
    assert.equal(expectations.readiness.gameplayAffecting, false);
    assert.equal(expectations.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(expectations, "sqlite"), false);
    assert.equal(Object.hasOwn(expectations, "database"), false);
    assert.equal(Object.hasOwn(expectations, "migrate"), false);
    assert.equal(Object.hasOwn(expectations, "createTable"), false);
    assert.equal(Object.hasOwn(expectations, "openDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "readDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "writeDatabase"), false);
    assert.equal(Object.hasOwn(expectations, "savePayload"), false);
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
    const contextSeed = "sqlite-schema-expectations-no-engine-change";
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

    createSQLiteSchemaExpectationsShell({
      sqliteSchemaExpectationsId: "sqlite-schema-expectations-engine-check",
      saveShapeExpectations,
      adapterContract,
      storageExpectations,
      expectedTables: EXPECTED_SQLITE_TABLES,
      requiredPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
      requiredIndexes: REQUIRED_SQLITE_INDEXES,
      requiredReplayColumns: REQUIRED_REPLAY_COLUMNS,
      requiredProgressionColumns: REQUIRED_PROGRESSION_COLUMNS,
      presentTables: EXPECTED_SQLITE_TABLES,
      presentPrimaryKeys: REQUIRED_SQLITE_PRIMARY_KEYS,
      presentIndexes: REQUIRED_SQLITE_INDEXES
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
