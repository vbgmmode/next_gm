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

describe("Save Progression Contract Shell v0.1", () => {
  it("creates valid save/progression contract shells", () => {
    const { startResult, gateSummary } = createCompleteStartGateReferences();
    const contract = createSaveProgressionContractShell({
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

    assert.deepEqual(contract, {
      status: "diagnostics-only",
      saveContractId: "save-contract-new-game",
      requestedSaveSlotId: "slot-autosave-1",
      setupId: "setup-new-game",
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      replayId: "replay-save-progression-contract",
      seedLabel: "save-progression-contract",
      progressionStatus: "ready-placeholder",
      persistenceStatus: "not-wired-placeholder",
      gateReference: {
        status: "diagnostics-only",
        gateReadiness: "structurally-ready",
        blockingReasons: [],
        warningReasons: [],
        missingStructuralPieces: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      startRequestReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        setupId: "setup-new-game",
        selectedBrandId: "brand-apex",
        playerManagerId: "manager-player",
        replayId: "replay-save-progression-contract",
        seedLabel: "save-progression-contract",
        gameplayAffecting: false,
        playerFacing: false
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        progressionStatus: "ready-placeholder",
        persistenceStatus: "not-wired-placeholder",
        gateReadiness: "structurally-ready",
        startRequestReferenceStatus: "provided",
        gameplayAffecting: false,
        playerFacing: false
      },
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing saveContractId structurally", () => {
    const contract = createSaveProgressionContractShell({
      saveContractId: " "
    });

    assert.equal(contract.saveContractId, "");
    assert.deepEqual(contract.readiness.issues, ["missing-save-contract-id"]);
    assert.equal(contract.readiness.structurallyReady, false);
    assert.equal(contract.readiness.gateReadiness, "missing");
    assert.equal(contract.readiness.startRequestReferenceStatus, "missing");
  });

  it("summarizes gate and start references deterministically", () => {
    const blockedStartResult = createNewGameStartContractShell({});
    const blockedGateSummary = createNewGameStartGateSummary({
      startResult: blockedStartResult
    });
    const firstContract = createSaveProgressionContractShell({
      saveContractId: "save-contract-blocked",
      startGateSummary: blockedGateSummary,
      startRequest: blockedStartResult.request
    });
    const secondContract = createSaveProgressionContractShell({
      saveContractId: "save-contract-blocked",
      startGateSummary: blockedGateSummary,
      startRequest: blockedStartResult.request
    });

    assert.deepEqual(secondContract, firstContract);
    assert.deepEqual(firstContract.gateReference, {
      status: "diagnostics-only",
      gateReadiness: "blocked",
      blockingReasons: [
        "missing-start-request-shell",
        "missing-game-setup-shell",
        "missing-setup-readiness-summary",
        "missing-simulation-context",
        "missing-selected-brand-id",
        "missing-player-manager-id",
        "missing-draft-session-id"
      ],
      warningReasons: [
        "missing-simulation-replay-id",
        "setup-readiness-summary-not-provided"
      ],
      missingStructuralPieces: [
        "new-game-start-request",
        "game-setup"
      ],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstContract.startRequestReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("keeps the contract diagnostics-only and not player-facing", () => {
    const { startResult, gateSummary } = createCompleteStartGateReferences();
    const contract = createSaveProgressionContractShell({
      saveContractId: "save-contract-diagnostics",
      startGateSummary: gateSummary,
      startRequest: startResult.request,
      simulationContext: createSimulationContext({
        seed: "save-progression-diagnostics",
        replay: { replayId: "replay-save-progression-diagnostics" }
      })
    });

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.readiness.status, "diagnostics-only");
    assert.equal(contract.readiness.gameplayAffecting, false);
    assert.equal(contract.readiness.playerFacing, false);
    assert.equal(contract.gateReference.playerFacing, false);
    assert.equal(contract.startRequestReference.playerFacing, false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "writeFile"), false);
    assert.equal(Object.hasOwn(contract, "databaseWrite"), false);
    assert.equal(Object.hasOwn(contract, "gameplayState"), false);
    assert.equal(Object.hasOwn(contract, "advanceWeek"), false);
    assert.equal(Object.hasOwn(contract, "draftExecution"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "gameplayStart"), false);
    assert.equal(Object.hasOwn(contract, "fanScores"), false);
    assert.equal(Object.hasOwn(contract, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "save-progression-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const { startResult, gateSummary } = createCompleteStartGateReferences();

    createSaveProgressionContractShell({
      saveContractId: "save-contract-engine-check",
      startGateSummary: gateSummary,
      startRequest: startResult.request,
      simulationContext: createSimulationContext({
        seed: contextSeed,
        replay: { replayId: "replay-save-engine-check" }
      })
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteStartGateReferences() {
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
      seed: "save-progression-start-reference",
      seedLabel: "save-progression-start-reference",
      replay: { replayId: "replay-save-progression-start-reference" }
    }),
    selectedBrandId: "brand-apex",
    playerManagerId: "manager-player",
    draftSessionId: "draft-session-new-game"
  });

  return {
    startResult,
    gateSummary: createNewGameStartGateSummary({
      startRequest: startResult.request,
      startResult,
      setupReadiness
    })
  };
}
