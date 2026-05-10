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
  createRosterEntityShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("Game Setup Readiness Summary Shell v0.1", () => {
  it("summarizes complete setup shell inputs as structurally ready", () => {
    const summary = createGameSetupReadinessSummary(createCompleteSetupShellInputs());

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.overallSetupReadiness, "structurally-ready");
    assert.deepEqual(summary.missingStructuralPieces, []);
    assert.equal(summary.setupReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.setupReadiness.shellIds, ["setup-new-game"]);
    assert.equal(summary.brandReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.brandReadiness.shellIds, ["brand-apex", "brand-prime"]);
    assert.equal(summary.managerReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.managerReadiness.shellIds, ["manager-player", "manager-ai"]);
    assert.equal(summary.rosterReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.rosterReadiness.shellIds, ["talent-ace", "talent-crowe"]);
    assert.equal(summary.divisionReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.divisionReadiness.shellIds, ["division-world"]);
    assert.equal(summary.championshipReadiness.readiness, "structurally-ready");
    assert.deepEqual(summary.championshipReadiness.shellIds, ["championship-world"]);
    assert.equal(summary.draftReadiness.readiness, "structurally-ready");
  });

  it("reports missing pieces and structural issues deterministically", () => {
    const firstSummary = createGameSetupReadinessSummary({
      brands: [
        createBrandEntityShell({
          brandId: " ",
          displayName: " "
        })
      ],
      draftReadiness: createDraftReadinessSummary({
        draftOrder: createDraftOrderEntityShell({ draftOrderId: " " }),
        draftPicks: []
      })
    });
    const secondSummary = createGameSetupReadinessSummary({
      brands: [
        createBrandEntityShell({
          brandId: " ",
          displayName: " "
        })
      ],
      draftReadiness: createDraftReadinessSummary({
        draftOrder: createDraftOrderEntityShell({ draftOrderId: " " }),
        draftPicks: []
      })
    });

    assert.deepEqual(secondSummary, firstSummary);
    assert.deepEqual(firstSummary.missingStructuralPieces, [
      "game-setup",
      "managers",
      "roster",
      "divisions",
      "championships"
    ]);
    assert.equal(firstSummary.overallSetupReadiness, "missing-structural-pieces");
    assert.deepEqual(firstSummary.brandReadiness, {
      status: "diagnostics-only",
      readiness: "structural-issues",
      structurallyReady: false,
      shellIds: [],
      issues: ["missing-brand-id", "missing-display-name"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstSummary.draftReadiness, {
      status: "diagnostics-only",
      readiness: "structural-issues",
      structurallyReady: false,
      shellIds: [],
      issues: [
        "missing-draft-pool-shell",
        "missing-draft-order-id",
        "missing-draft-pick-shells",
        "missing-draft-session-shell"
      ],
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("keeps the summary diagnostics-only and not player-facing", () => {
    const summary = createGameSetupReadinessSummary(createCompleteSetupShellInputs());

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.playerFacing, false);
    for (const component of [
      summary.setupReadiness,
      summary.brandReadiness,
      summary.managerReadiness,
      summary.rosterReadiness,
      summary.divisionReadiness,
      summary.championshipReadiness,
      summary.draftReadiness
    ]) {
      assert.equal(component.status, "diagnostics-only");
      assert.equal(component.gameplayAffecting, false);
      assert.equal(component.playerFacing, false);
    }

    assert.equal(Object.hasOwn(summary, "brandSelectionFlow"), false);
    assert.equal(Object.hasOwn(summary, "managerAssignmentLogic"), false);
    assert.equal(Object.hasOwn(summary, "draftExecution"), false);
    assert.equal(Object.hasOwn(summary, "turnAdvancement"), false);
    assert.equal(Object.hasOwn(summary, "pickValidation"), false);
    assert.equal(Object.hasOwn(summary, "aiDrafting"), false);
    assert.equal(Object.hasOwn(summary, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(summary, "saveCreation"), false);
    assert.equal(Object.hasOwn(summary, "gameplayStart"), false);
    assert.equal(Object.hasOwn(summary, "fanScores"), false);
    assert.equal(Object.hasOwn(summary, "generatedDiscourse"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "game-setup-readiness-summary-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createGameSetupReadinessSummary(createCompleteSetupShellInputs());

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteSetupShellInputs() {
  return {
    setup: createGameSetupEntityShell({
      setupId: "setup-new-game",
      availableBrandIds: ["brand-apex", "brand-prime"],
      selectedBrandId: "brand-apex",
      managerIds: ["manager-player", "manager-ai"],
      playerManagerId: "manager-player",
      aiManagerIds: ["manager-ai"],
      rosterPoolStatus: "placeholder-ready",
      divisionSetupStatus: "placeholder-ready",
      championshipSetupStatus: "placeholder-ready"
    }),
    brands: [
      createBrandEntityShell({
        brandId: "brand-apex",
        displayName: "Apex Wrestling",
        brandTheme: "sports-forward-placeholder",
        rosterAssignmentReadiness: "placeholder-ready"
      }),
      createBrandEntityShell({
        brandId: "brand-prime",
        displayName: "Prime Wrestling",
        brandTheme: "entertainment-placeholder",
        rosterAssignmentReadiness: "placeholder-ready"
      })
    ],
    managers: [
      createManagerEntityShell({
        managerId: "manager-player",
        displayName: "Player Manager",
        controlledBrandId: "brand-apex",
        controlType: "player-placeholder"
      }),
      createManagerEntityShell({
        managerId: "manager-ai",
        displayName: "AI Manager",
        controlledBrandId: "brand-prime",
        controlType: "ai-placeholder"
      })
    ],
    roster: [
      createRosterEntityShell({
        talentId: "talent-ace",
        displayName: "Rio Ace",
        brandId: "brand-apex",
        brandStatus: "brand-placeholder"
      }),
      createRosterEntityShell({
        talentId: "talent-crowe",
        displayName: "Marcus Crowe",
        brandId: "brand-prime",
        brandStatus: "brand-placeholder"
      })
    ],
    divisions: [
      createDivisionEntityShell({
        divisionId: "division-world",
        displayName: "World Division",
        brandId: "brand-apex",
        eligibility: "singles-placeholder",
        championshipAssociation: {
          status: "championship-placeholder",
          championshipId: "championship-world"
        }
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
        availableTalentIds: ["talent-ace", "talent-crowe"],
        draftPoolStatus: "placeholder-ready"
      }),
      draftOrder: createDraftOrderEntityShell({
        draftOrderId: "draft-order-new-game",
        setupId: "setup-new-game",
        draftPoolId: "draft-pool-new-game",
        roundCount: 1,
        brandTurnOrderIds: ["brand-apex", "brand-prime"],
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
  };
}
