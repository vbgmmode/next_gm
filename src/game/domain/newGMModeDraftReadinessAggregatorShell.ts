import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import { createNewGMModeDraftPrerequisiteContractShell } from "./newGMModeDraftPrerequisiteContractShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";

export type NewGMModeDraftReadinessPhaseId =
  | "setup_contracts_available"
  | "draft_prerequisites_defined"
  | "talent_pool_prerequisites_defined"
  | "draft_board_prerequisites_defined"
  | "roster_slot_requirements_defined"
  | "championship_division_requirements_defined"
  | "blocked_real_draft_execution_unavailable";

export type NewGMModeDraftReadinessBlockedReason =
  | "draft-readiness-aggregator-only"
  | "talent-pool-creation-not-implemented"
  | "wrestler-data-loading-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-creation-not-implemented"
  | "championship-creation-not-implemented"
  | "division-creation-not-implemented"
  | "champion-assignment-not-implemented"
  | "contender-pool-creation-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftReadinessPhase {
  readonly id: NewGMModeDraftReadinessPhaseId;
  readonly label: string;
  readonly blockedReason: NewGMModeDraftReadinessBlockedReason;
}

export interface NewGMModeDraftReadinessContractSummary {
  readonly id: string;
  readonly status: "diagnostics-only";
  readonly available: true;
  readonly itemCount: number;
  readonly contractOnly: true;
}

export interface NewGMModeDraftReadinessAggregatorShell {
  readonly status: "diagnostics-only";
  readonly draftReadinessAggregatorId: "new-gm-mode-draft-readiness-aggregator-v0.1";
  readonly deterministicOrdering: true;
  readonly readinessPhases: readonly NewGMModeDraftReadinessPhase[];
  readonly readinessSummary: {
    readonly phaseCount: number;
    readonly contractSummaryCount: 6;
    readonly allDraftReadinessContractsAvailable: true;
    readonly realDraftExecutionReady: false;
    readonly weekOneUnlockReady: false;
    readonly contractOnly: true;
  };
  readonly setupReadinessHandoffSummary: NewGMModeDraftReadinessContractSummary;
  readonly draftPrerequisiteSummary: NewGMModeDraftReadinessContractSummary;
  readonly talentPoolPrerequisiteSummary: NewGMModeDraftReadinessContractSummary;
  readonly draftBoardPrerequisiteSummary: NewGMModeDraftReadinessContractSummary;
  readonly rosterSlotRequirementSummary: NewGMModeDraftReadinessContractSummary;
  readonly championshipDivisionRequirementSummary: NewGMModeDraftReadinessContractSummary;
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly rosterSlotRequirementContractAvailable: true;
  readonly championshipDivisionRequirementContractAvailable: true;
  readonly draftReadinessAggregatorAvailable: true;
  readonly talentPoolCreationAvailable: false;
  readonly wrestlerDataLoadingAvailable: false;
  readonly eligibleTalentPoolCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftOrderingAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterCreationAvailable: false;
  readonly wrestlerAssignmentAvailable: false;
  readonly championshipCreationAvailable: false;
  readonly championshipAssignmentAvailable: false;
  readonly divisionCreationAvailable: false;
  readonly divisionAssignmentAvailable: false;
  readonly championAssignmentAvailable: false;
  readonly contenderPoolCreationAvailable: false;
  readonly weekOneUnlockAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly wrestlerDataCreated: false;
  readonly wrestlerIdentityRecordsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly talentPoolsCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftOrderingGenerated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly rostersCreated: false;
  readonly wrestlerAssignmentsCreated: false;
  readonly championshipsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionsCreated: false;
  readonly championsCreated: false;
  readonly championAssignmentsCreated: false;
  readonly contenderPoolsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
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
  readonly blockedReasons: readonly NewGMModeDraftReadinessBlockedReason[];
}

const READINESS_PHASES: readonly NewGMModeDraftReadinessPhase[] =
  Object.freeze([
    createReadinessPhase(
      "setup_contracts_available",
      "Setup contracts available",
      "draft-readiness-aggregator-only"
    ),
    createReadinessPhase(
      "draft_prerequisites_defined",
      "Draft prerequisites defined",
      "draft-readiness-aggregator-only"
    ),
    createReadinessPhase(
      "talent_pool_prerequisites_defined",
      "Talent pool prerequisites defined",
      "talent-pool-creation-not-implemented"
    ),
    createReadinessPhase(
      "draft_board_prerequisites_defined",
      "Draft board prerequisites defined",
      "draft-board-creation-not-implemented"
    ),
    createReadinessPhase(
      "roster_slot_requirements_defined",
      "Roster slot requirements defined",
      "roster-creation-not-implemented"
    ),
    createReadinessPhase(
      "championship_division_requirements_defined",
      "Championship and division requirements defined",
      "championship-creation-not-implemented"
    ),
    createReadinessPhase(
      "blocked_real_draft_execution_unavailable",
      "Real draft execution unavailable",
      "draft-execution-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftReadinessBlockedReason[] =
  Object.freeze([
    "draft-readiness-aggregator-only",
    "talent-pool-creation-not-implemented",
    "wrestler-data-loading-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-execution-not-implemented",
    "roster-creation-not-implemented",
    "championship-creation-not-implemented",
    "division-creation-not-implemented",
    "champion-assignment-not-implemented",
    "contender-pool-creation-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftReadinessAggregatorShell(): NewGMModeDraftReadinessAggregatorShell {
  const setupReadinessHandoff = createNewGMModeSetupReadinessHandoffShell({});
  const draftPrerequisite = createNewGMModeDraftPrerequisiteContractShell();
  const talentPoolPrerequisite =
    createNewGMModeTalentPoolPrerequisiteContractShell();
  const draftBoardPrerequisite =
    createNewGMModeDraftBoardPrerequisiteContractShell();
  const rosterSlotRequirement =
    createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftReadinessAggregatorId:
      "new-gm-mode-draft-readiness-aggregator-v0.1",
    deterministicOrdering: true,
    readinessPhases: READINESS_PHASES,
    readinessSummary: Object.freeze({
      phaseCount: READINESS_PHASES.length,
      contractSummaryCount: 6,
      allDraftReadinessContractsAvailable: true,
      realDraftExecutionReady: false,
      weekOneUnlockReady: false,
      contractOnly: true
    }),
    setupReadinessHandoffSummary: createContractSummary(
      setupReadinessHandoff.handoffId,
      setupReadinessHandoff.status,
      setupReadinessHandoff.readinessIssues.length
    ),
    draftPrerequisiteSummary: createContractSummary(
      draftPrerequisite.draftPrerequisiteContractId,
      draftPrerequisite.status,
      draftPrerequisite.draftPrerequisiteSummary.prerequisiteCount
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
    rosterSlotRequirementSummary: createContractSummary(
      rosterSlotRequirement.rosterSlotRequirementContractId,
      rosterSlotRequirement.status,
      rosterSlotRequirement.rosterSlotRequirementSummary.requirementCount
    ),
    championshipDivisionRequirementSummary: createContractSummary(
      championshipDivisionRequirement.championshipDivisionRequirementContractId,
      championshipDivisionRequirement.status,
      championshipDivisionRequirement.championshipDivisionRequirementSummary
        .requirementCount
    ),
    setupReadinessHandoffAvailable: true,
    draftPrerequisiteContractAvailable: true,
    talentPoolPrerequisiteContractAvailable: true,
    draftBoardPrerequisiteContractAvailable: true,
    rosterSlotRequirementContractAvailable: true,
    championshipDivisionRequirementContractAvailable: true,
    draftReadinessAggregatorAvailable: true,
    talentPoolCreationAvailable: false,
    wrestlerDataLoadingAvailable: false,
    eligibleTalentPoolCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftOrderingAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterCreationAvailable: false,
    wrestlerAssignmentAvailable: false,
    championshipCreationAvailable: false,
    championshipAssignmentAvailable: false,
    divisionCreationAvailable: false,
    divisionAssignmentAvailable: false,
    championAssignmentAvailable: false,
    contenderPoolCreationAvailable: false,
    weekOneUnlockAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    wrestlerDataCreated: false,
    wrestlerIdentityRecordsCreated: false,
    eligibleTalentPoolsCreated: false,
    talentPoolsCreated: false,
    draftBoardsCreated: false,
    draftOrderingGenerated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    rostersCreated: false,
    wrestlerAssignmentsCreated: false,
    championshipsCreated: false,
    championshipAssignmentsCreated: false,
    divisionsCreated: false,
    championsCreated: false,
    championAssignmentsCreated: false,
    contenderPoolsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
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
  id: NewGMModeDraftReadinessPhaseId,
  label: string,
  blockedReason: NewGMModeDraftReadinessBlockedReason
): NewGMModeDraftReadinessPhase {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}

function createContractSummary(
  id: string,
  status: "diagnostics-only",
  itemCount: number
): NewGMModeDraftReadinessContractSummary {
  return Object.freeze({
    id,
    status,
    available: true,
    itemCount,
    contractOnly: true
  });
}
