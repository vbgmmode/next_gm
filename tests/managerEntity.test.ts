import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createManagerEntityReadiness,
  createManagerEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Manager Entity Shell v0.1", () => {
  it("creates valid manager shells with structural placeholders", () => {
    const manager = createManagerEntityShell({
      managerId: "manager-player",
      displayName: "Player Booker",
      controlledBrandId: "brand-apex",
      controlledBrandStatus: "brand-placeholder",
      controlType: "player-placeholder",
      personaStyle: "story-focused-placeholder"
    });

    assert.deepEqual(manager, {
      managerId: "manager-player",
      displayName: "Player Booker",
      controlledBrandId: "brand-apex",
      controlledBrandStatus: "brand-placeholder",
      controlType: "player-placeholder",
      personaStyle: "story-focused-placeholder",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        controlledBrandStatus: "brand-placeholder",
        controlType: "player-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing required identity fields structurally", () => {
    const manager = createManagerEntityShell({
      managerId: " ",
      displayName: ""
    });

    assert.deepEqual(manager.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-manager-id", "missing-display-name"],
      controlledBrandStatus: "unassigned",
      controlType: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createManagerEntityReadiness({ managerId: "manager-id", displayName: "" }).issues,
      ["missing-display-name"]
    );
  });

  it("keeps manager readiness diagnostics-only", () => {
    const manager = createManagerEntityShell({
      managerId: "manager-independent",
      displayName: "Independent Manager",
      controlType: "ai-placeholder",
      personaStyle: "analytical-placeholder"
    });

    assert.equal(manager.readiness.status, "diagnostics-only");
    assert.equal(manager.readiness.controlType, "ai-placeholder");
    assert.equal(manager.readiness.gameplayAffecting, false);
    assert.equal(manager.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(manager, "ratings"), false);
    assert.equal(Object.hasOwn(manager, "perks"), false);
    assert.equal(Object.hasOwn(manager, "budget"), false);
    assert.equal(Object.hasOwn(manager, "bookingBehavior"), false);
    assert.equal(Object.hasOwn(manager, "progression"), false);
  });

  it("keeps existing engine behavior unchanged when manager shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("manager-shell-no-engine-change", 7));

    createManagerEntityShell({
      managerId: "manager-diagnostics-shell",
      displayName: "Diagnostics Manager",
      controlledBrandId: "brand-diagnostics-shell",
      controlType: "ai-placeholder",
      personaStyle: "balanced-placeholder"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("manager-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
