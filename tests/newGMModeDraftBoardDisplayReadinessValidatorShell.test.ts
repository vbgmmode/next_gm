import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardDisplayReadinessValidatorShell,
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

const UNTOUCHED_DRAFT_BOARD_DISPLAY_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-board-display-validator-should-not-exist.sqlite";

describe("New GM Mode Draft Board Display Readiness Validator Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    assert.equal(
      validator.draftBoardDisplayReadinessValidatorId,
      "new-gm-mode-draft-board-display-readiness-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.status, "diagnostics-only");
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
    assert.equal(validator.displayReadinessValidationOnly, true);
  });

  it("reports current fixture display readiness while blocking board and UI creation", () => {
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    assert.equal(validator.draftBoardOrderingSummaryAvailable, true);
    assert.equal(validator.draftBoardOrderingValidatorAvailable, true);
    assert.equal(validator.draftBoardEligibilityInputSummaryAvailable, true);
    assert.equal(validator.talentPoolReadinessAvailable, true);
    assert.equal(
      validator.displayReadinessPhase,
      "structurally-ready-display-blocked"
    );
    assert.equal(
      validator.futureDraftBoardDisplayFieldsStructurallySatisfied,
      true
    );
    assert.deepEqual(validator.displayReadinessSummary, {
      totalFixtureCount: 245,
      displayReadyEligibleEntryCount: 235,
      excludedIneligibleCount: 10,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: true,
      validationIssueCount: 0,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    });
    assert.equal(validator.actualDraftBoardCreationAvailable, false);
    assert.equal(validator.draftBoardUiRenderingAvailable, false);
  });

  it("returns deterministic display-ready entries and excludes unavailable non-draftable fixtures", () => {
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    assert.deepEqual(
      validator.displayReadyEntries
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
    assert.equal(
      validator.displayReadyEntries.some(
        (entry) => entry.wrestlerId === "fixture-wrestler-009-ivan-north"
      ),
      false
    );
    assert.equal(validator.displayReadyEntries.length, 235);
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
  });

  it("reports deterministic display field readiness", () => {
    const firstValidator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();
    const secondValidator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    assert.deepEqual(secondValidator.displayReadyEntries, firstValidator.displayReadyEntries);
    assert.deepEqual(firstValidator.deterministicDisplayFieldReadinessSummary, {
      displayOrderingSource: "draft-board-ordering-validator",
      displayFieldIds: [
        "displayName",
        "brandEligibility",
        "draftEligibility",
        "availabilityStatus",
        "genderDivisionEligibility",
        "roleCategoryTags",
        "championshipDivisionEligibility",
        "placeholderAttributes"
      ],
      uiRenderingCreated: false,
      playerFacingDraftBoardCreated: false
    });
  });

  it("detects malformed display fields in injected fixture overrides", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell({
      fixtures: [
        ...catalog.fixtures.slice(0, 10),
        {
          ...catalog.fixtures[10],
          placeholderAttributes: undefined
        },
        ...catalog.fixtures.slice(11)
      ]
    });

    assert.equal(validator.displayReadinessPhase, "invalid-display-fields");
    assert.equal(
      validator.futureDraftBoardDisplayFieldsStructurallySatisfied,
      false
    );
    assert.deepEqual(validator.displayReadinessIssues, [
      {
        fixtureIndex: 10,
        wrestlerId: "fixture-wrestler-011-akira-tozawa",
        fieldId: "placeholderAttributes",
        issue: "missing-placeholder-attributes-visibility"
      },
      {
        fixtureIndex: 245,
        fieldId: "draftBoardOrderingSummary",
        issue: "draft-board-ordering-summary-not-structurally-satisfied"
      }
    ]);
    assert.equal(
      validator.displayReadinessSummary.displayReadyEligibleEntryCount,
      234
    );
  });

  it("detects duplicate eligible wrestler IDs deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell({
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

    assert.equal(validator.displayReadinessPhase, "duplicate-display-wrestler-ids");
    assert.ok(
      validator.displayReadinessIssues.some(
        (issue) =>
          issue.fixtureIndex === 11 &&
          issue.wrestlerId === "fixture-wrestler-011-akira-tozawa" &&
          issue.fieldId === "wrestlerId" &&
          issue.issue === "duplicate-display-wrestler-id"
      )
    );
  });

  it("reports insufficient display-ready entries deterministically", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell({
      fixtures: catalog.fixtures.slice(10, 17)
    });

    assert.equal(validator.displayReadinessPhase, "insufficient-display-ready-entries");
    assert.deepEqual(validator.displayReadinessSummary, {
      totalFixtureCount: 7,
      displayReadyEligibleEntryCount: 0,
      excludedIneligibleCount: 7,
      minimumEligibleRequirement: 8,
      minimumEligibleRequirementSatisfied: false,
      validationIssueCount: 2,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    });
    assert.deepEqual(
      validator.displayReadinessIssues.map((issue) => issue.issue),
      [
        "draft-board-ordering-summary-not-structurally-satisfied",
        "minimum-display-ready-entry-count-not-satisfied"
      ]
    );
  });

  it("does not create a draft board, UI, persistence, gameplay, generated text, or GenAI", () => {
    const validator = createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_DISPLAY_VALIDATOR_DATABASE), false);
    assert.equal(validator.talentPoolStateCreated, false);
    assert.equal(validator.draftBoardStateCreated, false);
    assert.equal(validator.draftOrderStateCreated, false);
    assert.equal(validator.draftBoardUiCreated, false);
    assert.equal(validator.playerFacingDraftBoardCreated, false);
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
    const contextSeed = "new-gm-mode-draft-board-display-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardDisplayReadinessValidatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
