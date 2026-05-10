import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createGameSetupEntityReadiness,
  createGameSetupEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Game Setup Entity Shell v0.1", () => {
  it("creates valid setup shells with structural placeholders", () => {
    const setup = createGameSetupEntityShell({
      setupId: "setup-new-game",
      availableBrandIds: ["brand-apex", "brand-rival", " "],
      selectedBrandId: "brand-apex",
      managerIds: ["manager-player", "manager-ai"],
      playerManagerId: "manager-player",
      aiManagerIds: ["manager-ai"],
      rosterPoolStatus: "placeholder-ready",
      divisionSetupStatus: "pending-placeholder",
      championshipSetupStatus: "pending-placeholder"
    });

    assert.deepEqual(setup, {
      setupId: "setup-new-game",
      availableBrandIds: ["brand-apex", "brand-rival"],
      selectedBrandId: "brand-apex",
      managerIds: ["manager-player", "manager-ai"],
      playerManagerId: "manager-player",
      aiManagerIds: ["manager-ai"],
      rosterPoolStatus: "placeholder-ready",
      divisionSetupStatus: "pending-placeholder",
      championshipSetupStatus: "pending-placeholder",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        rosterPoolStatus: "placeholder-ready",
        divisionSetupStatus: "pending-placeholder",
        championshipSetupStatus: "pending-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing setup identity structurally", () => {
    const setup = createGameSetupEntityShell({
      setupId: " "
    });

    assert.deepEqual(setup.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-setup-id"],
      rosterPoolStatus: "unassigned",
      divisionSetupStatus: "unassigned",
      championshipSetupStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(createGameSetupEntityReadiness({ setupId: "" }).issues, ["missing-setup-id"]);
  });

  it("keeps setup readiness diagnostics-only", () => {
    const setup = createGameSetupEntityShell({
      setupId: "setup-diagnostics",
      rosterPoolStatus: "pending-placeholder",
      divisionSetupStatus: "placeholder-ready",
      championshipSetupStatus: "placeholder-ready"
    });

    assert.equal(setup.readiness.status, "diagnostics-only");
    assert.equal(setup.readiness.gameplayAffecting, false);
    assert.equal(setup.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(setup, "brandSelectionFlow"), false);
    assert.equal(Object.hasOwn(setup, "draftLogic"), false);
    assert.equal(Object.hasOwn(setup, "aiAssignmentLogic"), false);
    assert.equal(Object.hasOwn(setup, "saveCreation"), false);
    assert.equal(Object.hasOwn(setup, "businessSystem"), false);
  });

  it("keeps existing engine behavior unchanged when setup shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("setup-shell-no-engine-change", 7));

    createGameSetupEntityShell({
      setupId: "setup-diagnostics-shell",
      availableBrandIds: ["brand-diagnostics-shell"],
      selectedBrandId: "brand-diagnostics-shell",
      managerIds: ["manager-diagnostics-shell"],
      playerManagerId: "manager-diagnostics-shell",
      aiManagerIds: [],
      rosterPoolStatus: "placeholder-ready",
      divisionSetupStatus: "pending-placeholder",
      championshipSetupStatus: "pending-placeholder"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("setup-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
