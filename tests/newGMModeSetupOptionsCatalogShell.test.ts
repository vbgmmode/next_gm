import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeSetupOptionsCatalogShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_CATALOG_DATABASE =
  "data/saves/__new-gm-mode-setup-options-catalog-should-not-exist.sqlite";

describe("New GM Mode Setup Options Catalog Shell v0.1", () => {
  it("reports diagnosticsOnly true and playerFacing false", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.status, "diagnostics-only");
    assert.equal(catalog.diagnosticsOnly, true);
    assert.equal(catalog.playerFacing, false);
    assert.equal(catalog.gameplayAffecting, false);
    assert.equal(catalog.catalogId, "new-gm-mode-setup-options-catalog-v0.1");
    assert.equal(catalog.deterministicOrdering, true);
  });

  it("includes promotions and brands with stable IDs and deterministic order", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(catalog.promotionsBrands, [
      {
        id: "wwe-raw",
        label: "WWE Raw",
        availability: "available-contract-option"
      },
      {
        id: "wwe-smackdown",
        label: "WWE SmackDown",
        availability: "available-contract-option"
      },
      {
        id: "wwe-nxt",
        label: "WWE NXT",
        availability: "available-contract-option"
      },
      {
        id: "aew-dynamite",
        label: "AEW Dynamite",
        availability: "available-contract-option"
      },
      {
        id: "aew-collision",
        label: "AEW Collision",
        availability: "available-contract-option"
      }
    ]);
  });

  it("includes manager identity types with stable IDs and deterministic order", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(catalog.managerIdentityTypes, [
      {
        id: "custom-gm",
        label: "Custom GM",
        availability: "available-contract-option"
      },
      {
        id: "existing-authority-figure",
        label: "Existing Authority Figure",
        availability: "available-contract-option"
      },
      {
        id: "anonymous-owner-representative",
        label: "Anonymous/Owner Representative",
        availability: "available-contract-option"
      }
    ]);
  });

  it("includes difficulty modes with stable IDs and deterministic order", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(catalog.difficultyModes, [
      {
        id: "easy",
        label: "Easy",
        availability: "available-contract-option"
      },
      {
        id: "normal",
        label: "Normal",
        availability: "available-contract-option"
      },
      {
        id: "hard",
        label: "Hard",
        availability: "available-contract-option"
      },
      {
        id: "legend",
        label: "Legend",
        availability: "available-contract-option"
      }
    ]);
  });

  it("includes draft requirement and status options", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(catalog.draftModes, [
      {
        id: "draft-required-before-week-1",
        label: "Draft required before Week 1",
        availability: "blocked-until-implementation",
        blockedReason: "draft-execution-not-implemented"
      },
      {
        id: "manual-draft-planned-not-implemented",
        label: "Manual draft planned but not implemented",
        availability: "planned-not-implemented",
        blockedReason: "draft-execution-not-implemented"
      },
      {
        id: "ai-assisted-draft-planned-not-implemented",
        label: "AI-assisted draft planned but not implemented",
        availability: "planned-not-implemented",
        blockedReason: "draft-execution-not-implemented"
      }
    ]);
    assert.equal(catalog.draftExecutionAvailable, false);
  });

  it("includes starting calendar and week options", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(catalog.startingCalendarWeekOptions, [
      {
        id: "week-0-setup-phase",
        label: "Week 0 setup phase",
        availability: "available-contract-option"
      },
      {
        id: "week-1-locked-until-draft-completion",
        label: "Week 1 locked until draft completion",
        availability: "blocked-until-implementation",
        blockedReason: "weekly-loop-not-implemented"
      }
    ]);
    assert.equal(catalog.weeklyLoopAvailable, false);
  });

  it("reports setup catalog capabilities without enabling gameplay", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.setupContractAvailable, true);
    assert.equal(catalog.setupOptionsCatalogAvailable, true);
    assert.equal(catalog.gameplayStartAvailable, false);
    assert.equal(catalog.rosterAssignmentAvailable, false);
    assert.equal(catalog.titleAssignmentAvailable, false);
    assert.equal(catalog.uiWiringAvailable, false);
    assert.equal(catalog.gameplayPayloadPersistenceAvailable, false);
    assert.deepEqual(catalog.blockedReasons, [
      "catalog-options-only",
      "gameplay-start-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "title-assignment-not-implemented",
      "weekly-loop-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.saveCreated, false);
    assert.equal(catalog.sqliteWritten, false);
    assert.equal(catalog.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_CATALOG_DATABASE), false);
    assert.equal(Object.hasOwn(catalog, "saveRepository"), false);
    assert.equal(Object.hasOwn(catalog, "createSave"), false);
    assert.equal(Object.hasOwn(catalog, "sqliteConnection"), false);
  });

  it("does not create rosters, championships, divisions, matches, shows, or weeks", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.rostersCreated, false);
    assert.equal(catalog.championshipsCreated, false);
    assert.equal(catalog.divisionsCreated, false);
    assert.equal(catalog.matchesCreated, false);
    assert.equal(catalog.showsCreated, false);
    assert.equal(catalog.weeksCreated, false);
    assert.equal(Object.hasOwn(catalog, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(catalog, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(catalog, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(catalog, "matchSimulation"), false);
    assert.equal(Object.hasOwn(catalog, "showBooking"), false);
    assert.equal(Object.hasOwn(catalog, "weekState"), false);
  });

  it("does not execute draft logic or enable gameplay start", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.draftLogicExecuted, false);
    assert.equal(catalog.gameplayStartAvailable, false);
    assert.equal(catalog.matchSimulationExecuted, false);
    assert.equal(catalog.showBookingCreated, false);
    assert.equal(catalog.businessSystemsRun, false);
    assert.equal(catalog.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(catalog, "draftExecution"), false);
    assert.equal(Object.hasOwn(catalog, "gameplayStart"), false);
    assert.equal(Object.hasOwn(catalog, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const catalog = createNewGMModeSetupOptionsCatalogShell();

    assert.equal(catalog.generatedTextCreated, false);
    assert.equal(catalog.genAIUsed, false);
    assert.equal(Object.hasOwn(catalog, "generatedText"), false);
    assert.equal(Object.hasOwn(catalog, "genAIClient"), false);
    assert.equal(Object.hasOwn(catalog, "prompt"), false);
    assert.equal(Object.hasOwn(catalog, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstCatalog = createNewGMModeSetupOptionsCatalogShell();
    const secondCatalog = createNewGMModeSetupOptionsCatalogShell();

    assert.deepEqual(secondCatalog, firstCatalog);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-setup-options-catalog-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeSetupOptionsCatalogShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
