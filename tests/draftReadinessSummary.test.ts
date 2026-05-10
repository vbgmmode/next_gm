import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDraftOrderEntityShell,
  createDraftPickEntityShell,
  createDraftPoolEntityShell,
  createDraftReadinessSummary,
  createDraftSessionEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Draft Readiness Summary Shell v0.1", () => {
  it("summarizes complete draft shell inputs as structurally ready", () => {
    const summary = createDraftReadinessSummary({
      draftPool: createDraftPoolEntityShell({
        draftPoolId: "draft-pool-new-game",
        setupId: "setup-new-game",
        availableTalentIds: ["talent-a", "talent-b"],
        draftPoolStatus: "placeholder-ready"
      }),
      draftOrder: createDraftOrderEntityShell({
        draftOrderId: "draft-order-new-game",
        setupId: "setup-new-game",
        draftPoolId: "draft-pool-new-game",
        roundCount: 2,
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
    });

    assert.deepEqual(summary, {
      status: "diagnostics-only",
      draftPoolReadiness: {
        status: "diagnostics-only",
        readiness: "structurally-ready",
        structurallyReady: true,
        shellIds: ["draft-pool-new-game"],
        issues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      draftOrderReadiness: {
        status: "diagnostics-only",
        readiness: "structurally-ready",
        structurallyReady: true,
        shellIds: ["draft-order-new-game"],
        issues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      draftPickReadiness: {
        status: "diagnostics-only",
        readiness: "structurally-ready",
        structurallyReady: true,
        shellIds: ["draft-pick-round-1-pick-1"],
        issues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      draftSessionReadiness: {
        status: "diagnostics-only",
        readiness: "structurally-ready",
        structurallyReady: true,
        shellIds: ["draft-session-new-game"],
        issues: [],
        gameplayAffecting: false,
        playerFacing: false
      },
      missingStructuralPieces: [],
      overallDraftReadiness: "structurally-ready",
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing pieces deterministically", () => {
    const firstSummary = createDraftReadinessSummary({
      draftOrder: createDraftOrderEntityShell({ draftOrderId: " " }),
      draftPicks: []
    });
    const secondSummary = createDraftReadinessSummary({
      draftOrder: createDraftOrderEntityShell({ draftOrderId: " " }),
      draftPicks: []
    });

    assert.deepEqual(secondSummary, firstSummary);
    assert.deepEqual(firstSummary.missingStructuralPieces, [
      "draft-pool",
      "draft-picks",
      "draft-session"
    ]);
    assert.equal(firstSummary.overallDraftReadiness, "missing-structural-pieces");
    assert.deepEqual(firstSummary.draftOrderReadiness, {
      status: "diagnostics-only",
      readiness: "structural-issues",
      structurallyReady: false,
      shellIds: [],
      issues: ["missing-draft-order-id"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(firstSummary.draftPickReadiness.issues, ["missing-draft-pick-shells"]);
  });

  it("keeps summary output diagnostics-only and not player-facing", () => {
    const summary = createDraftReadinessSummary({
      draftPool: createDraftPoolEntityShell({ draftPoolId: "draft-pool-diagnostics" }),
      draftOrder: createDraftOrderEntityShell({ draftOrderId: "draft-order-diagnostics" }),
      draftPicks: [
        createDraftPickEntityShell({ draftPickId: "draft-pick-diagnostics" })
      ],
      draftSession: createDraftSessionEntityShell({ draftSessionId: "draft-session-diagnostics" })
    });

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.draftPoolReadiness.playerFacing, false);
    assert.equal(summary.draftOrderReadiness.playerFacing, false);
    assert.equal(summary.draftPickReadiness.playerFacing, false);
    assert.equal(summary.draftSessionReadiness.playerFacing, false);
    assert.equal(Object.hasOwn(summary, "turnAdvancement"), false);
    assert.equal(Object.hasOwn(summary, "pickExecution"), false);
    assert.equal(Object.hasOwn(summary, "pickValidation"), false);
    assert.equal(Object.hasOwn(summary, "aiDrafting"), false);
    assert.equal(Object.hasOwn(summary, "rosterAssignment"), false);
  });

  it("keeps existing engine behavior unchanged when draft readiness summaries are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("draft-readiness-summary-no-engine-change", 7));

    createDraftReadinessSummary({
      draftPool: createDraftPoolEntityShell({ draftPoolId: "draft-pool-engine-check" }),
      draftOrder: createDraftOrderEntityShell({ draftOrderId: "draft-order-engine-check" }),
      draftPicks: [
        createDraftPickEntityShell({ draftPickId: "draft-pick-engine-check" })
      ],
      draftSession: createDraftSessionEntityShell({ draftSessionId: "draft-session-engine-check" })
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("draft-readiness-summary-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
