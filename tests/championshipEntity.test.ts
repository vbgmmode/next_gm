import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createChampionshipEntityReadiness,
  createChampionshipEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Championship Entity Shell v0.1", () => {
  it("creates valid championship shells with structural placeholders", () => {
    const championship = createChampionshipEntityShell({
      championshipId: "championship-apex-primary",
      displayName: "Apex Primary Championship",
      brandId: "brand-apex",
      divisionId: "division-apex-singles",
      championshipType: "singles-placeholder",
      currentHolder: {
        status: "holder-placeholder",
        talentId: "talent-jade-valor",
        displayName: "Jade Valor"
      }
    });

    assert.deepEqual(championship, {
      championshipId: "championship-apex-primary",
      displayName: "Apex Primary Championship",
      brandId: "brand-apex",
      divisionId: "division-apex-singles",
      championshipType: "singles-placeholder",
      currentHolder: {
        status: "holder-placeholder",
        talentId: "talent-jade-valor",
        displayName: "Jade Valor"
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        championshipType: "singles-placeholder",
        holderStatus: "holder-placeholder",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing required identity fields structurally", () => {
    const championship = createChampionshipEntityShell({
      championshipId: " ",
      displayName: ""
    });

    assert.deepEqual(championship.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-championship-id", "missing-display-name"],
      championshipType: "unassigned",
      holderStatus: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createChampionshipEntityReadiness({
        championshipId: "championship-id",
        displayName: ""
      }).issues,
      ["missing-display-name"]
    );
  });

  it("keeps championship readiness diagnostics-only", () => {
    const championship = createChampionshipEntityShell({
      championshipId: "championship-independent",
      displayName: "Independent Championship",
      championshipType: "specialty-placeholder",
      currentHolder: { status: "unassigned" }
    });

    assert.equal(championship.readiness.status, "diagnostics-only");
    assert.equal(championship.readiness.championshipType, "specialty-placeholder");
    assert.equal(championship.readiness.gameplayAffecting, false);
    assert.equal(championship.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(championship, "titleHistory"), false);
    assert.equal(Object.hasOwn(championship, "reignLength"), false);
    assert.equal(Object.hasOwn(championship, "defenses"), false);
    assert.equal(Object.hasOwn(championship, "titleChangeLogic"), false);
  });

  it("keeps existing engine behavior unchanged when championship shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("championship-shell-no-engine-change", 7));

    createChampionshipEntityShell({
      championshipId: "championship-diagnostics-shell",
      displayName: "Diagnostics Championship",
      brandId: "brand-diagnostics-shell",
      divisionId: "division-diagnostics-shell",
      championshipType: "world-placeholder",
      currentHolder: { status: "holder-placeholder" }
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("championship-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
