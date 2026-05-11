import { createNewGMModeRosterAssignmentRuleEvaluationContractShell } from "./newGMModeRosterAssignmentRuleEvaluationContractShell.ts";
import {
  type NewGMModeRosterAssignmentRuleEvaluationReadinessPhaseId,
  type NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput,
  createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell
} from "./newGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell.ts";

export interface NewGMModeRosterAssignmentRuleEvaluationSummaryShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleEvaluationSummaryId: "new-gm-mode-roster-assignment-rule-evaluation-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly contractAvailability: {
    readonly ruleEvaluationContractAvailable: true;
    readonly ruleEvaluationValidatorAvailable: true;
    readonly inputReadinessSummaryAvailable: true;
  };
  readonly topLevelReadinessPhase: NewGMModeRosterAssignmentRuleEvaluationReadinessPhaseId;
  readonly futureRosterAssignmentRuleEvaluationStructurallyReady: boolean;
  readonly fixtureHandoffCounts: {
    readonly totalFixtureCount: number;
    readonly eligibleDisplayReadyCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: number;
    readonly expectedEligibleDisplayReadyCount: number;
    readonly expectedExcludedIneligibleCount: number;
  };
  readonly evaluationRuleCount: number;
  readonly issueCount: number;
  readonly deterministicBlockedReasons: ReturnType<
    typeof createNewGMModeRosterAssignmentRuleEvaluationContractShell
  >["blockedReasons"];
  readonly capabilityFlags: ReturnType<
    typeof createNewGMModeRosterAssignmentRuleEvaluationContractShell
  >["capabilityFlags"];
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly selectedWrestlerIdentityAvailable: false;
  readonly concreteSelectedWrestlerEvaluated: false;
  readonly concreteDraftPickValidated: false;
  readonly validatedPickAvailable: false;
  readonly draftPickCreated: false;
  readonly draftPickExecuted: false;
  readonly executedPickAvailable: false;
  readonly targetBrandRosterContextAvailable: false;
  readonly actualRuleEvaluationAvailable: false;
  readonly actualRosterAssignmentRuleEvaluationAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly actualRosterAssignmentAvailable: false;
  readonly rosterStateMutationAvailable: false;
  readonly rosterStateAvailable: false;
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

export function createNewGMModeRosterAssignmentRuleEvaluationSummaryShell(
  input: NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput = {}
): NewGMModeRosterAssignmentRuleEvaluationSummaryShell {
  const contract = createNewGMModeRosterAssignmentRuleEvaluationContractShell();
  const validator =
    createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell(input);

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleEvaluationSummaryId:
      "new-gm-mode-roster-assignment-rule-evaluation-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    contractAvailability: Object.freeze({
      ruleEvaluationContractAvailable:
        contract.rosterAssignmentRuleEvaluationContractAvailable,
      ruleEvaluationValidatorAvailable:
        validator.rosterAssignmentRuleEvaluationReadinessValidatorId ===
        "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1",
      inputReadinessSummaryAvailable:
        validator.requiredInputAvailabilitySummary
          .assignmentInputReadinessSummaryAvailable
    }),
    topLevelReadinessPhase: validator.readinessPhase,
    futureRosterAssignmentRuleEvaluationStructurallyReady:
      validator.futureRosterAssignmentRuleEvaluationStructurallyReady,
    fixtureHandoffCounts: validator.fixtureHandoffCounts,
    evaluationRuleCount: contract.evaluationRuleCount,
    issueCount: validator.issueCount,
    deterministicBlockedReasons: validator.blockedReasons,
    capabilityFlags: validator.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    selectedWrestlerIdentityAvailable: false,
    concreteSelectedWrestlerEvaluated: false,
    concreteDraftPickValidated: false,
    validatedPickAvailable: false,
    draftPickCreated: false,
    draftPickExecuted: false,
    executedPickAvailable: false,
    targetBrandRosterContextAvailable: false,
    actualRuleEvaluationAvailable: false,
    actualRosterAssignmentRuleEvaluationAvailable: false,
    rosterAssignmentAvailable: false,
    actualRosterAssignmentAvailable: false,
    rosterStateMutationAvailable: false,
    rosterStateAvailable: false,
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
