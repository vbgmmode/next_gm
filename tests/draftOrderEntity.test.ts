import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDraftOrderEntityReadiness,
  createDraftOrderEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Draft Order Entity Shell v0.1", () => {
  it("creates valid draft order shells with structural placeholders", () => {
    const draftOrder = createDraftOrderEntityShell({
      draftOrderId: "draft-order-new-game",
      setupId: "setup-new-game",
      draftPoolId: "draft-pool-new-game",
      roundCount: 6,
      brandTurnOrderIds: ["brand-apex", "brand-rival"],
      currentTurn: {
        status: "turn-placeholder",
        brandId: "brand-apex",
        roundNumber: 1,
        turnIndex: 0
      },
      draftOrderStatus: "placeholder-ready"
    });

    assert.deepEqual(draftOrder, {
      draftOrderId: "draft-order-new-game",
      setupId: "setup-new-game",
      draftPoolId: "draft-pool-new-game",
      roundCount: 6,
      brandTurnOrderIds: ["brand-apex", "brand-rival"],
      currentTurn: {
        status: "turn-placeholder",
        brandId: "brand-apex",
        roundNumber: 1,
        turnIndex: 0
      },
      draftOrderStatus: "placeholder-ready",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        draftOrderStatus: "placeholder-ready",
        currentTurnStatus: "turn-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing draftOrderId structurally", () => {
    const draftOrder = createDraftOrderEntityShell({
      draftOrderId: " "
    });

    assert.deepEqual(draftOrder.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-draft-order-id"],
      draftOrderStatus: "unassigned",
      currentTurnStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createDraftOrderEntityReadiness({ draftOrderId: "" }).issues,
      ["missing-draft-order-id"]
    );
  });

  it("keeps draft order readiness diagnostics-only", () => {
    const draftOrder = createDraftOrderEntityShell({
      draftOrderId: "draft-order-diagnostics",
      draftOrderStatus: "pending-placeholder",
      currentTurn: { status: "turn-placeholder" }
    });

    assert.equal(draftOrder.readiness.status, "diagnostics-only");
    assert.equal(draftOrder.readiness.draftOrderStatus, "pending-placeholder");
    assert.equal(draftOrder.readiness.currentTurnStatus, "turn-placeholder");
    assert.equal(draftOrder.readiness.gameplayAffecting, false);
    assert.equal(draftOrder.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(draftOrder, "picks"), false);
    assert.equal(Object.hasOwn(draftOrder, "snakeDraftLogic"), false);
    assert.equal(Object.hasOwn(draftOrder, "aiDrafting"), false);
    assert.equal(Object.hasOwn(draftOrder, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(draftOrder, "contracts"), false);
    assert.equal(Object.hasOwn(draftOrder, "ratings"), false);
  });

  it("normalizes brand turn order IDs safely", () => {
    const draftOrder = createDraftOrderEntityShell({
      draftOrderId: "draft-order-normalized",
      setupId: " setup-new-game ",
      draftPoolId: " draft-pool-new-game ",
      roundCount: 4.8,
      brandTurnOrderIds: [" brand-a ", "", "brand-b", " "],
      currentTurn: {
        status: "turn-placeholder",
        brandId: " brand-a ",
        roundNumber: 2.9,
        turnIndex: 1.6
      }
    });

    assert.equal(draftOrder.setupId, "setup-new-game");
    assert.equal(draftOrder.draftPoolId, "draft-pool-new-game");
    assert.equal(draftOrder.roundCount, 4);
    assert.deepEqual(draftOrder.brandTurnOrderIds, ["brand-a", "brand-b"]);
    assert.deepEqual(draftOrder.currentTurn, {
      status: "turn-placeholder",
      brandId: "brand-a",
      roundNumber: 2,
      turnIndex: 1
    });
    assert.equal(Object.isFrozen(draftOrder.brandTurnOrderIds), true);
    assert.equal(Object.isFrozen(draftOrder.currentTurn), true);
  });

  it("keeps existing engine behavior unchanged when draft order shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("draft-order-shell-no-engine-change", 7));

    createDraftOrderEntityShell({
      draftOrderId: "draft-order-diagnostics-shell",
      setupId: "setup-diagnostics-shell",
      draftPoolId: "draft-pool-diagnostics-shell",
      roundCount: 3,
      brandTurnOrderIds: ["brand-diagnostics-shell"],
      currentTurn: { status: "turn-placeholder", brandId: "brand-diagnostics-shell" },
      draftOrderStatus: "placeholder-ready"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("draft-order-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
