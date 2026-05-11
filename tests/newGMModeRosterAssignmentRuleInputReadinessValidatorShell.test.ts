import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "../src/game/domain/index.ts";

const UNTOUCHED_RULE_INPUT_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-rule-input-validator-should-not-exist.sqlite";

describe("New GM Mode Roster Assignment Rule Input Readiness Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell();

    assert.equal(
      validator.rosterAssignmentRuleInputReadinessValidatorId,
      "new-gm-mode-roster-assignment-rule-input-readiness-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
  });

  it("reports structurally ready rule inputs while actual roster assignment remains blocked", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell();

    assert.equal(validator.ruleInputContractAvailable, true);
    assert.equal(validator.rosterAssignmentPrerequisiteAvailable, true);
    assert.equal(validator.executionPrerequisiteAvailable, true);
    assert.equal(validator.validationReadinessAvailable, true);
    assert.equal(validator.rosterSlotRequirementAvailable, true);
    assert.equal(validator.championshipDivisionRequirementAvailable, true);
    assert.equal(validator.talentPoolReadinessAvailable, true);
    assert.equal(
      validator.ruleInputReadinessPhase,
      "rule-inputs-structurally-ready-roster-assignment-blocked"
    );
    assert.equal(
      validator.futureRosterAssignmentRuleInputsStructurallySatisfied,
      true
    );
    assert.deepEqual(validator.ruleInputReadinessSummary, {
      totalFixtureCount: 245,
      eligibleDisplayReadyCount: 235,
      excludedIneligibleCount: 10,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      rosterStateAvailable: false,
      actualRosterAssignmentReady: false,
      issueCount: 0
    });
    assert.deepEqual(validator.ruleInputReadinessIssues, []);
  });

  it("reports malformed fixture handoff counts without converting them to gameplay state", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell({
        fixtures: catalog.fixtures.slice(10, 17)
      });

    assert.equal(
      validator.ruleInputReadinessPhase,
      "missing-roster-assignment-prerequisites"
    );
    assert.equal(
      validator.futureRosterAssignmentRuleInputsStructurallySatisfied,
      false
    );
    assert.deepEqual(validator.ruleInputReadinessSummary, {
      totalFixtureCount: 7,
      eligibleDisplayReadyCount: 0,
      excludedIneligibleCount: 7,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      rosterStateAvailable: false,
      actualRosterAssignmentReady: false,
      issueCount: 7
    });
    assert.deepEqual(
      validator.ruleInputReadinessIssues.map((issue) => issue.issue),
      [
        "roster-assignment-prerequisite-summary-not-structurally-satisfied",
        "execution-prerequisite-summary-not-structurally-satisfied",
        "validation-readiness-summary-not-structurally-satisfied",
        "talent-pool-readiness-not-structurally-satisfied",
        "fixture-count-not-stable",
        "eligible-display-ready-count-not-stable",
        "excluded-ineligible-count-not-stable"
      ]
    );
    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.rosterStateCreated, false);
  });

  it("keeps selected wrestler, executed pick, roster state, and actual assignment unavailable", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell();

    assert.equal(validator.selectedWrestlerChosen, false);
    assert.equal(validator.selectedWrestlerId, null);
    assert.equal(validator.selectedWrestlerIdentityAvailable, false);
    assert.equal(validator.executedPickAvailable, false);
    assert.equal(validator.rosterStateAvailable, false);
    assert.equal(validator.rosterStateCreated, false);
    assert.equal(validator.rosterAssignmentAvailable, false);
    assert.equal(validator.actualRosterAssignmentAvailable, false);
    assert.equal(
      validator.capabilityFlags.selectedWrestlerIdentityDependencyAvailable,
      false
    );
    assert.equal(validator.capabilityFlags.executedPickDependencyAvailable, false);
    assert.equal(validator.capabilityFlags.actualRosterAssignmentAvailable, false);
  });

  it("references roster slot and championship division contracts but does not execute assignment", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell();

    assert.equal(validator.rosterSlotRequirementAvailable, true);
    assert.equal(validator.championshipDivisionRequirementAvailable, true);
    assert.equal(
      validator.capabilityFlags.rosterSlotRequirementContextAvailable,
      false
    );
    assert.equal(
      validator.capabilityFlags.championshipDivisionCompatibilityContextAvailable,
      false
    );
    assert.equal(validator.rosterAssignmentsCreated, false);
    assert.equal(validator.championshipAssignmentsCreated, false);
    assert.equal(validator.divisionAssignmentsCreated, false);
  });

  it("does not create draft board, UI, match/show/week state, persistence, or generated output", () => {
    const validator =
      createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell();

    assert.equal(validator.concreteDraftPickValidated, false);
    assert.equal(validator.validatedPickAvailable, false);
    assert.equal(validator.draftPickCreated, false);
    assert.equal(validator.draftPickExecuted, false);
    assert.equal(validator.actualDraftBoardCreationAvailable, false);
    assert.equal(validator.draftBoardCreationAvailable, false);
    assert.equal(validator.draftBoardUiRenderingAvailable, false);
    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_RULE_INPUT_VALIDATOR_DATABASE), false);
    assert.equal(validator.gameplayStateCreated, false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.draftOrderStateCreated, false);
    assert.equal(validator.draftBoardUiCreated, false);
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
    assert.equal(Object.hasOwn(validator, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(validator, "draftPick"), false);
    assert.equal(Object.hasOwn(validator, "draftBoard"), false);
    assert.equal(Object.hasOwn(validator, "draftBoardUi"), false);
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
