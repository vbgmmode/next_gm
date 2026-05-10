import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDraftPickEntityReadiness,
  createDraftPickEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Draft Pick Entity Shell v0.1", () => {
  it("creates valid draft pick shells with structural placeholders", () => {
    const draftPick = createDraftPickEntityShell({
      draftPickId: "draft-pick-round-1-pick-1",
      draftOrderId: "draft-order-new-game",
      draftPoolId: "draft-pool-new-game",
      setupId: "setup-new-game",
      roundNumber: 1,
      pickNumber: 1,
      brandId: "brand-apex",
      managerId: "manager-player",
      selectedTalentId: "talent-jade-valor",
      pickStatus: "selected-placeholder"
    });

    assert.deepEqual(draftPick, {
      draftPickId: "draft-pick-round-1-pick-1",
      draftOrderId: "draft-order-new-game",
      draftPoolId: "draft-pool-new-game",
      setupId: "setup-new-game",
      roundNumber: 1,
      pickNumber: 1,
      brandId: "brand-apex",
      managerId: "manager-player",
      selectedTalentId: "talent-jade-valor",
      pickStatus: "selected-placeholder",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        pickStatus: "selected-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing draftPickId structurally", () => {
    const draftPick = createDraftPickEntityShell({
      draftPickId: " "
    });

    assert.deepEqual(draftPick.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-draft-pick-id"],
      pickStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createDraftPickEntityReadiness({ draftPickId: "" }).issues,
      ["missing-draft-pick-id"]
    );
  });

  it("keeps draft pick readiness diagnostics-only", () => {
    const draftPick = createDraftPickEntityShell({
      draftPickId: "draft-pick-diagnostics",
      pickStatus: "pending-placeholder"
    });

    assert.equal(draftPick.readiness.status, "diagnostics-only");
    assert.equal(draftPick.readiness.pickStatus, "pending-placeholder");
    assert.equal(draftPick.readiness.gameplayAffecting, false);
    assert.equal(draftPick.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(draftPick, "pickExecution"), false);
    assert.equal(Object.hasOwn(draftPick, "pickValidation"), false);
    assert.equal(Object.hasOwn(draftPick, "aiDrafting"), false);
    assert.equal(Object.hasOwn(draftPick, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(draftPick, "contracts"), false);
    assert.equal(Object.hasOwn(draftPick, "ratings"), false);
  });

  it("normalizes numeric placeholders safely", () => {
    const draftPick = createDraftPickEntityShell({
      draftPickId: "draft-pick-normalized",
      draftOrderId: " draft-order-new-game ",
      draftPoolId: " draft-pool-new-game ",
      setupId: " setup-new-game ",
      roundNumber: 2.9,
      pickNumber: Number.NaN,
      brandId: " brand-a ",
      managerId: " manager-a ",
      selectedTalentId: " talent-a "
    });

    assert.equal(draftPick.draftOrderId, "draft-order-new-game");
    assert.equal(draftPick.draftPoolId, "draft-pool-new-game");
    assert.equal(draftPick.setupId, "setup-new-game");
    assert.equal(draftPick.roundNumber, 2);
    assert.equal(draftPick.pickNumber, 0);
    assert.equal(draftPick.brandId, "brand-a");
    assert.equal(draftPick.managerId, "manager-a");
    assert.equal(draftPick.selectedTalentId, "talent-a");
  });

  it("keeps existing engine behavior unchanged when draft pick shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("draft-pick-shell-no-engine-change", 7));

    createDraftPickEntityShell({
      draftPickId: "draft-pick-diagnostics-shell",
      draftOrderId: "draft-order-diagnostics-shell",
      draftPoolId: "draft-pool-diagnostics-shell",
      setupId: "setup-diagnostics-shell",
      roundNumber: 1,
      pickNumber: 1,
      brandId: "brand-diagnostics-shell",
      managerId: "manager-diagnostics-shell",
      selectedTalentId: "talent-diagnostics-shell",
      pickStatus: "selected-placeholder"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("draft-pick-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
