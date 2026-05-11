import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeTalentPoolFixtureEligibilitySummaryShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_TALENT_POOL_ELIGIBILITY_SUMMARY_DATABASE =
  "data/saves/__new-gm-mode-talent-pool-eligibility-summary-should-not-exist.sqlite";

describe("New GM Mode Talent Pool Fixture Eligibility Summary Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const summary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    assert.equal(summary.status, "diagnostics-only");
    assert.equal(
      summary.eligibilitySummaryId,
      "new-gm-mode-talent-pool-fixture-eligibility-summary-v0.1"
    );
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.eligibilityValidationOnly, true);
  });

  it("reports rule contract, catalog, validator, counts, and blocked reasons", () => {
    const summary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    assert.equal(summary.talentPoolEligibilityRuleContractAvailable, true);
    assert.equal(summary.staticWrestlerFixtureCatalogAvailable, true);
    assert.equal(summary.staticWrestlerFixtureValidatorAvailable, true);
    assert.equal(summary.staticWrestlerFixtureValidationSummaryAvailable, true);
    assert.equal(summary.talentPoolFixtureEligibilityValidatorAvailable, true);
    assert.equal(summary.talentPoolFixtureEligibilitySummaryAvailable, true);
    assert.deepEqual(summary.eligibilitySummary, {
      totalFixtureCount: 245,
      eligibleCandidateCount: 235,
      ineligibleCandidateCount: 10,
      eligibilityIssueCount: 11,
      minimumEligibleTalentCountSatisfied: true,
      actualTalentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    });
    assert.deepEqual(summary.blockedReasons, [
      "talent-pool-eligibility-rule-contract-only",
      "selected-brand-context-not-implemented",
      "real-wrestler-record-creation-not-implemented",
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

  it("keeps actual talent pool creation unavailable", () => {
    const summary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    assert.deepEqual(summary.capabilityFlags, {
      staticWrestlerFixtureCatalogAvailable: true,
      staticWrestlerFixtureValidatorAvailable: true,
      staticWrestlerFixtureValidationSummaryAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      talentPoolEligibilityRuleContractAvailable: true,
      talentPoolFixtureEligibilityValidatorAvailable: true,
      talentPoolFixtureEligibilitySummaryAvailable: true,
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
    assert.equal(summary.gameplayStartAvailable, false);
  });

  it("does not create saves, SQLite writes, pool state, draft state, gameplay, or generated text", () => {
    const summary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    assert.equal(summary.saveCreated, false);
    assert.equal(summary.sqliteWritten, false);
    assert.equal(summary.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_TALENT_POOL_ELIGIBILITY_SUMMARY_DATABASE), false);
    assert.equal(summary.wrestlerRecordsCreated, false);
    assert.equal(summary.rosterStateCreated, false);
    assert.equal(summary.talentPoolStateCreated, false);
    assert.equal(summary.eligibleTalentPoolStateCreated, false);
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
    assert.equal(summary.generatedTextCreated, false);
    assert.equal(summary.genAIUsed, false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstSummary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();
    const secondSummary = createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    assert.deepEqual(secondSummary, firstSummary);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-talent-pool-eligibility-summary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeTalentPoolFixtureEligibilitySummaryShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
