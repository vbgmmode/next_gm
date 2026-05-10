import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardEligibilityInputContractShell,
  createNewGMModeDraftBoardEligibilityInputSummaryShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_BOARD_INPUT_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-draft-board-input-summary-should-not-exist.sqlite";

describe("New GM Mode Draft Board Eligibility Input Summary Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell();

    assert.equal(
      summary.draftBoardEligibilityInputSummaryId,
      "new-gm-mode-draft-board-eligibility-input-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.status, "diagnostics-only");
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
  });

  it("reports structurally satisfied draft board inputs while blocking actual board creation", () => {
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell();

    assert.equal(summary.draftBoardInputContractAvailable, true);
    assert.equal(summary.talentPoolReadinessAvailable, true);
    assert.equal(summary.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(
      summary.topLevelReadinessPhase,
      "structurally-ready-talent-pool-blocked"
    );
    assert.equal(summary.futureDraftBoardInputsStructurallySatisfied, true);
    assert.deepEqual(summary.draftBoardInputSummary, {
      totalFixtureCount: 10,
      eligibleFixtureCount: 9,
      ineligibleFixtureCount: 1,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    });
    assert.equal(summary.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.draftBoardsCreated, false);
  });

  it("reports insufficient eligible fixture scenarios deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(summary.topLevelReadinessPhase, "insufficient-eligible-fixtures");
    assert.equal(summary.futureDraftBoardInputsStructurallySatisfied, false);
    assert.deepEqual(summary.draftBoardInputSummary, {
      totalFixtureCount: 7,
      eligibleFixtureCount: 7,
      ineligibleFixtureCount: 0,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      validationIssueCount: 1,
      actualDraftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    });
  });

  it("reports malformed injected fixture scenarios without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          brandEligibility: []
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.equal(summary.topLevelReadinessPhase, "invalid-fixture-eligibility");
    assert.equal(summary.futureDraftBoardInputsStructurallySatisfied, false);
    assert.equal(summary.draftBoardInputSummary.totalFixtureCount, 10);
    assert.equal(summary.draftBoardInputSummary.eligibleFixtureCount, 8);
  });

  it("exposes all new shells from the domain index", () => {
    assert.equal(
      typeof createNewGMModeTalentPoolReadinessAggregatorShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftBoardEligibilityInputContractShell,
      "function"
    );
    assert.equal(
      typeof createNewGMModeDraftBoardEligibilityInputSummaryShell,
      "function"
    );
  });

  it("includes deterministic blocked reasons and capability flags", () => {
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell();

    assert.deepEqual(summary.blockedReasons, [
      "draft-board-eligibility-input-contract-only",
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
    assert.equal(summary.capabilityFlags.talentPoolCreationAvailable, false);
    assert.equal(summary.capabilityFlags.draftBoardCreationAvailable, false);
    assert.equal(summary.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(summary.capabilityFlags.draftPickValidationAvailable, false);
    assert.equal(summary.capabilityFlags.draftExecutionAvailable, false);
  });

  it("does not create saves, SQLite writes, draft state, roster state, gameplay, UI, or GenAI", () => {
    const summary = createNewGMModeDraftBoardEligibilityInputSummaryShell();

    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_INPUT_SUMMARY_DATABASE), false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
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
    assert.equal(summary.generatedTextCreated, false);
    assert.equal(summary.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-board-input-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardEligibilityInputSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
