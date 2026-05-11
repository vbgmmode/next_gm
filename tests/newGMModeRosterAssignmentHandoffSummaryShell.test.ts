import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentHandoffSummaryShell,
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

const UNTOUCHED_HANDOFF_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-handoff-summary-should-not-exist.sqlite";
const rosterAssignmentHandoffSummary =
  createNewGMModeRosterAssignmentHandoffSummaryShell();

describe("New GM Mode Roster Assignment Handoff Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = rosterAssignmentHandoffSummary;

    assert.equal(
      summary.rosterAssignmentHandoffSummaryId,
      "new-gm-mode-roster-assignment-handoff-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("includes stable handoff phase values and deterministic ordering", () => {
    const summary = rosterAssignmentHandoffSummary;

    assert.deepEqual(
      summary.handoffPhases.map((phase) => phase.id),
      [
        "missing-result-shape-readiness",
        "missing-rule-evaluation-readiness",
        "missing-assignment-input-readiness",
        "missing-draft-execution-prerequisite",
        "missing-roster-mutation-boundary",
        "structurally-ready-roster-assignment-handoff-blocked"
      ]
    );
    assert.deepEqual(
      summary.handoffPhases.map((phase) => phase.slug),
      summary.handoffPhases.map((phase) => phase.id)
    );
  });

  it("summarizes upstream readiness and fixture handoff counts while roster mutation stays blocked", () => {
    const summary = rosterAssignmentHandoffSummary;

    assert.equal(
      summary.topLevelHandoffPhase,
      "structurally-ready-roster-assignment-handoff-blocked"
    );
    assert.equal(summary.resultShapeReadinessAvailable, true);
    assert.equal(summary.resultShapeReadinessStructurallySatisfied, true);
    assert.equal(summary.ruleEvaluationReadinessAvailable, true);
    assert.equal(summary.ruleEvaluationReadinessStructurallySatisfied, true);
    assert.equal(summary.assignmentInputReadinessAvailable, true);
    assert.equal(summary.assignmentInputReadinessStructurallySatisfied, true);
    assert.equal(summary.draftPickExecutionPrerequisiteAvailable, true);
    assert.equal(
      summary.draftPickExecutionPrerequisiteStructurallySatisfied,
      true
    );
    assert.equal(summary.draftPickValidationReadinessAvailable, true);
    assert.equal(summary.draftPickValidationReadinessStructurallySatisfied, true);
    assert.equal(summary.draftBoardSelectionPrerequisiteAvailable, true);
    assert.equal(
      summary.draftBoardSelectionPrerequisiteStructurallySatisfied,
      true
    );
    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(summary.talentPoolReadinessStructurallySatisfied, true);
    assert.equal(summary.futureRosterMutationBoundaryAvailable, false);
    assert.deepEqual(summary.fixtureHandoffCounts, {
      totalFixtureCount: 245,
      eligibleDisplayReadyCount: 235,
      excludedIneligibleCount: 10,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10
    });
    assert.equal(summary.issueCount, 0);
    assert.deepEqual(summary.handoffIssues, []);
    assert.equal(summary.assignmentResultObjectCreated, false);
    assert.equal(summary.assignmentResultObjectAvailable, false);
    assert.equal(summary.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(summary.rosterStateMutationAvailable, false);
    assert.equal(summary.actualRosterMutationAvailable, false);
    assert.equal(summary.capabilityFlags.assignmentResultObjectCreationAvailable, false);
    assert.equal(summary.capabilityFlags.actualRosterMutationAvailable, false);
  });

  it("reports malformed fixture handoff counts deterministically without creating gameplay state", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeRosterAssignmentHandoffSummaryShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(summary.topLevelHandoffPhase, "missing-result-shape-readiness");
    assert.deepEqual(summary.fixtureHandoffCounts, {
      totalFixtureCount: 7,
      eligibleDisplayReadyCount: 0,
      excludedIneligibleCount: 7,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10
    });
    assert.deepEqual(
      summary.handoffIssues.map((issue) => issue.issue),
      [
        "result-shape-readiness-not-structurally-satisfied",
        "rule-evaluation-readiness-not-structurally-satisfied",
        "assignment-input-readiness-not-structurally-satisfied",
        "draft-execution-prerequisite-not-structurally-satisfied",
        "fixture-count-not-stable",
        "eligible-display-ready-count-not-stable",
        "excluded-ineligible-count-not-stable"
      ]
    );
    assert.equal(summary.assignmentResultObjectCreated, false);
    assert.equal(summary.selectedWrestlerHandled, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.rosterStateCreated, false);
  });

  it("does not handle selected wrestlers, create picks, assign rosters, mutate state, persist, add UI, or generate text", () => {
    const summary = rosterAssignmentHandoffSummary;

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.selectedWrestlerIdentityAvailable, false);
    assert.equal(summary.selectedWrestlerHandled, false);
    assert.equal(summary.concreteSelectedWrestlerEvaluated, false);
    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.validatedPickAvailable, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.executedPickAvailable, false);
    assert.equal(summary.actualRuleEvaluationAvailable, false);
    assert.equal(summary.actualRosterAssignmentRuleEvaluationAvailable, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.actualRosterAssignmentAvailable, false);
    assert.equal(summary.rosterStateMutationAvailable, false);
    assert.equal(summary.actualRosterMutationAvailable, false);
    assert.equal(summary.rosterStateAvailable, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(summary.championshipDivisionAssignmentAvailable, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_HANDOFF_SUMMARY_DATABASE), false);
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

  it("exports the handoff summary shell from the domain index", () => {
    assert.equal(
      typeof createNewGMModeRosterAssignmentHandoffSummaryShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-assignment-handoff-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterAssignmentHandoffSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
