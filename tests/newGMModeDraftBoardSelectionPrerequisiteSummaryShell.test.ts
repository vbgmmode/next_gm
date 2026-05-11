import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardSelectionPrerequisiteContractShell,
  createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell,
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

const UNTOUCHED_DRAFT_BOARD_SELECTION_PREREQUISITE_DATABASE =
  "data/saves/__new-gm-mode-draft-board-selection-prerequisite-should-not-exist.sqlite";

describe("New GM Mode Draft Board Selection Prerequisite Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell();

    assert.equal(
      summary.draftBoardSelectionPrerequisiteSummaryId,
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes structurally ready selection prerequisites while pick validation remains blocked", () => {
    const summary = createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell();

    assert.equal(summary.selectionPrerequisiteContractAvailable, true);
    assert.equal(summary.displayReadinessAvailable, true);
    assert.equal(summary.orderingReadinessAvailable, true);
    assert.equal(summary.draftBoardInputReadinessAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(summary.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(
      summary.selectionPrerequisitePhase,
      "selection-prerequisites-structurally-ready-pick-validation-blocked"
    );
    assert.equal(summary.futureSelectionPrerequisitesStructurallySatisfied, true);
    assert.deepEqual(summary.selectionPrerequisiteSummary, {
      totalFixtureCount: 245,
      displayReadyEligibleCount: 235,
      excludedIneligibleCount: 10,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      selectedWrestlerChosen: false,
      actualDraftPickValidationReady: false,
      actualDraftPickExecutionReady: false
    });
    assert.equal(summary.actualDraftPickValidationAvailable, false);
    assert.equal(summary.actualDraftPickExecutionAvailable, false);
  });

  it("reports insufficient display-ready entries deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(
      summary.selectionPrerequisitePhase,
      "insufficient-display-ready-entries"
    );
    assert.equal(summary.futureSelectionPrerequisitesStructurallySatisfied, false);
    assert.deepEqual(summary.selectionPrerequisiteSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 0,
      excludedIneligibleCount: 7,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      selectedWrestlerChosen: false,
      actualDraftPickValidationReady: false,
      actualDraftPickExecutionReady: false
    });
  });

  it("references roster slot and championship division requirements without executing them", () => {
    const summary = createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell();

    assert.equal(summary.rosterSlotRequirementAvailable, true);
    assert.equal(summary.championshipDivisionRequirementAvailable, true);
    assert.equal(summary.capabilityFlags.rosterSlotContextAvailable, false);
    assert.equal(
      summary.capabilityFlags.championshipDivisionCompatibilityContextAvailable,
      false
    );
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.championshipDivisionAssignmentAvailable, false);
    assert.equal(summary.rosterAssignmentsCreated, false);
    assert.equal(summary.championshipAssignmentsCreated, false);
    assert.equal(summary.divisionAssignmentsCreated, false);
  });

  it("does not choose a wrestler or create draft board, draft pick, UI, gameplay, or persistence state", () => {
    const summary = createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell();

    assert.equal(summary.selectedWrestlerChosen, false);
    assert.equal(summary.selectedWrestlerId, null);
    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_SELECTION_PREREQUISITE_DATABASE), false);
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

  it("exposes selection prerequisite shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeDraftBoardSelectionPrerequisiteContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-board-selection-prerequisite-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
