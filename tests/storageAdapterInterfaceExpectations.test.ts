import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPersistenceAdapterContractShell,
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

describe("Storage Adapter Interface Expectations Shell v0.1", () => {
  it("creates valid interface expectation shells", () => {
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);
    const expectations = createStorageAdapterInterfaceExpectationsShell({
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

    assert.deepEqual(expectations, {
      status: "diagnostics-only",
      expectationsId: "storage-expectations-local",
      adapterContractId: "adapter-contract-local",
      expectedOperations: ["save", "load", "list", "delete"],
      requiredCapabilities: [
        "adapter-contract-id",
        "save-slot-reference",
        "storage-target",
        "save-progression-reference",
        "replay-reference",
        "seed-reference"
      ],
      unsupportedOperationWarnings: [],
      missingCapabilityWarnings: [],
      adapterReadiness: "structurally-ready",
      adapterReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        adapterContractId: "adapter-contract-local",
        adapterReadiness: "structurally-ready",
        supportedOperations: ["save", "load", "list", "delete"],
        adapterIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      saveProgressionReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        saveContractId: "save-contract-new-game",
        requestedSaveSlotId: "slot-autosave-1",
        saveContractStructurallyReady: true,
        saveContractIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        adapterReadiness: "structurally-ready",
        unsupportedOperationWarnings: [],
        missingCapabilityWarnings: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing expectationsId structurally", () => {
    const expectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: " "
    });

    assert.equal(expectations.expectationsId, "");
    assert.deepEqual(expectations.readiness.issues, ["missing-expectations-id"]);
    assert.equal(expectations.readiness.structurallyReady, false);
    assert.equal(expectations.adapterReadiness, "missing");
    assert.deepEqual(expectations.unsupportedOperationWarnings, []);
    assert.deepEqual(expectations.missingCapabilityWarnings, []);
  });

  it("summarizes adapter contract references deterministically", () => {
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
    const firstExpectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-partial",
      adapterContract,
      saveProgressionContract,
      expectedOperations: ["save", "load", "list"],
      requiredCapabilities: ["adapter-contract-id", "save-slot-reference"]
    });
    const secondExpectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-partial",
      adapterContract,
      saveProgressionContract,
      expectedOperations: ["save", "load", "list"],
      requiredCapabilities: ["adapter-contract-id", "save-slot-reference"]
    });

    assert.deepEqual(secondExpectations, firstExpectations);
    assert.deepEqual(firstExpectations.adapterReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      adapterContractId: "adapter-contract-partial",
      adapterReadiness: "structurally-ready",
      supportedOperations: ["save"],
      adapterIssues: [],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstExpectations.saveProgressionReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      requestedSaveSlotId: "slot-blocked",
      saveContractStructurallyReady: false,
      saveContractIssues: ["missing-save-contract-id"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstExpectations.unsupportedOperationWarnings, [
      "unsupported-operation:load",
      "unsupported-operation:list"
    ]);
  });

  it("keeps unsupported operation and missing capability warnings diagnostics-only", () => {
    const adapterContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-warning",
      adapterKind: "memory-placeholder",
      supportedOperations: ["save"]
    });
    const expectations = createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-warning",
      adapterContract,
      expectedOperations: ["save", "load", "delete"],
      requiredCapabilities: [
        "adapter-contract-id",
        "save-slot-reference",
        "storage-target",
        "save-progression-reference",
        "replay-reference",
        "seed-reference"
      ]
    });

    assert.equal(expectations.readiness.structurallyReady, true);
    assert.deepEqual(expectations.unsupportedOperationWarnings, [
      "unsupported-operation:load",
      "unsupported-operation:delete"
    ]);
    assert.deepEqual(expectations.missingCapabilityWarnings, [
      "missing-capability:save-slot-reference",
      "missing-capability:storage-target",
      "missing-capability:save-progression-reference",
      "missing-capability:replay-reference",
      "missing-capability:seed-reference"
    ]);
    assert.equal(expectations.status, "diagnostics-only");
    assert.equal(expectations.gameplayAffecting, false);
    assert.equal(expectations.playerFacing, false);
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
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "storage-adapter-expectations-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const adapterContract = createCompleteAdapterContract(saveProgressionContract);

    createStorageAdapterInterfaceExpectationsShell({
      expectationsId: "storage-expectations-engine-check",
      adapterContract,
      saveProgressionContract,
      expectedOperations: ["save", "load", "list", "delete"],
      requiredCapabilities: ["adapter-contract-id", "save-progression-reference"]
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
    replayId: "replay-save-progression-contract",
    seedLabel: "save-progression-contract",
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
