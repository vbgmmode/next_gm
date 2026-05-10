import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeSetupSelectionValidatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-setup-selection-validator-should-not-exist.sqlite";

const VALID_SELECTION = Object.freeze({
  promotionOrBrandId: "wwe-raw",
  managerIdentityTypeId: "custom-gm",
  difficultyModeId: "normal",
  draftModeId: "draft-required-before-week-1",
  startingWeekOptionId: "week-0-setup-phase",
  saveIdentityPrerequisiteSatisfied: true
});

describe("New GM Mode Setup Selection Validator Shell v0.1", () => {
  it("valid catalog IDs produce structurally valid setup selection output", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.selectionValidity, "structurally-valid");
    assert.equal(result.setupReadiness, "blocked");
    assert.equal(result.setupReadinessSummary.structurallyValidSelection, true);
    assert.equal(result.setupReadinessSummary.validSelectionCount, 6);
    assert.equal(result.setupReadinessSummary.saveIdentityPrerequisiteSatisfied, true);
    assert.equal(result.setupReadinessSummary.draftComplete, false);
    assert.equal(result.setupReadinessSummary.playableStartReady, false);
    assert.deepEqual(result.validationIssues, [
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
    assert.deepEqual(result.blockedReasons, [
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects missing promotion or brand deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      promotionOrBrandId: undefined
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "missing-promotion-or-brand",
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects missing manager identity type deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      managerIdentityTypeId: undefined
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "missing-manager-identity-type",
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects missing difficulty mode deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      difficultyModeId: undefined
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "missing-difficulty-mode",
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects missing draft status or mode deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      draftModeId: undefined
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "missing-draft-status-or-mode",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects missing starting week option deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      startingWeekOptionId: undefined
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "missing-starting-week-option",
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("rejects unknown IDs deterministically", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      promotionOrBrandId: "unknown-brand",
      managerIdentityTypeId: "unknown-manager",
      difficultyModeId: "unknown-difficulty",
      draftStatusId: "unknown-draft",
      startingWeekOptionId: "unknown-week",
      saveIdentityPrerequisiteSatisfied: true
    });

    assert.equal(result.selectionValidity, "blocked");
    assert.deepEqual(result.validationIssues, [
      "unknown-promotion-or-brand",
      "unknown-manager-identity-type",
      "unknown-difficulty-mode",
      "unknown-draft-status-or-mode",
      "unknown-starting-week-option",
      "gameplay-start-not-implemented"
    ]);
    assert.deepEqual(result.blockedReasons, [
      "gameplay-start-not-implemented"
    ]);
  });

  it("saveIdentityPrerequisiteSatisfied false blocks readiness", () => {
    const result = createNewGMModeSetupSelectionValidatorShell({
      ...VALID_SELECTION,
      saveIdentityPrerequisiteSatisfied: false
    });

    assert.equal(result.selectionValidity, "structurally-valid");
    assert.equal(result.setupReadiness, "blocked");
    assert.equal(result.setupReadinessSummary.saveIdentityPrerequisiteSatisfied, false);
    assert.deepEqual(result.blockedReasons, [
      "save-identity-prerequisite-not-satisfied",
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("draft incomplete blocks gameplay readiness", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.setupReadiness, "blocked");
    assert.equal(result.setupReadinessSummary.draftComplete, false);
    assert.equal(result.draftExecutionAvailable, false);
    assert.equal(result.gameplayStartAvailable, false);
    assert.equal(result.blockedReasons.includes("draft-incomplete"), true);
  });

  it("reports diagnosticsOnly true and playerFacing false", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.status, "diagnostics-only");
    assert.equal(result.validatorId, "new-gm-mode-setup-selection-validator-v0.1");
    assert.equal(result.diagnosticsOnly, true);
    assert.equal(result.playerFacing, false);
    assert.equal(result.gameplayAffecting, false);
  });

  it("reports setup validation capabilities without enabling gameplay", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.setupContractAvailable, true);
    assert.equal(result.setupOptionsCatalogAvailable, true);
    assert.equal(result.setupSelectionValidationAvailable, true);
    assert.equal(result.gameplayStartAvailable, false);
    assert.equal(result.draftExecutionAvailable, false);
    assert.equal(result.rosterAssignmentAvailable, false);
    assert.equal(result.titleAssignmentAvailable, false);
    assert.equal(result.weeklyLoopAvailable, false);
    assert.equal(result.uiWiringAvailable, false);
    assert.equal(result.gameplayPayloadPersistenceAvailable, false);
  });

  it("does not create a save or write to SQLite", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.saveCreated, false);
    assert.equal(result.sqliteWritten, false);
    assert.equal(result.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_VALIDATOR_DATABASE), false);
    assert.equal(Object.hasOwn(result, "saveRepository"), false);
    assert.equal(Object.hasOwn(result, "createSave"), false);
    assert.equal(Object.hasOwn(result, "sqliteConnection"), false);
  });

  it("does not create rosters, championships, divisions, matches, shows, or weeks", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.gameplayStateCreated, false);
    assert.equal(result.rostersCreated, false);
    assert.equal(result.championshipsCreated, false);
    assert.equal(result.divisionsCreated, false);
    assert.equal(result.matchesCreated, false);
    assert.equal(result.showsCreated, false);
    assert.equal(result.weeksCreated, false);
    assert.equal(Object.hasOwn(result, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(result, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(result, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(result, "matchSimulation"), false);
    assert.equal(Object.hasOwn(result, "showBooking"), false);
    assert.equal(Object.hasOwn(result, "weekState"), false);
  });

  it("does not execute draft logic or enable gameplay start", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.draftLogicExecuted, false);
    assert.equal(result.gameplayStartAvailable, false);
    assert.equal(result.matchSimulationExecuted, false);
    assert.equal(result.showBookingCreated, false);
    assert.equal(result.businessSystemsRun, false);
    assert.equal(result.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(result, "draftExecution"), false);
    assert.equal(Object.hasOwn(result, "gameplayStart"), false);
    assert.equal(Object.hasOwn(result, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const result = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.equal(result.generatedTextCreated, false);
    assert.equal(result.genAIUsed, false);
    assert.equal(Object.hasOwn(result, "generatedText"), false);
    assert.equal(Object.hasOwn(result, "genAIClient"), false);
    assert.equal(Object.hasOwn(result, "prompt"), false);
    assert.equal(Object.hasOwn(result, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstResult = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);
    const secondResult = createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    assert.deepEqual(secondResult, firstResult);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-setup-selection-validator-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeSetupSelectionValidatorShell(VALID_SELECTION);

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
