import { createNewGMModeRosterAssignmentResultShapeContractShell } from "./newGMModeRosterAssignmentResultShapeContractShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeReadinessPhaseId,
  type NewGMModeRosterAssignmentResultShapeReadinessValidatorInput,
  createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell
} from "./newGMModeRosterAssignmentResultShapeReadinessValidatorShell.ts";

export interface NewGMModeRosterAssignmentResultShapeSummaryShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentResultShapeSummaryId: "new-gm-mode-roster-assignment-result-shape-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly contractAvailability: {
    readonly resultShapeContractAvailable: true;
    readonly resultShapeValidatorAvailable: true;
    readonly ruleEvaluationReadinessAvailable: true;
  };
  readonly topLevelReadinessPhase: NewGMModeRosterAssignmentResultShapeReadinessPhaseId;
  readonly futureRosterAssignmentResultShapeStructurallyReady: boolean;
  readonly fixtureHandoffCounts: {
    readonly totalFixtureCount: number;
    readonly eligibleDisplayReadyCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: number;
    readonly expectedEligibleDisplayReadyCount: number;
    readonly expectedExcludedIneligibleCount: number;
  };
  readonly resultShapeRequirementCount: number;
  readonly issueCount: number;
  readonly deterministicBlockedReasons: ReturnType<
    typeof createNewGMModeRosterAssignmentResultShapeContractShell
  >["blockedReasons"];
  readonly capabilityFlags: ReturnType<
    typeof createNewGMModeRosterAssignmentResultShapeContractShell
  >["capabilityFlags"];
  readonly assignmentResultObjectCreated: false;
  readonly assignmentResultObjectAvailable: false;
  readonly actualRosterAssignmentResultCreationAvailable: false;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly selectedWrestlerIdentityAvailable: false;
  readonly selectedWrestlerHandled: false;
  readonly concreteSelectedWrestlerEvaluated: false;
  readonly concreteDraftPickValidated: false;
  readonly validatedPickAvailable: false;
  readonly draftPickCreated: false;
  readonly draftPickExecuted: false;
  readonly executedPickAvailable: false;
  readonly targetBrandReferenceAvailable: false;
  readonly assignmentDecisionStatusAvailable: false;
  readonly assignmentBlockedReasonListAvailable: false;
  readonly rosterSlotAssignmentPreviewAvailable: false;
  readonly genderDivisionAssignmentPreviewAvailable: false;
  readonly roleCategoryAssignmentPreviewAvailable: false;
  readonly championshipDivisionCompatibilityPreviewAvailable: false;
  readonly duplicateRosterMembershipPreventionResultAvailable: false;
  readonly rosterSizeGuardResultAvailable: false;
  readonly futureRosterMutationTransactionMarkerAvailable: false;
  readonly futureSavePayloadCompatibilityMarkerAvailable: false;
  readonly actualRuleEvaluationAvailable: false;
  readonly actualRosterAssignmentRuleEvaluationAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly actualRosterAssignmentAvailable: false;
  readonly rosterStateMutationAvailable: false;
  readonly actualRosterMutationAvailable: false;
  readonly rosterStateAvailable: false;
  readonly rosterStateCreated: false;
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

export function createNewGMModeRosterAssignmentResultShapeSummaryShell(
  input: NewGMModeRosterAssignmentResultShapeReadinessValidatorInput = {}
): NewGMModeRosterAssignmentResultShapeSummaryShell {
  const contract = createNewGMModeRosterAssignmentResultShapeContractShell();
  const validator =
    createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell(input);

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentResultShapeSummaryId:
      "new-gm-mode-roster-assignment-result-shape-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    contractAvailability: Object.freeze({
      resultShapeContractAvailable:
        contract.rosterAssignmentResultShapeContractAvailable,
      resultShapeValidatorAvailable:
        validator.rosterAssignmentResultShapeReadinessValidatorId ===
        "new-gm-mode-roster-assignment-result-shape-readiness-validator-v0.1",
      ruleEvaluationReadinessAvailable:
        validator.requiredInputAvailabilitySummary.ruleEvaluationSummaryAvailable
    }),
    topLevelReadinessPhase: validator.readinessPhase,
    futureRosterAssignmentResultShapeStructurallyReady:
      validator.futureRosterAssignmentResultShapeStructurallyReady,
    fixtureHandoffCounts: validator.fixtureHandoffCounts,
    resultShapeRequirementCount: contract.resultShapeRequirementCount,
    issueCount: validator.issueCount,
    deterministicBlockedReasons: validator.blockedReasons,
    capabilityFlags: validator.capabilityFlags,
    assignmentResultObjectCreated: false,
    assignmentResultObjectAvailable: false,
    actualRosterAssignmentResultCreationAvailable: false,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    selectedWrestlerIdentityAvailable: false,
    selectedWrestlerHandled: false,
    concreteSelectedWrestlerEvaluated: false,
    concreteDraftPickValidated: false,
    validatedPickAvailable: false,
    draftPickCreated: false,
    draftPickExecuted: false,
    executedPickAvailable: false,
    targetBrandReferenceAvailable: false,
    assignmentDecisionStatusAvailable: false,
    assignmentBlockedReasonListAvailable: false,
    rosterSlotAssignmentPreviewAvailable: false,
    genderDivisionAssignmentPreviewAvailable: false,
    roleCategoryAssignmentPreviewAvailable: false,
    championshipDivisionCompatibilityPreviewAvailable: false,
    duplicateRosterMembershipPreventionResultAvailable: false,
    rosterSizeGuardResultAvailable: false,
    futureRosterMutationTransactionMarkerAvailable: false,
    futureSavePayloadCompatibilityMarkerAvailable: false,
    actualRuleEvaluationAvailable: false,
    actualRosterAssignmentRuleEvaluationAvailable: false,
    rosterAssignmentAvailable: false,
    actualRosterAssignmentAvailable: false,
    rosterStateMutationAvailable: false,
    actualRosterMutationAvailable: false,
    rosterStateAvailable: false,
    rosterStateCreated: false,
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
