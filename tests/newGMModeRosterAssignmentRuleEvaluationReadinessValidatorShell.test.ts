import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "../src/game/domain/index.ts";

const UNTOUCHED_RULE_EVALUATION_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-rule-evaluation-validator-should-not-exist.sqlite";

describe("New GM Mode Roster Assignment Rule Evaluation Readiness Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell();

    assert.equal(
      validator.rosterAssignmentRuleEvaluationReadinessValidatorId,
      "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
  });

  it("reports structurally ready rule evaluation while actual evaluation and roster mutation stay blocked", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell();

    assert.equal(
      validator.readinessPhase,
      "structurally-ready-rule-evaluation-blocked"
    );
    assert.equal(
      validator.futureRosterAssignmentRuleEvaluationStructurallyReady,
      true
    );
    assert.deepEqual(validator.requiredInputAvailabilitySummary, {
      ruleEvaluationContractAvailable: true,
      assignmentInputReadinessSummaryAvailable: true,
      assignmentInputReadinessValidatorAvailable: true,
      assignmentInputContractAvailable: true,
      assignmentInputReadinessStructurallySatisfied: true,
      draftPickExecutionPrerequisiteSummaryAvailable: true,
      draftPickExecutionPrerequisitesStructurallySatisfied: true,
      draftPickValidationReadinessSummaryAvailable: true,
      rosterSlotRequirementContractAvailable: true,
      championshipDivisionRequirementContractAvailable: true,
      talentPoolReadinessAggregatorAvailable: true,
      talentPoolReadinessStructurallySatisfied: true,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      targetBrandRosterContextAvailable: false,
      rosterStateAvailable: false,
      actualRuleEvaluationReady: false,
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
    assert.equal(validator.evaluationRuleCount, 15);
    assert.equal(validator.issueCount, 0);
    assert.deepEqual(validator.readinessIssues, []);
    assert.equal(validator.actualRuleEvaluationAvailable, false);
    assert.equal(validator.actualRosterAssignmentRuleEvaluationAvailable, false);
    assert.equal(validator.rosterStateMutationAvailable, false);
  });

  it("returns deterministic phases for missing injected availability scenarios", () => {
    assert.equal(
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        availabilityOverrides: { ruleEvaluationContractAvailable: false }
      }).readinessPhase,
      "missing-rule-evaluation-contract"
    );
    assert.equal(
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        availabilityOverrides: { assignmentInputReadinessAvailable: false }
      }).readinessPhase,
      "missing-assignment-input-readiness"
    );
    assert.equal(
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        availabilityOverrides: { executedPickPrerequisiteAvailable: false }
      }).readinessPhase,
      "missing-executed-pick-prerequisite"
    );
    assert.equal(
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        availabilityOverrides: { rosterSlotRequirementAvailable: false }
      }).readinessPhase,
      "missing-roster-slot-requirements"
    );
    assert.equal(
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        availabilityOverrides: {
          championshipDivisionRequirementAvailable: false
        }
      }).readinessPhase,
      "missing-championship-division-requirements"
    );
  });

  it("reports malformed fixture handoff counts without evaluating a concrete assignment", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator =
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell({
        fixtures: catalog.fixtures.slice(10, 17)
      });

    assert.equal(
      validator.readinessPhase,
      "missing-assignment-input-readiness"
    );
    assert.equal(
      validator.futureRosterAssignmentRuleEvaluationStructurallyReady,
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
        "assignment-input-readiness-not-structurally-satisfied",
        "executed-pick-prerequisite-not-structurally-satisfied",
        "talent-pool-readiness-not-structurally-satisfied",
        "fixture-count-not-stable",
        "eligible-display-ready-count-not-stable",
        "excluded-ineligible-count-not-stable"
      ]
    );
    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.concreteSelectedWrestlerEvaluated, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.rosterStateCreated, false);
  });

  it("keeps selected wrestler, executed pick, roster state, rule evaluation, and mutation unavailable", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell();

    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.selectedWrestlerId, null);
    assert.equal(validator.selectedWrestlerIdentityAvailable, false);
    assert.equal(validator.executedPickAvailable, false);
    assert.equal(validator.targetBrandRosterContextAvailable, false);
    assert.equal(validator.actualRuleEvaluationAvailable, false);
    assert.equal(validator.actualRosterAssignmentRuleEvaluationAvailable, false);
    assert.equal(validator.rosterAssignmentAvailable, false);
    assert.equal(validator.actualRosterAssignmentAvailable, false);
    assert.equal(validator.rosterStateMutationAvailable, false);
    assert.equal(validator.rosterStateAvailable, false);
    assert.equal(validator.rosterStateCreated, false);
    assert.equal(
      validator.capabilityFlags.actualRosterAssignmentRuleEvaluationAvailable,
      false
    );
    assert.equal(validator.capabilityFlags.rosterStateMutationAvailable, false);
  });

  it("does not create draft picks, rosters, championship assignments, match/show/week state, persistence, UI, or generated output", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell();

    assert.equal(validator.concreteDraftPickValidated, false);
    assert.equal(validator.validatedPickAvailable, false);
    assert.equal(validator.draftPickCreated, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_RULE_EVALUATION_VALIDATOR_DATABASE), false);
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
