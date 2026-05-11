import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "../src/game/domain/index.ts";

const UNTOUCHED_RESULT_SHAPE_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-result-shape-validator-should-not-exist.sqlite";
const resultShapeReadinessValidator =
  createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell();

describe("New GM Mode Roster Assignment Result Shape Readiness Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator = resultShapeReadinessValidator;

    assert.equal(
      validator.rosterAssignmentResultShapeReadinessValidatorId,
      "new-gm-mode-roster-assignment-result-shape-readiness-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
  });

  it("reports structurally ready result shape while assignment result creation and roster mutation stay blocked", () => {
    const validator = resultShapeReadinessValidator;

    assert.equal(
      validator.readinessPhase,
      "structurally-ready-result-shape-blocked"
    );
    assert.equal(
      validator.futureRosterAssignmentResultShapeStructurallyReady,
      true
    );
    assert.deepEqual(validator.requiredInputAvailabilitySummary, {
      resultShapeContractAvailable: true,
      ruleEvaluationSummaryAvailable: true,
      ruleEvaluationReadinessValidatorAvailable: true,
      ruleEvaluationReadinessStructurallySatisfied: true,
      assignmentInputReadinessSummaryAvailable: true,
      assignmentInputReadinessStructurallySatisfied: true,
      draftPickExecutionPrerequisiteSummaryAvailable: true,
      draftPickExecutionPrerequisitesStructurallySatisfied: true,
      rosterSlotRequirementContractAvailable: true,
      championshipDivisionRequirementContractAvailable: true,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      assignmentResultObjectAvailable: false,
      actualAssignmentResultCreationReady: false,
      rosterStateAvailable: false,
      actualRosterMutationReady: false
    });
    assert.deepEqual(validator.fixtureHandoffCounts, {
      totalFixtureCount: 245,
      eligibleDisplayReadyCount: 235,
      excludedIneligibleCount: 10,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10
    });
    assert.equal(validator.resultShapeRequirementCount, 15);
    assert.equal(validator.issueCount, 0);
    assert.deepEqual(validator.readinessIssues, []);
    assert.equal(validator.assignmentResultObjectCreated, false);
    assert.equal(validator.assignmentResultObjectAvailable, false);
    assert.equal(validator.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(validator.rosterStateMutationAvailable, false);
    assert.equal(validator.actualRosterMutationAvailable, false);
  });

  it("returns deterministic phases for missing injected readiness scenarios", () => {
    assert.equal(
      createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell({
        availabilityOverrides: { resultShapeContractAvailable: false }
      }).readinessPhase,
      "missing-result-shape-contract"
    );
    assert.equal(
      createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell({
        availabilityOverrides: { ruleEvaluationReadinessAvailable: false }
      }).readinessPhase,
      "missing-rule-evaluation-readiness"
    );
    assert.equal(
      createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell({
        availabilityOverrides: { assignmentInputReadinessAvailable: false }
      }).readinessPhase,
      "missing-assignment-input-readiness"
    );
    assert.equal(
      createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell({
        availabilityOverrides: { executedPickPrerequisiteAvailable: false }
      }).readinessPhase,
      "missing-executed-pick-prerequisite"
    );
  });

  it("reports malformed fixture handoff counts without creating an assignment result", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator =
      createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell({
        fixtures: catalog.fixtures.slice(10, 17)
      });

    assert.equal(
      validator.readinessPhase,
      "missing-assignment-input-readiness"
    );
    assert.equal(
      validator.futureRosterAssignmentResultShapeStructurallyReady,
      false
    );
    assert.deepEqual(validator.fixtureHandoffCounts, {
      totalFixtureCount: 7,
      eligibleDisplayReadyCount: 0,
      excludedIneligibleCount: 7,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10
    });
    assert.deepEqual(
      validator.readinessIssues.map((issue) => issue.issue),
      [
        "rule-evaluation-readiness-not-structurally-satisfied",
        "assignment-input-readiness-not-structurally-satisfied",
        "executed-pick-prerequisite-not-structurally-satisfied",
        "fixture-count-not-stable",
        "eligible-display-ready-count-not-stable",
        "excluded-ineligible-count-not-stable"
      ]
    );
    assert.equal(validator.assignmentResultObjectCreated, false);
    assert.equal(validator.selectedWrestlerHandled, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.rosterStateCreated, false);
  });

  it("keeps selected wrestler, executed pick, assignment result, roster state, and mutation unavailable", () => {
    const validator = resultShapeReadinessValidator;

    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.selectedWrestlerId, null);
    assert.equal(validator.selectedWrestlerIdentityAvailable, false);
    assert.equal(validator.selectedWrestlerHandled, false);
    assert.equal(validator.executedPickAvailable, false);
    assert.equal(validator.assignmentResultObjectCreated, false);
    assert.equal(validator.assignmentResultObjectAvailable, false);
    assert.equal(validator.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(validator.rosterAssignmentAvailable, false);
    assert.equal(validator.actualRosterAssignmentAvailable, false);
    assert.equal(validator.rosterStateMutationAvailable, false);
    assert.equal(validator.actualRosterMutationAvailable, false);
    assert.equal(validator.rosterStateAvailable, false);
    assert.equal(validator.rosterStateCreated, false);
    assert.equal(
      validator.capabilityFlags.assignmentResultObjectCreationAvailable,
      false
    );
    assert.equal(
      validator.capabilityFlags.actualRosterAssignmentResultCreationAvailable,
      false
    );
    assert.equal(validator.capabilityFlags.actualRosterMutationAvailable, false);
  });

  it("does not create draft picks, rosters, championship assignments, match/show/week state, persistence, UI, or generated output", () => {
    const validator = resultShapeReadinessValidator;

    assert.equal(validator.concreteDraftPickValidated, false);
    assert.equal(validator.validatedPickAvailable, false);
    assert.equal(validator.draftPickCreated, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_RESULT_SHAPE_VALIDATOR_DATABASE), false);
    assert.equal(validator.gameplayStateCreated, false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.draftOrderStateCreated, false);
    assert.equal(validator.draftBoardUiCreated, false);
    assert.equal(validator.playerFacingDraftBoardCreated, false);
    assert.equal(validator.draftBoardsCreated, false);
    assert.equal(validator.draftPicksCreated, false);
    assert.equal(validator.draftPickValidationExecuted, false);
    assert.equal(validator.draftExecutionExecuted, false);
    assert.equal(validator.rosterAssignmentsCreated, false);
    assert.equal(validator.championshipAssignmentsCreated, false);
    assert.equal(validator.divisionAssignmentsCreated, false);
    assert.equal(validator.matchesCreated, false);
    assert.equal(validator.showsCreated, false);
    assert.equal(validator.weeksCreated, false);
    assert.equal(validator.weekOneUnlocked, false);
    assert.equal(validator.persistencePayloadsCreated, false);
    assert.equal(validator.generatedTextCreated, false);
    assert.equal(validator.genAIUsed, false);
    assert.equal(Object.hasOwn(validator, "assignmentResult"), false);
    assert.equal(Object.hasOwn(validator, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(validator, "draftPick"), false);
    assert.equal(Object.hasOwn(validator, "roster"), false);
    assert.equal(Object.hasOwn(validator, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(validator, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(validator, "divisionAssignment"), false);
    assert.equal(Object.hasOwn(validator, "matchState"), false);
    assert.equal(Object.hasOwn(validator, "showState"), false);
    assert.equal(Object.hasOwn(validator, "weekState"), false);
    assert.equal(Object.hasOwn(validator, "persistencePayload"), false);
    assert.equal(Object.hasOwn(validator, "generatedText"), false);
    assert.equal(Object.hasOwn(validator, "genAIClient"), false);
  });
});
