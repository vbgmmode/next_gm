import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDraftSessionEntityReadiness,
  createDraftSessionEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Draft Session Entity Shell v0.1", () => {
  it("creates valid draft session shells with structural placeholders", () => {
    const draftSession = createDraftSessionEntityShell({
      draftSessionId: "draft-session-new-game",
      setupId: "setup-new-game",
      draftPoolId: "draft-pool-new-game",
      draftOrderId: "draft-order-new-game",
      draftPickIds: ["draft-pick-round-1-pick-1", "draft-pick-round-1-pick-2"],
      sessionStatus: "active-placeholder",
      currentTurn: {
        status: "turn-placeholder",
        draftPickId: "draft-pick-round-1-pick-1",
        brandId: "brand-apex",
        managerId: "manager-player"
      }
    });

    assert.deepEqual(draftSession, {
      draftSessionId: "draft-session-new-game",
      setupId: "setup-new-game",
      draftPoolId: "draft-pool-new-game",
      draftOrderId: "draft-order-new-game",
      draftPickIds: ["draft-pick-round-1-pick-1", "draft-pick-round-1-pick-2"],
      sessionStatus: "active-placeholder",
      currentTurn: {
        status: "turn-placeholder",
        draftPickId: "draft-pick-round-1-pick-1",
        brandId: "brand-apex",
        managerId: "manager-player"
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        sessionStatus: "active-placeholder",
        currentTurnStatus: "turn-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing draftSessionId structurally", () => {
    const draftSession = createDraftSessionEntityShell({
      draftSessionId: " "
    });

    assert.deepEqual(draftSession.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-draft-session-id"],
      sessionStatus: "unassigned",
      currentTurnStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createDraftSessionEntityReadiness({ draftSessionId: "" }).issues,
      ["missing-draft-session-id"]
    );
  });

  it("keeps draft session readiness diagnostics-only", () => {
    const draftSession = createDraftSessionEntityShell({
      draftSessionId: "draft-session-diagnostics",
      sessionStatus: "pending-placeholder",
      currentTurn: { status: "turn-placeholder" }
    });

    assert.equal(draftSession.readiness.status, "diagnostics-only");
    assert.equal(draftSession.readiness.sessionStatus, "pending-placeholder");
    assert.equal(draftSession.readiness.currentTurnStatus, "turn-placeholder");
    assert.equal(draftSession.readiness.gameplayAffecting, false);
    assert.equal(draftSession.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(draftSession, "turnAdvancement"), false);
    assert.equal(Object.hasOwn(draftSession, "pickExecution"), false);
    assert.equal(Object.hasOwn(draftSession, "pickValidation"), false);
    assert.equal(Object.hasOwn(draftSession, "aiDrafting"), false);
    assert.equal(Object.hasOwn(draftSession, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(draftSession, "ratings"), false);
  });

  it("normalizes draftPickIds safely", () => {
    const draftSession = createDraftSessionEntityShell({
      draftSessionId: "draft-session-normalized",
      setupId: " setup-new-game ",
      draftPoolId: " draft-pool-new-game ",
      draftOrderId: " draft-order-new-game ",
      draftPickIds: [" draft-pick-a ", "", "draft-pick-b", " "],
      currentTurn: {
        status: "turn-placeholder",
        draftPickId: " draft-pick-a ",
        brandId: " brand-a ",
        managerId: " manager-a "
      }
    });

    assert.equal(draftSession.setupId, "setup-new-game");
    assert.equal(draftSession.draftPoolId, "draft-pool-new-game");
    assert.equal(draftSession.draftOrderId, "draft-order-new-game");
    assert.deepEqual(draftSession.draftPickIds, ["draft-pick-a", "draft-pick-b"]);
    assert.deepEqual(draftSession.currentTurn, {
      status: "turn-placeholder",
      draftPickId: "draft-pick-a",
      brandId: "brand-a",
      managerId: "manager-a"
    });
    assert.equal(Object.isFrozen(draftSession.draftPickIds), true);
    assert.equal(Object.isFrozen(draftSession.currentTurn), true);
  });

  it("keeps existing engine behavior unchanged when draft session shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("draft-session-shell-no-engine-change", 7));

    createDraftSessionEntityShell({
      draftSessionId: "draft-session-diagnostics-shell",
      setupId: "setup-diagnostics-shell",
      draftPoolId: "draft-pool-diagnostics-shell",
      draftOrderId: "draft-order-diagnostics-shell",
      draftPickIds: ["draft-pick-diagnostics-shell"],
      sessionStatus: "active-placeholder",
      currentTurn: {
        status: "turn-placeholder",
        draftPickId: "draft-pick-diagnostics-shell",
        brandId: "brand-diagnostics-shell",
        managerId: "manager-diagnostics-shell"
      }
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("draft-session-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
