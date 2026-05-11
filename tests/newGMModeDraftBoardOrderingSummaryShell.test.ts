import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardOrderingContractShell,
  createNewGMModeDraftBoardOrderingSummaryShell,
  createNewGMModeDraftBoardOrderingValidatorShell,
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

const UNTOUCHED_DRAFT_BOARD_ORDERING_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-draft-board-ordering-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Board Ordering Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftBoardOrderingSummaryShell();

    assert.equal(
      summary.draftBoardOrderingSummaryId,
      "new-gm-mode-draft-board-ordering-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("summarizes ordering readiness for the current static fixture set", () => {
    const summary = createNewGMModeDraftBoardOrderingSummaryShell();

    assert.equal(summary.orderingContractAvailable, true);
    assert.equal(summary.orderingValidatorAvailable, true);
    assert.equal(summary.draftBoardInputSummaryAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(summary.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(
      summary.topLevelOrderingReadinessPhase,
      "structurally-ready-ordering-blocked"
    );
    assert.equal(summary.futureDraftBoardOrderingStructurallySatisfied, true);
    assert.deepEqual(summary.orderingSummary, {
      totalFixtureCount: 245,
      eligibleOrderedCount: 235,
      excludedIneligibleCount: 10,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 0,
      actualDraftBoardCreationReady: false
    });
  });

  it("reports insufficient eligible fixture scenarios without creating a draft board", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardOrderingSummaryShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(summary.topLevelOrderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.equal(summary.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.deepEqual(summary.orderingSummary, {
      totalFixtureCount: 7,
      eligibleOrderedCount: 0,
      excludedIneligibleCount: 7,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false
    });
    assert.equal(summary.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.draftBoardsCreated, false);
  });

  it("reports malformed injected fixture scenarios without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardOrderingSummaryShell({
      fixtures: [
        ...catalog.fixtures.slice(0, 10),
        {
          ...catalog.fixtures[10],
          displayName: "",
          brandEligibility: []
        },
        ...catalog.fixtures.slice(11)
      ]
    });

    assert.equal(summary.topLevelOrderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.equal(summary.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.equal(summary.orderingSummary.totalFixtureCount, 245);
    assert.equal(summary.orderingSummary.eligibleOrderedCount, 234);
    assert.equal(summary.orderingSummary.validationIssueCount, 3);
  });

  it("keeps actual draft board creation blocked through reasons and capabilities", () => {
    const summary = createNewGMModeDraftBoardOrderingSummaryShell();

    assert.deepEqual(summary.blockedReasons, [
      "draft-board-ordering-contract-only",
      "draft-board-eligibility-input-summary-required",
      "talent-pool-readiness-required",
      "eligible-wrestler-list-not-persisted",
      "actual-draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(summary.capabilityFlags.draftBoardOrderingContractAvailable, true);
    assert.equal(summary.capabilityFlags.draftBoardOrderingValidatorAvailable, true);
    assert.equal(summary.capabilityFlags.draftBoardOrderingSummaryAvailable, true);
    assert.equal(summary.capabilityFlags.draftBoardCreationAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.capabilityFlags.draftPickValidationAvailable, false);
    assert.equal(summary.capabilityFlags.draftExecutionAvailable, false);
    assert.equal(summary.capabilityFlags.randomOrderingAvailable, false);
  });

  it("exposes all ordering shells from the domain index", () => {
    assert.equal(typeof createNewGMModeDraftBoardOrderingContractShell, "function");
    assert.equal(typeof createNewGMModeDraftBoardOrderingValidatorShell, "function");
    assert.equal(typeof createNewGMModeDraftBoardOrderingSummaryShell, "function");
  });

  it("does not create saves, SQLite writes, draft state, roster state, gameplay, UI, or GenAI", () => {
    const summary = createNewGMModeDraftBoardOrderingSummaryShell();

    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_ORDERING_SUMMARY_DATABASE), false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
    assert.equal(summary.draftOrderStateCreated, false);
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
    const contextSeed = "new-gm-mode-draft-board-ordering-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardOrderingSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
