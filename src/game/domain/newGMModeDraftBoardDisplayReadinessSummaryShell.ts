import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import {
  type NewGMModeDraftBoardDisplayBlockedReason,
  type NewGMModeDraftBoardDisplayCapabilityFlags,
  createNewGMModeDraftBoardDisplayContractShell
} from "./newGMModeDraftBoardDisplayContractShell.ts";
import {
  type NewGMModeDraftBoardDisplayReadinessPhaseId,
  createNewGMModeDraftBoardDisplayReadinessValidatorShell
} from "./newGMModeDraftBoardDisplayReadinessValidatorShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export interface NewGMModeDraftBoardDisplayReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftBoardDisplayReadinessSummaryId: "new-gm-mode-draft-board-display-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly displayContractAvailable: true;
  readonly displayValidatorAvailable: true;
  readonly orderingSummaryAvailable: true;
  readonly draftBoardInputSummaryAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly topLevelDisplayReadinessPhase: NewGMModeDraftBoardDisplayReadinessPhaseId;
  readonly futureDraftBoardDisplayFieldsStructurallySatisfied: boolean;
  readonly displayReadinessSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualDraftBoardCreationReady: false;
    readonly draftBoardUiRenderingReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftBoardDisplayBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardDisplayCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly actualDraftBoardDisplayAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
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

export function createNewGMModeDraftBoardDisplayReadinessSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardDisplayReadinessSummaryShell {
  const displayContract = createNewGMModeDraftBoardDisplayContractShell();
  const displayValidator =
    createNewGMModeDraftBoardDisplayReadinessValidatorShell(input);
  const orderingSummary = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const draftBoardInputSummary =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const draftBoardPrerequisite = createNewGMModeDraftBoardPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardDisplayReadinessSummaryId:
      "new-gm-mode-draft-board-display-readiness-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    displayContractAvailable: displayContract.displayContractAvailable,
    displayValidatorAvailable:
      displayValidator.draftBoardDisplayReadinessValidatorId ===
      "new-gm-mode-draft-board-display-readiness-validator-v0.1",
    orderingSummaryAvailable:
      orderingSummary.draftBoardOrderingSummaryId ===
      "new-gm-mode-draft-board-ordering-summary-v0.1",
    draftBoardInputSummaryAvailable:
      draftBoardInputSummary.draftBoardInputContractAvailable,
    draftBoardPrerequisiteContractAvailable:
      draftBoardPrerequisite.draftBoardPrerequisiteContractAvailable,
    topLevelDisplayReadinessPhase: displayValidator.displayReadinessPhase,
    futureDraftBoardDisplayFieldsStructurallySatisfied:
      displayValidator.futureDraftBoardDisplayFieldsStructurallySatisfied,
    displayReadinessSummary: Object.freeze({
      totalFixtureCount:
        displayValidator.displayReadinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        displayValidator.displayReadinessSummary.displayReadyEligibleEntryCount,
      excludedIneligibleCount:
        displayValidator.displayReadinessSummary.excludedIneligibleCount,
      minimumEligibleRequirement:
        displayValidator.displayReadinessSummary.minimumEligibleRequirement,
      minimumEligibleRequirementSatisfied:
        displayValidator.displayReadinessSummary.minimumEligibleRequirementSatisfied,
      validationIssueCount:
        displayValidator.displayReadinessSummary.validationIssueCount,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    }),
    blockedReasons: displayContract.blockedReasons,
    capabilityFlags: displayContract.capabilityFlags,
    actualDraftBoardCreationAvailable: false,
    actualDraftBoardDisplayAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
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
