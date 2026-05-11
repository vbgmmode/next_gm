import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
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

const UNTOUCHED_DRAFT_PICK_VALIDATION_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-validator-should-not-exist.sqlite";
const draftPickValidationReadinessValidator =
  createNewGMModeDraftPickValidationReadinessValidatorShell();

describe("New GM Mode Draft Pick Validation Readiness Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator = draftPickValidationReadinessValidator;

    assert.equal(
      validator.draftPickValidationReadinessValidatorId,
      "new-gm-mode-draft-pick-validation-readiness-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
    assert.equal(validator.draftPickValidationReadinessOnly, true);
  });

  it("reports validation prerequisites ready while concrete pick validation remains blocked", () => {
    const validator = draftPickValidationReadinessValidator;

    assert.equal(validator.draftPickValidationContractAvailable, true);
    assert.equal(validator.selectionPrerequisiteSummaryAvailable, true);
    assert.equal(validator.displayReadinessAvailable, true);
    assert.equal(validator.orderingReadinessAvailable, true);
    assert.equal(validator.draftBoardInputReadinessAvailable, true);
    assert.equal(validator.talentPoolReadinessAvailable, true);
    assert.equal(validator.rosterSlotRequirementAvailable, true);
    assert.equal(validator.championshipDivisionRequirementAvailable, true);
    assert.equal(
      validator.validationReadinessPhase,
      "validation-prerequisites-ready-concrete-pick-validation-blocked"
    );
    assert.equal(
      validator.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      true
    );
    assert.deepEqual(validator.validationReadinessSummary, {
      totalFixtureCount: 245,
      displayReadyEligibleCount: 235,
      excludedIneligibleCount: 10,
      expectedFixtureCount: 245,
      expectedDisplayReadyEligibleCount: 235,
      expectedExcludedIneligibleCount: 10,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false,
      validationIssueCount: 0
    });
    assert.deepEqual(validator.validationReadinessIssues, []);
    assert.equal(validator.concreteDraftPickValidationAvailable, false);
    assert.equal(validator.actualDraftPickExecutionAvailable, false);
  });

  it("reports malformed readiness inputs deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftPickValidationReadinessValidatorShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(
      validator.validationReadinessPhase,
      "insufficient-display-ready-entries"
    );
    assert.equal(
      validator.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      false
    );
    assert.deepEqual(validator.validationReadinessSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 0,
      excludedIneligibleCount: 7,
      expectedFixtureCount: 245,
      expectedDisplayReadyEligibleCount: 235,
      expectedExcludedIneligibleCount: 10,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false,
      validationIssueCount: 9
    });
    assert.deepEqual(
      validator.validationReadinessIssues.map((issue) => issue.issue),
      [
        "selection-prerequisite-summary-not-structurally-satisfied",
        "display-readiness-not-structurally-satisfied",
        "ordering-readiness-not-structurally-satisfied",
        "draft-board-input-readiness-not-structurally-satisfied",
        "talent-pool-readiness-not-structurally-satisfied",
        "display-ready-eligible-entries-missing",
        "fixture-count-not-stable",
        "display-ready-eligible-count-not-stable",
        "excluded-ineligible-count-not-stable"
      ]
    );
  });

  it("references roster slot and championship division contracts without executing them", () => {
    const validator = draftPickValidationReadinessValidator;

    assert.equal(validator.rosterSlotRequirementAvailable, true);
    assert.equal(validator.championshipDivisionRequirementAvailable, true);
    assert.equal(validator.capabilityFlags.rosterSlotContextAvailable, false);
    assert.equal(
      validator.capabilityFlags.championshipDivisionCompatibilityContextAvailable,
      false
    );
    assert.equal(validator.rosterAssignmentAvailable, false);
    assert.equal(validator.championshipDivisionAssignmentAvailable, false);
    assert.equal(validator.rosterAssignmentsCreated, false);
    assert.equal(validator.championshipAssignmentsCreated, false);
    assert.equal(validator.divisionAssignmentsCreated, false);
  });

  it("does not choose a wrestler, validate a concrete pick, create pick state, UI, gameplay, or persistence", () => {
    const validator = draftPickValidationReadinessValidator;

    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.selectedWrestlerId, null);
    assert.equal(validator.concreteDraftPickValidated, false);
    assert.equal(validator.draftPickCreated, false);
    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_VALIDATION_VALIDATOR_DATABASE), false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.draftOrderStateCreated, false);
    assert.equal(validator.draftBoardUiCreated, false);
    assert.equal(validator.playerFacingDraftBoardCreated, false);
    assert.equal(validator.draftBoardsCreated, false);
    assert.equal(validator.draftPicksCreated, false);
    assert.equal(validator.draftPickValidationExecuted, false);
    assert.equal(validator.draftExecutionExecuted, false);
    assert.equal(validator.matchesCreated, false);
    assert.equal(validator.showsCreated, false);
    assert.equal(validator.weeksCreated, false);
    assert.equal(validator.weekOneUnlocked, false);
    assert.equal(validator.persistencePayloadsCreated, false);
    assert.equal(validator.generatedTextCreated, false);
    assert.equal(validator.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-pick-validation-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationReadinessValidatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
