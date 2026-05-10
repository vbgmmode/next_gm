import { createNewGMModeRosterAssignmentHandoffSummaryShell } from "./newGMModeRosterAssignmentHandoffSummaryShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeCapabilityFlags
} from "./newGMModeRosterAssignmentResultShapeContractShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeReadinessValidatorInput
} from "./newGMModeRosterAssignmentResultShapeReadinessValidatorShell.ts";

export type NewGMModeRosterMutationBoundaryRequirementId =
  | "roster-assignment-handoff-availability"
  | "assignment-result-shape-readiness-availability"
  | "rule-evaluation-readiness-availability"
  | "executed-draft-pick-reference-prerequisite"
  | "selected-wrestler-identity-prerequisite"
  | "target-brand-roster-context-prerequisite"
  | "roster-state-read-prerequisite"
  | "duplicate-roster-membership-guard"
  | "roster-slot-capacity-guard"
  | "gender-division-compatibility-guard"
  | "championship-division-compatibility-guard"
  | "transaction-atomicity-requirement"
  | "rollback-error-result-requirement"
  | "future-save-payload-compatibility-marker"
  | "blocked-actual-roster-mutation";

export type NewGMModeRosterMutationBoundaryBlockedReason =
  | "roster-mutation-boundary-contract-only"
  | "roster-assignment-handoff-required"
  | "assignment-result-shape-readiness-required"
  | "rule-evaluation-readiness-required"
  | "executed-draft-pick-reference-not-implemented"
  | "selected-wrestler-identity-not-implemented"
  | "target-brand-roster-context-not-implemented"
  | "roster-state-read-not-implemented"
  | "duplicate-roster-membership-guard-not-implemented"
  | "roster-slot-capacity-guard-not-implemented"
  | "gender-division-compatibility-guard-not-implemented"
  | "championship-division-compatibility-guard-not-implemented"
  | "transaction-atomicity-not-implemented"
  | "rollback-error-result-not-implemented"
  | "future-save-payload-compatibility-not-implemented"
  | "actual-roster-mutation-not-implemented"
  | "assignment-result-object-creation-not-implemented"
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

export interface NewGMModeRosterMutationBoundaryRequirement {
  readonly id: NewGMModeRosterMutationBoundaryRequirementId;
  readonly slug: NewGMModeRosterMutationBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeRosterMutationBoundaryCapabilityFlags =
  NewGMModeRosterAssignmentResultShapeCapabilityFlags & {
    readonly rosterMutationBoundaryContractAvailable: true;
    readonly rosterAssignmentHandoffSummaryAvailable: true;
    readonly rosterMutationTransactionAvailable: false;
    readonly rosterStateReadAvailable: false;
    readonly rosterStateCreationAvailable: false;
    readonly rollbackErrorResultAvailable: false;
    readonly transactionAtomicityAvailable: false;
    readonly futureSavePayloadCompatibilityAvailable: false;
  };

export interface NewGMModeRosterMutationBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly rosterMutationBoundaryContractId: "new-gm-mode-roster-mutation-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterMutationBoundaryContractAvailable: true;
  readonly orderedMutationBoundaryRequirements: readonly NewGMModeRosterMutationBoundaryRequirement[];
  readonly mutationBoundaryRequirementCount: number;
  readonly rosterAssignmentHandoffAvailable: true;
  readonly rosterAssignmentHandoffStructurallyReady: boolean;
  readonly assignmentResultShapeReadinessAvailable: true;
  readonly assignmentResultShapeReadinessStructurallySatisfied: boolean;
  readonly ruleEvaluationReadinessAvailable: true;
  readonly ruleEvaluationReadinessStructurallySatisfied: boolean;
  readonly assignmentInputReadinessAvailable: true;
  readonly assignmentInputReadinessStructurallySatisfied: boolean;
  readonly draftPickExecutionPrerequisiteAvailable: true;
  readonly draftPickExecutionPrerequisiteStructurallySatisfied: boolean;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly futureRosterMutationBoundaryAvailable: false;
  readonly fixtureHandoffCounts: {
    readonly totalFixtureCount: number;
    readonly eligibleDisplayReadyCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: 10;
    readonly expectedEligibleDisplayReadyCount: 9;
    readonly expectedExcludedIneligibleCount: 1;
  };
  readonly blockedReasons: readonly NewGMModeRosterMutationBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterMutationBoundaryCapabilityFlags;
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
  readonly targetBrandRosterContextAvailable: false;
  readonly rosterStateReadAvailable: false;
  readonly duplicateRosterMembershipGuardAvailable: false;
  readonly rosterSlotCapacityGuardAvailable: false;
  readonly genderDivisionCompatibilityGuardAvailable: false;
  readonly championshipDivisionCompatibilityGuardAvailable: false;
  readonly transactionAtomicityAvailable: false;
  readonly rollbackErrorResultAvailable: false;
  readonly futureSavePayloadCompatibilityAvailable: false;
  readonly actualRuleEvaluationAvailable: false;
  readonly actualRosterAssignmentRuleEvaluationAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly actualRosterAssignmentAvailable: false;
  readonly rosterStateMutationAvailable: false;
  readonly actualRosterMutationAvailable: false;
  readonly rosterMutationTransactionAvailable: false;
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

const ORDERED_MUTATION_BOUNDARY_REQUIREMENT_IDS: readonly NewGMModeRosterMutationBoundaryRequirementId[] =
  Object.freeze([
    "roster-assignment-handoff-availability",
    "assignment-result-shape-readiness-availability",
    "rule-evaluation-readiness-availability",
    "executed-draft-pick-reference-prerequisite",
    "selected-wrestler-identity-prerequisite",
    "target-brand-roster-context-prerequisite",
    "roster-state-read-prerequisite",
    "duplicate-roster-membership-guard",
    "roster-slot-capacity-guard",
    "gender-division-compatibility-guard",
    "championship-division-compatibility-guard",
    "transaction-atomicity-requirement",
    "rollback-error-result-requirement",
    "future-save-payload-compatibility-marker",
    "blocked-actual-roster-mutation"
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterMutationBoundaryBlockedReason[] =
  Object.freeze([
    "roster-mutation-boundary-contract-only",
    "roster-assignment-handoff-required",
    "assignment-result-shape-readiness-required",
    "rule-evaluation-readiness-required",
    "executed-draft-pick-reference-not-implemented",
    "selected-wrestler-identity-not-implemented",
    "target-brand-roster-context-not-implemented",
    "roster-state-read-not-implemented",
    "duplicate-roster-membership-guard-not-implemented",
    "roster-slot-capacity-guard-not-implemented",
    "gender-division-compatibility-guard-not-implemented",
    "championship-division-compatibility-guard-not-implemented",
    "transaction-atomicity-not-implemented",
    "rollback-error-result-not-implemented",
    "future-save-payload-compatibility-not-implemented",
    "actual-roster-mutation-not-implemented",
    "assignment-result-object-creation-not-implemented",
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

const EXPECTED_FIXTURE_COUNT = 10;
const EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT = 9;
const EXPECTED_EXCLUDED_INELIGIBLE_COUNT = 1;

export function createNewGMModeRosterMutationBoundaryContractShell(
  input: NewGMModeRosterAssignmentResultShapeReadinessValidatorInput = {}
): NewGMModeRosterMutationBoundaryContractShell {
  const handoffSummary =
    createNewGMModeRosterAssignmentHandoffSummaryShell(input);
  const totalFixtureCount =
    handoffSummary.fixtureHandoffCounts.totalFixtureCount;
  const eligibleDisplayReadyCount =
    handoffSummary.fixtureHandoffCounts.eligibleDisplayReadyCount;
  const excludedIneligibleCount =
    handoffSummary.fixtureHandoffCounts.excludedIneligibleCount;

  return Object.freeze({
    status: "diagnostics-only",
    rosterMutationBoundaryContractId:
      "new-gm-mode-roster-mutation-boundary-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterMutationBoundaryContractAvailable: true,
    orderedMutationBoundaryRequirements: Object.freeze(
      ORDERED_MUTATION_BOUNDARY_REQUIREMENT_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          required: true,
          diagnosticsOnly: true
        })
      )
    ),
    mutationBoundaryRequirementCount:
      ORDERED_MUTATION_BOUNDARY_REQUIREMENT_IDS.length,
    rosterAssignmentHandoffAvailable:
      handoffSummary.rosterAssignmentHandoffSummaryId ===
      "new-gm-mode-roster-assignment-handoff-summary-v0.1",
    rosterAssignmentHandoffStructurallyReady:
      handoffSummary.topLevelHandoffPhase ===
      "structurally-ready-roster-assignment-handoff-blocked",
    assignmentResultShapeReadinessAvailable:
      handoffSummary.resultShapeReadinessAvailable,
    assignmentResultShapeReadinessStructurallySatisfied:
      handoffSummary.resultShapeReadinessStructurallySatisfied,
    ruleEvaluationReadinessAvailable:
      handoffSummary.ruleEvaluationReadinessAvailable,
    ruleEvaluationReadinessStructurallySatisfied:
      handoffSummary.ruleEvaluationReadinessStructurallySatisfied,
    assignmentInputReadinessAvailable:
      handoffSummary.assignmentInputReadinessAvailable,
    assignmentInputReadinessStructurallySatisfied:
      handoffSummary.assignmentInputReadinessStructurallySatisfied,
    draftPickExecutionPrerequisiteAvailable:
      handoffSummary.draftPickExecutionPrerequisiteAvailable,
    draftPickExecutionPrerequisiteStructurallySatisfied:
      handoffSummary.draftPickExecutionPrerequisiteStructurallySatisfied,
    rosterSlotRequirementAvailable:
      handoffSummary.rosterSlotRequirementAvailable,
    championshipDivisionRequirementAvailable:
      handoffSummary.championshipDivisionRequirementAvailable,
    futureRosterMutationBoundaryAvailable: false,
    fixtureHandoffCounts: Object.freeze({
      totalFixtureCount,
      eligibleDisplayReadyCount,
      excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_FIXTURE_COUNT,
      expectedEligibleDisplayReadyCount: EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT,
      expectedExcludedIneligibleCount: EXPECTED_EXCLUDED_INELIGIBLE_COUNT
    }),
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: Object.freeze({
      ...handoffSummary.capabilityFlags,
      rosterMutationBoundaryContractAvailable: true,
      rosterAssignmentHandoffSummaryAvailable: true,
      rosterMutationTransactionAvailable: false,
      rosterStateReadAvailable: false,
      rosterStateCreationAvailable: false,
      rollbackErrorResultAvailable: false,
      transactionAtomicityAvailable: false,
      futureSavePayloadCompatibilityAvailable: false
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
    targetBrandRosterContextAvailable: false,
    rosterStateReadAvailable: false,
    duplicateRosterMembershipGuardAvailable: false,
    rosterSlotCapacityGuardAvailable: false,
    genderDivisionCompatibilityGuardAvailable: false,
    championshipDivisionCompatibilityGuardAvailable: false,
    transactionAtomicityAvailable: false,
    rollbackErrorResultAvailable: false,
    futureSavePayloadCompatibilityAvailable: false,
    actualRuleEvaluationAvailable: false,
    actualRosterAssignmentRuleEvaluationAvailable: false,
    rosterAssignmentAvailable: false,
    actualRosterAssignmentAvailable: false,
    rosterStateMutationAvailable: false,
    actualRosterMutationAvailable: false,
    rosterMutationTransactionAvailable: false,
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
