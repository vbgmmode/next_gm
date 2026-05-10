import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionPrerequisiteContractShell,
  createNewGMModeDraftPickExecutionPrerequisiteSummaryShell,
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

const UNTOUCHED_DRAFT_PICK_EXECUTION_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-execution-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Pick Execution Prerequisite Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftPickExecutionPrerequisiteSummaryShell();

    assert.equal(
      summary.draftPickExecutionPrerequisiteSummaryId,
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes execution prerequisites while actual pick execution remains blocked", () => {
    const summary = createNewGMModeDraftPickExecutionPrerequisiteSummaryShell();

    assert.equal(summary.executionPrerequisiteContractAvailable, true);
    assert.equal(summary.validationReadinessAvailable, true);
    assert.equal(summary.selectionPrerequisiteAvailable, true);
    assert.equal(summary.displayReadinessAvailable, true);
    assert.equal(summary.orderingReadinessAvailable, true);
    assert.equal(summary.draftBoardInputReadinessAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(
      summary.topLevelExecutionPrerequisitePhase,
      "execution-prerequisites-structurally-ready-pick-execution-blocked"
    );
    assert.equal(
      summary.futureDraftPickExecutionPrerequisitesStructurallySatisfied,
      true
    );
    assert.deepEqual(summary.executionPrerequisiteSummary, {
      totalFixtureCount: 10,
      displayReadyEligibleCount: 9,
      excludedIneligibleCount: 1,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      actualDraftPickExecutionReady: false
    });
    assert.equal(summary.concreteDraftPickValidationAvailable, false);
    assert.equal(summary.actualDraftPickExecutionAvailable, false);
    assert.equal(summary.draftExecutionAvailable, false);
  });

  it("reports malformed readiness inputs instead of repairing or executing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftPickExecutionPrerequisiteSummaryShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(
      summary.topLevelExecutionPrerequisitePhase,
      "missing-validation-readiness"
    );
    assert.equal(
      summary.futureDraftPickExecutionPrerequisitesStructurallySatisfied,
      false
    );
    assert.deepEqual(summary.executionPrerequisiteSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 7,
      excludedIneligibleCount: 0,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      actualDraftPickExecutionReady: false
    });
    assert.equal(summary.draftPickExecuted, false);
  });

  it("keeps validation referenced but no concrete pick validated or executed", () => {
    const summary = createNewGMModeDraftPickExecutionPrerequisiteSummaryShell();

    assert.equal(
      summary.capabilityFlags.draftPickValidationReadinessSummaryAvailable,
      true
    );
    assert.equal(
      summary.capabilityFlags.draftPickExecutionPrerequisiteContractAvailable,
      true
    );
    assert.equal(
      summary.capabilityFlags.draftPickExecutionPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(summary.capabilityFlags.concreteDraftPickValidationAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(summary.capabilityFlags.validatedPickDependencyAvailable, false);
    assert.equal(summary.capabilityFlags.draftStateMutationAvailable, false);
    assert.equal(summary.capabilityFlags.futureRosterAssignmentDependencyAvailable, false);
    assert.equal(
      summary.capabilityFlags.futurePersistencePayloadDependencyAvailable,
      false
    );
  });

  it("exposes draft pick execution prerequisite shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeDraftPickExecutionPrerequisiteContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftPickExecutionPrerequisiteSummaryShell,
      "function"
    );
  });

  it("does not choose a wrestler, validate a concrete pick, execute a pick, create state, UI, or persistence", () => {
    const summary = createNewGMModeDraftPickExecutionPrerequisiteSummaryShell();

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.concreteDraftPickValidated, false);
    assert.equal(summary.validatedPickAvailable, false);
    assert.equal(summary.draftPickCreated, false);
    assert.equal(summary.draftPickExecuted, false);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_EXECUTION_SUMMARY_DATABASE), false);
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
    const contextSeed = "new-gm-mode-draft-pick-execution-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickExecutionPrerequisiteSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
