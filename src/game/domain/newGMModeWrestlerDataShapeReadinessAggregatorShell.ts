import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import { createNewGMModeDraftReadinessAggregatorShell } from "./newGMModeDraftReadinessAggregatorShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";
import { createNewGMModeWrestlerDataShapeContractShell } from "./newGMModeWrestlerDataShapeContractShell.ts";

export type NewGMModeWrestlerDataShapeReadinessPhaseId =
  | "draft_readiness_contracts_available"
  | "wrestler_data_shape_defined"
  | "talent_pool_dependency_defined"
  | "draft_board_dependency_defined"
  | "blocked_real_wrestler_loading_unavailable"
  | "blocked_real_talent_pool_creation_unavailable"
  | "blocked_real_draft_execution_unavailable";

export type NewGMModeWrestlerDataShapeReadinessBlockedReason =
  | "wrestler-data-shape-readiness-aggregator-only"
  | "draft-readiness-aggregator-available"
  | "wrestler-data-shape-contract-available"
  | "talent-pool-prerequisite-contract-available"
  | "draft-board-prerequisite-contract-available"
  | "wrestler-data-loading-not-implemented"
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

export interface NewGMModeWrestlerDataShapeReadinessPhase {
  readonly id: NewGMModeWrestlerDataShapeReadinessPhaseId;
  readonly slug: NewGMModeWrestlerDataShapeReadinessPhaseId;
  readonly label: string;
  readonly blockedReason: NewGMModeWrestlerDataShapeReadinessBlockedReason;
}

export interface NewGMModeWrestlerDataShapeReadinessContractSummary {
  readonly id: string;
  readonly status: "diagnostics-only";
  readonly available: true;
  readonly itemCount: number;
  readonly contractOnly: true;
}

export interface NewGMModeWrestlerDataShapeReadinessAggregatorShell {
  readonly status: "diagnostics-only";
  readonly wrestlerDataShapeReadinessAggregatorId: "new-gm-mode-wrestler-data-shape-readiness-aggregator-v0.1";
  readonly deterministicOrdering: true;
  readonly readinessPhases: readonly NewGMModeWrestlerDataShapeReadinessPhase[];
  readonly readinessSummary: {
    readonly phaseCount: number;
    readonly contractSummaryCount: 4;
    readonly allWrestlerDataShapeDependenciesAvailable: true;
    readonly realWrestlerLoadingReady: false;
    readonly realTalentPoolCreationReady: false;
    readonly realDraftExecutionReady: false;
    readonly contractOnly: true;
  };
  readonly draftReadinessAggregatorSummary: NewGMModeWrestlerDataShapeReadinessContractSummary;
  readonly wrestlerDataShapeContractSummary: NewGMModeWrestlerDataShapeReadinessContractSummary;
  readonly talentPoolPrerequisiteSummary: NewGMModeWrestlerDataShapeReadinessContractSummary;
  readonly draftBoardPrerequisiteSummary: NewGMModeWrestlerDataShapeReadinessContractSummary;
  readonly availableNow: {
    readonly draftReadinessAggregatorAvailable: true;
    readonly wrestlerDataShapeContractAvailable: true;
    readonly talentPoolPrerequisiteContractAvailable: true;
    readonly draftBoardPrerequisiteContractAvailable: true;
    readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
  };
  readonly notImplemented: readonly NewGMModeWrestlerDataShapeReadinessBlockedReason[];
  readonly draftReadinessAggregatorAvailable: true;
  readonly wrestlerDataShapeContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
  readonly wrestlerDataLoadingAvailable: false;
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
    readonly draftReadinessAggregatorAvailable: true;
    readonly wrestlerDataShapeContractAvailable: true;
    readonly wrestlerDataShapeReadinessAggregatorAvailable: true;
    readonly wrestlerDataLoadingAvailable: false;
    readonly wrestlerRecordCreationAvailable: false;
    readonly rosterIngestionAvailable: false;
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
  readonly blockedReasons: readonly NewGMModeWrestlerDataShapeReadinessBlockedReason[];
}

const READINESS_PHASES: readonly NewGMModeWrestlerDataShapeReadinessPhase[] =
  Object.freeze([
    createReadinessPhase(
      "draft_readiness_contracts_available",
      "Draft readiness contracts available",
      "draft-readiness-aggregator-available"
    ),
    createReadinessPhase(
      "wrestler_data_shape_defined",
      "Wrestler data shape defined",
      "wrestler-data-shape-contract-available"
    ),
    createReadinessPhase(
      "talent_pool_dependency_defined",
      "Talent pool dependency defined",
      "talent-pool-prerequisite-contract-available"
    ),
    createReadinessPhase(
      "draft_board_dependency_defined",
      "Draft board dependency defined",
      "draft-board-prerequisite-contract-available"
    ),
    createReadinessPhase(
      "blocked_real_wrestler_loading_unavailable",
      "Real wrestler loading unavailable",
      "wrestler-data-loading-not-implemented"
    ),
    createReadinessPhase(
      "blocked_real_talent_pool_creation_unavailable",
      "Real talent pool creation unavailable",
      "talent-pool-creation-not-implemented"
    ),
    createReadinessPhase(
      "blocked_real_draft_execution_unavailable",
      "Real draft execution unavailable",
      "draft-execution-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeWrestlerDataShapeReadinessBlockedReason[] =
  Object.freeze([
    "wrestler-data-shape-readiness-aggregator-only",
    "draft-readiness-aggregator-available",
    "wrestler-data-shape-contract-available",
    "talent-pool-prerequisite-contract-available",
    "draft-board-prerequisite-contract-available",
    "wrestler-data-loading-not-implemented",
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

const NOT_IMPLEMENTED: readonly NewGMModeWrestlerDataShapeReadinessBlockedReason[] =
  Object.freeze([
    "wrestler-data-loading-not-implemented",
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

export function createNewGMModeWrestlerDataShapeReadinessAggregatorShell(): NewGMModeWrestlerDataShapeReadinessAggregatorShell {
  const draftReadinessAggregator = createNewGMModeDraftReadinessAggregatorShell();
  const wrestlerDataShape = createNewGMModeWrestlerDataShapeContractShell();
  const talentPoolPrerequisite =
    createNewGMModeTalentPoolPrerequisiteContractShell();
  const draftBoardPrerequisite =
    createNewGMModeDraftBoardPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    wrestlerDataShapeReadinessAggregatorId:
      "new-gm-mode-wrestler-data-shape-readiness-aggregator-v0.1",
    deterministicOrdering: true,
    readinessPhases: READINESS_PHASES,
    readinessSummary: Object.freeze({
      phaseCount: READINESS_PHASES.length,
      contractSummaryCount: 4,
      allWrestlerDataShapeDependenciesAvailable: true,
      realWrestlerLoadingReady: false,
      realTalentPoolCreationReady: false,
      realDraftExecutionReady: false,
      contractOnly: true
    }),
    draftReadinessAggregatorSummary: createContractSummary(
      draftReadinessAggregator.draftReadinessAggregatorId,
      draftReadinessAggregator.status,
      draftReadinessAggregator.readinessSummary.contractSummaryCount
    ),
    wrestlerDataShapeContractSummary: createContractSummary(
      wrestlerDataShape.wrestlerDataShapeContractId,
      wrestlerDataShape.status,
      wrestlerDataShape.wrestlerDataShapeSummary.fieldCount
    ),
    talentPoolPrerequisiteSummary: createContractSummary(
      talentPoolPrerequisite.talentPoolPrerequisiteContractId,
      talentPoolPrerequisite.status,
      talentPoolPrerequisite.talentPoolPrerequisiteSummary.prerequisiteCount
    ),
    draftBoardPrerequisiteSummary: createContractSummary(
      draftBoardPrerequisite.draftBoardPrerequisiteContractId,
      draftBoardPrerequisite.status,
      draftBoardPrerequisite.draftBoardPrerequisiteSummary.prerequisiteCount
    ),
    availableNow: Object.freeze({
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      talentPoolPrerequisiteContractAvailable: true,
      draftBoardPrerequisiteContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true
    }),
    notImplemented: NOT_IMPLEMENTED,
    draftReadinessAggregatorAvailable: true,
    wrestlerDataShapeContractAvailable: true,
    talentPoolPrerequisiteContractAvailable: true,
    draftBoardPrerequisiteContractAvailable: true,
    wrestlerDataShapeReadinessAggregatorAvailable: true,
    wrestlerDataLoadingAvailable: false,
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
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataShapeReadinessAggregatorAvailable: true,
      wrestlerDataLoadingAvailable: false,
      wrestlerRecordCreationAvailable: false,
      rosterIngestionAvailable: false,
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

function createReadinessPhase(
  id: NewGMModeWrestlerDataShapeReadinessPhaseId,
  label: string,
  blockedReason: NewGMModeWrestlerDataShapeReadinessBlockedReason
): NewGMModeWrestlerDataShapeReadinessPhase {
  return Object.freeze({
    id,
    slug: id,
    label,
    blockedReason
  });
}

function createContractSummary(
  id: string,
  status: "diagnostics-only",
  itemCount: number
): NewGMModeWrestlerDataShapeReadinessContractSummary {
  return Object.freeze({
    id,
    status,
    available: true,
    itemCount,
    contractOnly: true
  });
}
