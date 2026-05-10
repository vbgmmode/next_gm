import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDraftPoolEntityReadiness,
  createDraftPoolEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Draft Pool Entity Shell v0.1", () => {
  it("creates valid draft pool shells with structural placeholders", () => {
    const draftPool = createDraftPoolEntityShell({
      draftPoolId: "draft-pool-new-game",
      setupId: "setup-new-game",
      availableTalentIds: ["talent-jade-valor", "talent-rio-ace"],
      unavailableTalentIds: ["talent-inactive"],
      reservedTalentIds: ["talent-protected"],
      draftPoolStatus: "placeholder-ready"
    });

    assert.deepEqual(draftPool, {
      draftPoolId: "draft-pool-new-game",
      setupId: "setup-new-game",
      availableTalentIds: ["talent-jade-valor", "talent-rio-ace"],
      unavailableTalentIds: ["talent-inactive"],
      reservedTalentIds: ["talent-protected"],
      draftPoolStatus: "placeholder-ready",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        draftPoolStatus: "placeholder-ready",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing draftPoolId structurally", () => {
    const draftPool = createDraftPoolEntityShell({
      draftPoolId: " "
    });

    assert.deepEqual(draftPool.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-draft-pool-id"],
      draftPoolStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createDraftPoolEntityReadiness({ draftPoolId: "" }).issues,
      ["missing-draft-pool-id"]
    );
  });

  it("keeps draft pool readiness diagnostics-only", () => {
    const draftPool = createDraftPoolEntityShell({
      draftPoolId: "draft-pool-diagnostics",
      draftPoolStatus: "pending-placeholder"
    });

    assert.equal(draftPool.readiness.status, "diagnostics-only");
    assert.equal(draftPool.readiness.draftPoolStatus, "pending-placeholder");
    assert.equal(draftPool.readiness.gameplayAffecting, false);
    assert.equal(draftPool.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(draftPool, "draftOrder"), false);
    assert.equal(Object.hasOwn(draftPool, "picks"), false);
    assert.equal(Object.hasOwn(draftPool, "aiDrafting"), false);
    assert.equal(Object.hasOwn(draftPool, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(draftPool, "contracts"), false);
    assert.equal(Object.hasOwn(draftPool, "ratings"), false);
  });

  it("normalizes draft pool ID lists safely", () => {
    const draftPool = createDraftPoolEntityShell({
      draftPoolId: "draft-pool-normalized",
      setupId: " setup-new-game ",
      availableTalentIds: [" talent-a ", "", "talent-b", " "],
      unavailableTalentIds: [" talent-c ", "talent-d"],
      reservedTalentIds: ["", " talent-e "]
    });

    assert.equal(draftPool.setupId, "setup-new-game");
    assert.deepEqual(draftPool.availableTalentIds, ["talent-a", "talent-b"]);
    assert.deepEqual(draftPool.unavailableTalentIds, ["talent-c", "talent-d"]);
    assert.deepEqual(draftPool.reservedTalentIds, ["talent-e"]);
    assert.equal(Object.isFrozen(draftPool.availableTalentIds), true);
    assert.equal(Object.isFrozen(draftPool.unavailableTalentIds), true);
    assert.equal(Object.isFrozen(draftPool.reservedTalentIds), true);
  });

  it("keeps existing engine behavior unchanged when draft pool shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("draft-pool-shell-no-engine-change", 7));

    createDraftPoolEntityShell({
      draftPoolId: "draft-pool-diagnostics-shell",
      setupId: "setup-diagnostics-shell",
      availableTalentIds: ["talent-diagnostics-shell"],
      unavailableTalentIds: [],
      reservedTalentIds: [],
      draftPoolStatus: "placeholder-ready"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("draft-pool-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
