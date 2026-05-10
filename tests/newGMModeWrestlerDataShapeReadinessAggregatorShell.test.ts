import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeWrestlerDataShapeReadinessAggregatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_WRESTLER_DATA_SHAPE_READINESS_DATABASE =
  "data/saves/__new-gm-mode-wrestler-data-shape-readiness-aggregator-should-not-exist.sqlite";

describe("New GM Mode Wrestler Data Shape Readiness Aggregator Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.status, "diagnostics-only");
    assert.equal(
      aggregator.wrestlerDataShapeReadinessAggregatorId,
      "new-gm-mode-wrestler-data-shape-readiness-aggregator-v0.1"
    );
    assert.equal(aggregator.diagnosticsOnly, true);
    assert.equal(aggregator.playerFacing, false);
    assert.equal(aggregator.gameplayAffecting, false);
    assert.equal(aggregator.deterministicOrdering, true);
  });

  it("includes stable readiness IDs, slugs, and deterministic order", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.deepEqual(
      aggregator.readinessPhases.map((phase) => phase.id),
      [
        "draft_readiness_contracts_available",
        "wrestler_data_shape_defined",
        "talent_pool_dependency_defined",
        "draft_board_dependency_defined",
        "blocked_real_wrestler_loading_unavailable",
        "blocked_real_talent_pool_creation_unavailable",
        "blocked_real_draft_execution_unavailable"
      ]
    );
    assert.deepEqual(
      aggregator.readinessPhases.map((phase) => phase.slug),
      aggregator.readinessPhases.map((phase) => phase.id)
    );
    assert.deepEqual(aggregator.readinessSummary, {
      phaseCount: 7,
      contractSummaryCount: 4,
      allWrestlerDataShapeDependenciesAvailable: true,
      realWrestlerLoadingReady: false,
      realTalentPoolCreationReady: false,
      realDraftExecutionReady: false,
      contractOnly: true
    });
  });

  it("includes draft readiness aggregator summary", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.draftReadinessAggregatorAvailable, true);
    assert.deepEqual(aggregator.draftReadinessAggregatorSummary, {
      id: "new-gm-mode-draft-readiness-aggregator-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 6,
      contractOnly: true
    });
  });

  it("includes wrestler data shape contract summary", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.wrestlerDataShapeContractAvailable, true);
    assert.deepEqual(aggregator.wrestlerDataShapeContractSummary, {
      id: "new-gm-mode-wrestler-data-shape-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 14,
      contractOnly: true
    });
  });

  it("includes talent pool prerequisite summary", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.talentPoolPrerequisiteContractAvailable, true);
    assert.deepEqual(aggregator.talentPoolPrerequisiteSummary, {
      id: "new-gm-mode-talent-pool-prerequisite-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 12,
      contractOnly: true
    });
  });

  it("includes draft board prerequisite summary", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.draftBoardPrerequisiteContractAvailable, true);
    assert.deepEqual(aggregator.draftBoardPrerequisiteSummary, {
      id: "new-gm-mode-draft-board-prerequisite-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 12,
      contractOnly: true
    });
  });

  it("reports currently available contract dependencies", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.deepEqual(aggregator.availableNow, {
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      talentPoolPrerequisiteContractAvailable: true,
      draftBoardPrerequisiteContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true
    });
    assert.equal(aggregator.draftReadinessAggregatorAvailable, true);
    assert.equal(aggregator.wrestlerDataShapeContractAvailable, true);
    assert.equal(aggregator.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(aggregator.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(
      aggregator.wrestlerDataShapeReadinessAggregatorAvailable,
      true
    );
  });

  it("reports wrestler data loading, talent pool creation, draft board creation, draft execution, and gameplay start unavailable", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.deepEqual(aggregator.capabilityFlags, {
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true,
      wrestlerDataLoadingAvailable: false,
      wrestlerRecordCreationAvailable: false,
      rosterIngestionAvailable: false,
      talentPoolCreationAvailable: false,
      draftBoardCreationAvailable: false,
      draftPickValidationAvailable: false,
      draftExecutionAvailable: false,
      rosterAssignmentAvailable: false,
      championshipDivisionAssignmentAvailable: false,
      gameplayStartAvailable: false,
      gameplayPayloadPersistenceAvailable: false,
      uiWiringAvailable: false
    });
    assert.equal(aggregator.wrestlerDataLoadingAvailable, false);
    assert.equal(aggregator.wrestlerRecordCreationAvailable, false);
    assert.equal(aggregator.rosterIngestionAvailable, false);
    assert.equal(aggregator.talentPoolCreationAvailable, false);
    assert.equal(aggregator.draftBoardCreationAvailable, false);
    assert.equal(aggregator.draftOrderingGenerationAvailable, false);
    assert.equal(aggregator.draftPickValidationAvailable, false);
    assert.equal(aggregator.draftExecutionAvailable, false);
    assert.equal(aggregator.rosterAssignmentAvailable, false);
    assert.equal(aggregator.championshipDivisionAssignmentAvailable, false);
    assert.equal(aggregator.gameplayStartAvailable, false);
    assert.equal(aggregator.gameplayPayloadPersistenceAvailable, false);
    assert.equal(aggregator.uiWiringAvailable, false);
  });

  it("includes clear blocked reasons for wrestler loading and talent pool creation", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.deepEqual(aggregator.blockedReasons, [
      "wrestler-data-shape-readiness-aggregator-only",
      "draft-readiness-aggregator-available",
      "wrestler-data-shape-contract-available",
      "talent-pool-prerequisite-contract-available",
      "draft-board-prerequisite-contract-available",
      "wrestler-data-loading-not-implemented",
      "wrestler-record-creation-not-implemented",
      "roster-ingestion-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-ordering-generation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.deepEqual(aggregator.notImplemented, [
      "wrestler-data-loading-not-implemented",
      "wrestler-record-creation-not-implemented",
      "roster-ingestion-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-ordering-generation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.saveCreated, false);
    assert.equal(aggregator.sqliteWritten, false);
    assert.equal(aggregator.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_WRESTLER_DATA_SHAPE_READINESS_DATABASE),
      false
    );
    assert.equal(Object.hasOwn(aggregator, "saveRepository"), false);
    assert.equal(Object.hasOwn(aggregator, "createSave"), false);
    assert.equal(Object.hasOwn(aggregator, "sqliteConnection"), false);
    assert.equal(Object.hasOwn(aggregator, "persistencePayload"), false);
  });

  it("does not create wrestler records, pools, boards, picks, rosters, championships, divisions, matches, shows, or weeks", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.gameplayStateCreated, false);
    assert.equal(aggregator.wrestlerDataLoaded, false);
    assert.equal(aggregator.wrestlerDataCreated, false);
    assert.equal(aggregator.wrestlerRecordsCreated, false);
    assert.equal(aggregator.rosterIngested, false);
    assert.equal(aggregator.talentPoolsCreated, false);
    assert.equal(aggregator.eligibleTalentPoolsCreated, false);
    assert.equal(aggregator.draftBoardsCreated, false);
    assert.equal(aggregator.draftOrderingGenerated, false);
    assert.equal(aggregator.draftPicksCreated, false);
    assert.equal(aggregator.draftPickValidationExecuted, false);
    assert.equal(aggregator.rostersCreated, false);
    assert.equal(aggregator.rosterAssignmentsCreated, false);
    assert.equal(aggregator.championshipsCreated, false);
    assert.equal(aggregator.championshipAssignmentsCreated, false);
    assert.equal(aggregator.divisionsCreated, false);
    assert.equal(aggregator.divisionAssignmentsCreated, false);
    assert.equal(aggregator.matchesCreated, false);
    assert.equal(aggregator.showsCreated, false);
    assert.equal(aggregator.weeksCreated, false);
    assert.equal(Object.hasOwn(aggregator, "wrestlers"), false);
    assert.equal(Object.hasOwn(aggregator, "wrestlerRecords"), false);
    assert.equal(Object.hasOwn(aggregator, "talentPool"), false);
    assert.equal(Object.hasOwn(aggregator, "draftBoard"), false);
    assert.equal(Object.hasOwn(aggregator, "draftPick"), false);
    assert.equal(Object.hasOwn(aggregator, "roster"), false);
    assert.equal(Object.hasOwn(aggregator, "championship"), false);
    assert.equal(Object.hasOwn(aggregator, "division"), false);
    assert.equal(Object.hasOwn(aggregator, "match"), false);
    assert.equal(Object.hasOwn(aggregator, "show"), false);
    assert.equal(Object.hasOwn(aggregator, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.draftLogicExecuted, false);
    assert.equal(aggregator.draftExecutionExecuted, false);
    assert.equal(aggregator.rosterAssignmentExecuted, false);
    assert.equal(aggregator.championshipAssignmentExecuted, false);
    assert.equal(aggregator.divisionAssignmentExecuted, false);
    assert.equal(aggregator.weekOneUnlocked, false);
    assert.equal(aggregator.matchSimulationExecuted, false);
    assert.equal(aggregator.showBookingCreated, false);
    assert.equal(aggregator.businessSystemsRun, false);
    assert.equal(aggregator.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(aggregator, "draftExecution"), false);
    assert.equal(Object.hasOwn(aggregator, "weekOneUnlock"), false);
    assert.equal(Object.hasOwn(aggregator, "gameplayStart"), false);
    assert.equal(Object.hasOwn(aggregator, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const aggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.equal(aggregator.generatedTextCreated, false);
    assert.equal(aggregator.genAIUsed, false);
    assert.equal(Object.hasOwn(aggregator, "generatedText"), false);
    assert.equal(Object.hasOwn(aggregator, "genAIClient"), false);
    assert.equal(Object.hasOwn(aggregator, "prompt"), false);
    assert.equal(Object.hasOwn(aggregator, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstAggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();
    const secondAggregator =
      createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    assert.deepEqual(secondAggregator, firstAggregator);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-wrestler-data-shape-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeWrestlerDataShapeReadinessAggregatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
