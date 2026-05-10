import {
  type NewGMModeRosterAssignmentRuleEvaluationCapabilityFlags,
  createNewGMModeRosterAssignmentRuleEvaluationContractShell
} from "./newGMModeRosterAssignmentRuleEvaluationContractShell.ts";

export type NewGMModeRosterAssignmentResultShapeRequirementId =
  | "roster-assignment-rule-evaluation-readiness-availability"
  | "executed-draft-pick-reference"
  | "selected-wrestler-identity-reference"
  | "target-brand-reference"
  | "assignment-decision-status"
  | "assignment-blocked-reason-list"
  | "roster-slot-assignment-preview"
  | "gender-division-assignment-preview"
  | "role-category-assignment-preview"
  | "championship-division-compatibility-preview"
  | "duplicate-roster-membership-prevention-result"
  | "roster-size-guard-result"
  | "future-roster-mutation-transaction-marker"
  | "future-save-payload-compatibility-marker"
  | "blocked-actual-roster-mutation";

export type NewGMModeRosterAssignmentResultShapeBlockedReason =
  | "roster-assignment-result-shape-contract-only"
  | "roster-assignment-rule-evaluation-readiness-required"
  | "executed-draft-pick-reference-not-implemented"
  | "selected-wrestler-identity-reference-not-implemented"
  | "target-brand-reference-not-implemented"
  | "assignment-decision-status-not-implemented"
  | "assignment-blocked-reason-list-not-implemented"
  | "roster-slot-assignment-preview-not-implemented"
  | "gender-division-assignment-preview-not-implemented"
  | "role-category-assignment-preview-not-implemented"
  | "championship-division-compatibility-preview-not-implemented"
  | "duplicate-roster-membership-prevention-result-not-implemented"
  | "roster-size-guard-result-not-implemented"
  | "future-roster-mutation-transaction-marker-not-implemented"
  | "future-save-payload-compatibility-marker-not-implemented"
  | "actual-assignment-result-creation-not-implemented"
  | "actual-roster-mutation-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "roster-state-creation-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "match-show-week-state-not-implemented"
  | "save-creation-not-implemented"
  | "sqlite-write-not-implemented"
  | "generated-text-not-implemented"
  | "genai-not-implemented";

export interface NewGMModeRosterAssignmentResultShapeRequirement {
  readonly id: NewGMModeRosterAssignmentResultShapeRequirementId;
  readonly slug: NewGMModeRosterAssignmentResultShapeRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeRosterAssignmentResultShapeCapabilityFlags =
  NewGMModeRosterAssignmentRuleEvaluationCapabilityFlags & {
    readonly rosterAssignmentResultShapeContractAvailable: true;
    readonly rosterAssignmentResultShapeReadinessValidatorAvailable: true;
    readonly rosterAssignmentResultShapeSummaryAvailable: true;
    readonly rosterAssignmentRuleEvaluationReadinessAvailable: true;
    readonly rosterAssignmentRuleEvaluationSummaryAvailable: true;
    readonly assignmentResultObjectCreationAvailable: false;
    readonly actualRosterAssignmentResultCreationAvailable: false;
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
    readonly actualRosterMutationAvailable: false;
  };

export interface NewGMModeRosterAssignmentResultShapeContractShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentResultShapeContractId: "new-gm-mode-roster-assignment-result-shape-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentResultShapeContractAvailable: true;
  readonly orderedResultShapeRequirements: readonly NewGMModeRosterAssignmentResultShapeRequirement[];
  readonly resultShapeRequirementCount: number;
  readonly blockedReasons: readonly NewGMModeRosterAssignmentResultShapeBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterAssignmentResultShapeCapabilityFlags;
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

const ORDERED_RESULT_SHAPE_REQUIREMENT_IDS: readonly NewGMModeRosterAssignmentResultShapeRequirementId[] =
  Object.freeze([
    "roster-assignment-rule-evaluation-readiness-availability",
    "executed-draft-pick-reference",
    "selected-wrestler-identity-reference",
    "target-brand-reference",
    "assignment-decision-status",
    "assignment-blocked-reason-list",
    "roster-slot-assignment-preview",
    "gender-division-assignment-preview",
    "role-category-assignment-preview",
    "championship-division-compatibility-preview",
    "duplicate-roster-membership-prevention-result",
    "roster-size-guard-result",
    "future-roster-mutation-transaction-marker",
    "future-save-payload-compatibility-marker",
    "blocked-actual-roster-mutation"
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterAssignmentResultShapeBlockedReason[] =
  Object.freeze([
    "roster-assignment-result-shape-contract-only",
    "roster-assignment-rule-evaluation-readiness-required",
    "executed-draft-pick-reference-not-implemented",
    "selected-wrestler-identity-reference-not-implemented",
    "target-brand-reference-not-implemented",
    "assignment-decision-status-not-implemented",
    "assignment-blocked-reason-list-not-implemented",
    "roster-slot-assignment-preview-not-implemented",
    "gender-division-assignment-preview-not-implemented",
    "role-category-assignment-preview-not-implemented",
    "championship-division-compatibility-preview-not-implemented",
    "duplicate-roster-membership-prevention-result-not-implemented",
    "roster-size-guard-result-not-implemented",
    "future-roster-mutation-transaction-marker-not-implemented",
    "future-save-payload-compatibility-marker-not-implemented",
    "actual-assignment-result-creation-not-implemented",
    "actual-roster-mutation-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-assignment-not-implemented",
    "roster-state-creation-not-implemented",
    "championship-division-assignment-not-implemented",
    "match-show-week-state-not-implemented",
    "save-creation-not-implemented",
    "sqlite-write-not-implemented",
    "generated-text-not-implemented",
    "genai-not-implemented"
  ]);

export function createNewGMModeRosterAssignmentResultShapeContractShell(): NewGMModeRosterAssignmentResultShapeContractShell {
  const ruleEvaluationContract =
    createNewGMModeRosterAssignmentRuleEvaluationContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentResultShapeContractId:
      "new-gm-mode-roster-assignment-result-shape-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentResultShapeContractAvailable: true,
    orderedResultShapeRequirements: Object.freeze(
      ORDERED_RESULT_SHAPE_REQUIREMENT_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          required: true,
          diagnosticsOnly: true
        })
      )
    ),
    resultShapeRequirementCount: ORDERED_RESULT_SHAPE_REQUIREMENT_IDS.length,
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: Object.freeze({
      ...ruleEvaluationContract.capabilityFlags,
      rosterAssignmentResultShapeContractAvailable: true,
      rosterAssignmentResultShapeReadinessValidatorAvailable: true,
      rosterAssignmentResultShapeSummaryAvailable: true,
      rosterAssignmentRuleEvaluationReadinessAvailable: true,
      rosterAssignmentRuleEvaluationSummaryAvailable: true,
      assignmentResultObjectCreationAvailable: false,
      actualRosterAssignmentResultCreationAvailable: false,
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
      actualRosterMutationAvailable: false
    }),
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
