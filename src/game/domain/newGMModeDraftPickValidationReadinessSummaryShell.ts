import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import { createNewGMModeDraftBoardDisplayReadinessSummaryShell } from "./newGMModeDraftBoardDisplayReadinessSummaryShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell } from "./newGMModeDraftBoardSelectionPrerequisiteSummaryShell.ts";
import {
  type NewGMModeDraftPickValidationBlockedReason,
  type NewGMModeDraftPickValidationCapabilityFlags,
  createNewGMModeDraftPickValidationContractShell
} from "./newGMModeDraftPickValidationContractShell.ts";
import {
  type NewGMModeDraftPickValidationReadinessPhaseId,
  createNewGMModeDraftPickValidationReadinessValidatorShell
} from "./newGMModeDraftPickValidationReadinessValidatorShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export interface NewGMModeDraftPickValidationReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftPickValidationReadinessSummaryId: "new-gm-mode-draft-pick-validation-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly draftPickValidationContractAvailable: true;
  readonly validationReadinessValidatorAvailable: true;
  readonly selectionPrerequisiteAvailable: true;
  readonly displayReadinessAvailable: true;
  readonly orderingReadinessAvailable: true;
  readonly draftBoardInputReadinessAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly topLevelValidationReadinessPhase: NewGMModeDraftPickValidationReadinessPhaseId;
  readonly futureDraftPickValidationPrerequisitesStructurallySatisfied: boolean;
  readonly validationReadinessSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly validationIssueCount: number;
    readonly selectedWrestlerChosen: false;
    readonly concreteDraftPickValidated: false;
    readonly actualDraftPickExecutionReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftPickValidationBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly concreteDraftPickValidated: false;
  readonly draftPickCreated: false;
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

export function createNewGMModeDraftPickValidationReadinessSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftPickValidationReadinessSummaryShell {
  const validationContract = createNewGMModeDraftPickValidationContractShell();
  const validationReadiness =
    createNewGMModeDraftPickValidationReadinessValidatorShell(input);
  const selectionPrerequisites =
    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(input);
  const displayReadiness =
    createNewGMModeDraftBoardDisplayReadinessSummaryShell(input);
  const orderingReadiness = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const draftBoardInputReadiness =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);

  return Object.freeze({
    status: "diagnostics-only",
    draftPickValidationReadinessSummaryId:
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    draftPickValidationContractAvailable:
      validationContract.draftPickValidationContractAvailable,
    validationReadinessValidatorAvailable:
      validationReadiness.draftPickValidationReadinessValidatorId ===
      "new-gm-mode-draft-pick-validation-readiness-validator-v0.1",
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
    topLevelValidationReadinessPhase:
      validationReadiness.validationReadinessPhase,
    futureDraftPickValidationPrerequisitesStructurallySatisfied:
      validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied,
    validationReadinessSummary: Object.freeze({
      totalFixtureCount:
        validationReadiness.validationReadinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        validationReadiness.validationReadinessSummary.displayReadyEligibleCount,
      excludedIneligibleCount:
        validationReadiness.validationReadinessSummary.excludedIneligibleCount,
      validationIssueCount:
        validationReadiness.validationReadinessSummary.validationIssueCount,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false
    }),
    blockedReasons: validationContract.blockedReasons,
    capabilityFlags: validationContract.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    concreteDraftPickValidated: false,
    draftPickCreated: false,
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
