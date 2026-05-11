import { createNewGMModeRosterAssignmentRuleInputContractShell } from "./newGMModeRosterAssignmentRuleInputContractShell.ts";
import {
  type NewGMModeRosterAssignmentRuleInputReadinessPhaseId,
  createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell
} from "./newGMModeRosterAssignmentRuleInputReadinessValidatorShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export interface NewGMModeRosterAssignmentRuleInputReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleInputReadinessSummaryId: "new-gm-mode-roster-assignment-rule-input-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly ruleInputContractAvailable: true;
  readonly ruleInputValidatorAvailable: true;
  readonly rosterAssignmentPrerequisiteAvailable: true;
  readonly executionPrerequisiteAvailable: true;
  readonly validationReadinessAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly totalFixtureCount: number;
  readonly eligibleDisplayReadyCount: number;
  readonly excludedIneligibleCount: number;
  readonly futureRosterAssignmentRuleInputsStructurallySatisfied: boolean;
  readonly topLevelRuleInputReadinessPhase: NewGMModeRosterAssignmentRuleInputReadinessPhaseId;
  readonly deterministicBlockedReasons: ReturnType<
    typeof createNewGMModeRosterAssignmentRuleInputContractShell
  >["blockedReasons"];
  readonly capabilityFlags: ReturnType<
    typeof createNewGMModeRosterAssignmentRuleInputContractShell
  >["capabilityFlags"];
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly selectedWrestlerIdentityAvailable: false;
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

export function createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeRosterAssignmentRuleInputReadinessSummaryShell {
  const ruleInputValidator =
    createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell(input);

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleInputReadinessSummaryId:
      "new-gm-mode-roster-assignment-rule-input-readiness-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    ruleInputContractAvailable:
      ruleInputValidator.ruleInputContractAvailable,
    ruleInputValidatorAvailable:
      ruleInputValidator.rosterAssignmentRuleInputReadinessValidatorId ===
      "new-gm-mode-roster-assignment-rule-input-readiness-validator-v0.1",
    rosterAssignmentPrerequisiteAvailable:
      ruleInputValidator.rosterAssignmentPrerequisiteAvailable,
    executionPrerequisiteAvailable:
      ruleInputValidator.executionPrerequisiteAvailable,
    validationReadinessAvailable:
      ruleInputValidator.validationReadinessAvailable,
    rosterSlotRequirementAvailable:
      ruleInputValidator.rosterSlotRequirementAvailable,
    championshipDivisionRequirementAvailable:
      ruleInputValidator.championshipDivisionRequirementAvailable,
    totalFixtureCount:
      ruleInputValidator.ruleInputReadinessSummary.totalFixtureCount,
    eligibleDisplayReadyCount:
      ruleInputValidator.ruleInputReadinessSummary.eligibleDisplayReadyCount,
    excludedIneligibleCount:
      ruleInputValidator.ruleInputReadinessSummary.excludedIneligibleCount,
    futureRosterAssignmentRuleInputsStructurallySatisfied:
      ruleInputValidator.futureRosterAssignmentRuleInputsStructurallySatisfied,
    topLevelRuleInputReadinessPhase:
      ruleInputValidator.ruleInputReadinessPhase,
    deterministicBlockedReasons: ruleInputValidator.blockedReasons,
    capabilityFlags: ruleInputValidator.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    selectedWrestlerIdentityAvailable: false,
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
