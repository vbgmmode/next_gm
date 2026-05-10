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

describe("New Game Start Gate Summary v0.1", () => {
  it("creates a structurally-ready gate summary from a ready start contract", () => {
    const { setup, setupReadiness } = createCompleteStartInputs();
    const startResult = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({
        seed: "new-game-start-gate",
        replay: { replayId: "replay-new-game-start-gate" }
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

    assert.deepEqual(gateSummary, {
      status: "diagnostics-only",
      gateStatus: "structurally-ready",
      startReadiness: "structurally-ready",
      blockingReasons: [],
      warningReasons: [],
      requiredStructuralPieces: [
        "new-game-start-request",
        "new-game-start-result",
        "game-setup",
        "brands",
        "managers",
        "roster",
        "divisions",
        "championships",
        "draft-readiness"
      ],
      missingStructuralPieces: [],
      overallGateReadiness: "structurally-ready",
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing and blocking pieces deterministically", () => {
    const blockedStartResult = createNewGameStartContractShell({});
    const firstGateSummary = createNewGameStartGateSummary({
      startResult: blockedStartResult
    });
    const secondGateSummary = createNewGameStartGateSummary({
      startResult: blockedStartResult
    });

    assert.deepEqual(secondGateSummary, firstGateSummary);
    assert.equal(firstGateSummary.gateStatus, "blocked");
    assert.equal(firstGateSummary.startReadiness, "blocked");
    assert.deepEqual(firstGateSummary.blockingReasons, [
      "missing-start-request-shell",
      "missing-game-setup-shell",
      "missing-setup-readiness-summary",
      "missing-simulation-context",
      "missing-selected-brand-id",
      "missing-player-manager-id",
      "missing-draft-session-id"
    ]);
    assert.deepEqual(firstGateSummary.missingStructuralPieces, [
      "new-game-start-request",
      "game-setup"
    ]);
    assert.equal(firstGateSummary.overallGateReadiness, "blocked");
  });

  it("keeps warnings diagnostic without changing gate readiness or gameplay behavior", () => {
    const { setup, setupReadiness } = createCompleteStartInputs();
    const startResult = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({ seed: "new-game-start-gate-warning" }),
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      draftSessionId: "draft-session-new-game"
    });
    const gateSummary = createNewGameStartGateSummary({
      startRequest: startResult.request,
      startResult
    });

    assert.equal(gateSummary.gateStatus, "structurally-ready");
    assert.equal(gateSummary.overallGateReadiness, "structurally-ready");
    assert.deepEqual(gateSummary.blockingReasons, []);
    assert.deepEqual(gateSummary.warningReasons, [
      "missing-simulation-replay-id",
      "setup-readiness-summary-not-provided"
    ]);
    assert.equal(Object.hasOwn(gateSummary, "gameplayStart"), false);
    assert.equal(Object.hasOwn(gateSummary, "saveCreation"), false);
    assert.equal(Object.hasOwn(gateSummary, "warningGameplayEffects"), false);
  });

  it("keeps the gate summary diagnostics-only and not player-facing", () => {
    const { setup, setupReadiness } = createCompleteStartInputs();
    const startResult = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({
        seed: "new-game-start-gate-diagnostics",
        replay: { replayId: "replay-diagnostics" }
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

    assert.equal(gateSummary.status, "diagnostics-only");
    assert.equal(gateSummary.gameplayAffecting, false);
    assert.equal(gateSummary.playerFacing, false);
    assert.equal(Object.hasOwn(gateSummary, "brandSelectionFlow"), false);
    assert.equal(Object.hasOwn(gateSummary, "managerAssignmentLogic"), false);
    assert.equal(Object.hasOwn(gateSummary, "draftExecution"), false);
    assert.equal(Object.hasOwn(gateSummary, "turnAdvancement"), false);
    assert.equal(Object.hasOwn(gateSummary, "pickValidation"), false);
    assert.equal(Object.hasOwn(gateSummary, "aiDrafting"), false);
    assert.equal(Object.hasOwn(gateSummary, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(gateSummary, "gameplayStart"), false);
    assert.equal(Object.hasOwn(gateSummary, "fanScores"), false);
    assert.equal(Object.hasOwn(gateSummary, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-game-start-gate-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const { setup, setupReadiness } = createCompleteStartInputs();
    const startResult = createNewGameStartContractShell({
      setup,
      setupReadiness,
      simulationContext: createSimulationContext({
        seed: contextSeed,
        replay: { replayId: "replay-engine-check" }
      }),
      selectedBrandId: "brand-apex",
      playerManagerId: "manager-player",
      draftSessionId: "draft-session-new-game"
    });

    createNewGameStartGateSummary({
      startRequest: startResult.request,
      startResult,
      setupReadiness
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
