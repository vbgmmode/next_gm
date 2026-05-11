import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
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

const UNTOUCHED_DRAFT_BOARD_ORDERING_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-board-ordering-validator-should-not-exist.sqlite";

describe("New GM Mode Draft Board Ordering Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator = createNewGMModeDraftBoardOrderingValidatorShell();

    assert.equal(
      validator.draftBoardOrderingValidatorId,
      "new-gm-mode-draft-board-ordering-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
    assert.equal(validator.orderingValidationOnly, true);
  });

  it("reports current fixture ordering as structurally satisfied while board creation remains blocked", () => {
    const validator = createNewGMModeDraftBoardOrderingValidatorShell();

    assert.equal(validator.draftBoardEligibilityInputSummaryAvailable, true);
    assert.equal(validator.talentPoolReadinessAvailable, true);
    assert.equal(validator.staticWrestlerFixtureCatalogAvailable, true);
    assert.equal(
      validator.orderingReadinessPhase,
      "structurally-ready-ordering-blocked"
    );
    assert.equal(validator.futureDraftBoardOrderingStructurallySatisfied, true);
    assert.deepEqual(validator.orderingSummary, {
      totalFixtureCount: 245,
      eligibleOrderedEntryCount: 235,
      excludedIneligibleCount: 10,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 0,
      actualDraftBoardCreationReady: false
    });
    assert.equal(validator.actualDraftBoardCreationAvailable, false);
    assert.equal(validator.draftBoardsCreated, false);
  });

  it("returns deterministic eligible ordered entries and excludes unavailable non-draftable fixtures", () => {
    const validator = createNewGMModeDraftBoardOrderingValidatorShell();

    assert.deepEqual(
      validator.eligibleOrderedEntries
        .map((entry) => entry.wrestlerId)
        .slice(0, 5),
      [
        "fixture-wrestler-011-akira-tozawa",
        "fixture-wrestler-012-austin-theory",
        "fixture-wrestler-013-bron-breakker",
        "fixture-wrestler-014-bronson-reed",
        "fixture-wrestler-015-brutus-creed"
      ]
    );
    assert.deepEqual(
      validator.eligibleOrderedEntries
        .map((entry) => entry.orderingKey)
        .slice(0, 5),
      [
        "010:fixture-wrestler-011-akira-tozawa",
        "011:fixture-wrestler-012-austin-theory",
        "012:fixture-wrestler-013-bron-breakker",
        "013:fixture-wrestler-014-bronson-reed",
        "014:fixture-wrestler-015-brutus-creed"
      ]
    );
    assert.equal(validator.eligibleOrderedEntries.length, 235);
    assert.equal(validator.excludedIneligibleFixtures.length, 10);
    assert.deepEqual(validator.excludedIneligibleFixtures[8],
      {
        fixtureIndex: 8,
        wrestlerId: "fixture-wrestler-009-ivan-north",
        exclusionReasons: [
          "fixture-not-draft-eligible",
          "fixture-not-available"
        ]
      }
    );
    assert.equal(
      validator.eligibleOrderedEntries.some(
        (entry) => entry.wrestlerId === "fixture-wrestler-009-ivan-north"
      ),
      false
    );
  });

  it("preserves deterministic ordering across repeated calls and never uses random ordering", () => {
    const firstValidator = createNewGMModeDraftBoardOrderingValidatorShell();
    const secondValidator = createNewGMModeDraftBoardOrderingValidatorShell();

    assert.deepEqual(secondValidator.eligibleOrderedEntries, firstValidator.eligibleOrderedEntries);
    assert.deepEqual(secondValidator.deterministicOrderingSummary, {
      orderingAlgorithm: "fixture-index-then-wrestler-id",
      orderingKeyFields: ["fixtureIndex", "wrestlerId"],
      tieBreakerFields: ["wrestlerId"],
      randomOrderingUsed: false
    });
    assert.equal(secondValidator.randomOrderingUsed, false);
  });

  it("reports insufficient eligible fixture scenarios deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardOrderingValidatorShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(validator.orderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.equal(validator.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.deepEqual(validator.orderingSummary, {
      totalFixtureCount: 7,
      eligibleOrderedEntryCount: 0,
      excludedIneligibleCount: 7,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false
    });
    assert.deepEqual(validator.orderingIssues, [
      {
        fixtureIndex: 7,
        fieldId: "draftBoardEligibilityInputSummary",
        issue: "draft-board-input-summary-not-structurally-satisfied"
      },
      {
        fixtureIndex: 7,
        fieldId: "minimumEligibleRequirement",
        issue: "minimum-eligible-requirement-not-satisfied"
      }
    ]);
  });

  it("detects duplicate eligible wrestler IDs deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardOrderingValidatorShell({
      fixtures: [
        ...catalog.fixtures.slice(0, 10),
        catalog.fixtures[10],
        {
          ...catalog.fixtures[11],
          wrestlerId: catalog.fixtures[10].wrestlerId
        },
        ...catalog.fixtures.slice(12)
      ]
    });

    assert.equal(validator.orderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.ok(
      validator.orderingIssues.some(
        (issue) =>
          issue.fixtureIndex === 11 &&
          issue.wrestlerId === "fixture-wrestler-011-akira-tozawa" &&
          issue.fieldId === "wrestlerId" &&
          issue.issue === "duplicate-eligible-wrestler-id"
      )
    );
  });

  it("reports malformed injected fixtures without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardOrderingValidatorShell({
      fixtures: [
        ...catalog.fixtures.slice(0, 10),
        {
          ...catalog.fixtures[10],
          displayName: "",
          brandEligibility: [],
          draftEligibility: undefined
        },
        ...catalog.fixtures.slice(11)
      ]
    });

    assert.equal(validator.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.deepEqual(
      validator.orderingIssues
        .filter((issue) => issue.fixtureIndex === 10)
        .map((issue) => issue.issue),
      [
        "missing-wrestler-display-identity",
        "missing-brand-eligibility-visibility",
        "missing-draft-eligibility-visibility"
      ]
    );
  });

  it("keeps actual draft board, draft pick, roster, gameplay, persistence, UI, and GenAI boundaries closed", () => {
    const validator = createNewGMModeDraftBoardOrderingValidatorShell();

    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_ORDERING_VALIDATOR_DATABASE), false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.draftOrderStateCreated, false);
    assert.equal(validator.draftBoardsCreated, false);
    assert.equal(validator.draftPicksCreated, false);
    assert.equal(validator.draftPickValidationExecuted, false);
    assert.equal(validator.draftExecutionExecuted, false);
    assert.equal(validator.rosterAssignmentsCreated, false);
    assert.equal(validator.championshipAssignmentsCreated, false);
    assert.equal(validator.divisionAssignmentsCreated, false);
    assert.equal(validator.matchesCreated, false);
    assert.equal(validator.showsCreated, false);
    assert.equal(validator.weeksCreated, false);
    assert.equal(validator.weekOneUnlocked, false);
    assert.equal(validator.persistencePayloadsCreated, false);
    assert.equal(validator.generatedTextCreated, false);
    assert.equal(validator.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-board-ordering-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardOrderingValidatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
