import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
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

const UNTOUCHED_TALENT_POOL_READINESS_DATABASE =
  "data/saves/__new-gm-mode-talent-pool-readiness-should-not-exist.sqlite";

describe("New GM Mode Talent Pool Readiness Aggregator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell();

    assert.equal(
      aggregator.talentPoolReadinessAggregatorId,
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1"
    );
    assert.equal(aggregator.version, "0.1");
    assert.equal(aggregator.status, "diagnostics-only");
    assert.equal(aggregator.diagnosticsOnly, true);
    assert.equal(aggregator.playerFacing, false);
    assert.equal(aggregator.gameplayAffecting, false);
    assert.equal(aggregator.deterministicOrdering, true);
  });

  it("includes stable ordered readiness phases", () => {
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell();

    assert.deepEqual(
      aggregator.readinessPhases.map((phase) => phase.id),
      [
        "missing-rule-contract",
        "missing-fixture-validation",
        "insufficient-eligible-fixtures",
        "invalid-fixture-eligibility",
        "structurally-ready-talent-pool-blocked"
      ]
    );
    assert.deepEqual(
      aggregator.readinessPhases.map((phase) => phase.slug),
      aggregator.readinessPhases.map((phase) => phase.id)
    );
  });

  it("reports current static fixture readiness without creating a talent pool", () => {
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell();

    assert.equal(
      aggregator.readinessPhase,
      "structurally-ready-talent-pool-blocked"
    );
    assert.deepEqual(aggregator.readinessSummary, {
      totalFixtureCount: 10,
      eligibleFixtureCount: 9,
      ineligibleFixtureCount: 1,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      structuralTalentPoolReadinessSatisfied: true,
      validationIssueCount: 2,
      actualTalentPoolCreationReady: false
    });
    assert.equal(aggregator.talentPoolCreationAvailable, false);
    assert.equal(aggregator.talentPoolsCreated, false);
    assert.equal(aggregator.eligibleTalentPoolsCreated, false);
    assert.equal(aggregator.talentPoolStateCreated, false);
  });

  it("reports all composed availability flags", () => {
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell();

    assert.equal(aggregator.ruleContractAvailable, true);
    assert.equal(aggregator.fixtureValidatorAvailable, true);
    assert.equal(aggregator.fixtureEligibilitySummaryAvailable, true);
    assert.equal(aggregator.staticFixtureValidationAvailable, true);
    assert.equal(aggregator.wrestlerDataShapeReadinessAvailable, true);
    assert.equal(aggregator.draftReadinessContractAvailable, true);
    assert.equal(aggregator.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(aggregator.capabilityFlags.talentPoolCreationAvailable, false);
    assert.equal(aggregator.capabilityFlags.draftBoardCreationAvailable, false);
    assert.equal(aggregator.capabilityFlags.draftPickValidationAvailable, false);
    assert.equal(aggregator.capabilityFlags.draftExecutionAvailable, false);
  });

  it("reports insufficient eligible fixture scenarios deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell({
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(aggregator.readinessPhase, "insufficient-eligible-fixtures");
    assert.deepEqual(aggregator.readinessSummary, {
      totalFixtureCount: 7,
      eligibleFixtureCount: 7,
      ineligibleFixtureCount: 0,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      structuralTalentPoolReadinessSatisfied: false,
      validationIssueCount: 1,
      actualTalentPoolCreationReady: false
    });
    assert.deepEqual(aggregator.eligibilityIssues, [
      {
        fixtureIndex: 7,
        fieldId: "minimumEligibleTalentCount",
        issue: "minimum-eligible-talent-count-not-satisfied"
      }
    ]);
  });

  it("reports malformed injected fixtures without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          draftEligibility: undefined
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.equal(aggregator.readinessPhase, "invalid-fixture-eligibility");
    assert.equal(
      aggregator.readinessSummary.structuralTalentPoolReadinessSatisfied,
      false
    );
    assert.ok(
      aggregator.eligibilityIssues.some(
        (issue) =>
          issue.fixtureIndex === 0 &&
          issue.fieldId === "draftEligibility" &&
          issue.issue === "missing-draft-eligibility"
      )
    );
  });

  it("does not create saves, SQLite writes, draft state, roster state, gameplay, UI, or GenAI", () => {
    const aggregator = createNewGMModeTalentPoolReadinessAggregatorShell();

    assert.equal(aggregator.saveCreated, false);
    assert.equal(aggregator.sqliteWritten, false);
    assert.equal(aggregator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_TALENT_POOL_READINESS_DATABASE), false);
    assert.equal(aggregator.draftBoardStateCreated, false);
    assert.equal(aggregator.draftBoardsCreated, false);
    assert.equal(aggregator.draftPicksCreated, false);
    assert.equal(aggregator.draftPickValidationExecuted, false);
    assert.equal(aggregator.draftExecutionExecuted, false);
    assert.equal(aggregator.rosterAssignmentsCreated, false);
    assert.equal(aggregator.championshipAssignmentsCreated, false);
    assert.equal(aggregator.divisionAssignmentsCreated, false);
    assert.equal(aggregator.matchesCreated, false);
    assert.equal(aggregator.showsCreated, false);
    assert.equal(aggregator.weeksCreated, false);
    assert.equal(aggregator.weekOneUnlocked, false);
    assert.equal(aggregator.generatedTextCreated, false);
    assert.equal(aggregator.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-talent-pool-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeTalentPoolReadinessAggregatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
