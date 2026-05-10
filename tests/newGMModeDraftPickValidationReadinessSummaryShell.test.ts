import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationContractShell,
  createNewGMModeDraftPickValidationReadinessSummaryShell,
  createNewGMModeDraftPickValidationReadinessValidatorShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_VALIDATION_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Pick Validation Readiness Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftPickValidationReadinessSummaryShell();

    assert.equal(
      summary.draftPickValidationReadinessSummaryId,
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes validation prerequisites while concrete pick validation remains blocked", () => {
    const summary = createNewGMModeDraftPickValidationReadinessSummaryShell();

    assert.equal(summary.draftPickValidationContractAvailable, true);
    assert.equal(summary.validationReadinessValidatorAvailable, true);
    assert.equal(summary.selectionPrerequisiteAvailable, true);
    assert.equal(summary.displayReadinessAvailable, true);
    assert.equal(summary.orderingReadinessAvailable, true);
    assert.equal(summary.draftBoardInputReadinessAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(
      summary.topLevelValidationReadinessPhase,
      "validation-prerequisites-ready-concrete-pick-validation-blocked"
    );
    assert.equal(
      summary.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      true
    );
    assert.deepEqual(summary.validationReadinessSummary, {
      totalFixtureCount: 10,
      displayReadyEligibleCount: 9,
      excludedIneligibleCount: 1,
      validationIssueCount: 0,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false
    });
    assert.equal(summary.concreteDraftPickValidationAvailable, false);
    assert.equal(summary.actualDraftPickExecutionAvailable, false);
  });

  it("reports malformed readiness inputs through the summary", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftPickValidationReadinessSummaryShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(
      summary.topLevelValidationReadinessPhase,
      "insufficient-display-ready-entries"
    );
    assert.equal(
      summary.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      false
    );
    assert.deepEqual(summary.validationReadinessSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 7,
      excludedIneligibleCount: 0,
      validationIssueCount: 8,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false
    });
  });

  it("keeps concrete pick validation and execution unavailable through capability flags", () => {
    const summary = createNewGMModeDraftPickValidationReadinessSummaryShell();

    assert.equal(summary.capabilityFlags.draftPickValidationContractAvailable, true);
    assert.equal(
      summary.capabilityFlags.draftPickValidationReadinessValidatorAvailable,
      true
    );
    assert.equal(
      summary.capabilityFlags.draftPickValidationReadinessSummaryAvailable,
      true
    );
    assert.equal(summary.capabilityFlags.concreteDraftPickValidationAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(summary.capabilityFlags.draftPickCreationAvailable, false);
    assert.equal(summary.capabilityFlags.draftTurnContextAvailable, false);
    assert.equal(summary.capabilityFlags.duplicatePickPreventionAvailable, false);
  });

  it("exposes all draft pick validation readiness shells from the domain index", () => {
    assert.equal(typeof createNewGMModeDraftPickValidationContractShell, "function");
    assert.equal(
      typeof createNewGMModeDraftPickValidationReadinessValidatorShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftPickValidationReadinessSummaryShell,
      "function"
    );
  });

  it("does not choose a wrestler, validate a pick, create pick state, UI, gameplay, or persistence", () => {
    const summary = createNewGMModeDraftPickValidationReadinessSummaryShell();

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_VALIDATION_SUMMARY_DATABASE), false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
    assert.equal(summary.draftOrderStateCreated, false);
    assert.equal(summary.draftBoardUiCreated, false);
    assert.equal(summary.playerFacingDraftBoardCreated, false);
    assert.equal(summary.draftBoardsCreated, false);
    assert.equal(summary.draftPicksCreated, false);
    assert.equal(summary.draftPickValidationExecuted, false);
    assert.equal(summary.draftExecutionExecuted, false);
    assert.equal(summary.rosterAssignmentsCreated, false);
    assert.equal(summary.championshipAssignmentsCreated, false);
    assert.equal(summary.divisionAssignmentsCreated, false);
    assert.equal(summary.matchesCreated, false);
    assert.equal(summary.showsCreated, false);
    assert.equal(summary.weeksCreated, false);
    assert.equal(summary.weekOneUnlocked, false);
    assert.equal(summary.persistencePayloadsCreated, false);
    assert.equal(summary.generatedTextCreated, false);
    assert.equal(summary.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-pick-validation-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationReadinessSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
