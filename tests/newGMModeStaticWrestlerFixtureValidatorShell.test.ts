import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeStaticWrestlerFixtureCatalogShell,
  createNewGMModeStaticWrestlerFixtureValidatorShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_STATIC_WRESTLER_FIXTURE_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-static-wrestler-fixture-validator-should-not-exist.sqlite";

describe("New GM Mode Static Wrestler Fixture Validator Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell();

    assert.equal(validator.status, "diagnostics-only");
    assert.equal(
      validator.validatorId,
      "new-gm-mode-static-wrestler-fixture-validator-v0.1"
    );
    assert.equal(validator.diagnosticsOnly, true);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.deterministicOrdering, true);
  });

  it("confirms the current fixture catalog is structurally valid", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell();

    assert.equal(validator.sourceCatalogId, catalog.staticWrestlerFixtureCatalogId);
    assert.equal(validator.fixtureValidationStatus, "structurally-valid");
    assert.equal(validator.fixturesInspected, catalog.fixtures.length);
    assert.ok(validator.fixturesInspected >= 245);
    assert.equal(validator.validFixtureCount, catalog.fixtures.length);
    assert.equal(validator.invalidFixtureCount, 0);
    assert.deepEqual(validator.validationIssues, []);
  });

  it("detects missing required fields in supplied malformed fixture overrides", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const fixtures = [
      {
        ...catalog.fixtures[0],
        displayName: undefined,
        genderDivisionEligibility: [],
        placeholderAttributes: {
          ...catalog.fixtures[0].placeholderAttributes,
          promoCharisma: ""
        }
      },
      ...catalog.fixtures.slice(1)
    ];
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell({
      fixtures
    });

    assert.equal(validator.fixtureValidationStatus, "blocked");
    assert.equal(validator.fixturesInspected, catalog.fixtures.length);
    assert.equal(validator.validFixtureCount, catalog.fixtures.length - 1);
    assert.equal(validator.invalidFixtureCount, 1);
    assert.deepEqual(validator.validationIssues, [
      {
        fixtureIndex: 0,
        wrestlerId: "fixture-wrestler-001-ace-mercer",
        fieldId: "displayName",
        issue: "missing-display-name"
      },
      {
        fixtureIndex: 0,
        wrestlerId: "fixture-wrestler-001-ace-mercer",
        fieldId: "genderDivisionEligibility",
        issue: "missing-gender-division-eligibility"
      },
      {
        fixtureIndex: 0,
        wrestlerId: "fixture-wrestler-001-ace-mercer",
        fieldId: "promoCharisma",
        issue: "missing-promo-charisma-placeholder"
      }
    ]);
  });

  it("detects duplicate wrestler IDs in supplied fixture overrides", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const fixtures = [
      catalog.fixtures[0],
      {
        ...catalog.fixtures[1],
        wrestlerId: catalog.fixtures[0].wrestlerId,
        slug: catalog.fixtures[0].wrestlerId
      },
      ...catalog.fixtures.slice(2)
    ];
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell({
      fixtures
    });

    assert.equal(validator.fixtureValidationStatus, "blocked");
    assert.equal(validator.invalidFixtureCount, 1);
    assert.deepEqual(
      validator.validationIssues.map((issue) => issue.issue),
      ["duplicate-wrestler-id", "unstable-wrestler-id-order"]
    );
  });

  it("preserves deterministic issue ordering", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const fixtures = [
      {
        ...catalog.fixtures[0],
        wrestlerId: "",
        slug: "",
        displayName: "",
        brandEligibility: ["unknown-brand"],
        availabilityStatus: "unknown-status",
        draftEligibility: { eligible: "yes", blockedReason: "unknown" },
        championshipDivisionEligibility: ["unknown-title"],
        futurePersistenceCompatibilityMarker: "not-compatible",
        createsRosterState: true
      },
      ...catalog.fixtures.slice(1)
    ];
    const firstValidator = createNewGMModeStaticWrestlerFixtureValidatorShell({
      fixtures
    });
    const secondValidator = createNewGMModeStaticWrestlerFixtureValidatorShell({
      fixtures
    });

    assert.deepEqual(secondValidator.validationIssues, firstValidator.validationIssues);
    assert.deepEqual(
      firstValidator.validationIssues.map((issue) => issue.issue),
      [
        "missing-wrestler-id",
        "missing-slug",
        "missing-display-name",
        "invalid-brand-eligibility",
        "invalid-availability-status",
        "invalid-draft-eligibility",
        "invalid-championship-division-eligibility",
        "invalid-future-persistence-compatibility-marker",
        "fixture-created-roster-state"
      ]
    );
  });

  it("reports validation capabilities while keeping real talent and draft behavior unavailable", () => {
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell();

    assert.deepEqual(validator.capabilityFlags, {
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
    assert.equal(validator.talentPoolCreationAvailable, false);
    assert.equal(validator.draftBoardCreationAvailable, false);
    assert.equal(validator.draftPickValidationAvailable, false);
    assert.equal(validator.draftExecutionAvailable, false);
    assert.equal(validator.gameplayStartAvailable, false);
  });

  it("does not create saves, SQLite writes, gameplay state, draft state, or generated text", () => {
    const validator = createNewGMModeStaticWrestlerFixtureValidatorShell();

    assert.equal(validator.saveCreated, false);
    assert.equal(validator.sqliteWritten, false);
    assert.equal(validator.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_STATIC_WRESTLER_FIXTURE_VALIDATOR_DATABASE),
      false
    );
    assert.equal(validator.wrestlerRecordsCreated, false);
    assert.equal(validator.rosterStateCreated, false);
    assert.equal(validator.talentPoolStateCreated, false);
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
    assert.equal(validator.matchSimulationExecuted, false);
    assert.equal(validator.showBookingCreated, false);
    assert.equal(validator.businessSystemsRun, false);
    assert.equal(validator.fanSocialOutputCreated, false);
    assert.equal(validator.generatedTextCreated, false);
    assert.equal(validator.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-static-wrestler-fixture-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeStaticWrestlerFixtureValidatorShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
