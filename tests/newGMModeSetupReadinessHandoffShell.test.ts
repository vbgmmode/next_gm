import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeSetupReadinessHandoffShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_HANDOFF_DATABASE =
  "data/saves/__new-gm-mode-setup-readiness-handoff-should-not-exist.sqlite";

const VALID_STRUCTURAL_SELECTION = Object.freeze({
  promotionOrBrandId: "wwe-raw",
  managerIdentityTypeId: "custom-gm",
  difficultyModeId: "normal",
  draftModeId: "draft-required-before-week-1",
  startingWeekOptionId: "week-0-setup-phase",
  saveIdentityPrerequisiteSatisfied: true,
  draftComplete: true
});

describe("New GM Mode Setup Readiness Handoff Shell v0.1", () => {
  it("reports diagnosticsOnly true and playerFacing false", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.status, "diagnostics-only");
    assert.equal(handoff.handoffId, "new-gm-mode-setup-readiness-handoff-v0.1");
    assert.equal(handoff.diagnosticsOnly, true);
    assert.equal(handoff.playerFacing, false);
    assert.equal(handoff.gameplayAffecting, false);
  });

  it("includes setup contract summary", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(
      handoff.setupContractSummary.setupContractId,
      "new-gm-mode-setup-contract-v0.1"
    );
    assert.equal(handoff.setupContractSummary.requiredInputCount, 8);
    assert.equal(handoff.setupContractSummary.gameplayStartAvailable, false);
    assert.deepEqual(handoff.setupContractSummary.requiredFutureSetupInputs, [
      "selected-promotion-or-brand",
      "selected-manager-identity",
      "difficulty-mode",
      "draft-requirement",
      "starting-calendar-week-state",
      "roster-setup-requirement",
      "championship-division-setup-requirement",
      "save-identity-prerequisite"
    ]);
  });

  it("includes setup options catalog availability", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.setupOptionsCatalogAvailable, true);
    assert.equal(
      handoff.setupOptionsCatalogSummary.catalogId,
      "new-gm-mode-setup-options-catalog-v0.1"
    );
    assert.deepEqual(handoff.setupOptionsCatalogSummary, {
      catalogId: "new-gm-mode-setup-options-catalog-v0.1",
      setupOptionsCatalogAvailable: true,
      promotionOrBrandOptionCount: 5,
      managerIdentityTypeOptionCount: 3,
      difficultyModeOptionCount: 4,
      draftModeOptionCount: 3,
      startingCalendarWeekOptionCount: 2
    });
  });

  it("includes selection validation summary", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.deepEqual(handoff.selectionValidationSummary, {
      validatorId: "new-gm-mode-setup-selection-validator-v0.1",
      selectionValidity: "structurally-valid",
      structurallyValidSelection: true,
      validSelectionCount: 6,
      validationIssues: ["gameplay-start-not-implemented"],
      blockedReasons: ["gameplay-start-not-implemented"]
    });
    assert.deepEqual(handoff.requiredInputsSummary, {
      requiredSelectionCount: 6,
      validSelectionCount: 6,
      missingOrInvalidSelectionCount: 0
    });
  });

  it("missing selections produce deterministic blocked readiness", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell({
      ...VALID_STRUCTURAL_SELECTION,
      promotionOrBrandId: undefined
    });

    assert.equal(handoff.readinessPhase, "blocked_missing_selection");
    assert.deepEqual(handoff.missingOrInvalidSelections, [
      "missing-promotion-or-brand"
    ]);
    assert.deepEqual(handoff.readinessIssues, [
      "missing-promotion-or-brand",
      "gameplay-start-not-implemented"
    ]);
  });

  it("unknown IDs produce deterministic blocked readiness", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell({
      promotionOrBrandId: "unknown-brand",
      managerIdentityTypeId: "unknown-manager",
      difficultyModeId: "unknown-difficulty",
      draftModeId: "unknown-draft",
      startingWeekOptionId: "unknown-week",
      saveIdentityPrerequisiteSatisfied: true,
      draftComplete: true
    });

    assert.equal(handoff.readinessPhase, "blocked_invalid_selection");
    assert.deepEqual(handoff.missingOrInvalidSelections, [
      "unknown-promotion-or-brand",
      "unknown-manager-identity-type",
      "unknown-difficulty-mode",
      "unknown-draft-status-or-mode",
      "unknown-starting-week-option"
    ]);
    assert.deepEqual(handoff.readinessIssues, [
      "unknown-promotion-or-brand",
      "unknown-manager-identity-type",
      "unknown-difficulty-mode",
      "unknown-draft-status-or-mode",
      "unknown-starting-week-option",
      "gameplay-start-not-implemented"
    ]);
  });

  it("unsatisfied save identity prerequisite produces deterministic blocked readiness", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell({
      ...VALID_STRUCTURAL_SELECTION,
      saveIdentityPrerequisiteSatisfied: false
    });

    assert.equal(handoff.readinessPhase, "blocked_save_identity_prerequisite");
    assert.equal(handoff.saveIdentityPrerequisiteStatus, "unsatisfied");
    assert.deepEqual(handoff.readinessIssues, [
      "save-identity-prerequisite-not-satisfied",
      "gameplay-start-not-implemented"
    ]);
  });

  it("incomplete draft produces deterministic blocked readiness", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell({
      ...VALID_STRUCTURAL_SELECTION,
      draftComplete: false
    });

    assert.equal(handoff.readinessPhase, "blocked_draft_incomplete");
    assert.equal(handoff.draftCompletionStatus, "incomplete");
    assert.deepEqual(handoff.readinessIssues, [
      "draft-incomplete",
      "gameplay-start-not-implemented"
    ]);
  });

  it("fully valid structural setup keeps gameplay start unavailable", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(
      handoff.readinessPhase,
      "structurally_ready_gameplay_start_unavailable"
    );
    assert.equal(handoff.saveIdentityPrerequisiteStatus, "satisfied");
    assert.equal(handoff.draftCompletionStatus, "complete");
    assert.deepEqual(handoff.readinessIssues, [
      "gameplay-start-not-implemented"
    ]);
    assert.equal(handoff.gameplayStartAvailable, false);
  });

  it("reports handoff capabilities without enabling gameplay", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.setupContractAvailable, true);
    assert.equal(handoff.setupOptionsCatalogAvailable, true);
    assert.equal(handoff.setupSelectionValidationAvailable, true);
    assert.equal(handoff.setupReadinessHandoffAvailable, true);
    assert.equal(handoff.gameplayStartAvailable, false);
    assert.equal(handoff.draftExecutionAvailable, false);
    assert.equal(handoff.rosterAssignmentAvailable, false);
    assert.equal(handoff.titleAssignmentAvailable, false);
    assert.equal(handoff.weeklyLoopAvailable, false);
    assert.equal(handoff.uiWiringAvailable, false);
    assert.equal(handoff.gameplayPayloadPersistenceAvailable, false);
  });

  it("does not create a save or write to SQLite", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.saveCreated, false);
    assert.equal(handoff.sqliteWritten, false);
    assert.equal(handoff.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_HANDOFF_DATABASE), false);
    assert.equal(Object.hasOwn(handoff, "saveRepository"), false);
    assert.equal(Object.hasOwn(handoff, "createSave"), false);
    assert.equal(Object.hasOwn(handoff, "sqliteConnection"), false);
  });

  it("does not create gameplay state or setup entities", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.gameplayStateCreated, false);
    assert.equal(handoff.rostersCreated, false);
    assert.equal(handoff.championshipsCreated, false);
    assert.equal(handoff.divisionsCreated, false);
    assert.equal(handoff.matchesCreated, false);
    assert.equal(handoff.showsCreated, false);
    assert.equal(handoff.weeksCreated, false);
    assert.equal(Object.hasOwn(handoff, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(handoff, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(handoff, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(handoff, "matchSimulation"), false);
    assert.equal(Object.hasOwn(handoff, "showBooking"), false);
    assert.equal(Object.hasOwn(handoff, "weekState"), false);
  });

  it("does not execute draft logic or enable gameplay start", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.draftLogicExecuted, false);
    assert.equal(handoff.gameplayStartAvailable, false);
    assert.equal(handoff.matchSimulationExecuted, false);
    assert.equal(handoff.showBookingCreated, false);
    assert.equal(handoff.businessSystemsRun, false);
    assert.equal(handoff.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(handoff, "draftExecution"), false);
    assert.equal(Object.hasOwn(handoff, "gameplayStart"), false);
    assert.equal(Object.hasOwn(handoff, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const handoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.equal(handoff.generatedTextCreated, false);
    assert.equal(handoff.genAIUsed, false);
    assert.equal(Object.hasOwn(handoff, "generatedText"), false);
    assert.equal(Object.hasOwn(handoff, "genAIClient"), false);
    assert.equal(Object.hasOwn(handoff, "prompt"), false);
    assert.equal(Object.hasOwn(handoff, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstHandoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );
    const secondHandoff = createNewGMModeSetupReadinessHandoffShell(
      VALID_STRUCTURAL_SELECTION
    );

    assert.deepEqual(secondHandoff, firstHandoff);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-setup-readiness-handoff-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeSetupReadinessHandoffShell(VALID_STRUCTURAL_SELECTION);

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
