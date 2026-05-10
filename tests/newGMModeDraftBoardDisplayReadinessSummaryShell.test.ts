import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardDisplayContractShell,
  createNewGMModeDraftBoardDisplayReadinessSummaryShell,
  createNewGMModeDraftBoardDisplayReadinessValidatorShell,
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

const UNTOUCHED_DRAFT_BOARD_DISPLAY_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-draft-board-display-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Board Display Readiness Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell();

    assert.equal(
      summary.draftBoardDisplayReadinessSummaryId,
      "new-gm-mode-draft-board-display-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes display readiness for the current static fixture set", () => {
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell();

    assert.equal(summary.displayContractAvailable, true);
    assert.equal(summary.displayValidatorAvailable, true);
    assert.equal(summary.orderingSummaryAvailable, true);
    assert.equal(summary.draftBoardInputSummaryAvailable, true);
    assert.equal(summary.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(
      summary.topLevelDisplayReadinessPhase,
      "structurally-ready-display-blocked"
    );
    assert.equal(
      summary.futureDraftBoardDisplayFieldsStructurallySatisfied,
      true
    );
    assert.deepEqual(summary.displayReadinessSummary, {
      totalFixtureCount: 10,
      displayReadyEligibleCount: 9,
      excludedIneligibleCount: 1,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 0,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    });
  });

  it("reports malformed display fields without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          placeholderAttributes: undefined
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.equal(summary.topLevelDisplayReadinessPhase, "invalid-display-fields");
    assert.equal(
      summary.futureDraftBoardDisplayFieldsStructurallySatisfied,
      false
    );
    assert.deepEqual(summary.displayReadinessSummary, {
      totalFixtureCount: 10,
      displayReadyEligibleCount: 8,
      excludedIneligibleCount: 2,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    });
  });

  it("reports insufficient display-ready entries without creating a board or UI", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(
      summary.topLevelDisplayReadinessPhase,
      "insufficient-display-ready-entries"
    );
    assert.equal(
      summary.futureDraftBoardDisplayFieldsStructurallySatisfied,
      false
    );
    assert.deepEqual(summary.displayReadinessSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleCount: 7,
      excludedIneligibleCount: 0,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    });
    assert.equal(summary.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.draftBoardUiRenderingAvailable, false);
  });

  it("keeps actual draft board display and UI creation blocked through capabilities", () => {
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell();

    assert.deepEqual(summary.blockedReasons, [
      "draft-board-display-contract-only",
      "draft-board-ordering-summary-required",
      "draft-board-eligibility-input-summary-required",
      "talent-pool-readiness-required",
      "eligible-ordered-wrestler-entries-not-persisted",
      "actual-draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "player-facing-draft-board-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(summary.capabilityFlags.draftBoardDisplayContractAvailable, true);
    assert.equal(
      summary.capabilityFlags.draftBoardDisplayReadinessValidatorAvailable,
      true
    );
    assert.equal(
      summary.capabilityFlags.draftBoardDisplayReadinessSummaryAvailable,
      true
    );
    assert.equal(summary.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftBoardDisplayAvailable, false);
    assert.equal(summary.capabilityFlags.draftBoardUiRenderingAvailable, false);
    assert.equal(summary.capabilityFlags.playerFacingDraftBoardAvailable, false);
  });

  it("exposes all display shells from the domain index", () => {
    assert.equal(typeof createNewGMModeDraftBoardDisplayContractShell, "function");
    assert.equal(
      typeof createNewGMModeDraftBoardDisplayReadinessValidatorShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftBoardDisplayReadinessSummaryShell,
      "function"
    );
  });

  it("does not create saves, SQLite writes, draft state, UI, gameplay, generated text, or GenAI", () => {
    const summary = createNewGMModeDraftBoardDisplayReadinessSummaryShell();

    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_DISPLAY_SUMMARY_DATABASE), false);
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
    const contextSeed = "new-gm-mode-draft-board-display-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardDisplayReadinessSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
