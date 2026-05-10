import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import { createNewGMModeDraftBoardDisplayReadinessSummaryShell } from "./newGMModeDraftBoardDisplayReadinessSummaryShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell } from "./newGMModeDraftBoardSelectionPrerequisiteSummaryShell.ts";
import {
  type NewGMModeDraftPickExecutionPrerequisiteBlockedReason,
  type NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags,
  createNewGMModeDraftPickExecutionPrerequisiteContractShell
} from "./newGMModeDraftPickExecutionPrerequisiteContractShell.ts";
import { createNewGMModeDraftPickValidationReadinessSummaryShell } from "./newGMModeDraftPickValidationReadinessSummaryShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftPickExecutionPrerequisitePhaseId =
  | "missing-execution-prerequisite-contract"
  | "missing-validation-readiness"
  | "missing-selection-prerequisites"
  | "missing-display-readiness"
  | "missing-ordering-readiness"
  | "missing-draft-board-input-readiness"
  | "missing-talent-pool-readiness"
  | "execution-prerequisites-structurally-ready-pick-execution-blocked";

export interface NewGMModeDraftPickExecutionPrerequisiteSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftPickExecutionPrerequisiteSummaryId: "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly executionPrerequisiteContractAvailable: true;
  readonly validationReadinessAvailable: true;
  readonly selectionPrerequisiteAvailable: true;
  readonly displayReadinessAvailable: true;
  readonly orderingReadinessAvailable: true;
  readonly draftBoardInputReadinessAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly topLevelExecutionPrerequisitePhase: NewGMModeDraftPickExecutionPrerequisitePhaseId;
  readonly futureDraftPickExecutionPrerequisitesStructurallySatisfied: boolean;
  readonly executionPrerequisiteSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly selectedWrestlerChosen: false;
    readonly concreteDraftPickValidated: false;
    readonly validatedPickAvailable: false;
    readonly draftPickCreated: false;
    readonly actualDraftPickExecutionReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftPickExecutionPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly concreteDraftPickValidated: false;
  readonly validatedPickAvailable: false;
  readonly draftPickCreated: false;
  readonly draftPickExecuted: false;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly concreteDraftPickValidationAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
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

export function createNewGMModeDraftPickExecutionPrerequisiteSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftPickExecutionPrerequisiteSummaryShell {
  const executionContract =
    createNewGMModeDraftPickExecutionPrerequisiteContractShell();
  const validationReadiness =
    createNewGMModeDraftPickValidationReadinessSummaryShell(input);
  const selectionPrerequisites =
    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(input);
  const displayReadiness =
    createNewGMModeDraftBoardDisplayReadinessSummaryShell(input);
  const orderingReadiness = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const draftBoardInputReadiness =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const futureDraftPickExecutionPrerequisitesStructurallySatisfied =
    validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied &&
    selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied &&
    displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied &&
    orderingReadiness.futureDraftBoardOrderingStructurallySatisfied &&
    draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied &&
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied;

  return Object.freeze({
    status: "diagnostics-only",
    draftPickExecutionPrerequisiteSummaryId:
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    executionPrerequisiteContractAvailable:
      executionContract.draftPickExecutionPrerequisiteContractAvailable,
    validationReadinessAvailable:
      validationReadiness.draftPickValidationReadinessSummaryId ===
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    selectionPrerequisiteAvailable:
      selectionPrerequisites.draftBoardSelectionPrerequisiteSummaryId ===
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1",
    displayReadinessAvailable:
      displayReadiness.draftBoardDisplayReadinessSummaryId ===
      "new-gm-mode-draft-board-display-readiness-summary-v0.1",
    orderingReadinessAvailable:
      orderingReadiness.draftBoardOrderingSummaryId ===
      "new-gm-mode-draft-board-ordering-summary-v0.1",
    draftBoardInputReadinessAvailable:
      draftBoardInputReadiness.draftBoardInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    topLevelExecutionPrerequisitePhase: determineExecutionPrerequisitePhase(
      executionContract.draftPickExecutionPrerequisiteContractAvailable,
      validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied,
      displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied,
      orderingReadiness.futureDraftBoardOrderingStructurallySatisfied,
      draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied,
      talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied
    ),
    futureDraftPickExecutionPrerequisitesStructurallySatisfied,
    executionPrerequisiteSummary: Object.freeze({
      totalFixtureCount:
        validationReadiness.validationReadinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        validationReadiness.validationReadinessSummary.displayReadyEligibleCount,
      excludedIneligibleCount:
        validationReadiness.validationReadinessSummary.excludedIneligibleCount,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      validatedPickAvailable: false,
      draftPickCreated: false,
      actualDraftPickExecutionReady: false
    }),
    blockedReasons: executionContract.blockedReasons,
    capabilityFlags: executionContract.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    concreteDraftPickValidated: false,
    validatedPickAvailable: false,
    draftPickCreated: false,
    draftPickExecuted: false,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    concreteDraftPickValidationAvailable: false,
    actualDraftPickExecutionAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
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

function determineExecutionPrerequisitePhase(
  executionContractAvailable: boolean,
  validationReadinessStructurallySatisfied: boolean,
  selectionPrerequisitesStructurallySatisfied: boolean,
  displayReadinessStructurallySatisfied: boolean,
  orderingReadinessStructurallySatisfied: boolean,
  draftBoardInputReadinessStructurallySatisfied: boolean,
  talentPoolReadinessStructurallySatisfied: boolean
): NewGMModeDraftPickExecutionPrerequisitePhaseId {
  if (!executionContractAvailable) {
    return "missing-execution-prerequisite-contract";
  }

  if (!validationReadinessStructurallySatisfied) {
    return "missing-validation-readiness";
  }

  if (!selectionPrerequisitesStructurallySatisfied) {
    return "missing-selection-prerequisites";
  }

  if (!displayReadinessStructurallySatisfied) {
    return "missing-display-readiness";
  }

  if (!orderingReadinessStructurallySatisfied) {
    return "missing-ordering-readiness";
  }

  if (!draftBoardInputReadinessStructurallySatisfied) {
    return "missing-draft-board-input-readiness";
  }

  if (!talentPoolReadinessStructurallySatisfied) {
    return "missing-talent-pool-readiness";
  }

  return "execution-prerequisites-structurally-ready-pick-execution-blocked";
}
