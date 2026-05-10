import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createRosterEntityReadiness,
  createRosterEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Roster Entity Shell v0.1", () => {
  it("creates valid roster entities with structural placeholders", () => {
    const entity = createRosterEntityShell({
      talentId: "talent-jade-valor",
      displayName: "Jade Valor",
      brandId: "brand-apex",
      brandStatus: "brand-placeholder",
      divisionEligibility: ["singles-placeholder", "tag-placeholder"],
      role: "in-ring-placeholder",
      alignment: "face-placeholder"
    });

    assert.deepEqual(entity, {
      talentId: "talent-jade-valor",
      displayName: "Jade Valor",
      brandId: "brand-apex",
      brandStatus: "brand-placeholder",
      divisionEligibility: ["singles-placeholder", "tag-placeholder"],
      role: "in-ring-placeholder",
      alignment: "face-placeholder",
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing required identity fields structurally", () => {
    const entity = createRosterEntityShell({
      talentId: " ",
      displayName: ""
    });

    assert.deepEqual(entity.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-talent-id", "missing-display-name"],
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createRosterEntityReadiness({ talentId: "talent-id", displayName: "" }).issues,
      ["missing-display-name"]
    );
  });

  it("keeps roster readiness diagnostics-only", () => {
    const entity = createRosterEntityShell({
      talentId: "talent-rio-ace",
      displayName: "Rio Ace"
    });

    assert.equal(entity.readiness.status, "diagnostics-only");
    assert.equal(entity.readiness.gameplayAffecting, false);
    assert.equal(entity.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(entity, "popularity"), false);
    assert.equal(Object.hasOwn(entity, "morale"), false);
    assert.equal(Object.hasOwn(entity, "stamina"), false);
    assert.equal(Object.hasOwn(entity, "momentum"), false);
  });

  it("keeps existing engine behavior unchanged when roster shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("roster-shell-no-engine-change", 7));

    createRosterEntityShell({
      talentId: "talent-independent-shell",
      displayName: "Independent Shell",
      brandStatus: "inactive-placeholder",
      divisionEligibility: ["open"],
      role: "non-wrestling-placeholder",
      alignment: "unassigned"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("roster-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
