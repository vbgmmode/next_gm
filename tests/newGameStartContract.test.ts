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
  createRosterEntityShell
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

describe("New Game Start Contract Shell v0.1", () => {
  it("creates a structurally-ready start shell from complete structural inputs", () => {
    const { setup, setupReadiness } = createCompleteStartInputs();
    const result = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({
        seed: "new-game-start",
        seedLabel: "new-game-start",
        replay: { replayId: "replay-new-game-start" }
      }),
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      draftSessionId: "draft-session-new-game"
    });

    assert.deepEqual(result, {
      status: "diagnostics-only",
      request: {
        status: "diagnostics-only",
        setupId: "setup-new-game",
        selectedBrandId: "brand-apex",
        playerManagerId: "manager-player",
        draftSessionId: "draft-session-new-game",
        simulationSeedLabel: "new-game-start",
        simulationReplayId: "replay-new-game-start",
        gameplayAffecting: false,
        playerFacing: false
      },
      startRequestStatus: "structurally-ready",
      setupReadiness: "structurally-ready",
      missingStructuralPieces: [],
      startBlockedReasons: [],
      overallStartReadiness: "structurally-ready",
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("blocks missing setup and readiness pieces deterministically", () => {
    const firstResult = createNewGameStartContractShell({
      selectedBrandId: " ",
      playerManagerId: " ",
      draftSessionId: " "
    });
    const secondResult = createNewGameStartContractShell({
      selectedBrandId: " ",
      playerManagerId: " ",
      draftSessionId: " "
    });

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(firstResult.missingStructuralPieces, ["game-setup"]);
    assert.deepEqual(firstResult.startBlockedReasons, [
      "missing-game-setup-shell",
      "missing-setup-readiness-summary",
      "missing-simulation-context",
      "missing-selected-brand-id",
      "missing-player-manager-id",
      "missing-draft-session-id"
    ]);
    assert.equal(firstResult.startRequestStatus, "blocked");
    assert.equal(firstResult.setupReadiness, "missing");
    assert.equal(firstResult.overallStartReadiness, "blocked");
  });

  it("keeps the result diagnostics-only and not player-facing", () => {
    const { setup, setupReadiness } = createCompleteStartInputs();
    const result = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({ seed: "new-game-start-diagnostics" }),
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      draftSessionId: "draft-session-new-game"
    });

    assert.equal(result.status, "diagnostics-only");
    assert.equal(result.gameplayAffecting, false);
    assert.equal(result.playerFacing, false);
    assert.equal(result.request.status, "diagnostics-only");
    assert.equal(result.request.gameplayAffecting, false);
    assert.equal(result.request.playerFacing, false);
    assert.equal(Object.hasOwn(result, "saveCreation"), false);
    assert.equal(Object.hasOwn(result, "gameplayState"), false);
    assert.equal(Object.hasOwn(result, "brandSelectionFlow"), false);
    assert.equal(Object.hasOwn(result, "managerAssignmentLogic"), false);
    assert.equal(Object.hasOwn(result, "draftExecution"), false);
    assert.equal(Object.hasOwn(result, "turnAdvancement"), false);
    assert.equal(Object.hasOwn(result, "pickValidation"), false);
    assert.equal(Object.hasOwn(result, "aiDrafting"), false);
    assert.equal(Object.hasOwn(result, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(result, "gameplayStart"), false);
    assert.equal(Object.hasOwn(result, "fanScores"), false);
    assert.equal(Object.hasOwn(result, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-game-start-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const { setup, setupReadiness } = createCompleteStartInputs();

    createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({ seed: contextSeed }),
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      draftSessionId: "draft-session-new-game"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteStartInputs() {
  const setup = createGameSetupEntityShell({
    setupId: "setup-new-game",
    availableBrandIds: ["brand-apex", "brand-prime"],
    selectedBrandId: "brand-apex",
    managerIds: ["manager-player", "manager-ai"],
    playerManagerId: "manager-player",
    aiManagerIds: ["manager-ai"],
    rosterPoolStatus: "placeholder-ready",
    divisionSetupStatus: "placeholder-ready",
    championshipSetupStatus: "placeholder-ready"
  });

  return {
    setup,
    setupReadiness: createGameSetupReadinessSummary({
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
    })
  };
}
