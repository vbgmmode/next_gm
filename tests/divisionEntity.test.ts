import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDivisionEntityReadiness,
  createDivisionEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Division Entity Shell v0.1", () => {
  it("creates valid division shells with structural placeholders", () => {
    const division = createDivisionEntityShell({
      divisionId: "division-apex-singles",
      displayName: "Apex Singles",
      brandId: "brand-apex",
      eligibility: "singles-placeholder",
      championshipAssociation: {
        status: "championship-placeholder",
        championshipId: "championship-apex-primary",
        displayName: "Apex Primary Championship"
      }
    });

    assert.deepEqual(division, {
      divisionId: "division-apex-singles",
      displayName: "Apex Singles",
      brandId: "brand-apex",
      eligibility: "singles-placeholder",
      championshipAssociation: {
        status: "championship-placeholder",
        championshipId: "championship-apex-primary",
        displayName: "Apex Primary Championship"
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        eligibility: "singles-placeholder",
        championshipAssociationStatus: "championship-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing required identity fields structurally", () => {
    const division = createDivisionEntityShell({
      divisionId: " ",
      displayName: ""
    });

    assert.deepEqual(division.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-division-id", "missing-display-name"],
      eligibility: "open",
      championshipAssociationStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createDivisionEntityReadiness({ divisionId: "division-id", displayName: "" }).issues,
      ["missing-display-name"]
    );
  });

  it("keeps division readiness diagnostics-only", () => {
    const division = createDivisionEntityShell({
      divisionId: "division-independent",
      displayName: "Independent Division",
      eligibility: "specialty-placeholder",
      championshipAssociation: { status: "unassigned" }
    });

    assert.equal(division.readiness.status, "diagnostics-only");
    assert.equal(division.readiness.eligibility, "specialty-placeholder");
    assert.equal(division.readiness.gameplayAffecting, false);
    assert.equal(division.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(division, "rankings"), false);
    assert.equal(Object.hasOwn(division, "contenders"), false);
    assert.equal(Object.hasOwn(division, "records"), false);
    assert.equal(Object.hasOwn(division, "bookingLogic"), false);
  });

  it("keeps existing engine behavior unchanged when division shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("division-shell-no-engine-change", 7));

    createDivisionEntityShell({
      divisionId: "division-diagnostics-shell",
      displayName: "Diagnostics Division",
      brandId: "brand-diagnostics-shell",
      eligibility: "open",
      championshipAssociation: { status: "championship-placeholder" }
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("division-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
