import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell,
  createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell,
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

const UNTOUCHED_ROSTER_ASSIGNMENT_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-roster-assignment-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Pick Roster Assignment Prerequisite Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    assert.equal(
      summary.draftPickRosterAssignmentPrerequisiteSummaryId,
      "new-gm-mode-draft-pick-roster-assignment-prerequisite-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes structurally ready roster assignment prerequisites while actual assignment remains blocked", () => {
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    assert.equal(summary.rosterAssignmentPrerequisiteContractAvailable, true);
    assert.equal(summary.executionPrerequisiteAvailable, true);
    assert.equal(summary.validationReadinessAvailable, true);
    assert.equal(summary.selectionPrerequisiteAvailable, true);
    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(
      summary.topLevelRosterAssignmentPrerequisitePhase,
      "roster-assignment-prerequisites-structurally-ready-assignment-blocked"
    );
    assert.equal(
      summary.futureRosterAssignmentPrerequisitesStructurallySatisfied,
      true
    );
    assert.deepEqual(summary.rosterAssignmentPrerequisiteSummary, {
      totalFixtureCount: 10,
      displayReadyEligibleCount: 9,
      excludedIneligibleCount: 1,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      draftPickExecuted: false,
      executedPickAvailable: false,
      actualRosterAssignmentReady: false
    });
    assert.equal(summary.actualRosterAssignmentAvailable, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.rosterStateMutationAvailable, false);
  });

  it("reports malformed readiness inputs without choosing, validating, executing, or assigning", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell({
        fixtures: catalog.fixtures.slice(0, 7)
      });

    assert.equal(
      summary.topLevelRosterAssignmentPrerequisitePhase,
      "missing-execution-prerequisites"
    );
    assert.equal(
      summary.futureRosterAssignmentPrerequisitesStructurallySatisfied,
      false
    );
    assert.deepEqual(summary.rosterAssignmentPrerequisiteSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 7,
      excludedIneligibleCount: 0,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      draftPickExecuted: false,
      executedPickAvailable: false,
      actualRosterAssignmentReady: false
    });
    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.rosterAssignmentsCreated, false);
  });

  it("references execution and validation readiness shells but does not execute them", () => {
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    assert.equal(
      summary.capabilityFlags.draftPickExecutionPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(
      summary.capabilityFlags.draftPickValidationReadinessSummaryAvailable,
      true
    );
    assert.equal(summary.capabilityFlags.validatedPickDependencyAvailable, false);
    assert.equal(summary.capabilityFlags.executedPickDependencyAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(summary.capabilityFlags.actualRosterAssignmentAvailable, false);
    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.draftPickValidationExecuted, false);
    assert.equal(summary.draftExecutionExecuted, false);
  });

  it("references roster slot and championship division contracts but does not execute assignment", () => {
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(
      summary.capabilityFlags.rosterSlotRequirementDependencyAvailable,
      false
    );
    assert.equal(
      summary.capabilityFlags.championshipDivisionCompatibilityDependencyAvailable,
      false
    );
    assert.equal(summary.rosterAssignmentsCreated, false);
    assert.equal(summary.championshipAssignmentsCreated, false);
    assert.equal(summary.divisionAssignmentsCreated, false);
    assert.equal(summary.championshipDivisionAssignmentAvailable, false);
  });

  it("exposes roster assignment prerequisite shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell,
      "function"
    );
  });

  it("does not choose a wrestler, create a draft board, create roster state, persist, or create UI", () => {
    const summary =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.validatedPickAvailable, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.executedPickAvailable, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_ROSTER_ASSIGNMENT_SUMMARY_DATABASE), false);
    assert.equal(summary.gameplayStateCreated, false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
    assert.equal(summary.draftOrderStateCreated, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(summary.draftBoardUiCreated, false);
    assert.equal(summary.playerFacingDraftBoardCreated, false);
    assert.equal(summary.draftBoardsCreated, false);
    assert.equal(summary.draftPicksCreated, false);
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

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-assignment-prerequisite-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
