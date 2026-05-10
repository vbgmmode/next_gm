import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import { createNewGMModeDraftReadinessAggregatorShell } from "./newGMModeDraftReadinessAggregatorShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";

export type NewGMModeWrestlerDataShapeFieldId =
  | "wrestler-id"
  | "display-name"
  | "gender-division-eligibility"
  | "role-category-tags"
  | "brand-eligibility"
  | "availability-status"
  | "popularity-star-power-placeholder"
  | "in-ring-ability-placeholder"
  | "stamina-durability-placeholder"
  | "promo-charisma-placeholder"
  | "tag-team-compatibility-placeholder"
  | "championship-division-eligibility"
  | "draft-eligibility"
  | "future-persistence-payload-compatibility";

export type NewGMModeWrestlerDataShapeFieldCategory =
  | "identity"
  | "eligibility"
  | "tagging"
  | "availability"
  | "attribute-placeholder"
  | "future-persistence";

export type NewGMModeWrestlerDataShapeBlockedReason =
  | "wrestler-data-shape-contract-only"
  | "draft-readiness-aggregator-available"
  | "talent-pool-prerequisite-contract-available"
  | "draft-board-prerequisite-contract-available"
  | "wrestler-data-loading-not-implemented"
  | "wrestler-record-creation-not-implemented"
  | "real-roster-ingestion-not-implemented"
  | "talent-pool-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeWrestlerDataShapeField {
  readonly id: NewGMModeWrestlerDataShapeFieldId;
  readonly slug: NewGMModeWrestlerDataShapeFieldId;
  readonly label: string;
  readonly category: NewGMModeWrestlerDataShapeFieldCategory;
  readonly requiredForFutureTalentPools: true;
  readonly blockedReason: NewGMModeWrestlerDataShapeBlockedReason;
}

export interface NewGMModeWrestlerDataShapeContractShell {
  readonly status: "diagnostics-only";
  readonly wrestlerDataShapeContractId: "new-gm-mode-wrestler-data-shape-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly wrestlerDataShapeFields: readonly NewGMModeWrestlerDataShapeField[];
  readonly wrestlerDataShapeSummary: {
    readonly fieldCount: number;
    readonly requiredBeforeTalentPoolCreation: true;
    readonly requiredBeforeDraftBoardCreation: true;
    readonly contractOnly: true;
    readonly wrestlerDataLoadingReady: false;
    readonly wrestlerRecordCreationReady: false;
    readonly talentPoolCreationReady: false;
    readonly draftBoardCreationReady: false;
    readonly draftExecutionReady: false;
  };
  readonly availableNow: {
    readonly draftReadinessAggregatorAvailable: true;
    readonly talentPoolPrerequisiteContractAvailable: true;
    readonly draftBoardPrerequisiteContractAvailable: true;
    readonly wrestlerDataShapeContractAvailable: true;
  };
  readonly notImplemented: readonly NewGMModeWrestlerDataShapeBlockedReason[];
  readonly draftReadinessAggregatorAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly wrestlerDataShapeContractAvailable: true;
  readonly wrestlerDataLoadingAvailable: false;
  readonly wrestlerRecordCreationAvailable: false;
  readonly realRosterIngestionAvailable: false;
  readonly talentPoolCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly capabilityFlags: {
    readonly draftReadinessAggregatorAvailable: true;
    readonly wrestlerDataShapeContractAvailable: true;
    readonly wrestlerDataLoadingAvailable: false;
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
  readonly wrestlerDataLoaded: false;
  readonly wrestlerDataCreated: false;
  readonly wrestlerRecordsCreated: false;
  readonly realRosterIngested: false;
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
  readonly blockedReasons: readonly NewGMModeWrestlerDataShapeBlockedReason[];
}

const WRESTLER_DATA_SHAPE_FIELDS: readonly NewGMModeWrestlerDataShapeField[] =
  Object.freeze([
    createWrestlerDataShapeField(
      "wrestler-id",
      "Wrestler ID",
      "identity",
      "wrestler-record-creation-not-implemented"
    ),
    createWrestlerDataShapeField(
      "display-name",
      "Display name",
      "identity",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "gender-division-eligibility",
      "Gender division eligibility",
      "eligibility",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "role-category-tags",
      "Role and category tags",
      "tagging",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "brand-eligibility",
      "Brand eligibility",
      "eligibility",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "availability-status",
      "Availability status",
      "availability",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "popularity-star-power-placeholder",
      "Popularity and star power placeholder",
      "attribute-placeholder",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "in-ring-ability-placeholder",
      "In-ring ability placeholder",
      "attribute-placeholder",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "stamina-durability-placeholder",
      "Stamina and durability placeholder",
      "attribute-placeholder",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "promo-charisma-placeholder",
      "Promo and charisma placeholder",
      "attribute-placeholder",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "tag-team-compatibility-placeholder",
      "Tag team compatibility placeholder",
      "attribute-placeholder",
      "wrestler-data-loading-not-implemented"
    ),
    createWrestlerDataShapeField(
      "championship-division-eligibility",
      "Championship division eligibility",
      "eligibility",
      "championship-division-assignment-not-implemented"
    ),
    createWrestlerDataShapeField(
      "draft-eligibility",
      "Draft eligibility",
      "eligibility",
      "draft-pick-validation-not-implemented"
    ),
    createWrestlerDataShapeField(
      "future-persistence-payload-compatibility",
      "Future persistence payload compatibility",
      "future-persistence",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeWrestlerDataShapeBlockedReason[] =
  Object.freeze([
    "wrestler-data-shape-contract-only",
    "draft-readiness-aggregator-available",
    "talent-pool-prerequisite-contract-available",
    "draft-board-prerequisite-contract-available",
    "wrestler-data-loading-not-implemented",
    "wrestler-record-creation-not-implemented",
    "real-roster-ingestion-not-implemented",
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

const NOT_IMPLEMENTED: readonly NewGMModeWrestlerDataShapeBlockedReason[] =
  Object.freeze([
    "wrestler-data-loading-not-implemented",
    "wrestler-record-creation-not-implemented",
    "real-roster-ingestion-not-implemented",
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

export function createNewGMModeWrestlerDataShapeContractShell(): NewGMModeWrestlerDataShapeContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    wrestlerDataShapeContractId:
      "new-gm-mode-wrestler-data-shape-contract-v0.1",
    deterministicOrdering: true,
    wrestlerDataShapeFields: WRESTLER_DATA_SHAPE_FIELDS,
    wrestlerDataShapeSummary: Object.freeze({
      fieldCount: WRESTLER_DATA_SHAPE_FIELDS.length,
      requiredBeforeTalentPoolCreation: true,
      requiredBeforeDraftBoardCreation: true,
      contractOnly: true,
      wrestlerDataLoadingReady: false,
      wrestlerRecordCreationReady: false,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false
    }),
    availableNow: Object.freeze({
      draftReadinessAggregatorAvailable:
        typeof createNewGMModeDraftReadinessAggregatorShell === "function",
      talentPoolPrerequisiteContractAvailable:
        typeof createNewGMModeTalentPoolPrerequisiteContractShell === "function",
      draftBoardPrerequisiteContractAvailable:
        typeof createNewGMModeDraftBoardPrerequisiteContractShell === "function",
      wrestlerDataShapeContractAvailable: true
    }),
    notImplemented: NOT_IMPLEMENTED,
    draftReadinessAggregatorAvailable:
      typeof createNewGMModeDraftReadinessAggregatorShell === "function",
    talentPoolPrerequisiteContractAvailable:
      typeof createNewGMModeTalentPoolPrerequisiteContractShell === "function",
    draftBoardPrerequisiteContractAvailable:
      typeof createNewGMModeDraftBoardPrerequisiteContractShell === "function",
    wrestlerDataShapeContractAvailable: true,
    wrestlerDataLoadingAvailable: false,
    wrestlerRecordCreationAvailable: false,
    realRosterIngestionAvailable: false,
    talentPoolCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    capabilityFlags: Object.freeze({
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataLoadingAvailable: false,
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
    wrestlerDataLoaded: false,
    wrestlerDataCreated: false,
    wrestlerRecordsCreated: false,
    realRosterIngested: false,
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

function createWrestlerDataShapeField(
  id: NewGMModeWrestlerDataShapeFieldId,
  label: string,
  category: NewGMModeWrestlerDataShapeFieldCategory,
  blockedReason: NewGMModeWrestlerDataShapeBlockedReason
): NewGMModeWrestlerDataShapeField {
  return Object.freeze({
    id,
    slug: id,
    label,
    category,
    requiredForFutureTalentPools: true,
    blockedReason
  });
}
