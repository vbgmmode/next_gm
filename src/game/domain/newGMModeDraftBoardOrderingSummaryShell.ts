import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import {
  type NewGMModeDraftBoardOrderingBlockedReason,
  type NewGMModeDraftBoardOrderingCapabilityFlags,
  createNewGMModeDraftBoardOrderingContractShell
} from "./newGMModeDraftBoardOrderingContractShell.ts";
import {
  type NewGMModeDraftBoardOrderingReadinessPhaseId,
  createNewGMModeDraftBoardOrderingValidatorShell
} from "./newGMModeDraftBoardOrderingValidatorShell.ts";
import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export interface NewGMModeDraftBoardOrderingSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftBoardOrderingSummaryId: "new-gm-mode-draft-board-ordering-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly orderingContractAvailable: true;
  readonly orderingValidatorAvailable: true;
  readonly draftBoardInputSummaryAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly topLevelOrderingReadinessPhase: NewGMModeDraftBoardOrderingReadinessPhaseId;
  readonly futureDraftBoardOrderingStructurallySatisfied: boolean;
  readonly orderingSummary: {
    readonly totalFixtureCount: number;
    readonly eligibleOrderedCount: number;
    readonly excludedIneligibleCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualDraftBoardCreationReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftBoardOrderingBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardOrderingCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
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
  readonly randomOrderingUsed: false;
}

export function createNewGMModeDraftBoardOrderingSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardOrderingSummaryShell {
  const orderingContract = createNewGMModeDraftBoardOrderingContractShell();
  const orderingValidator = createNewGMModeDraftBoardOrderingValidatorShell(input);
  const draftBoardInputSummary =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const draftBoardPrerequisite = createNewGMModeDraftBoardPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardOrderingSummaryId:
      "new-gm-mode-draft-board-ordering-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    orderingContractAvailable: orderingContract.orderingContractAvailable,
    orderingValidatorAvailable:
      orderingValidator.draftBoardOrderingValidatorId ===
      "new-gm-mode-draft-board-ordering-validator-v0.1",
    draftBoardInputSummaryAvailable:
      draftBoardInputSummary.draftBoardInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    draftBoardPrerequisiteContractAvailable:
      draftBoardPrerequisite.draftBoardPrerequisiteContractAvailable,
    topLevelOrderingReadinessPhase: orderingValidator.orderingReadinessPhase,
    futureDraftBoardOrderingStructurallySatisfied:
      orderingValidator.futureDraftBoardOrderingStructurallySatisfied,
    orderingSummary: Object.freeze({
      totalFixtureCount: orderingValidator.orderingSummary.totalFixtureCount,
      eligibleOrderedCount:
        orderingValidator.orderingSummary.eligibleOrderedEntryCount,
      excludedIneligibleCount:
        orderingValidator.orderingSummary.excludedIneligibleCount,
      minimumEligibleRequirement:
        orderingValidator.orderingSummary.minimumEligibleRequirement,
      minimumEligibleRequirementSatisfied:
        orderingValidator.orderingSummary.minimumEligibleRequirementSatisfied,
      validationIssueCount:
        orderingValidator.orderingSummary.validationIssueCount,
      actualDraftBoardCreationReady: false
    }),
    blockedReasons: orderingContract.blockedReasons,
    capabilityFlags: orderingContract.capabilityFlags,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
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
    genAIUsed: false,
    randomOrderingUsed: false
  });
}
