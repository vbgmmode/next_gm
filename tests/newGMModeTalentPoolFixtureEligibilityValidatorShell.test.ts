import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeStaticWrestlerFixtureCatalogShell,
  createNewGMModeTalentPoolFixtureEligibilityValidatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_TALENT_POOL_ELIGIBILITY_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-talent-pool-eligibility-validator-should-not-exist.sqlite";

describe("New GM Mode Talent Pool Fixture Eligibility Validator Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    assert.equal(validator.status, "diagnostics-only");
    assert.equal(
      validator.validatorId,
      "new-gm-mode-talent-pool-fixture-eligibility-validator-v0.1"
    );
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
    assert.equal(validator.eligibilityValidationOnly, true);
  });

  it("confirms current static fixtures can be evaluated structurally", () => {
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    assert.equal(validator.sourceCatalogId, "new-gm-mode-static-wrestler-fixture-catalog-v0.1");
    assert.equal(validator.ruleContractId, "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1");
    assert.equal(
      validator.fixtureValidationSummaryId,
      "new-gm-mode-static-wrestler-fixture-validation-summary-v0.1"
    );
    assert.deepEqual(validator.fixtureEligibilitySummary, {
      totalFixtureCount: 245,
      eligibleCandidateCount: 235,
      ineligibleCandidateCount: 10,
      eligibilityIssueCount: 11,
      minimumEligibleTalentCount: 8,
      minimumEligibleTalentCountSatisfied: true,
      actualTalentPoolCreationReady: false
    });
  });

  it("returns deterministic eligible and ineligible fixture summaries", () => {
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    assert.deepEqual(
      validator.eligibleFixtures
        .map((fixture) => fixture.wrestlerId)
        .slice(0, 5),
      [
        "fixture-wrestler-011-akira-tozawa",
        "fixture-wrestler-012-austin-theory",
        "fixture-wrestler-013-bron-breakker",
        "fixture-wrestler-014-bronson-reed",
        "fixture-wrestler-015-brutus-creed"
      ]
    );
    assert.equal(validator.eligibleFixtures.length, 235);
    assert.equal(validator.ineligibleFixtures.length, 10);
    assert.deepEqual(validator.ineligibleFixtures[8], {
      fixtureIndex: 8,
      wrestlerId: "fixture-wrestler-009-ivan-north",
      slug: "fixture-wrestler-009-ivan-north",
      eligibilityStatus: "ineligible",
      eligibilityReasons: [
        "fixture-not-draft-eligible",
        "fixture-not-available"
      ]
    });
  });

  it("detects missing draft eligibility in malformed injected fixture override", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          draftEligibility: undefined
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.ok(
      validator.eligibilityIssues.some(
        (issue) =>
          issue.fixtureIndex === 0 &&
          issue.fieldId === "draftEligibility" &&
          issue.issue === "missing-draft-eligibility"
      )
    );
  });

  it("detects missing availability status in malformed injected fixture override", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          availabilityStatus: undefined
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.ok(
      validator.eligibilityIssues.some(
        (issue) =>
          issue.fixtureIndex === 0 &&
          issue.fieldId === "availabilityStatus" &&
          issue.issue === "missing-availability-status"
      )
    );
  });

  it("detects missing brand eligibility in malformed injected fixture override", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          brandEligibility: []
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.ok(
      validator.eligibilityIssues.some(
        (issue) =>
          issue.fixtureIndex === 0 &&
          issue.fieldId === "brandEligibility" &&
          issue.issue === "missing-brand-eligibility"
      )
    );
  });

  it("preserves deterministic issue ordering", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const fixtures = [
      {
        ...catalog.fixtures[0],
        draftEligibility: undefined,
        availabilityStatus: undefined,
        brandEligibility: [],
        genderDivisionEligibility: [],
        roleCategoryTags: [],
        championshipDivisionEligibility: [],
        futurePersistenceCompatibilityMarker: undefined
      },
      ...catalog.fixtures.slice(1)
    ];
    const firstValidator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
      fixtures
    });
    const secondValidator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
      fixtures
    });

    assert.deepEqual(secondValidator.eligibilityIssues, firstValidator.eligibilityIssues);
    assert.deepEqual(
      firstValidator.eligibilityIssues
        .filter((issue) => issue.fixtureIndex === 0)
        .map((issue) => issue.issue),
      [
        "fixture-validation-failed",
        "missing-draft-eligibility",
        "missing-availability-status",
        "missing-brand-eligibility",
        "missing-gender-division-eligibility",
        "missing-role-category-tags",
        "missing-championship-division-eligibility",
        "missing-future-persistence-compatibility-marker"
      ]
    );
  });

  it("reports eligibility capabilities while keeping actual talent pool creation unavailable", () => {
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    assert.deepEqual(validator.capabilityFlags, {
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
    assert.equal(validator.talentPoolCreationAvailable, false);
    assert.equal(validator.draftBoardCreationAvailable, false);
    assert.equal(validator.draftPickValidationAvailable, false);
    assert.equal(validator.draftExecutionAvailable, false);
  });

  it("does not create saves, SQLite writes, pool state, draft state, gameplay, or generated text", () => {
    const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_TALENT_POOL_ELIGIBILITY_VALIDATOR_DATABASE), false);
    assert.equal(validator.wrestlerRecordsCreated, false);
    assert.equal(validator.rosterStateCreated, false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.eligibleTalentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.talentPoolsCreated, false);
    assert.equal(validator.eligibleTalentPoolsCreated, false);
    assert.equal(validator.draftBoardsCreated, false);
    assert.equal(validator.draftPicksCreated, false);
    assert.equal(validator.draftPickValidationExecuted, false);
    assert.equal(validator.rostersCreated, false);
    assert.equal(validator.rosterAssignmentsCreated, false);
    assert.equal(validator.championshipsCreated, false);
    assert.equal(validator.championshipAssignmentsCreated, false);
    assert.equal(validator.divisionsCreated, false);
    assert.equal(validator.divisionAssignmentsCreated, false);
    assert.equal(validator.matchesCreated, false);
    assert.equal(validator.showsCreated, false);
    assert.equal(validator.weeksCreated, false);
    assert.equal(validator.draftLogicExecuted, false);
    assert.equal(validator.draftExecutionExecuted, false);
    assert.equal(validator.weekOneUnlocked, false);
    assert.equal(validator.generatedTextCreated, false);
    assert.equal(validator.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-talent-pool-eligibility-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeTalentPoolFixtureEligibilityValidatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
