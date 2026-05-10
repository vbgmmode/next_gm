import { createNewGMModeWrestlerDataShapeContractShell } from "./newGMModeWrestlerDataShapeContractShell.ts";
import { createNewGMModeWrestlerDataShapeReadinessAggregatorShell } from "./newGMModeWrestlerDataShapeReadinessAggregatorShell.ts";

export type NewGMModeStaticWrestlerFixtureGenderDivisionEligibility =
  | "mens-division"
  | "womens-division";

export type NewGMModeStaticWrestlerFixtureRoleCategoryTag =
  | "main-event"
  | "upper-card"
  | "midcard"
  | "tag-specialist"
  | "technical"
  | "powerhouse"
  | "high-flyer"
  | "promo-specialist"
  | "prospect"
  | "veteran";

export type NewGMModeStaticWrestlerFixtureBrandEligibility =
  | "brand-alpha"
  | "brand-beta"
  | "brand-cross-eligible";

export type NewGMModeStaticWrestlerFixtureAvailabilityStatus =
  | "available"
  | "unavailable-fixture-example";

export type NewGMModeStaticWrestlerFixtureChampionshipDivisionEligibility =
  | "world-title"
  | "womens-world-title"
  | "midcard-title"
  | "tag-team-title";

export type NewGMModeStaticWrestlerFixturePersistenceMarker =
  "fixture-only-future-persistence-compatible";

export type NewGMModeStaticWrestlerFixtureBlockedReason =
  | "static-wrestler-fixture-catalog-only"
  | "wrestler-data-shape-contract-available"
  | "wrestler-data-shape-readiness-aggregator-available"
  | "external-wrestler-data-loading-not-implemented"
  | "wrestler-record-creation-not-implemented"
  | "roster-ingestion-not-implemented"
  | "talent-pool-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-ordering-generation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeStaticWrestlerFixturePlaceholderAttributes {
  readonly popularityStarPower: string;
  readonly inRingAbility: string;
  readonly staminaDurability: string;
  readonly promoCharisma: string;
  readonly tagTeamCompatibility: string;
}

export interface NewGMModeStaticWrestlerFixture {
  readonly wrestlerId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly genderDivisionEligibility: readonly NewGMModeStaticWrestlerFixtureGenderDivisionEligibility[];
  readonly roleCategoryTags: readonly NewGMModeStaticWrestlerFixtureRoleCategoryTag[];
  readonly brandEligibility: readonly NewGMModeStaticWrestlerFixtureBrandEligibility[];
  readonly availabilityStatus: NewGMModeStaticWrestlerFixtureAvailabilityStatus;
  readonly draftEligibility: {
    readonly eligible: boolean;
    readonly blockedReason: "fixture-available-for-draft-validation" | "fixture-unavailable-example-only";
  };
  readonly championshipDivisionEligibility: readonly NewGMModeStaticWrestlerFixtureChampionshipDivisionEligibility[];
  readonly placeholderAttributes: NewGMModeStaticWrestlerFixturePlaceholderAttributes;
  readonly futurePersistenceCompatibilityMarker: NewGMModeStaticWrestlerFixturePersistenceMarker;
  readonly fixtureOnly: true;
  readonly createsRosterState: false;
  readonly createsTalentPoolState: false;
  readonly createsDraftBoardState: false;
  readonly createsGameplayState: false;
}

export interface NewGMModeStaticWrestlerFixtureCatalogShell {
  readonly status: "diagnostics-only";
  readonly staticWrestlerFixtureCatalogId: "new-gm-mode-static-wrestler-fixture-catalog-v0.1";
  readonly deterministicOrdering: true;
  readonly fixtures: readonly NewGMModeStaticWrestlerFixture[];
  readonly catalogSummary: {
    readonly fixtureCount: number;
    readonly contractFieldCount: number;
    readonly fixtureOnly: true;
    readonly externalWrestlerDataLoadingReady: false;
    readonly wrestlerRecordCreationReady: false;
    readonly talentPoolCreationReady: false;
    readonly draftBoardCreationReady: false;
    readonly draftExecutionReady: false;
    readonly gameplayStartReady: false;
  };
  readonly availableNow: {
    readonly wrestlerDataShapeContractAvailable: true;
    readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
    readonly staticWrestlerFixtureCatalogAvailable: true;
  };
  readonly notImplemented: readonly NewGMModeStaticWrestlerFixtureBlockedReason[];
  readonly wrestlerDataShapeContractAvailable: true;
  readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
  readonly staticWrestlerFixtureCatalogAvailable: true;
  readonly externalWrestlerDataLoadingAvailable: false;
  readonly wrestlerRecordCreationAvailable: false;
  readonly rosterIngestionAvailable: false;
  readonly talentPoolCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftOrderingGenerationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly capabilityFlags: {
    readonly wrestlerDataShapeContractAvailable: true;
    readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
    readonly staticWrestlerFixtureCatalogAvailable: true;
    readonly externalWrestlerDataLoadingAvailable: false;
    readonly wrestlerRecordCreationAvailable: false;
    readonly talentPoolCreationAvailable: false;
    readonly draftBoardCreationAvailable: false;
    readonly draftPickValidationAvailable: false;
    readonly draftExecutionAvailable: false;
    readonly rosterAssignmentAvailable: false;
    readonly championshipDivisionAssignmentAvailable: false;
    readonly gameplayStartAvailable: false;
    readonly gameplayPayloadPersistenceAvailable: false;
    readonly uiWiringAvailable: false;
  };
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly externalWrestlerDataLoaded: false;
  readonly wrestlerDataCreated: false;
  readonly wrestlerRecordsCreated: false;
  readonly rosterIngested: false;
  readonly talentPoolsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftOrderingGenerated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly rostersCreated: false;
  readonly rosterAssignmentsCreated: false;
  readonly championshipsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionsCreated: false;
  readonly divisionAssignmentsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
  readonly draftExecutionExecuted: false;
  readonly rosterAssignmentExecuted: false;
  readonly championshipAssignmentExecuted: false;
  readonly divisionAssignmentExecuted: false;
  readonly weekOneUnlocked: false;
  readonly matchSimulationExecuted: false;
  readonly showBookingCreated: false;
  readonly businessSystemsRun: false;
  readonly fanSocialOutputCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly blockedReasons: readonly NewGMModeStaticWrestlerFixtureBlockedReason[];
}

const STATIC_WRESTLER_FIXTURES: readonly NewGMModeStaticWrestlerFixture[] =
  Object.freeze([
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-001-ace-mercer",
      displayName: "Ace Mercer",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["main-event", "technical", "veteran"],
      brandEligibility: ["brand-alpha", "brand-cross-eligible"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["world-title", "midcard-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-high",
        inRingAbility: "fixture-elite",
        staminaDurability: "fixture-durable",
        promoCharisma: "fixture-strong",
        tagTeamCompatibility: "fixture-flexible"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-002-bruno-vale",
      displayName: "Bruno Vale",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["upper-card", "powerhouse", "veteran"],
      brandEligibility: ["brand-beta"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["world-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-strong",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-durable",
        promoCharisma: "fixture-steady",
        tagTeamCompatibility: "fixture-strong"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-003-cassian-ryde",
      displayName: "Cassian Ryde",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["midcard", "high-flyer", "prospect"],
      brandEligibility: ["brand-alpha"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["midcard-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-rising",
        inRingAbility: "fixture-flashy",
        staminaDurability: "fixture-steady",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-strong"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-004-dante-cross",
      displayName: "Dante Cross",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["midcard", "tag-specialist", "technical"],
      brandEligibility: ["brand-beta", "brand-cross-eligible"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["midcard-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-steady",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-durable",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-elite"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-005-elena-voss",
      displayName: "Elena Voss",
      genderDivisionEligibility: ["womens-division"],
      roleCategoryTags: ["main-event", "promo-specialist", "veteran"],
      brandEligibility: ["brand-alpha", "brand-cross-eligible"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["womens-world-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-elite",
        inRingAbility: "fixture-strong",
        staminaDurability: "fixture-steady",
        promoCharisma: "fixture-elite",
        tagTeamCompatibility: "fixture-flexible"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-006-fiona-hale",
      displayName: "Fiona Hale",
      genderDivisionEligibility: ["womens-division"],
      roleCategoryTags: ["upper-card", "technical", "tag-specialist"],
      brandEligibility: ["brand-beta"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["womens-world-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-strong",
        inRingAbility: "fixture-elite",
        staminaDurability: "fixture-durable",
        promoCharisma: "fixture-steady",
        tagTeamCompatibility: "fixture-strong"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-007-gia-stone",
      displayName: "Gia Stone",
      genderDivisionEligibility: ["womens-division"],
      roleCategoryTags: ["midcard", "powerhouse", "prospect"],
      brandEligibility: ["brand-alpha"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["womens-world-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-rising",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-durable",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-limited"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-008-hana-reyes",
      displayName: "Hana Reyes",
      genderDivisionEligibility: ["womens-division"],
      roleCategoryTags: ["midcard", "high-flyer", "tag-specialist"],
      brandEligibility: ["brand-beta", "brand-cross-eligible"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["womens-world-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-steady",
        inRingAbility: "fixture-flashy",
        staminaDurability: "fixture-steady",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-elite"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-009-ivan-north",
      displayName: "Ivan North",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["upper-card", "promo-specialist", "powerhouse"],
      brandEligibility: ["brand-alpha", "brand-cross-eligible"],
      availabilityStatus: "unavailable-fixture-example",
      draftEligible: false,
      championshipDivisionEligibility: ["world-title", "midcard-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-strong",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-limited",
        promoCharisma: "fixture-elite",
        tagTeamCompatibility: "fixture-flexible"
      }
    }),
    createStaticWrestlerFixture({
      wrestlerId: "fixture-wrestler-010-jules-kade",
      displayName: "Jules Kade",
      genderDivisionEligibility: ["mens-division"],
      roleCategoryTags: ["midcard", "tag-specialist", "prospect"],
      brandEligibility: ["brand-beta"],
      availabilityStatus: "available",
      draftEligible: true,
      championshipDivisionEligibility: ["midcard-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-developing",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-steady",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-strong"
      }
    })
  ]);

const BLOCKED_REASONS: readonly NewGMModeStaticWrestlerFixtureBlockedReason[] =
  Object.freeze([
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

const NOT_IMPLEMENTED: readonly NewGMModeStaticWrestlerFixtureBlockedReason[] =
  Object.freeze([
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

export function createNewGMModeStaticWrestlerFixtureCatalogShell(): NewGMModeStaticWrestlerFixtureCatalogShell {
  const dataShapeContract = createNewGMModeWrestlerDataShapeContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    staticWrestlerFixtureCatalogId:
      "new-gm-mode-static-wrestler-fixture-catalog-v0.1",
    deterministicOrdering: true,
    fixtures: STATIC_WRESTLER_FIXTURES,
    catalogSummary: Object.freeze({
      fixtureCount: STATIC_WRESTLER_FIXTURES.length,
      contractFieldCount: dataShapeContract.wrestlerDataShapeSummary.fieldCount,
      fixtureOnly: true,
      externalWrestlerDataLoadingReady: false,
      wrestlerRecordCreationReady: false,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    }),
    availableNow: Object.freeze({
      wrestlerDataShapeContractAvailable:
        typeof createNewGMModeWrestlerDataShapeContractShell === "function",
      wrestlerDataShapeReadinessAggregatorAvailable:
        typeof createNewGMModeWrestlerDataShapeReadinessAggregatorShell ===
        "function",
      staticWrestlerFixtureCatalogAvailable: true
    }),
    notImplemented: NOT_IMPLEMENTED,
    wrestlerDataShapeContractAvailable:
      typeof createNewGMModeWrestlerDataShapeContractShell === "function",
    wrestlerDataShapeReadinessAggregatorAvailable:
      typeof createNewGMModeWrestlerDataShapeReadinessAggregatorShell ===
      "function",
    staticWrestlerFixtureCatalogAvailable: true,
    externalWrestlerDataLoadingAvailable: false,
    wrestlerRecordCreationAvailable: false,
    rosterIngestionAvailable: false,
    talentPoolCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftOrderingGenerationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    capabilityFlags: Object.freeze({
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
    }),
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    externalWrestlerDataLoaded: false,
    wrestlerDataCreated: false,
    wrestlerRecordsCreated: false,
    rosterIngested: false,
    talentPoolsCreated: false,
    eligibleTalentPoolsCreated: false,
    draftBoardsCreated: false,
    draftOrderingGenerated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    rostersCreated: false,
    rosterAssignmentsCreated: false,
    championshipsCreated: false,
    championshipAssignmentsCreated: false,
    divisionsCreated: false,
    divisionAssignmentsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
    draftExecutionExecuted: false,
    rosterAssignmentExecuted: false,
    championshipAssignmentExecuted: false,
    divisionAssignmentExecuted: false,
    weekOneUnlocked: false,
    matchSimulationExecuted: false,
    showBookingCreated: false,
    businessSystemsRun: false,
    fanSocialOutputCreated: false,
    generatedTextCreated: false,
    genAIUsed: false,
    gameplayAffecting: false,
    diagnosticsOnly: true,
    playerFacing: false,
    blockedReasons: BLOCKED_REASONS
  });
}

function createStaticWrestlerFixture(input: {
  readonly wrestlerId: string;
  readonly displayName: string;
  readonly genderDivisionEligibility: readonly NewGMModeStaticWrestlerFixtureGenderDivisionEligibility[];
  readonly roleCategoryTags: readonly NewGMModeStaticWrestlerFixtureRoleCategoryTag[];
  readonly brandEligibility: readonly NewGMModeStaticWrestlerFixtureBrandEligibility[];
  readonly availabilityStatus: NewGMModeStaticWrestlerFixtureAvailabilityStatus;
  readonly draftEligible: boolean;
  readonly championshipDivisionEligibility: readonly NewGMModeStaticWrestlerFixtureChampionshipDivisionEligibility[];
  readonly placeholderAttributes: NewGMModeStaticWrestlerFixturePlaceholderAttributes;
}): NewGMModeStaticWrestlerFixture {
  return Object.freeze({
    wrestlerId: input.wrestlerId,
    slug: input.wrestlerId,
    displayName: input.displayName,
    genderDivisionEligibility: Object.freeze([
      ...input.genderDivisionEligibility
    ]),
    roleCategoryTags: Object.freeze([...input.roleCategoryTags]),
    brandEligibility: Object.freeze([...input.brandEligibility]),
    availabilityStatus: input.availabilityStatus,
    draftEligibility: Object.freeze({
      eligible: input.draftEligible,
      blockedReason: input.draftEligible
        ? "fixture-available-for-draft-validation"
        : "fixture-unavailable-example-only"
    }),
    championshipDivisionEligibility: Object.freeze([
      ...input.championshipDivisionEligibility
    ]),
    placeholderAttributes: Object.freeze({
      ...input.placeholderAttributes
    }),
    futurePersistenceCompatibilityMarker:
      "fixture-only-future-persistence-compatible",
    fixtureOnly: true,
    createsRosterState: false,
    createsTalentPoolState: false,
    createsDraftBoardState: false,
    createsGameplayState: false
  });
}
