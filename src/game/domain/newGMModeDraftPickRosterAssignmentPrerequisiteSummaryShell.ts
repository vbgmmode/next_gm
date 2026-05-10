import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell } from "./newGMModeDraftBoardSelectionPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickExecutionPrerequisiteSummaryShell } from "./newGMModeDraftPickExecutionPrerequisiteSummaryShell.ts";
import {
  type NewGMModeDraftPickRosterAssignmentPrerequisiteBlockedReason,
  type NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags,
  createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell
} from "./newGMModeDraftPickRosterAssignmentPrerequisiteContractShell.ts";
import { createNewGMModeDraftPickValidationReadinessSummaryShell } from "./newGMModeDraftPickValidationReadinessSummaryShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftPickRosterAssignmentPrerequisitePhaseId =
  | "missing-roster-assignment-prerequisite-contract"
  | "missing-execution-prerequisites"
  | "missing-validation-readiness"
  | "missing-selection-prerequisites"
  | "missing-roster-slot-requirements"
  | "missing-championship-division-requirements"
  | "roster-assignment-prerequisites-structurally-ready-assignment-blocked";

export interface NewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftPickRosterAssignmentPrerequisiteSummaryId: "new-gm-mode-draft-pick-roster-assignment-prerequisite-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentPrerequisiteContractAvailable: true;
  readonly executionPrerequisiteAvailable: true;
  readonly validationReadinessAvailable: true;
  readonly selectionPrerequisiteAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly topLevelRosterAssignmentPrerequisitePhase: NewGMModeDraftPickRosterAssignmentPrerequisitePhaseId;
  readonly futureRosterAssignmentPrerequisitesStructurallySatisfied: boolean;
  readonly rosterAssignmentPrerequisiteSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly selectedWrestlerChosen: false;
    readonly concreteDraftPickValidated: false;
    readonly validatedPickAvailable: false;
    readonly draftPickCreated: false;
    readonly draftPickExecuted: false;
    readonly executedPickAvailable: false;
    readonly actualRosterAssignmentReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftPickRosterAssignmentPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly concreteDraftPickValidated: false;
  readonly validatedPickAvailable: false;
  readonly draftPickCreated: false;
  readonly draftPickExecuted: false;
  readonly executedPickAvailable: false;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly concreteDraftPickValidationAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly actualRosterAssignmentAvailable: false;
  readonly rosterStateMutationAvailable: false;
  readonly rosterStateCreated: false;
  readonly duplicateRosterMemberPreventionAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
  readonly draftOrderStateCreated: false;
  readonly draftBoardUiCreated: false;
  readonly playerFacingDraftBoardCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly draftExecutionExecuted: false;
  readonly rosterAssignmentsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionAssignmentsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly weekOneUnlocked: false;
  readonly persistencePayloadsCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

export function createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell {
  const rosterAssignmentContract =
    createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();
  const executionPrerequisites =
    createNewGMModeDraftPickExecutionPrerequisiteSummaryShell(input);
  const validationReadiness =
    createNewGMModeDraftPickValidationReadinessSummaryShell(input);
  const selectionPrerequisites =
    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const futureRosterAssignmentPrerequisitesStructurallySatisfied =
    executionPrerequisites.futureDraftPickExecutionPrerequisitesStructurallySatisfied &&
    validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied &&
    selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied &&
    rosterSlotRequirement.rosterSlotRequirementContractAvailable &&
    championshipDivisionRequirement.championshipDivisionRequirementContractAvailable &&
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied;

  return Object.freeze({
    status: "diagnostics-only",
    draftPickRosterAssignmentPrerequisiteSummaryId:
      "new-gm-mode-draft-pick-roster-assignment-prerequisite-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentPrerequisiteContractAvailable:
      rosterAssignmentContract.draftPickRosterAssignmentPrerequisiteContractAvailable,
    executionPrerequisiteAvailable:
      executionPrerequisites.draftPickExecutionPrerequisiteSummaryId ===
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1",
    validationReadinessAvailable:
      validationReadiness.draftPickValidationReadinessSummaryId ===
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    selectionPrerequisiteAvailable:
      selectionPrerequisites.draftBoardSelectionPrerequisiteSummaryId ===
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1",
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    topLevelRosterAssignmentPrerequisitePhase:
      determineRosterAssignmentPrerequisitePhase(
        rosterAssignmentContract.draftPickRosterAssignmentPrerequisiteContractAvailable,
        executionPrerequisites.futureDraftPickExecutionPrerequisitesStructurallySatisfied,
        validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied,
        selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied,
        rosterSlotRequirement.rosterSlotRequirementContractAvailable,
        championshipDivisionRequirement.championshipDivisionRequirementContractAvailable
      ),
    futureRosterAssignmentPrerequisitesStructurallySatisfied,
    rosterAssignmentPrerequisiteSummary: Object.freeze({
      totalFixtureCount:
        talentPoolReadiness.readinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        validationReadiness.validationReadinessSummary.displayReadyEligibleCount,
      excludedIneligibleCount:
        validationReadiness.validationReadinessSummary.excludedIneligibleCount,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      draftPickExecuted: false,
      executedPickAvailable: false,
      actualRosterAssignmentReady: false
    }),
    blockedReasons: rosterAssignmentContract.blockedReasons,
    capabilityFlags: rosterAssignmentContract.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    concreteDraftPickValidated: false,
    validatedPickAvailable: false,
    draftPickCreated: false,
    draftPickExecuted: false,
    executedPickAvailable: false,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    concreteDraftPickValidationAvailable: false,
    actualDraftPickExecutionAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    actualRosterAssignmentAvailable: false,
    rosterStateMutationAvailable: false,
    rosterStateCreated: false,
    duplicateRosterMemberPreventionAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
    draftOrderStateCreated: false,
    draftBoardUiCreated: false,
    playerFacingDraftBoardCreated: false,
    draftBoardsCreated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    draftExecutionExecuted: false,
    rosterAssignmentsCreated: false,
    championshipAssignmentsCreated: false,
    divisionAssignmentsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    weekOneUnlocked: false,
    persistencePayloadsCreated: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}

function determineRosterAssignmentPrerequisitePhase(
  rosterAssignmentContractAvailable: boolean,
  executionPrerequisitesStructurallySatisfied: boolean,
  validationReadinessStructurallySatisfied: boolean,
  selectionPrerequisitesStructurallySatisfied: boolean,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean
): NewGMModeDraftPickRosterAssignmentPrerequisitePhaseId {
  if (!rosterAssignmentContractAvailable) {
    return "missing-roster-assignment-prerequisite-contract";
  }

  if (!executionPrerequisitesStructurallySatisfied) {
    return "missing-execution-prerequisites";
  }

  if (!validationReadinessStructurallySatisfied) {
    return "missing-validation-readiness";
  }

  if (!selectionPrerequisitesStructurallySatisfied) {
    return "missing-selection-prerequisites";
  }

  if (!rosterSlotRequirementAvailable) {
    return "missing-roster-slot-requirements";
  }

  if (!championshipDivisionRequirementAvailable) {
    return "missing-championship-division-requirements";
  }

  return "roster-assignment-prerequisites-structurally-ready-assignment-blocked";
}
