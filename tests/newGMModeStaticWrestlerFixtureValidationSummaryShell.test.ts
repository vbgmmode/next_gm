import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeStaticWrestlerFixtureValidationSummaryShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_STATIC_WRESTLER_FIXTURE_VALIDATION_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-static-wrestler-fixture-validation-summary-should-not-exist.sqlite";

describe("New GM Mode Static Wrestler Fixture Validation Summary Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const summary = createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(
      summary.validationSummaryId,
      "new-gm-mode-static-wrestler-fixture-validation-summary-v0.1"
    );
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.fixtureValidationOnly, true);
  });

  it("reports catalog availability, validator availability, fixture count, and valid/invalid counts", () => {
    const summary = createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.equal(summary.staticWrestlerFixtureCatalogAvailable, true);
    assert.equal(summary.staticWrestlerFixtureValidatorAvailable, true);
    assert.equal(summary.staticWrestlerFixtureValidationSummaryAvailable, true);
    assert.equal(summary.validationStatus, "structurally-valid");
    assert.deepEqual(summary.fixtureSummary, {
      fixtureCount: 245,
      validFixtureCount: 245,
      invalidFixtureCount: 0,
      validationIssueCount: 0,
      fixtureCatalogAvailable: true,
      validatorAvailable: true,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      gameplayStartReady: false
    });
    assert.deepEqual(summary.validationIssues, []);
  });

  it("keeps talent pool creation and all real draft/gameplay capabilities unavailable", () => {
    const summary = createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.deepEqual(summary.capabilityFlags, {
      staticWrestlerFixtureCatalogAvailable: true,
      staticWrestlerFixtureValidatorAvailable: true,
      staticWrestlerFixtureValidationSummaryAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerRecordCreationAvailable: false,
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
    assert.equal(summary.wrestlerRecordCreationAvailable, false);
    assert.equal(summary.talentPoolCreationAvailable, false);
    assert.equal(summary.draftBoardCreationAvailable, false);
    assert.equal(summary.draftPickValidationAvailable, false);
    assert.equal(summary.draftExecutionAvailable, false);
    assert.equal(summary.rosterAssignmentAvailable, false);
    assert.equal(summary.championshipDivisionAssignmentAvailable, false);
    assert.equal(summary.gameplayStartAvailable, false);
    assert.equal(summary.gameplayPayloadPersistenceAvailable, false);
    assert.equal(summary.uiWiringAvailable, false);
  });

  it("summarizes blocked reasons for why real talent pool creation remains unavailable", () => {
    const summary = createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.deepEqual(summary.blockedReasons, [
      "static-wrestler-fixture-validation-only",
      "external-wrestler-data-loading-not-implemented",
      "wrestler-record-creation-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create saves, SQLite writes, gameplay state, draft state, or generated text", () => {
    const summary = createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_STATIC_WRESTLER_FIXTURE_VALIDATION_SUMMARY_DATABASE),
      false
    );
    assert.equal(summary.wrestlerRecordsCreated, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.draftBoardStateCreated, false);
    assert.equal(summary.talentPoolsCreated, false);
    assert.equal(summary.eligibleTalentPoolsCreated, false);
    assert.equal(summary.draftBoardsCreated, false);
    assert.equal(summary.draftPicksCreated, false);
    assert.equal(summary.draftPickValidationExecuted, false);
    assert.equal(summary.rostersCreated, false);
    assert.equal(summary.rosterAssignmentsCreated, false);
    assert.equal(summary.championshipsCreated, false);
    assert.equal(summary.championshipAssignmentsCreated, false);
    assert.equal(summary.divisionsCreated, false);
    assert.equal(summary.divisionAssignmentsCreated, false);
    assert.equal(summary.matchesCreated, false);
    assert.equal(summary.showsCreated, false);
    assert.equal(summary.weeksCreated, false);
    assert.equal(summary.draftLogicExecuted, false);
    assert.equal(summary.draftExecutionExecuted, false);
    assert.equal(summary.weekOneUnlocked, false);
    assert.equal(summary.matchSimulationExecuted, false);
    assert.equal(summary.showBookingCreated, false);
    assert.equal(summary.businessSystemsRun, false);
    assert.equal(summary.fanSocialOutputCreated, false);
    assert.equal(summary.generatedTextCreated, false);
    assert.equal(summary.genAIUsed, false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstSummary =
      createNewGMModeStaticWrestlerFixtureValidationSummaryShell();
    const secondSummary =
      createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    assert.deepEqual(secondSummary, firstSummary);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-static-wrestler-fixture-validation-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeStaticWrestlerFixtureValidationSummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
