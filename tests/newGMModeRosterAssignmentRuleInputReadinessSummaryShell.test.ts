import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentRuleInputContractShell,
  createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell,
  createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell,
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

const UNTOUCHED_RULE_INPUT_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-rule-input-summary-should-not-exist.sqlite";
const ruleInputReadinessSummary =
  createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell();

describe("New GM Mode Roster Assignment Rule Input Readiness Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = ruleInputReadinessSummary;

    assert.equal(
      summary.rosterAssignmentRuleInputReadinessSummaryId,
      "new-gm-mode-roster-assignment-rule-input-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes structurally ready rule inputs while actual roster assignment remains blocked", () => {
    const summary = ruleInputReadinessSummary;

    assert.equal(summary.ruleInputContractAvailable, true);
    assert.equal(summary.ruleInputValidatorAvailable, true);
    assert.equal(summary.rosterAssignmentPrerequisiteAvailable, true);
    assert.equal(summary.executionPrerequisiteAvailable, true);
    assert.equal(summary.validationReadinessAvailable, true);
    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(summary.totalFixtureCount, 245);
    assert.equal(summary.eligibleDisplayReadyCount, 235);
    assert.equal(summary.excludedIneligibleCount, 10);
    assert.equal(
      summary.futureRosterAssignmentRuleInputsStructurallySatisfied,
      true
    );
    assert.equal(
      summary.topLevelRuleInputReadinessPhase,
      "rule-inputs-structurally-ready-roster-assignment-blocked"
    );
    assert.equal(summary.actualRosterAssignmentAvailable, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.rosterStateAvailable, false);
  });

  it("propagates malformed fixture handoff counts without creating gameplay state", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary =
      createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell({
        fixtures: catalog.fixtures.slice(10, 17)
      });

    assert.equal(summary.totalFixtureCount, 7);
    assert.equal(summary.eligibleDisplayReadyCount, 0);
    assert.equal(summary.excludedIneligibleCount, 7);
    assert.equal(
      summary.futureRosterAssignmentRuleInputsStructurallySatisfied,
      false
    );
    assert.equal(
      summary.topLevelRuleInputReadinessPhase,
      "missing-roster-assignment-prerequisites"
    );
    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.rosterStateCreated, false);
  });

  it("keeps selected wrestler, executed pick, roster state, and actual assignment unavailable", () => {
    const summary = ruleInputReadinessSummary;

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.selectedWrestlerIdentityAvailable, false);
    assert.equal(summary.executedPickAvailable, false);
    assert.equal(summary.rosterStateAvailable, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.actualRosterAssignmentAvailable, false);
    assert.equal(
      summary.capabilityFlags.selectedWrestlerIdentityDependencyAvailable,
      false
    );
    assert.equal(summary.capabilityFlags.executedPickDependencyAvailable, false);
    assert.equal(summary.capabilityFlags.actualRosterAssignmentAvailable, false);
  });

  it("references roster slot and championship division contracts but does not execute assignment", () => {
    const summary = ruleInputReadinessSummary;

    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(
      summary.capabilityFlags.rosterSlotRequirementContextAvailable,
      false
    );
    assert.equal(
      summary.capabilityFlags.championshipDivisionCompatibilityContextAvailable,
      false
    );
    assert.equal(summary.rosterAssignmentsCreated, false);
    assert.equal(summary.championshipAssignmentsCreated, false);
    assert.equal(summary.divisionAssignmentsCreated, false);
  });

  it("does not choose, validate, execute, create boards, create roster state, persist, or generate text", () => {
    const summary = ruleInputReadinessSummary;

    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.validatedPickAvailable, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.draftBoardCreationAvailable, false);
    assert.equal(summary.draftBoardUiRenderingAvailable, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_RULE_INPUT_SUMMARY_DATABASE), false);
    assert.equal(summary.gameplayStateCreated, false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
    assert.equal(summary.draftOrderStateCreated, false);
    assert.equal(summary.draftBoardUiCreated, false);
    assert.equal(summary.draftBoardsCreated, false);
    assert.equal(summary.draftPicksCreated, false);
    assert.equal(summary.draftPickValidationExecuted, false);
    assert.equal(summary.draftExecutionExecuted, false);
    assert.equal(summary.matchesCreated, false);
    assert.equal(summary.showsCreated, false);
    assert.equal(summary.weeksCreated, false);
    assert.equal(summary.weekOneUnlocked, false);
    assert.equal(summary.persistencePayloadsCreated, false);
    assert.equal(summary.generatedTextCreated, false);
    assert.equal(summary.genAIUsed, false);
    assert.equal(Object.hasOwn(summary, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(summary, "draftPick"), false);
    assert.equal(Object.hasOwn(summary, "draftBoard"), false);
    assert.equal(Object.hasOwn(summary, "draftBoardUi"), false);
    assert.equal(Object.hasOwn(summary, "roster"), false);
    assert.equal(Object.hasOwn(summary, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(summary, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(summary, "divisionAssignment"), false);
    assert.equal(Object.hasOwn(summary, "matchState"), false);
    assert.equal(Object.hasOwn(summary, "showState"), false);
    assert.equal(Object.hasOwn(summary, "weekState"), false);
    assert.equal(Object.hasOwn(summary, "persistencePayload"), false);
    assert.equal(Object.hasOwn(summary, "generatedText"), false);
    assert.equal(Object.hasOwn(summary, "genAIClient"), false);
  });

  it("exposes rule input shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeRosterAssignmentRuleInputContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-assignment-rule-input-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
