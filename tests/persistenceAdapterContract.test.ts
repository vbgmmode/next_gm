import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createBrandEntityShell,
  createChampionshipEntityShell,
  createDivisionEntityShell,
  createDraftOrderEntityShell,
  createDraftPickEntityShell,
  createDraftPoolEntityShell,
  createDraftReadinessSummary,
  createDraftSessionEntityShell,
  createGameSetupEntityShell,
  createGameSetupReadinessSummary,
  createManagerEntityShell,
  createNewGameStartContractShell,
  createNewGameStartGateSummary,
  createPersistenceAdapterContractShell,
  createRosterEntityShell,
  createSaveProgressionContractShell
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

describe("Persistence Adapter Contract Shell v0.1", () => {
  it("creates valid persistence adapter contract shells", () => {
    const saveProgressionContract = createCompleteSaveProgressionContract();
    const contract = createPersistenceAdapterContractShell({
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

    assert.deepEqual(contract, {
      status: "diagnostics-only",
      adapterContractId: "adapter-contract-local",
      adapterKind: "local-file-placeholder",
      saveSlotId: "slot-autosave-1",
      supportedOperations: ["save", "load", "list", "delete"],
      persistenceReadiness: "contract-ready-placeholder",
      storageTarget: "local-profile-placeholder",
      replayId: "replay-adapter-contract",
      seedLabel: "adapter-contract",
      saveProgressionReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        saveContractId: "save-contract-new-game",
        requestedSaveSlotId: "slot-autosave-1",
        setupId: "setup-new-game",
        replayId: "replay-save-progression-contract",
        seedLabel: "save-progression-contract",
        progressionStatus: "ready-placeholder",
        persistenceStatus: "not-wired-placeholder",
        saveContractStructurallyReady: true,
        saveContractIssues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        adapterKind: "local-file-placeholder",
        supportedOperations: ["save", "load", "list", "delete"],
        persistenceReadiness: "contract-ready-placeholder",
        storageTarget: "local-profile-placeholder",
        saveProgressionReferenceStatus: "provided",
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing adapterContractId structurally", () => {
    const contract = createPersistenceAdapterContractShell({
      adapterContractId: " "
    });

    assert.equal(contract.adapterContractId, "");
    assert.deepEqual(contract.readiness.issues, ["missing-adapter-contract-id"]);
    assert.equal(contract.readiness.structurallyReady, false);
    assert.equal(contract.readiness.saveProgressionReferenceStatus, "missing");
    assert.deepEqual(contract.saveProgressionReference.saveContractIssues, []);
  });

  it("summarizes save/progression references deterministically", () => {
    const saveProgressionContract = createSaveProgressionContractShell({
      saveContractId: " ",
      requestedSaveSlotId: "slot-blocked",
      setupId: "setup-blocked",
      replayId: "replay-blocked",
      seedLabel: "seed-blocked",
      progressionStatus: "blocked-placeholder",
      persistenceStatus: "unavailable-placeholder"
    });
    const firstContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-blocked",
      adapterKind: "memory-placeholder",
      saveProgressionContract,
      supportedOperations: ["list"]
    });
    const secondContract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-blocked",
      adapterKind: "memory-placeholder",
      saveProgressionContract,
      supportedOperations: ["list"]
    });

    assert.deepEqual(secondContract, firstContract);
    assert.deepEqual(firstContract.saveProgressionReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      requestedSaveSlotId: "slot-blocked",
      setupId: "setup-blocked",
      replayId: "replay-blocked",
      seedLabel: "seed-blocked",
      progressionStatus: "blocked-placeholder",
      persistenceStatus: "unavailable-placeholder",
      saveContractStructurallyReady: false,
      saveContractIssues: ["missing-save-contract-id"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.equal(firstContract.saveSlotId, "slot-blocked");
  });

  it("keeps the adapter contract diagnostics-only and not player-facing", () => {
    const contract = createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-diagnostics",
      adapterKind: "indexeddb-placeholder",
      supportedOperations: ["save", "load"],
      persistenceReadiness: "not-wired-placeholder",
      storageTarget: "test-harness-placeholder",
      saveProgressionContract: createCompleteSaveProgressionContract()
    });

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.readiness.status, "diagnostics-only");
    assert.equal(contract.readiness.gameplayAffecting, false);
    assert.equal(contract.readiness.playerFacing, false);
    assert.equal(contract.saveProgressionReference.playerFacing, false);
    assert.equal(Object.hasOwn(contract, "save"), false);
    assert.equal(Object.hasOwn(contract, "load"), false);
    assert.equal(Object.hasOwn(contract, "listSaves"), false);
    assert.equal(Object.hasOwn(contract, "deleteSave"), false);
    assert.equal(Object.hasOwn(contract, "readFile"), false);
    assert.equal(Object.hasOwn(contract, "writeFile"), false);
    assert.equal(Object.hasOwn(contract, "databaseRead"), false);
    assert.equal(Object.hasOwn(contract, "databaseWrite"), false);
    assert.equal(Object.hasOwn(contract, "gameplayStart"), false);
    assert.equal(Object.hasOwn(contract, "advanceWeek"), false);
    assert.equal(Object.hasOwn(contract, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "persistence-adapter-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createPersistenceAdapterContractShell({
      adapterContractId: "adapter-contract-engine-check",
      adapterKind: "memory-placeholder",
      supportedOperations: ["save", "load", "list", "delete"],
      persistenceReadiness: "contract-ready-placeholder",
      storageTarget: "test-harness-placeholder",
      saveProgressionContract: createCompleteSaveProgressionContract(),
      simulationContext: createSimulationContext({
        seed: contextSeed,
        replay: { replayId: "replay-adapter-engine-check" }
      })
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteSaveProgressionContract() {
  const setup = createGameSetupEntityShell({
    setupId: "setup-new-game",
    availableBrandIds: ["brand-apex"],
    selectedBrandId: "brand-apex",
    managerIds: ["manager-player"],
    playerManagerId: "manager-player",
    rosterPoolStatus: "placeholder-ready",
    divisionSetupStatus: "placeholder-ready",
    championshipSetupStatus: "placeholder-ready"
  });
  const setupReadiness = createGameSetupReadinessSummary({
    setup,
    brands: [
      createBrandEntityShell({
        brandId: "brand-apex",
        displayName: "Apex Wrestling",
        rosterAssignmentReadiness: "placeholder-ready"
      })
    ],
    managers: [
      createManagerEntityShell({
        managerId: "manager-player",
        displayName: "Player Manager",
        controlledBrandId: "brand-apex",
        controlType: "player-placeholder"
      })
    ],
    roster: [
      createRosterEntityShell({
        talentId: "talent-ace",
        displayName: "Rio Ace",
        brandId: "brand-apex",
        brandStatus: "brand-placeholder"
      })
    ],
    divisions: [
      createDivisionEntityShell({
        divisionId: "division-world",
        displayName: "World Division",
        brandId: "brand-apex",
        eligibility: "singles-placeholder"
      })
    ],
    championships: [
      createChampionshipEntityShell({
        championshipId: "championship-world",
        displayName: "World Championship",
        brandId: "brand-apex",
        divisionId: "division-world",
        championshipType: "world-placeholder"
      })
    ],
    draftReadiness: createDraftReadinessSummary({
      draftPool: createDraftPoolEntityShell({
        draftPoolId: "draft-pool-new-game",
        setupId: "setup-new-game",
        availableTalentIds: ["talent-ace"],
        draftPoolStatus: "placeholder-ready"
      }),
      draftOrder: createDraftOrderEntityShell({
        draftOrderId: "draft-order-new-game",
        setupId: "setup-new-game",
        draftPoolId: "draft-pool-new-game",
        roundCount: 1,
        brandTurnOrderIds: ["brand-apex"],
        draftOrderStatus: "placeholder-ready",
        currentTurn: {
          status: "turn-placeholder",
          brandId: "brand-apex",
          roundNumber: 1,
          turnIndex: 0
        }
      }),
      draftPicks: [
        createDraftPickEntityShell({
          draftPickId: "draft-pick-round-1-pick-1",
          draftOrderId: "draft-order-new-game",
          draftPoolId: "draft-pool-new-game",
          setupId: "setup-new-game",
          roundNumber: 1,
          pickNumber: 1,
          brandId: "brand-apex",
          managerId: "manager-player",
          pickStatus: "pending-placeholder"
        })
      ],
      draftSession: createDraftSessionEntityShell({
        draftSessionId: "draft-session-new-game",
        setupId: "setup-new-game",
        draftPoolId: "draft-pool-new-game",
        draftOrderId: "draft-order-new-game",
        draftPickIds: ["draft-pick-round-1-pick-1"],
        sessionStatus: "active-placeholder",
        currentTurn: {
          status: "turn-placeholder",
          draftPickId: "draft-pick-round-1-pick-1",
          brandId: "brand-apex",
          managerId: "manager-player"
        }
      })
    })
  });
  const startResult = createNewGameStartContractShell({
    setup,
    setupReadiness,
    simulationContext: createSimulationContext({
      seed: "adapter-start-reference",
      seedLabel: "adapter-start-reference",
      replay: { replayId: "replay-adapter-start-reference" }
    }),
    selectedBrandId: "brand-apex",
    playerManagerId: "manager-player",
    draftSessionId: "draft-session-new-game"
  });
  const gateSummary = createNewGameStartGateSummary({
    startRequest: startResult.request,
    startResult,
    setupReadiness
  });

  return createSaveProgressionContractShell({
    saveContractId: "save-contract-new-game",
    requestedSaveSlotId: "slot-autosave-1",
    startGateSummary: gateSummary,
    startRequest: startResult.request,
    simulationContext: createSimulationContext({
      seed: "save-progression-contract",
      seedLabel: "save-progression-contract",
      replay: { replayId: "replay-save-progression-contract" }
    }),
    progressionStatus: "ready-placeholder",
    persistenceStatus: "not-wired-placeholder"
  });
}
