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
      totalFixtureCount: 10,
      eligibleOrderedEntryCount: 9,
      excludedIneligibleCount: 1,
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
      validator.eligibleOrderedEntries.map((entry) => entry.wrestlerId),
      [
        "fixture-wrestler-001-ace-mercer",
        "fixture-wrestler-002-bruno-vale",
        "fixture-wrestler-003-cassian-ryde",
        "fixture-wrestler-004-dante-cross",
        "fixture-wrestler-005-elena-voss",
        "fixture-wrestler-006-fiona-hale",
        "fixture-wrestler-007-gia-stone",
        "fixture-wrestler-008-hana-reyes",
        "fixture-wrestler-010-jules-kade"
      ]
    );
    assert.deepEqual(
      validator.eligibleOrderedEntries.map((entry) => entry.orderingKey),
      [
        "000:fixture-wrestler-001-ace-mercer",
        "001:fixture-wrestler-002-bruno-vale",
        "002:fixture-wrestler-003-cassian-ryde",
        "003:fixture-wrestler-004-dante-cross",
        "004:fixture-wrestler-005-elena-voss",
        "005:fixture-wrestler-006-fiona-hale",
        "006:fixture-wrestler-007-gia-stone",
        "007:fixture-wrestler-008-hana-reyes",
        "009:fixture-wrestler-010-jules-kade"
      ]
    );
    assert.deepEqual(validator.excludedIneligibleFixtures, [
      {
        fixtureIndex: 8,
        wrestlerId: "fixture-wrestler-009-ivan-north",
        exclusionReasons: [
          "fixture-not-draft-eligible",
          "fixture-not-available"
        ]
      }
    ]);
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
      fixtures: catalog.fixtures.slice(0, 7)
    });

    assert.equal(validator.orderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.equal(validator.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.deepEqual(validator.orderingSummary, {
      totalFixtureCount: 7,
      eligibleOrderedEntryCount: 7,
      excludedIneligibleCount: 0,
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
        catalog.fixtures[0],
        {
          ...catalog.fixtures[1],
          wrestlerId: catalog.fixtures[0].wrestlerId
        },
        ...catalog.fixtures.slice(2)
      ]
    });

    assert.equal(validator.orderingReadinessPhase, "draft-board-inputs-not-ready");
    assert.ok(
      validator.orderingIssues.some(
        (issue) =>
          issue.fixtureIndex === 1 &&
          issue.wrestlerId === "fixture-wrestler-001-ace-mercer" &&
          issue.fieldId === "wrestlerId" &&
          issue.issue === "duplicate-eligible-wrestler-id"
      )
    );
  });

  it("reports malformed injected fixtures without repairing them", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardOrderingValidatorShell({
      fixtures: [
        {
          ...catalog.fixtures[0],
          displayName: "",
          brandEligibility: [],
          draftEligibility: undefined
        },
        ...catalog.fixtures.slice(1)
      ]
    });

    assert.equal(validator.futureDraftBoardOrderingStructurallySatisfied, false);
    assert.deepEqual(
      validator.orderingIssues
        .filter((issue) => issue.fixtureIndex === 0)
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
