import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createBrandEntityReadiness,
  createBrandEntityShell
} from "../src/game/domain/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";
import { matchEngine } from "../src/game/engines/index.ts";

describe("Brand Entity Shell v0.1", () => {
  it("creates valid brand shells with structural placeholders", () => {
    const brand = createBrandEntityShell({
      brandId: "brand-apex",
      displayName: "Apex Wrestling",
      brandTheme: "sports-forward-placeholder",
      weeklyShow: {
        status: "weekly-show-placeholder",
        showId: "show-apex-weekly",
        displayName: "Apex Friday Fight"
      },
      manager: {
        status: "manager-placeholder",
        managerId: "manager-player",
        displayName: "Player Booker"
      },
      rosterAssignmentReadiness: "placeholder-ready"
    });

    assert.deepEqual(brand, {
      brandId: "brand-apex",
      displayName: "Apex Wrestling",
      brandTheme: "sports-forward-placeholder",
      weeklyShow: {
        status: "weekly-show-placeholder",
        showId: "show-apex-weekly",
        displayName: "Apex Friday Fight"
      },
      manager: {
        status: "manager-placeholder",
        managerId: "manager-player",
        displayName: "Player Booker"
      },
      readiness: {
        status: "diagnostics-only",
        structurallyReady: true,
        issues: [],
        rosterAssignmentReadiness: "placeholder-ready",
        gameplayAffecting: false,
        playerFacing: false
      }
    });
  });

  it("reports missing required identity fields structurally", () => {
    const brand = createBrandEntityShell({
      brandId: " ",
      displayName: ""
    });

    assert.deepEqual(brand.readiness, {
      status: "diagnostics-only",
      structurallyReady: false,
      issues: ["missing-brand-id", "missing-display-name"],
      rosterAssignmentReadiness: "unassigned",
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(
      createBrandEntityReadiness({ brandId: "brand-id", displayName: "" }).issues,
      ["missing-display-name"]
    );
  });

  it("keeps brand readiness diagnostics-only", () => {
    const brand = createBrandEntityShell({
      brandId: "brand-independent",
      displayName: "Independent Brand",
      rosterAssignmentReadiness: "pending-placeholder"
    });

    assert.equal(brand.readiness.status, "diagnostics-only");
    assert.equal(brand.readiness.rosterAssignmentReadiness, "pending-placeholder");
    assert.equal(brand.readiness.gameplayAffecting, false);
    assert.equal(brand.readiness.playerFacing, false);
    assert.equal(Object.hasOwn(brand, "score"), false);
    assert.equal(Object.hasOwn(brand, "bookingBehavior"), false);
    assert.equal(Object.hasOwn(brand, "businessModel"), false);
  });

  it("keeps existing engine behavior unchanged when brand shells are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("brand-shell-no-engine-change", 7));

    createBrandEntityShell({
      brandId: "brand-diagnostics-shell",
      displayName: "Diagnostics Shell",
      brandTheme: "hybrid-placeholder",
      weeklyShow: { status: "weekly-show-placeholder" },
      manager: { status: "unassigned" },
      rosterAssignmentReadiness: "placeholder-ready"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext("brand-shell-no-engine-change", 7));

    assert.deepEqual(secondResult, firstResult);
  });
});
