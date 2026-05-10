import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
  createSaveDataShapeExpectationsShell,
  createSaveProgressionContractShell,
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

describe("Save Data Shape Expectations Shell v0.1", () => {
  it("creates valid save shape expectation shells", () => {
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);
    const storageExpectations = createCompleteStorageExpectations(
      adapterContract,
      saveProgressionContract
    );
    const expectations = createSaveDataShapeExpectationsShell({
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

    assert.deepEqual(expectations, {
      status: "diagnostics-only",
      saveShapeExpectationsId: "save-shape-expectations-local",
      saveContractId: "save-contract-new-game",
      adapterContractId: "adapter-contract-local",
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
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"],
      missingSectionWarnings: [],
      missingFieldWarnings: [],
      saveShapeReadiness: "structurally-ready",
      saveProgressionReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        saveContractId: "save-contract-new-game",
        requestedSaveSlotId: "slot-autosave-1",
        setupId: "setup-new-game",
        selectedBrandId: "brand-apex",
        playerManagerId: "manager-player",
        replayId: "replay-save-shape",
        seedLabel: "save-shape",
        progressionStatus: "ready-placeholder",
        persistenceStatus: "not-wired-placeholder",
        gateReadiness: "missing",
        startRequestReferenceStatus: "missing",
        saveContractStructurallyReady: true,
        saveContractIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      adapterReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        adapterContractId: "adapter-contract-local",
        adapterReadiness: "structurally-ready",
        saveSlotId: "slot-autosave-1",
        storageTarget: "local-profile-placeholder",
        adapterIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      storageExpectationReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        expectationsId: "storage-expectations-local",
        adapterContractId: "adapter-contract-local",
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
        saveShapeReadiness: "structurally-ready",
        missingSectionWarnings: [],
        missingFieldWarnings: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing saveShapeExpectationsId structurally", () => {
    const expectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: " "
    });

    assert.equal(expectations.saveShapeExpectationsId, "");
    assert.deepEqual(expectations.readiness.issues, [
      "missing-save-shape-expectations-id"
    ]);
    assert.equal(expectations.readiness.structurallyReady, false);
    assert.equal(expectations.saveShapeReadiness, "structural-issues");
    assert.deepEqual(expectations.missingSectionWarnings, []);
    assert.deepEqual(expectations.missingFieldWarnings, []);
  });

  it("summarizes save/progression and adapter references deterministically", () => {
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
      adapterKind: "memory-placeholder",
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
    const firstExpectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-partial",
      saveProgressionContract,
      adapterContract,
      storageExpectations,
      expectedSaveSections: ["identity", "replay", "progression", "adapter", "metadata"],
      requiredIdentityFields: ["saveContractId", "saveSlotId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
    });
    const secondExpectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-partial",
      saveProgressionContract,
      adapterContract,
      storageExpectations,
      expectedSaveSections: ["identity", "replay", "progression", "adapter", "metadata"],
      requiredIdentityFields: ["saveContractId", "saveSlotId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
    });

    assert.deepEqual(secondExpectations, firstExpectations);
    assert.deepEqual(firstExpectations.saveProgressionReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      requestedSaveSlotId: "slot-blocked",
      replayId: "replay-blocked",
      seedLabel: "seed-blocked",
      progressionStatus: "blocked-placeholder",
      persistenceStatus: "unavailable-placeholder",
      gateReadiness: "missing",
      startRequestReferenceStatus: "missing",
      saveContractStructurallyReady: false,
      saveContractIssues: ["missing-save-contract-id"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstExpectations.adapterReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      adapterContractId: "adapter-contract-partial",
      adapterReadiness: "structurally-ready",
      saveSlotId: "slot-blocked",
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
    assert.deepEqual(firstExpectations.missingFieldWarnings, [
      "missing-identity-field:saveContractId"
    ]);
  });

  it("keeps missing section and field warnings diagnostics-only", () => {
    const adapterContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-warning",
      adapterKind: "memory-placeholder",
      supportedOperations: ["save"]
    });
    const storageExpectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-warning",
      adapterContract,
      expectedOperations: ["save", "load"],
      requiredCapabilities: ["adapter-contract-id", "save-progression-reference"]
    });
    const expectations = createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-warning",
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
      requiredProgressionFields: [
        "progressionStatus",
        "persistenceStatus",
        "gateReadiness",
        "startRequestReferenceStatus"
      ]
    });

    assert.equal(expectations.readiness.structurallyReady, true);
    assert.deepEqual(expectations.missingSectionWarnings, [
      "missing-section:replay",
      "missing-section:progression",
      "missing-section:setup"
    ]);
    assert.deepEqual(expectations.missingFieldWarnings, [
      "missing-identity-field:saveContractId",
      "missing-identity-field:saveSlotId",
      "missing-identity-field:setupId",
      "missing-identity-field:selectedBrandId",
      "missing-identity-field:playerManagerId",
      "missing-replay-field:replayId",
      "missing-replay-field:seedLabel",
      "missing-progression-field:progressionStatus",
      "missing-progression-field:persistenceStatus",
      "missing-progression-field:gateReadiness",
      "missing-progression-field:startRequestReferenceStatus"
    ]);
    assert.equal(expectations.status, "diagnostics-only");
    assert.equal(expectations.gameplayAffecting, false);
    assert.equal(expectations.playerFacing, false);
    assert.equal(expectations.readiness.gameplayAffecting, false);
    assert.equal(expectations.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(expectations, "savePayload"), false);
    assert.equal(Object.hasOwn(expectations, "save"), false);
    assert.equal(Object.hasOwn(expectations, "load"), false);
    assert.equal(Object.hasOwn(expectations, "list"), false);
    assert.equal(Object.hasOwn(expectations, "delete"), false);
    assert.equal(Object.hasOwn(expectations, "readFile"), false);
    assert.equal(Object.hasOwn(expectations, "writeFile"), false);
    assert.equal(Object.hasOwn(expectations, "databaseRead"), false);
    assert.equal(Object.hasOwn(expectations, "databaseWrite"), false);
    assert.equal(Object.hasOwn(expectations, "gameplayStart"), false);
    assert.equal(Object.hasOwn(expectations, "advanceWeek"), false);
    assert.equal(Object.hasOwn(expectations, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "save-data-shape-expectations-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);
    const storageExpectations = createCompleteStorageExpectations(
      adapterContract,
      saveProgressionContract
    );

    createSaveDataShapeExpectationsShell({
      saveShapeExpectationsId: "save-shape-expectations-engine-check",
      saveProgressionContract,
      adapterContract,
      storageExpectations,
      expectedSaveSections: ["identity", "replay", "progression", "adapter"],
      requiredIdentityFields: ["saveContractId", "adapterContractId"],
      requiredReplayFields: ["replayId", "seedLabel"],
      requiredProgressionFields: ["progressionStatus", "persistenceStatus"]
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
    adapterContractId: "adapter-contract-local",
    adapterKind: "local-file-placeholder",
    supportedOperations: ["save", "load", "list", "delete"],
    persistenceReadiness: "contract-ready-placeholder",
    storageTarget: "local-profile-placeholder",
    saveProgressionContract,
    simulationContext: createSimulationContext({
      seed: "adapter-contract",
      seedLabel: "adapter-contract",
      replay: { replayId: "replay-adapter-contract" }
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
