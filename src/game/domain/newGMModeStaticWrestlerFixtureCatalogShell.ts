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

export type NewGMModeStaticWrestlerFixtureSourceRosterPool =
  | "Raw"
  | "SmackDown"
  | "NXT"
  | "AEW"
  | "Legacy Fixture";

export type NewGMModeStaticWrestlerFixtureDivisionCategory =
  | "men"
  | "women"
  | "tag";

export type NewGMModeStaticWrestlerFixtureFinanceTier =
  | "Franchise"
  | "Main Event"
  | "Upper Card"
  | "Mid Card"
  | "Prospect"
  | "Specialist";

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
  readonly sourceRosterPool: NewGMModeStaticWrestlerFixtureSourceRosterPool;
  readonly divisionCategory: NewGMModeStaticWrestlerFixtureDivisionCategory;
  readonly financeProjectionTier: NewGMModeStaticWrestlerFixtureFinanceTier;
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "men",
      financeProjectionTier: "Franchise",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "men",
      financeProjectionTier: "Upper Card",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "men",
      financeProjectionTier: "Prospect",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "tag",
      financeProjectionTier: "Specialist",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "women",
      financeProjectionTier: "Main Event",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "tag",
      financeProjectionTier: "Upper Card",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "women",
      financeProjectionTier: "Prospect",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "tag",
      financeProjectionTier: "Mid Card",
      availabilityStatus: "available",
      draftEligible: false,
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "men",
      financeProjectionTier: "Upper Card",
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
      sourceRosterPool: "Legacy Fixture",
      divisionCategory: "tag",
      financeProjectionTier: "Prospect",
      availabilityStatus: "available",
      draftEligible: false,
      championshipDivisionEligibility: ["midcard-title", "tag-team-title"],
      placeholderAttributes: {
        popularityStarPower: "fixture-developing",
        inRingAbility: "fixture-solid",
        staminaDurability: "fixture-steady",
        promoCharisma: "fixture-developing",
        tagTeamCompatibility: "fixture-strong"
      }
    }),
    ...createPlayableRosterSeedFixtures()
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

let cachedStaticWrestlerFixtureCatalog:
  | NewGMModeStaticWrestlerFixtureCatalogShell
  | undefined;

export function createNewGMModeStaticWrestlerFixtureCatalogShell(): NewGMModeStaticWrestlerFixtureCatalogShell {
  if (cachedStaticWrestlerFixtureCatalog) {
    return cachedStaticWrestlerFixtureCatalog;
  }

  const dataShapeContract = createNewGMModeWrestlerDataShapeContractShell();

  cachedStaticWrestlerFixtureCatalog = Object.freeze({
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

  return cachedStaticWrestlerFixtureCatalog;
}

function createStaticWrestlerFixture(input: {
  readonly wrestlerId: string;
  readonly displayName: string;
  readonly genderDivisionEligibility: readonly NewGMModeStaticWrestlerFixtureGenderDivisionEligibility[];
  readonly roleCategoryTags: readonly NewGMModeStaticWrestlerFixtureRoleCategoryTag[];
  readonly brandEligibility: readonly NewGMModeStaticWrestlerFixtureBrandEligibility[];
  readonly sourceRosterPool: NewGMModeStaticWrestlerFixtureSourceRosterPool;
  readonly divisionCategory: NewGMModeStaticWrestlerFixtureDivisionCategory;
  readonly financeProjectionTier: NewGMModeStaticWrestlerFixtureFinanceTier;
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
    sourceRosterPool: input.sourceRosterPool,
    divisionCategory: input.divisionCategory,
    financeProjectionTier: input.financeProjectionTier,
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

interface PlayableRosterSeedEntry {
  readonly displayName: string;
  readonly sourceRosterPool: Exclude<
    NewGMModeStaticWrestlerFixtureSourceRosterPool,
    "Legacy Fixture"
  >;
  readonly divisionCategory: NewGMModeStaticWrestlerFixtureDivisionCategory;
  readonly financeProjectionTier: NewGMModeStaticWrestlerFixtureFinanceTier;
  readonly roleCategoryTags?: readonly NewGMModeStaticWrestlerFixtureRoleCategoryTag[];
}

function createPlayableRosterSeedEntries(): readonly PlayableRosterSeedEntry[] {
  return Object.freeze([
    ...createRosterEntries("Raw", "men", "Mid Card", [
      ["Akira Tozawa", "Specialist", ["tag-specialist", "high-flyer", "veteran"]],
      ["Austin Theory", "Upper Card", ["upper-card", "promo-specialist", "tag-specialist"]],
      ["Bron Breakker", "Main Event", ["main-event", "powerhouse"]],
      ["Bronson Reed", "Upper Card", ["upper-card", "powerhouse"]],
      ["Brutus Creed", "Mid Card", ["midcard", "technical", "tag-specialist"]],
      ["Chad Gable", "Upper Card", ["upper-card", "technical", "veteran"]],
      ["CM Punk", "Franchise", ["main-event", "promo-specialist", "veteran"]],
      ["Cruz Del Toro", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Dominik Mysterio", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Dragon Lee", "Upper Card", ["upper-card", "high-flyer"]],
      ["Erik", "Specialist", ["tag-specialist", "powerhouse", "veteran"]],
      ["Ethan Page", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Finn Balor", "Main Event", ["main-event", "technical", "veteran"]],
      ["Grayson Waller", "Mid Card", ["midcard", "promo-specialist"]],
      ["Ivar", "Specialist", ["tag-specialist", "powerhouse", "veteran"]],
      ["JD McDonagh", "Mid Card", ["midcard", "technical"]],
      ["Je'Von Evans", "Prospect", ["prospect", "high-flyer"]],
      ["Jey Uso", "Main Event", ["main-event", "promo-specialist", "tag-specialist"]],
      ["Jimmy Uso", "Upper Card", ["upper-card", "tag-specialist", "veteran"]],
      ["Joaquin Wilde", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Joe Hendry", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Julius Creed", "Mid Card", ["midcard", "technical", "tag-specialist"]],
      ["LA Knight", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Logan Paul", "Main Event", ["main-event", "promo-specialist"]],
      ["Ludwig Kaiser", "Mid Card", ["midcard", "technical"]],
      ["Otis", "Specialist", ["tag-specialist", "powerhouse", "veteran"]],
      ["Penta", "Main Event", ["main-event", "high-flyer"]],
      ["Pete Dunne", "Mid Card", ["midcard", "technical", "tag-specialist"]],
      ["Rey Mysterio", "Main Event", ["main-event", "high-flyer", "veteran"]],
      ["Rusev", "Upper Card", ["upper-card", "powerhouse", "veteran"]],
      ["Seth Rollins", "Franchise", ["main-event", "technical", "promo-specialist"]],
      ["Sheamus", "Upper Card", ["upper-card", "powerhouse", "veteran"]],
      ["Tyler Bate", "Mid Card", ["midcard", "technical", "tag-specialist"]]
    ]),
    ...createRosterEntries("Raw", "women", "Mid Card", [
      ["AJ Lee", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Asuka", "Main Event", ["main-event", "technical", "veteran"]],
      ["Bayley", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Becky Lynch", "Franchise", ["main-event", "promo-specialist", "veteran"]],
      ["Brie Bella", "Specialist", ["tag-specialist", "veteran"]],
      ["Ivy Nile", "Mid Card", ["midcard", "technical"]],
      ["IYO SKY", "Main Event", ["main-event", "high-flyer"]],
      ["Liv Morgan", "Main Event", ["main-event", "promo-specialist"]],
      ["Lyra Valkyria", "Upper Card", ["upper-card", "technical"]],
      ["Maxxine Dupri", "Prospect", ["prospect", "promo-specialist"]],
      ["Naomi", "Upper Card", ["upper-card", "high-flyer", "veteran"]],
      ["Natalya", "Specialist", ["tag-specialist", "technical", "veteran"]],
      ["Nikki Bella", "Specialist", ["tag-specialist", "veteran"]],
      ["Paige", "Specialist", ["tag-specialist", "veteran"]],
      ["Raquel Rodriguez", "Upper Card", ["upper-card", "powerhouse", "tag-specialist"]],
      ["Roxanne Perez", "Upper Card", ["upper-card", "technical"]],
      ["Sol Ruca", "Prospect", ["prospect", "high-flyer"]],
      ["Stephanie Vaquer", "Upper Card", ["upper-card", "technical"]],
      ["Zaria", "Prospect", ["prospect", "powerhouse"]]
    ]),
    ...createRosterEntries("SmackDown", "men", "Mid Card", [
      ["Angel", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Angelo Dawkins", "Specialist", ["tag-specialist", "powerhouse"]],
      ["Axiom", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Berto", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Carmelo Hayes", "Upper Card", ["upper-card", "high-flyer", "promo-specialist"]],
      ["Cody Rhodes", "Franchise", ["main-event", "promo-specialist"]],
      ["Damian Priest", "Main Event", ["main-event", "powerhouse", "veteran"]],
      ["Danhausen", "Specialist", ["promo-specialist", "veteran"]],
      ["Drew McIntyre", "Main Event", ["main-event", "powerhouse", "veteran"]],
      ["Elton Prince", "Specialist", ["tag-specialist", "promo-specialist"]],
      ["Gunther", "Franchise", ["main-event", "technical", "powerhouse"]],
      ["Ilja Dragunov", "Upper Card", ["upper-card", "technical"]],
      ["Jacob Fatu", "Main Event", ["main-event", "powerhouse"]],
      ["Johnny Gargano", "Upper Card", ["upper-card", "technical", "tag-specialist"]],
      ["Kevin Owens", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Kit Wilson", "Specialist", ["tag-specialist", "promo-specialist"]],
      ["Matt Cardona", "Upper Card", ["upper-card", "promo-specialist", "veteran"]],
      ["The Miz", "Upper Card", ["upper-card", "promo-specialist", "veteran"]],
      ["Montez Ford", "Upper Card", ["upper-card", "high-flyer", "tag-specialist"]],
      ["Nathan Frazer", "Specialist", ["tag-specialist", "high-flyer"]],
      ["R-Truth", "Specialist", ["promo-specialist", "veteran"]],
      ["Randy Orton", "Franchise", ["main-event", "promo-specialist", "veteran"]],
      ["Rey Fenix", "Upper Card", ["upper-card", "high-flyer"]],
      ["Ricky Saints", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Roman Reigns", "Franchise", ["main-event", "promo-specialist", "powerhouse"]],
      ["Royce Keys", "Prospect", ["prospect", "powerhouse"]],
      ["Sami Zayn", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Shinsuke Nakamura", "Upper Card", ["upper-card", "technical", "veteran"]],
      ["Solo Sikoa", "Upper Card", ["upper-card", "powerhouse"]],
      ["Talla Tonga", "Mid Card", ["midcard", "powerhouse"]],
      ["Tama Tonga", "Mid Card", ["midcard", "tag-specialist", "veteran"]],
      ["Trick Williams", "Main Event", ["main-event", "promo-specialist"]]
    ]),
    ...createRosterEntries("SmackDown", "women", "Mid Card", [
      ["Alexa Bliss", "Upper Card", ["upper-card", "promo-specialist", "veteran"]],
      ["B-Fab", "Specialist", ["promo-specialist", "veteran"]],
      ["Bianca Belair", "Franchise", ["main-event", "powerhouse"]],
      ["Blake Monroe", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Candice LeRae", "Specialist", ["tag-specialist", "technical", "veteran"]],
      ["Chelsea Green", "Specialist", ["promo-specialist", "tag-specialist"]],
      ["Fallon Henley", "Prospect", ["prospect", "tag-specialist"]],
      ["Giulia", "Upper Card", ["upper-card", "technical"]],
      ["Jade Cargill", "Main Event", ["main-event", "powerhouse"]],
      ["Jacy Jayne", "Mid Card", ["midcard", "promo-specialist"]],
      ["Jordynne Grace", "Upper Card", ["upper-card", "powerhouse"]],
      ["Kiana James", "Mid Card", ["midcard", "promo-specialist"]],
      ["Lainey Reid", "Prospect", ["prospect", "promo-specialist"]],
      ["Lash Legend", "Mid Card", ["midcard", "powerhouse"]],
      ["Mariah May", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Michin", "Mid Card", ["midcard", "technical", "veteran"]],
      ["Nia Jax", "Main Event", ["main-event", "powerhouse", "veteran"]],
      ["Piper Niven", "Mid Card", ["midcard", "powerhouse", "tag-specialist"]],
      ["Rhea Ripley", "Franchise", ["main-event", "powerhouse", "promo-specialist"]],
      ["Tiffany Stratton", "Main Event", ["main-event", "high-flyer", "promo-specialist"]]
    ]),
    ...createRosterEntries("NXT", "men", "Prospect", [
      ["Brad Baylor", "Prospect", ["prospect", "tag-specialist"]],
      ["Bronco Nima", "Prospect", ["prospect", "powerhouse", "tag-specialist"]],
      ["Brooks Jensen", "Mid Card", ["midcard", "powerhouse"]],
      ["Channing Stacks Lorenzo", "Mid Card", ["midcard", "technical", "veteran"]],
      ["Charlie Dempsey", "Upper Card", ["upper-card", "technical"]],
      ["Cutler James", "Prospect", ["prospect", "powerhouse"]],
      ["Dion Lennox", "Prospect", ["prospect", "powerhouse"]],
      ["EK Prosper", "Prospect", ["prospect", "high-flyer"]],
      ["Elio LeFleur", "Prospect", ["prospect", "promo-specialist"]],
      ["Hank Walker", "Prospect", ["prospect", "tag-specialist", "powerhouse"]],
      ["Jackson Drake", "Prospect", ["prospect", "technical"]],
      ["Jasper Troy", "Prospect", ["prospect", "powerhouse"]],
      ["Josh Briggs", "Mid Card", ["midcard", "powerhouse"]],
      ["Kale Dixon", "Prospect", ["prospect", "technical"]],
      ["Lexis King", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Lucien Price", "Prospect", ["prospect", "tag-specialist", "powerhouse"]],
      ["Myles Borne", "Upper Card", ["upper-card", "technical"]],
      ["Niko Vance", "Prospect", ["prospect", "powerhouse"]],
      ["Noam Dar", "Mid Card", ["midcard", "technical", "veteran"]],
      ["Osiris Griffin", "Prospect", ["prospect", "powerhouse"]],
      ["Ricky Smokes", "Prospect", ["prospect", "tag-specialist"]],
      ["Saquon Shugars", "Prospect", ["prospect", "powerhouse"]],
      ["Sean Legacy", "Prospect", ["prospect", "high-flyer"]],
      ["Shawn Spears", "Mid Card", ["midcard", "promo-specialist", "veteran"]],
      ["Shiloh Hill", "Prospect", ["prospect", "powerhouse"]],
      ["Tank Ledger", "Prospect", ["prospect", "tag-specialist", "powerhouse"]],
      ["Tavion Heights", "Prospect", ["prospect", "technical"]],
      ["Tony D'Angelo", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Uriah Connors", "Prospect", ["prospect", "technical"]]
    ]),
    ...createRosterEntries("NXT", "women", "Prospect", [
      ["Adriana Rizzo", "Prospect", ["prospect", "promo-specialist"]],
      ["Arianna Grace", "Prospect", ["prospect", "promo-specialist"]],
      ["Izzi Dame", "Mid Card", ["midcard", "powerhouse"]],
      ["Jaida Parker", "Mid Card", ["midcard", "powerhouse"]],
      ["Kali Armstrong", "Prospect", ["prospect", "powerhouse"]],
      ["Karmen Petrovic", "Prospect", ["prospect", "technical"]],
      ["Kelani Jordan", "Mid Card", ["midcard", "high-flyer"]],
      ["Kendal Grey", "Prospect", ["prospect", "technical", "tag-specialist"]],
      ["Lola Vice", "Upper Card", ["upper-card", "technical"]],
      ["Nikkita Lyons", "Mid Card", ["midcard", "powerhouse"]],
      ["Skylar Raye", "Prospect", ["prospect", "high-flyer"]],
      ["Tatum Paxley", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Thea Hail", "Mid Card", ["midcard", "technical"]],
      ["Wendy Choo", "Mid Card", ["midcard", "promo-specialist"]],
      ["Wren Sinclair", "Mid Card", ["midcard", "technical", "tag-specialist"]]
    ]),
    ...createRosterEntries("AEW", "men", "Mid Card", [
      ["Aaron Solo", "Prospect", ["prospect", "tag-specialist"]],
      ["Adam Cole", "Main Event", ["main-event", "promo-specialist", "technical"]],
      ["Adam Copeland", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Adam Page", "Franchise", ["main-event", "promo-specialist"]],
      ["Angelo Parker", "Specialist", ["tag-specialist", "promo-specialist"]],
      ["Anthony Bowens", "Upper Card", ["upper-card", "promo-specialist", "tag-specialist"]],
      ["Austin Gunn", "Specialist", ["tag-specialist", "promo-specialist"]],
      ["Bandido", "Upper Card", ["upper-card", "high-flyer"]],
      ["Big Bill", "Upper Card", ["upper-card", "powerhouse"]],
      ["Bishop Kaun", "Specialist", ["tag-specialist", "powerhouse"]],
      ["Blake Christian", "Prospect", ["prospect", "high-flyer"]],
      ["Bobby Lashley", "Main Event", ["main-event", "powerhouse", "veteran"]],
      ["Brian Cage", "Upper Card", ["upper-card", "powerhouse", "veteran"]],
      ["Brody King", "Upper Card", ["upper-card", "powerhouse", "tag-specialist"]],
      ["Bryan Danielson", "Franchise", ["main-event", "technical", "veteran"]],
      ["Bryan Keith", "Mid Card", ["midcard", "technical"]],
      ["Buddy Matthews", "Upper Card", ["upper-card", "technical"]],
      ["Cash Wheeler", "Specialist", ["tag-specialist", "technical", "veteran"]],
      ["Christian Cage", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Claudio Castagnoli", "Main Event", ["main-event", "technical", "powerhouse"]],
      ["Colten Gunn", "Specialist", ["tag-specialist", "promo-specialist"]],
      ["Daniel Garcia", "Upper Card", ["upper-card", "technical"]],
      ["Dante Martin", "Prospect", ["prospect", "high-flyer", "tag-specialist"]],
      ["Darby Allin", "Franchise", ["main-event", "high-flyer", "promo-specialist"]],
      ["Darius Martin", "Specialist", ["tag-specialist", "high-flyer"]],
      ["Dax Harwood", "Specialist", ["tag-specialist", "technical", "veteran"]],
      ["Dustin Rhodes", "Specialist", ["tag-specialist", "veteran"]],
      ["Eddie Kingston", "Upper Card", ["upper-card", "promo-specialist", "veteran"]],
      ["Hook", "Mid Card", ["midcard", "technical"]],
      ["Jack Perry", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Jay Lethal", "Specialist", ["tag-specialist", "technical", "veteran"]],
      ["Jay White", "Main Event", ["main-event", "promo-specialist", "technical"]],
      ["Jon Moxley", "Franchise", ["main-event", "promo-specialist", "veteran"]],
      ["Josh Alexander", "Upper Card", ["upper-card", "technical"]],
      ["Juice Robinson", "Mid Card", ["midcard", "promo-specialist", "tag-specialist"]],
      ["Katsuyori Shibata", "Specialist", ["technical", "veteran"]],
      ["Kazuchika Okada", "Franchise", ["main-event", "technical"]],
      ["Kenny Omega", "Franchise", ["main-event", "technical", "veteran"]],
      ["Kevin Knight", "Upper Card", ["upper-card", "high-flyer"]],
      ["Konosuke Takeshita", "Main Event", ["main-event", "technical", "powerhouse"]],
      ["Kota Ibushi", "Main Event", ["main-event", "technical", "veteran"]],
      ["Kyle Fletcher", "Upper Card", ["upper-card", "technical", "tag-specialist"]],
      ["Kyle O'Reilly", "Mid Card", ["midcard", "technical", "veteran"]],
      ["Lance Archer", "Specialist", ["powerhouse", "veteran"]],
      ["Mark Briscoe", "Upper Card", ["upper-card", "promo-specialist", "veteran"]],
      ["Mark Davis", "Specialist", ["tag-specialist", "powerhouse"]],
      ["Matt Jackson", "Specialist", ["tag-specialist", "high-flyer", "veteran"]],
      ["MJF", "Franchise", ["main-event", "promo-specialist"]],
      ["Nick Jackson", "Specialist", ["tag-specialist", "high-flyer", "veteran"]],
      ["Orange Cassidy", "Main Event", ["main-event", "promo-specialist"]],
      ["PAC", "Main Event", ["main-event", "high-flyer", "technical"]],
      ["Ricochet", "Upper Card", ["upper-card", "high-flyer", "promo-specialist"]],
      ["Rush", "Upper Card", ["upper-card", "powerhouse"]],
      ["Samoa Joe", "Main Event", ["main-event", "powerhouse", "veteran"]],
      ["Swerve Strickland", "Franchise", ["main-event", "promo-specialist"]],
      ["Wardlow", "Upper Card", ["upper-card", "powerhouse"]],
      ["Wheeler Yuta", "Mid Card", ["midcard", "technical"]],
      ["Will Ospreay", "Franchise", ["main-event", "high-flyer", "technical"]]
    ]),
    ...createRosterEntries("AEW", "women", "Mid Card", [
      ["Alex Windsor", "Mid Card", ["midcard", "technical"]],
      ["Anna Jay", "Mid Card", ["midcard", "promo-specialist"]],
      ["Athena", "Main Event", ["main-event", "technical", "promo-specialist"]],
      ["Billie Starkz", "Prospect", ["prospect", "technical"]],
      ["Deonna Purrazzo", "Upper Card", ["upper-card", "technical"]],
      ["Dr. Britt Baker DMD", "Main Event", ["main-event", "promo-specialist"]],
      ["Harley Cameron", "Mid Card", ["midcard", "promo-specialist"]],
      ["Hikaru Shida", "Main Event", ["main-event", "technical", "veteran"]],
      ["Jamie Hayter", "Main Event", ["main-event", "powerhouse"]],
      ["Julia Hart", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Kamille", "Upper Card", ["upper-card", "powerhouse"]],
      ["Kris Statlander", "Main Event", ["main-event", "powerhouse"]],
      ["Marina Shafir", "Specialist", ["technical", "veteran"]],
      ["Megan Bayne", "Upper Card", ["upper-card", "powerhouse", "tag-specialist"]],
      ["Mercedes Mone", "Franchise", ["main-event", "promo-specialist", "technical"]],
      ["Mina Shirakawa", "Upper Card", ["upper-card", "promo-specialist"]],
      ["Nyla Rose", "Upper Card", ["upper-card", "powerhouse", "veteran"]],
      ["Queen Aminata", "Mid Card", ["midcard", "technical"]],
      ["Riho", "Upper Card", ["upper-card", "high-flyer"]],
      ["Ruby Soho", "Mid Card", ["midcard", "promo-specialist", "veteran"]],
      ["Serena Deeb", "Specialist", ["technical", "veteran"]],
      ["Skye Blue", "Mid Card", ["midcard", "high-flyer"]],
      ["Tay Melo", "Mid Card", ["midcard", "technical"]],
      ["Taya Valkyrie", "Mid Card", ["midcard", "powerhouse", "veteran"]],
      ["Thekla", "Main Event", ["main-event", "technical", "promo-specialist"]],
      ["Thunder Rosa", "Main Event", ["main-event", "promo-specialist", "veteran"]],
      ["Timeless Toni Storm", "Main Event", ["main-event", "promo-specialist"]],
      ["Willow Nightingale", "Main Event", ["main-event", "powerhouse"]],
      ["Yuka Sakazaki", "Mid Card", ["midcard", "high-flyer"]]
    ])
  ]);
}

function createPlayableRosterSeedFixtures(): readonly NewGMModeStaticWrestlerFixture[] {
  return Object.freeze(
    createPlayableRosterSeedEntries().map((entry, index) =>
      createStaticWrestlerFixture({
        wrestlerId: createSeedWrestlerId(index + 11, entry.displayName),
        displayName: entry.displayName,
        genderDivisionEligibility:
          entry.divisionCategory === "women"
            ? ["womens-division"]
            : ["mens-division"],
        roleCategoryTags: entry.roleCategoryTags ?? [
          entry.financeProjectionTier === "Prospect"
            ? "prospect"
            : entry.financeProjectionTier === "Specialist"
              ? "tag-specialist"
              : entry.financeProjectionTier === "Mid Card"
                ? "midcard"
                : entry.financeProjectionTier === "Upper Card"
                  ? "upper-card"
                  : "main-event"
        ],
        brandEligibility: ["brand-alpha", "brand-beta", "brand-cross-eligible"],
        sourceRosterPool: entry.sourceRosterPool,
        divisionCategory: entry.divisionCategory,
        financeProjectionTier: entry.financeProjectionTier,
        availabilityStatus: "available",
        draftEligible: true,
        championshipDivisionEligibility:
          entry.divisionCategory === "women"
            ? ["womens-world-title", "tag-team-title"]
            : [
                entry.financeProjectionTier === "Franchise" ||
                entry.financeProjectionTier === "Main Event"
                  ? "world-title"
                  : "midcard-title",
                "tag-team-title"
              ],
        placeholderAttributes: createPlaceholderAttributes(entry)
      })
    )
  );
}

function createRosterEntries(
  sourceRosterPool: Exclude<
    NewGMModeStaticWrestlerFixtureSourceRosterPool,
    "Legacy Fixture"
  >,
  divisionCategory: NewGMModeStaticWrestlerFixtureDivisionCategory,
  fallbackTier: NewGMModeStaticWrestlerFixtureFinanceTier,
  entries: readonly (readonly [
    string,
    NewGMModeStaticWrestlerFixtureFinanceTier?,
    readonly NewGMModeStaticWrestlerFixtureRoleCategoryTag[]?
  ])[]
): readonly PlayableRosterSeedEntry[] {
  return entries.map(([displayName, financeProjectionTier, roleCategoryTags]) =>
    Object.freeze({
      displayName,
      sourceRosterPool,
      divisionCategory,
      financeProjectionTier: financeProjectionTier ?? fallbackTier,
      ...(roleCategoryTags ? { roleCategoryTags } : {})
    })
  );
}

function createSeedWrestlerId(index: number, displayName: string): string {
  return `fixture-wrestler-${String(index).padStart(3, "0")}-${createSlug(
    displayName
  )}`;
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createPlaceholderAttributes(
  entry: PlayableRosterSeedEntry
): NewGMModeStaticWrestlerFixturePlaceholderAttributes {
  if (entry.financeProjectionTier === "Franchise") {
    return {
      popularityStarPower: "fixture-elite",
      inRingAbility: "fixture-elite",
      staminaDurability: "fixture-durable",
      promoCharisma: "fixture-elite",
      tagTeamCompatibility: "fixture-flexible"
    };
  }

  if (entry.financeProjectionTier === "Main Event") {
    return {
      popularityStarPower: "fixture-high",
      inRingAbility: "fixture-strong",
      staminaDurability: "fixture-durable",
      promoCharisma: "fixture-strong",
      tagTeamCompatibility: "fixture-flexible"
    };
  }

  if (entry.financeProjectionTier === "Upper Card") {
    return {
      popularityStarPower: "fixture-strong",
      inRingAbility: "fixture-solid",
      staminaDurability: "fixture-steady",
      promoCharisma: "fixture-steady",
      tagTeamCompatibility: "fixture-strong"
    };
  }

  if (entry.financeProjectionTier === "Specialist") {
    return {
      popularityStarPower: "fixture-steady",
      inRingAbility: "fixture-solid",
      staminaDurability: "fixture-steady",
      promoCharisma: "fixture-developing",
      tagTeamCompatibility: "fixture-elite"
    };
  }

  if (entry.financeProjectionTier === "Prospect") {
    return {
      popularityStarPower: "fixture-developing",
      inRingAbility: "fixture-solid",
      staminaDurability: "fixture-steady",
      promoCharisma: "fixture-developing",
      tagTeamCompatibility: "fixture-strong"
    };
  }

  return {
    popularityStarPower: "fixture-steady",
    inRingAbility: "fixture-solid",
    staminaDurability: "fixture-steady",
    promoCharisma: "fixture-developing",
    tagTeamCompatibility: "fixture-flexible"
  };
}
