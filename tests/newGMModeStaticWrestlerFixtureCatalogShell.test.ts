import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
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

const UNTOUCHED_STATIC_WRESTLER_FIXTURE_CATALOG_DATABASE =
  "data/saves/__new-gm-mode-static-wrestler-fixture-catalog-should-not-exist.sqlite";

describe("New GM Mode Static Wrestler Fixture Catalog Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.status, "diagnostics-only");
    assert.equal(
      catalog.staticWrestlerFixtureCatalogId,
      "new-gm-mode-static-wrestler-fixture-catalog-v0.1"
    );
    assert.equal(catalog.diagnosticsOnly, true);
    assert.equal(catalog.playerFacing, false);
    assert.equal(catalog.gameplayAffecting, false);
    assert.equal(catalog.deterministicOrdering, true);
  });

  it("includes a deterministic fixture list and stable catalog summary", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.fixtures.length, 10);
    assert.deepEqual(catalog.catalogSummary, {
      fixtureCount: 10,
      contractFieldCount: 14,
      fixtureOnly: true,
      externalWrestlerDataLoadingReady: false,
      wrestlerRecordCreationReady: false,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    });
  });

  it("includes stable wrestler IDs and deterministic order", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.deepEqual(
      catalog.fixtures.map((fixture) => fixture.wrestlerId),
      [
        "fixture-wrestler-001-ace-mercer",
        "fixture-wrestler-002-bruno-vale",
        "fixture-wrestler-003-cassian-ryde",
        "fixture-wrestler-004-dante-cross",
        "fixture-wrestler-005-elena-voss",
        "fixture-wrestler-006-fiona-hale",
        "fixture-wrestler-007-gia-stone",
        "fixture-wrestler-008-hana-reyes",
        "fixture-wrestler-009-ivan-north",
        "fixture-wrestler-010-jules-kade"
      ]
    );
    assert.deepEqual(
      catalog.fixtures.map((fixture) => fixture.slug),
      catalog.fixtures.map((fixture) => fixture.wrestlerId)
    );
  });

  it("every fixture includes the required wrestler data shape fields", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    for (const fixture of catalog.fixtures) {
      assert.equal(typeof fixture.wrestlerId, "string");
      assert.equal(typeof fixture.displayName, "string");
      assert.ok(fixture.genderDivisionEligibility.length > 0);
      assert.ok(fixture.roleCategoryTags.length > 0);
      assert.ok(fixture.brandEligibility.length > 0);
      assert.equal(typeof fixture.availabilityStatus, "string");
      assert.equal(typeof fixture.draftEligibility.eligible, "boolean");
      assert.ok(fixture.championshipDivisionEligibility.length > 0);
      assert.equal(typeof fixture.placeholderAttributes.popularityStarPower, "string");
      assert.equal(typeof fixture.placeholderAttributes.inRingAbility, "string");
      assert.equal(typeof fixture.placeholderAttributes.staminaDurability, "string");
      assert.equal(typeof fixture.placeholderAttributes.promoCharisma, "string");
      assert.equal(typeof fixture.placeholderAttributes.tagTeamCompatibility, "string");
      assert.equal(
        fixture.futurePersistenceCompatibilityMarker,
        "fixture-only-future-persistence-compatible"
      );
      assert.equal(fixture.fixtureOnly, true);
      assert.equal(fixture.createsRosterState, false);
      assert.equal(fixture.createsTalentPoolState, false);
      assert.equal(fixture.createsDraftBoardState, false);
      assert.equal(fixture.createsGameplayState, false);
    }
  });

  it("includes men's and women's division eligible fixture wrestlers", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.ok(
      catalog.fixtures.some((fixture) =>
        fixture.genderDivisionEligibility.includes("mens-division")
      )
    );
    assert.ok(
      catalog.fixtures.some((fixture) =>
        fixture.genderDivisionEligibility.includes("womens-division")
      )
    );
  });

  it("includes tag-compatible fixture wrestlers without creating tag teams", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const tagCompatibleFixtures = catalog.fixtures.filter(
      (fixture) =>
        fixture.roleCategoryTags.includes("tag-specialist") ||
        fixture.championshipDivisionEligibility.includes("tag-team-title") ||
        ["fixture-strong", "fixture-elite"].includes(
          fixture.placeholderAttributes.tagTeamCompatibility
        )
    );

    assert.ok(tagCompatibleFixtures.length >= 4);
    assert.equal(Object.hasOwn(catalog, "tagTeams"), false);
    assert.equal(Object.hasOwn(catalog, "tagTeamAssignments"), false);
  });

  it("includes world title and midcard eligible fixture wrestlers", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.ok(
      catalog.fixtures.some((fixture) =>
        fixture.championshipDivisionEligibility.includes("world-title")
      )
    );
    assert.ok(
      catalog.fixtures.some((fixture) =>
        fixture.championshipDivisionEligibility.includes("womens-world-title")
      )
    );
    assert.ok(
      catalog.fixtures.some((fixture) =>
        fixture.championshipDivisionEligibility.includes("midcard-title")
      )
    );
  });

  it("includes an unavailable non-draftable fixture example without executing logic", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const unavailableFixture = catalog.fixtures.find(
      (fixture) => fixture.availabilityStatus === "unavailable-fixture-example"
    );

    assert.deepEqual(unavailableFixture?.draftEligibility, {
      eligible: false,
      blockedReason: "fixture-unavailable-example-only"
    });
    assert.equal(catalog.draftPickValidationAvailable, false);
    assert.equal(catalog.draftPickValidationExecuted, false);
  });

  it("reports data shape dependencies and static catalog as available", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.deepEqual(catalog.availableNow, {
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true,
      staticWrestlerFixtureCatalogAvailable: true
    });
    assert.equal(catalog.wrestlerDataShapeContractAvailable, true);
    assert.equal(catalog.wrestlerDataShapeReadinessAggregatorAvailable, true);
    assert.equal(catalog.staticWrestlerFixtureCatalogAvailable, true);
  });

  it("reports external loading, records, pool, board, draft, and gameplay capabilities unavailable", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.deepEqual(catalog.capabilityFlags, {
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true,
      staticWrestlerFixtureCatalogAvailable: true,
      externalWrestlerDataLoadingAvailable: false,
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
    assert.equal(catalog.externalWrestlerDataLoadingAvailable, false);
    assert.equal(catalog.wrestlerRecordCreationAvailable, false);
    assert.equal(catalog.rosterIngestionAvailable, false);
    assert.equal(catalog.talentPoolCreationAvailable, false);
    assert.equal(catalog.draftBoardCreationAvailable, false);
    assert.equal(catalog.draftOrderingGenerationAvailable, false);
    assert.equal(catalog.draftPickValidationAvailable, false);
    assert.equal(catalog.draftExecutionAvailable, false);
    assert.equal(catalog.rosterAssignmentAvailable, false);
    assert.equal(catalog.championshipDivisionAssignmentAvailable, false);
    assert.equal(catalog.gameplayStartAvailable, false);
    assert.equal(catalog.gameplayPayloadPersistenceAvailable, false);
    assert.equal(catalog.uiWiringAvailable, false);
  });

  it("includes clear blocked reasons for loading, records, pools, boards, and draft execution", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.deepEqual(catalog.blockedReasons, [
      "static-wrestler-fixture-catalog-only",
      "wrestler-data-shape-contract-available",
      "wrestler-data-shape-readiness-aggregator-available",
      "external-wrestler-data-loading-not-implemented",
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
    assert.deepEqual(catalog.notImplemented, [
      "external-wrestler-data-loading-not-implemented",
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
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.saveCreated, false);
    assert.equal(catalog.sqliteWritten, false);
    assert.equal(catalog.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_STATIC_WRESTLER_FIXTURE_CATALOG_DATABASE),
      false
    );
    assert.equal(Object.hasOwn(catalog, "saveRepository"), false);
    assert.equal(Object.hasOwn(catalog, "createSave"), false);
    assert.equal(Object.hasOwn(catalog, "sqliteConnection"), false);
    assert.equal(Object.hasOwn(catalog, "persistencePayload"), false);
  });

  it("does not create talent pools, draft boards, picks, rosters, championships, divisions, matches, shows, or weeks", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.gameplayStateCreated, false);
    assert.equal(catalog.externalWrestlerDataLoaded, false);
    assert.equal(catalog.wrestlerDataCreated, false);
    assert.equal(catalog.wrestlerRecordsCreated, false);
    assert.equal(catalog.rosterIngested, false);
    assert.equal(catalog.talentPoolsCreated, false);
    assert.equal(catalog.eligibleTalentPoolsCreated, false);
    assert.equal(catalog.draftBoardsCreated, false);
    assert.equal(catalog.draftOrderingGenerated, false);
    assert.equal(catalog.draftPicksCreated, false);
    assert.equal(catalog.rostersCreated, false);
    assert.equal(catalog.rosterAssignmentsCreated, false);
    assert.equal(catalog.championshipsCreated, false);
    assert.equal(catalog.championshipAssignmentsCreated, false);
    assert.equal(catalog.divisionsCreated, false);
    assert.equal(catalog.divisionAssignmentsCreated, false);
    assert.equal(catalog.matchesCreated, false);
    assert.equal(catalog.showsCreated, false);
    assert.equal(catalog.weeksCreated, false);
    assert.equal(Object.hasOwn(catalog, "talentPool"), false);
    assert.equal(Object.hasOwn(catalog, "draftBoard"), false);
    assert.equal(Object.hasOwn(catalog, "draftPick"), false);
    assert.equal(Object.hasOwn(catalog, "roster"), false);
    assert.equal(Object.hasOwn(catalog, "championship"), false);
    assert.equal(Object.hasOwn(catalog, "division"), false);
    assert.equal(Object.hasOwn(catalog, "match"), false);
    assert.equal(Object.hasOwn(catalog, "show"), false);
    assert.equal(Object.hasOwn(catalog, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.draftLogicExecuted, false);
    assert.equal(catalog.draftExecutionExecuted, false);
    assert.equal(catalog.rosterAssignmentExecuted, false);
    assert.equal(catalog.championshipAssignmentExecuted, false);
    assert.equal(catalog.divisionAssignmentExecuted, false);
    assert.equal(catalog.weekOneUnlocked, false);
    assert.equal(catalog.matchSimulationExecuted, false);
    assert.equal(catalog.showBookingCreated, false);
    assert.equal(catalog.businessSystemsRun, false);
    assert.equal(catalog.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(catalog, "draftExecution"), false);
    assert.equal(Object.hasOwn(catalog, "weekOneUnlock"), false);
    assert.equal(Object.hasOwn(catalog, "gameplayStart"), false);
    assert.equal(Object.hasOwn(catalog, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.equal(catalog.generatedTextCreated, false);
    assert.equal(catalog.genAIUsed, false);
    assert.equal(Object.hasOwn(catalog, "generatedText"), false);
    assert.equal(Object.hasOwn(catalog, "genAIClient"), false);
    assert.equal(Object.hasOwn(catalog, "prompt"), false);
    assert.equal(Object.hasOwn(catalog, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstCatalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
    const secondCatalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

    assert.deepEqual(secondCatalog, firstCatalog);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-static-wrestler-fixture-catalog-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeStaticWrestlerFixtureCatalogShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
