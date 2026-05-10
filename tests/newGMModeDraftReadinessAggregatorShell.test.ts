import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftReadinessAggregatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_READINESS_AGGREGATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-readiness-aggregator-should-not-exist.sqlite";

describe("New GM Mode Draft Readiness Aggregator Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.status, "diagnostics-only");
    assert.equal(
      aggregator.draftReadinessAggregatorId,
      "new-gm-mode-draft-readiness-aggregator-v0.1"
    );
    assert.equal(aggregator.diagnosticsOnly, true);
    assert.equal(aggregator.playerFacing, false);
    assert.equal(aggregator.gameplayAffecting, false);
    assert.equal(aggregator.deterministicOrdering, true);
  });

  it("includes stable readiness IDs and deterministic order", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.deepEqual(
      aggregator.readinessPhases.map((phase) => phase.id),
      [
        "setup_contracts_available",
        "draft_prerequisites_defined",
        "talent_pool_prerequisites_defined",
        "draft_board_prerequisites_defined",
        "roster_slot_requirements_defined",
        "championship_division_requirements_defined",
        "blocked_real_draft_execution_unavailable"
      ]
    );
    assert.deepEqual(aggregator.readinessSummary, {
      phaseCount: 7,
      contractSummaryCount: 6,
      allDraftReadinessContractsAvailable: true,
      realDraftExecutionReady: false,
      weekOneUnlockReady: false,
      contractOnly: true
    });
  });

  it("includes setup readiness handoff summary", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.setupReadinessHandoffAvailable, true);
    assert.deepEqual(aggregator.setupReadinessHandoffSummary, {
      id: "new-gm-mode-setup-readiness-handoff-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 7,
      contractOnly: true
    });
  });

  it("includes draft prerequisite summary", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.draftPrerequisiteContractAvailable, true);
    assert.deepEqual(aggregator.draftPrerequisiteSummary, {
      id: "new-gm-mode-draft-prerequisite-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 10,
      contractOnly: true
    });
  });

  it("includes talent pool prerequisite summary", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

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
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.draftBoardPrerequisiteContractAvailable, true);
    assert.deepEqual(aggregator.draftBoardPrerequisiteSummary, {
      id: "new-gm-mode-draft-board-prerequisite-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 12,
      contractOnly: true
    });
  });

  it("includes roster slot requirement summary", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.rosterSlotRequirementContractAvailable, true);
    assert.deepEqual(aggregator.rosterSlotRequirementSummary, {
      id: "new-gm-mode-roster-slot-requirement-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 14,
      contractOnly: true
    });
  });

  it("includes championship and division requirement summary", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(
      aggregator.championshipDivisionRequirementContractAvailable,
      true
    );
    assert.deepEqual(aggregator.championshipDivisionRequirementSummary, {
      id: "new-gm-mode-championship-division-requirement-contract-v0.1",
      status: "diagnostics-only",
      available: true,
      itemCount: 16,
      contractOnly: true
    });
  });

  it("reports draft readiness contracts as available", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.setupReadinessHandoffAvailable, true);
    assert.equal(aggregator.draftPrerequisiteContractAvailable, true);
    assert.equal(aggregator.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(aggregator.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(aggregator.rosterSlotRequirementContractAvailable, true);
    assert.equal(
      aggregator.championshipDivisionRequirementContractAvailable,
      true
    );
    assert.equal(aggregator.draftReadinessAggregatorAvailable, true);
  });

  it("reports draft execution and gameplay start unavailable", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.talentPoolCreationAvailable, false);
    assert.equal(aggregator.draftBoardCreationAvailable, false);
    assert.equal(aggregator.draftPickValidationAvailable, false);
    assert.equal(aggregator.draftExecutionAvailable, false);
    assert.equal(aggregator.rosterCreationAvailable, false);
    assert.equal(aggregator.championshipCreationAvailable, false);
    assert.equal(aggregator.divisionCreationAvailable, false);
    assert.equal(aggregator.weekOneUnlockAvailable, false);
    assert.equal(aggregator.gameplayStartAvailable, false);
    assert.equal(aggregator.gameplayPayloadPersistenceAvailable, false);
    assert.equal(aggregator.uiWiringAvailable, false);
    assert.deepEqual(aggregator.blockedReasons, [
      "draft-readiness-aggregator-only",
      "talent-pool-creation-not-implemented",
      "wrestler-data-loading-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-creation-not-implemented",
      "championship-creation-not-implemented",
      "division-creation-not-implemented",
      "champion-assignment-not-implemented",
      "contender-pool-creation-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.saveCreated, false);
    assert.equal(aggregator.sqliteWritten, false);
    assert.equal(aggregator.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_READINESS_AGGREGATOR_DATABASE),
      false
    );
    assert.equal(Object.hasOwn(aggregator, "saveRepository"), false);
    assert.equal(Object.hasOwn(aggregator, "createSave"), false);
    assert.equal(Object.hasOwn(aggregator, "sqliteConnection"), false);
  });

  it("does not create wrestler data, pools, boards, rosters, championships, divisions, champions, contender pools, or gameplay entities", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.gameplayStateCreated, false);
    assert.equal(aggregator.wrestlerDataCreated, false);
    assert.equal(aggregator.wrestlerIdentityRecordsCreated, false);
    assert.equal(aggregator.eligibleTalentPoolsCreated, false);
    assert.equal(aggregator.talentPoolsCreated, false);
    assert.equal(aggregator.draftBoardsCreated, false);
    assert.equal(aggregator.draftOrderingGenerated, false);
    assert.equal(aggregator.draftPicksCreated, false);
    assert.equal(aggregator.draftPickValidationExecuted, false);
    assert.equal(aggregator.rostersCreated, false);
    assert.equal(aggregator.wrestlerAssignmentsCreated, false);
    assert.equal(aggregator.championshipsCreated, false);
    assert.equal(aggregator.championshipAssignmentsCreated, false);
    assert.equal(aggregator.divisionsCreated, false);
    assert.equal(aggregator.championsCreated, false);
    assert.equal(aggregator.championAssignmentsCreated, false);
    assert.equal(aggregator.contenderPoolsCreated, false);
    assert.equal(aggregator.matchesCreated, false);
    assert.equal(aggregator.showsCreated, false);
    assert.equal(aggregator.weeksCreated, false);
    assert.equal(Object.hasOwn(aggregator, "wrestlers"), false);
    assert.equal(Object.hasOwn(aggregator, "talentPool"), false);
    assert.equal(Object.hasOwn(aggregator, "draftBoard"), false);
    assert.equal(Object.hasOwn(aggregator, "draftPick"), false);
    assert.equal(Object.hasOwn(aggregator, "roster"), false);
    assert.equal(Object.hasOwn(aggregator, "championship"), false);
    assert.equal(Object.hasOwn(aggregator, "division"), false);
    assert.equal(Object.hasOwn(aggregator, "champion"), false);
    assert.equal(Object.hasOwn(aggregator, "contenderPool"), false);
    assert.equal(Object.hasOwn(aggregator, "matchSimulation"), false);
    assert.equal(Object.hasOwn(aggregator, "showBooking"), false);
    assert.equal(Object.hasOwn(aggregator, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.draftLogicExecuted, false);
    assert.equal(aggregator.rosterAssignmentExecuted, false);
    assert.equal(aggregator.championshipAssignmentExecuted, false);
    assert.equal(aggregator.divisionAssignmentExecuted, false);
    assert.equal(aggregator.weekOneUnlockAvailable, false);
    assert.equal(aggregator.weekOneUnlocked, false);
    assert.equal(aggregator.gameplayStartAvailable, false);
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
    const aggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.equal(aggregator.generatedTextCreated, false);
    assert.equal(aggregator.genAIUsed, false);
    assert.equal(Object.hasOwn(aggregator, "generatedText"), false);
    assert.equal(Object.hasOwn(aggregator, "genAIClient"), false);
    assert.equal(Object.hasOwn(aggregator, "prompt"), false);
    assert.equal(Object.hasOwn(aggregator, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstAggregator = createNewGMModeDraftReadinessAggregatorShell();
    const secondAggregator = createNewGMModeDraftReadinessAggregatorShell();

    assert.deepEqual(secondAggregator, firstAggregator);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-readiness-aggregator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftReadinessAggregatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
