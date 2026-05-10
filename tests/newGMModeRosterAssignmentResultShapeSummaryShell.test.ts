import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentResultShapeContractShell,
  createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell,
  createNewGMModeRosterAssignmentResultShapeSummaryShell,
  createNewGMModeRosterAssignmentRuleEvaluationSummaryShell,
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

const UNTOUCHED_RESULT_SHAPE_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-result-shape-summary-should-not-exist.sqlite";

describe("New GM Mode Roster Assignment Result Shape Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeRosterAssignmentResultShapeSummaryShell();

    assert.equal(
      summary.rosterAssignmentResultShapeSummaryId,
      "new-gm-mode-roster-assignment-result-shape-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes contract, validator, rule evaluation readiness, counts, and blocked result creation", () => {
    const summary = createNewGMModeRosterAssignmentResultShapeSummaryShell();

    assert.deepEqual(summary.contractAvailability, {
      resultShapeContractAvailable: true,
      resultShapeValidatorAvailable: true,
      ruleEvaluationReadinessAvailable: true
    });
    assert.equal(
      summary.topLevelReadinessPhase,
      "structurally-ready-result-shape-blocked"
    );
    assert.equal(
      summary.futureRosterAssignmentResultShapeStructurallyReady,
      true
    );
    assert.deepEqual(summary.fixtureHandoffCounts, {
      totalFixtureCount: 10,
      eligibleDisplayReadyCount: 9,
      excludedIneligibleCount: 1,
      expectedFixtureCount: 10,
      expectedEligibleDisplayReadyCount: 9,
      expectedExcludedIneligibleCount: 1
    });
    assert.equal(summary.resultShapeRequirementCount, 15);
    assert.equal(summary.issueCount, 0);
    assert.equal(summary.assignmentResultObjectCreated, false);
    assert.equal(summary.assignmentResultObjectAvailable, false);
    assert.equal(summary.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(summary.rosterStateMutationAvailable, false);
    assert.equal(summary.actualRosterMutationAvailable, false);
  });

  it("propagates malformed fixture handoff counts without creating gameplay state", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeRosterAssignmentResultShapeSummaryShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.deepEqual(summary.fixtureHandoffCounts, {
      totalFixtureCount: 7,
      eligibleDisplayReadyCount: 7,
      excludedIneligibleCount: 0,
      expectedFixtureCount: 10,
      expectedEligibleDisplayReadyCount: 9,
      expectedExcludedIneligibleCount: 1
    });
    assert.equal(
      summary.futureRosterAssignmentResultShapeStructurallyReady,
      false
    );
    assert.equal(
      summary.topLevelReadinessPhase,
      "missing-assignment-input-readiness"
    );
    assert.equal(summary.issueCount, 6);
    assert.equal(summary.assignmentResultObjectCreated, false);
    assert.equal(summary.selectedWrestlerHandled, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.rosterStateCreated, false);
  });

  it("keeps selected wrestler, executed pick, assignment result, roster state, and roster mutation unavailable", () => {
    const summary = createNewGMModeRosterAssignmentResultShapeSummaryShell();

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.selectedWrestlerIdentityAvailable, false);
    assert.equal(summary.selectedWrestlerHandled, false);
    assert.equal(summary.executedPickAvailable, false);
    assert.equal(summary.assignmentResultObjectCreated, false);
    assert.equal(summary.assignmentResultObjectAvailable, false);
    assert.equal(summary.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.actualRosterAssignmentAvailable, false);
    assert.equal(summary.rosterStateMutationAvailable, false);
    assert.equal(summary.actualRosterMutationAvailable, false);
    assert.equal(summary.rosterStateAvailable, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(
      summary.capabilityFlags.assignmentResultObjectCreationAvailable,
      false
    );
    assert.equal(
      summary.capabilityFlags.actualRosterAssignmentResultCreationAvailable,
      false
    );
    assert.equal(summary.capabilityFlags.actualRosterMutationAvailable, false);
  });

  it("does not choose, validate, execute, assign, create match/show/week state, persist, add UI, or generate text", () => {
    const summary = createNewGMModeRosterAssignmentResultShapeSummaryShell();

    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.validatedPickAvailable, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_RESULT_SHAPE_SUMMARY_DATABASE), false);
    assert.equal(summary.gameplayStateCreated, false);
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
    assert.equal(Object.hasOwn(summary, "assignmentResult"), false);
    assert.equal(Object.hasOwn(summary, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(summary, "draftPick"), false);
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

  it("exposes result shape shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeRosterAssignmentResultShapeContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeRosterAssignmentResultShapeSummaryShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeRosterAssignmentRuleEvaluationSummaryShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-assignment-result-shape-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterAssignmentResultShapeSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
