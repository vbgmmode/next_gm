import {
  type NewGMModeRosterAssignmentRuleInputCapabilityFlags,
  createNewGMModeRosterAssignmentRuleInputContractShell
} from "./newGMModeRosterAssignmentRuleInputContractShell.ts";

export type NewGMModeRosterAssignmentRuleEvaluationRuleId =
  | "roster-assignment-rule-input-readiness-availability"
  | "executed-draft-pick-prerequisite"
  | "selected-wrestler-identity-prerequisite"
  | "target-brand-roster-context-prerequisite"
  | "roster-slot-availability-check"
  | "duplicate-roster-membership-prevention"
  | "gender-division-compatibility-check"
  | "role-category-compatibility-check"
  | "championship-division-compatibility-check"
  | "tag-division-team-compatibility-placeholder"
  | "minimum-maximum-roster-size-guard"
  | "future-roster-mutation-transaction-boundary"
  | "future-save-payload-compatibility-marker"
  | "blocked-actual-roster-assignment-evaluation"
  | "blocked-roster-state-mutation";

export type NewGMModeRosterAssignmentRuleEvaluationBlockedReason =
  | "roster-assignment-rule-evaluation-contract-only"
  | "roster-assignment-rule-input-readiness-required"
  | "executed-draft-pick-prerequisite-required"
  | "selected-wrestler-identity-not-implemented"
  | "target-brand-roster-context-not-implemented"
  | "roster-slot-availability-check-not-implemented"
  | "duplicate-roster-membership-prevention-not-implemented"
  | "gender-division-compatibility-check-not-implemented"
  | "role-category-compatibility-check-not-implemented"
  | "championship-division-compatibility-check-not-implemented"
  | "tag-division-team-compatibility-not-implemented"
  | "minimum-maximum-roster-size-guard-not-implemented"
  | "future-roster-mutation-transaction-boundary-not-implemented"
  | "future-save-payload-compatibility-not-implemented"
  | "actual-roster-assignment-evaluation-not-implemented"
  | "roster-state-mutation-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-state-creation-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "match-show-week-state-not-implemented"
  | "save-creation-not-implemented"
  | "sqlite-write-not-implemented"
  | "generated-text-not-implemented"
  | "genai-not-implemented";

export interface NewGMModeRosterAssignmentRuleEvaluationRule {
  readonly id: NewGMModeRosterAssignmentRuleEvaluationRuleId;
  readonly slug: NewGMModeRosterAssignmentRuleEvaluationRuleId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeRosterAssignmentRuleEvaluationCapabilityFlags =
  NewGMModeRosterAssignmentRuleInputCapabilityFlags & {
    readonly rosterAssignmentRuleEvaluationContractAvailable: true;
    readonly rosterAssignmentRuleEvaluationReadinessValidatorAvailable: true;
    readonly rosterAssignmentRuleEvaluationSummaryAvailable: true;
    readonly rosterAssignmentRuleInputReadinessAvailable: true;
    readonly draftPickExecutionPrerequisiteSummaryAvailable: true;
    readonly draftPickValidationReadinessSummaryAvailable: true;
    readonly rosterSlotRequirementContractAvailable: true;
    readonly championshipDivisionRequirementContractAvailable: true;
    readonly talentPoolReadinessAggregatorAvailable: true;
    readonly targetBrandRosterContextAvailable: false;
    readonly rosterSlotAvailabilityCheckAvailable: false;
    readonly duplicateRosterMembershipPreventionAvailable: false;
    readonly genderDivisionCompatibilityCheckAvailable: false;
    readonly roleCategoryCompatibilityCheckAvailable: false;
    readonly championshipDivisionCompatibilityCheckAvailable: false;
    readonly tagDivisionTeamCompatibilityCheckAvailable: false;
    readonly minimumMaximumRosterSizeGuardAvailable: false;
    readonly futureRosterMutationTransactionBoundaryAvailable: false;
    readonly futureSavePayloadCompatibilityMarkerAvailable: false;
    readonly actualRosterAssignmentRuleEvaluationAvailable: false;
    readonly rosterStateMutationAvailable: false;
  };

export interface NewGMModeRosterAssignmentRuleEvaluationContractShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleEvaluationContractId: "new-gm-mode-roster-assignment-rule-evaluation-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentRuleEvaluationContractAvailable: true;
  readonly orderedEvaluationRules: readonly NewGMModeRosterAssignmentRuleEvaluationRule[];
  readonly evaluationRuleCount: number;
  readonly blockedReasons: readonly NewGMModeRosterAssignmentRuleEvaluationBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterAssignmentRuleEvaluationCapabilityFlags;
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
  readonly rosterSlotAvailabilityCheckAvailable: false;
  readonly duplicateRosterMembershipPreventionAvailable: false;
  readonly genderDivisionCompatibilityCheckAvailable: false;
  readonly roleCategoryCompatibilityCheckAvailable: false;
  readonly championshipDivisionCompatibilityCheckAvailable: false;
  readonly tagDivisionTeamCompatibilityCheckAvailable: false;
  readonly minimumMaximumRosterSizeGuardAvailable: false;
  readonly futureRosterMutationTransactionBoundaryAvailable: false;
  readonly futureSavePayloadCompatibilityMarkerAvailable: false;
  readonly actualRuleEvaluationAvailable: false;
  readonly actualRosterAssignmentRuleEvaluationAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly actualRosterAssignmentAvailable: false;
  readonly rosterStateMutationAvailable: false;
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

const ORDERED_EVALUATION_RULE_IDS: readonly NewGMModeRosterAssignmentRuleEvaluationRuleId[] =
  Object.freeze([
    "roster-assignment-rule-input-readiness-availability",
    "executed-draft-pick-prerequisite",
    "selected-wrestler-identity-prerequisite",
    "target-brand-roster-context-prerequisite",
    "roster-slot-availability-check",
    "duplicate-roster-membership-prevention",
    "gender-division-compatibility-check",
    "role-category-compatibility-check",
    "championship-division-compatibility-check",
    "tag-division-team-compatibility-placeholder",
    "minimum-maximum-roster-size-guard",
    "future-roster-mutation-transaction-boundary",
    "future-save-payload-compatibility-marker",
    "blocked-actual-roster-assignment-evaluation",
    "blocked-roster-state-mutation"
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterAssignmentRuleEvaluationBlockedReason[] =
  Object.freeze([
    "roster-assignment-rule-evaluation-contract-only",
    "roster-assignment-rule-input-readiness-required",
    "executed-draft-pick-prerequisite-required",
    "selected-wrestler-identity-not-implemented",
    "target-brand-roster-context-not-implemented",
    "roster-slot-availability-check-not-implemented",
    "duplicate-roster-membership-prevention-not-implemented",
    "gender-division-compatibility-check-not-implemented",
    "role-category-compatibility-check-not-implemented",
    "championship-division-compatibility-check-not-implemented",
    "tag-division-team-compatibility-not-implemented",
    "minimum-maximum-roster-size-guard-not-implemented",
    "future-roster-mutation-transaction-boundary-not-implemented",
    "future-save-payload-compatibility-not-implemented",
    "actual-roster-assignment-evaluation-not-implemented",
    "roster-state-mutation-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-state-creation-not-implemented",
    "championship-division-assignment-not-implemented",
    "match-show-week-state-not-implemented",
    "save-creation-not-implemented",
    "sqlite-write-not-implemented",
    "generated-text-not-implemented",
    "genai-not-implemented"
  ]);

export function createNewGMModeRosterAssignmentRuleEvaluationContractShell(): NewGMModeRosterAssignmentRuleEvaluationContractShell {
  const ruleInputContract = createNewGMModeRosterAssignmentRuleInputContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleEvaluationContractId:
      "new-gm-mode-roster-assignment-rule-evaluation-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentRuleEvaluationContractAvailable: true,
    orderedEvaluationRules: Object.freeze(
      ORDERED_EVALUATION_RULE_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          required: true,
          diagnosticsOnly: true
        })
      )
    ),
    evaluationRuleCount: ORDERED_EVALUATION_RULE_IDS.length,
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: Object.freeze({
      ...ruleInputContract.capabilityFlags,
      rosterAssignmentRuleEvaluationContractAvailable: true,
      rosterAssignmentRuleEvaluationReadinessValidatorAvailable: true,
      rosterAssignmentRuleEvaluationSummaryAvailable: true,
      rosterAssignmentRuleInputReadinessAvailable: true,
      draftPickExecutionPrerequisiteSummaryAvailable: true,
      draftPickValidationReadinessSummaryAvailable: true,
      rosterSlotRequirementContractAvailable: true,
      championshipDivisionRequirementContractAvailable: true,
      talentPoolReadinessAggregatorAvailable: true,
      targetBrandRosterContextAvailable: false,
      rosterSlotAvailabilityCheckAvailable: false,
      duplicateRosterMembershipPreventionAvailable: false,
      genderDivisionCompatibilityCheckAvailable: false,
      roleCategoryCompatibilityCheckAvailable: false,
      championshipDivisionCompatibilityCheckAvailable: false,
      tagDivisionTeamCompatibilityCheckAvailable: false,
      minimumMaximumRosterSizeGuardAvailable: false,
      futureRosterMutationTransactionBoundaryAvailable: false,
      futureSavePayloadCompatibilityMarkerAvailable: false,
      actualRosterAssignmentRuleEvaluationAvailable: false,
      rosterStateMutationAvailable: false
    }),
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
    rosterSlotAvailabilityCheckAvailable: false,
    duplicateRosterMembershipPreventionAvailable: false,
    genderDivisionCompatibilityCheckAvailable: false,
    roleCategoryCompatibilityCheckAvailable: false,
    championshipDivisionCompatibilityCheckAvailable: false,
    tagDivisionTeamCompatibilityCheckAvailable: false,
    minimumMaximumRosterSizeGuardAvailable: false,
    futureRosterMutationTransactionBoundaryAvailable: false,
    futureSavePayloadCompatibilityMarkerAvailable: false,
    actualRuleEvaluationAvailable: false,
    actualRosterAssignmentRuleEvaluationAvailable: false,
    rosterAssignmentAvailable: false,
    actualRosterAssignmentAvailable: false,
    rosterStateMutationAvailable: false,
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
