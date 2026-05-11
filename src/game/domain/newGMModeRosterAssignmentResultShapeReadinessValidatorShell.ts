import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeBlockedReason,
  type NewGMModeRosterAssignmentResultShapeCapabilityFlags,
  createNewGMModeRosterAssignmentResultShapeContractShell
} from "./newGMModeRosterAssignmentResultShapeContractShell.ts";
import { createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell } from "./newGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell.ts";
import {
  type NewGMModeRosterAssignmentRuleEvaluationAvailabilityOverrides,
  type NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput
} from "./newGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import { createNewGMModeStaticWrestlerFixtureCatalogMetrics } from "./newGMModeStaticWrestlerFixtureCatalogMetrics.ts";

export type NewGMModeRosterAssignmentResultShapeReadinessPhaseId =
  | "missing-result-shape-contract"
  | "missing-rule-evaluation-readiness"
  | "missing-assignment-input-readiness"
  | "missing-executed-pick-prerequisite"
  | "structurally-ready-result-shape-blocked";

export type NewGMModeRosterAssignmentResultShapeReadinessIssueCode =
  | "result-shape-contract-missing"
  | "rule-evaluation-readiness-not-structurally-satisfied"
  | "assignment-input-readiness-not-structurally-satisfied"
  | "executed-pick-prerequisite-not-structurally-satisfied"
  | "fixture-count-not-stable"
  | "eligible-display-ready-count-not-stable"
  | "excluded-ineligible-count-not-stable";

export interface NewGMModeRosterAssignmentResultShapeAvailabilityOverrides
  extends NewGMModeRosterAssignmentRuleEvaluationAvailabilityOverrides {
  readonly resultShapeContractAvailable?: boolean;
  readonly ruleEvaluationReadinessAvailable?: boolean;
}

export interface NewGMModeRosterAssignmentResultShapeReadinessValidatorInput
  extends Omit<
    NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput,
    "availabilityOverrides"
  > {
  readonly availabilityOverrides?: NewGMModeRosterAssignmentResultShapeAvailabilityOverrides;
}

export interface NewGMModeRosterAssignmentResultShapeReadinessIssue {
  readonly fieldId: string;
  readonly issue: NewGMModeRosterAssignmentResultShapeReadinessIssueCode;
}

export interface NewGMModeRosterAssignmentResultShapeReadinessValidatorShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentResultShapeReadinessValidatorId: "new-gm-mode-roster-assignment-result-shape-readiness-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentResultShapeReadinessOnly: true;
  readonly readinessPhase: NewGMModeRosterAssignmentResultShapeReadinessPhaseId;
  readonly futureRosterAssignmentResultShapeStructurallyReady: boolean;
  readonly requiredInputAvailabilitySummary: {
    readonly resultShapeContractAvailable: boolean;
    readonly ruleEvaluationSummaryAvailable: boolean;
    readonly ruleEvaluationReadinessValidatorAvailable: boolean;
    readonly ruleEvaluationReadinessStructurallySatisfied: boolean;
    readonly assignmentInputReadinessSummaryAvailable: boolean;
    readonly assignmentInputReadinessStructurallySatisfied: boolean;
    readonly draftPickExecutionPrerequisiteSummaryAvailable: boolean;
    readonly draftPickExecutionPrerequisitesStructurallySatisfied: boolean;
    readonly rosterSlotRequirementContractAvailable: boolean;
    readonly championshipDivisionRequirementContractAvailable: boolean;
    readonly selectedWrestlerIdentityAvailable: false;
    readonly selectedWrestlerChosen: false;
    readonly executedPickAvailable: false;
    readonly assignmentResultObjectAvailable: false;
    readonly actualAssignmentResultCreationReady: false;
    readonly rosterStateAvailable: false;
    readonly actualRosterMutationReady: false;
  };
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
  readonly readinessIssues: readonly NewGMModeRosterAssignmentResultShapeReadinessIssue[];
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

const EXPECTED_CATALOG_METRICS =
  createNewGMModeStaticWrestlerFixtureCatalogMetrics();

export function createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell(
  input: NewGMModeRosterAssignmentResultShapeReadinessValidatorInput = {}
): NewGMModeRosterAssignmentResultShapeReadinessValidatorShell {
  const resultShapeContract =
    createNewGMModeRosterAssignmentResultShapeContractShell();
  const ruleEvaluationReadinessValidator =
    createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const overrides = input.availabilityOverrides;
  const resultShapeContractAvailable =
    overrides?.resultShapeContractAvailable ??
    resultShapeContract.rosterAssignmentResultShapeContractAvailable;
  const ruleEvaluationReadinessAvailable =
    overrides?.ruleEvaluationReadinessAvailable ??
    (ruleEvaluationReadinessValidator.rosterAssignmentRuleEvaluationReadinessValidatorId ===
        "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1");
  const assignmentInputReadinessAvailable =
    overrides?.assignmentInputReadinessAvailable ??
    ruleEvaluationReadinessValidator.requiredInputAvailabilitySummary
      .assignmentInputReadinessSummaryAvailable;
  const executedPickPrerequisiteAvailable =
    overrides?.executedPickPrerequisiteAvailable ??
    ruleEvaluationReadinessValidator.requiredInputAvailabilitySummary
      .draftPickExecutionPrerequisiteSummaryAvailable;
  const ruleEvaluationReadinessStructurallySatisfied =
    ruleEvaluationReadinessAvailable &&
    ruleEvaluationReadinessValidator.futureRosterAssignmentRuleEvaluationStructurallyReady;
  const assignmentInputReadinessStructurallySatisfied =
    assignmentInputReadinessAvailable &&
    ruleEvaluationReadinessValidator.requiredInputAvailabilitySummary
      .assignmentInputReadinessStructurallySatisfied;
  const draftPickExecutionPrerequisitesStructurallySatisfied =
    executedPickPrerequisiteAvailable &&
    ruleEvaluationReadinessValidator.requiredInputAvailabilitySummary
      .draftPickExecutionPrerequisitesStructurallySatisfied;
  const totalFixtureCount =
    ruleEvaluationReadinessValidator.fixtureHandoffCounts.totalFixtureCount;
  const eligibleDisplayReadyCount =
    ruleEvaluationReadinessValidator.fixtureHandoffCounts.eligibleDisplayReadyCount;
  const excludedIneligibleCount =
    ruleEvaluationReadinessValidator.fixtureHandoffCounts.excludedIneligibleCount;
  const issues = collectResultShapeReadinessIssues(
    resultShapeContractAvailable,
    ruleEvaluationReadinessStructurallySatisfied,
    assignmentInputReadinessStructurallySatisfied,
    draftPickExecutionPrerequisitesStructurallySatisfied,
    totalFixtureCount,
    eligibleDisplayReadyCount,
    excludedIneligibleCount
  );
  const futureRosterAssignmentResultShapeStructurallyReady =
    issues.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentResultShapeReadinessValidatorId:
      "new-gm-mode-roster-assignment-result-shape-readiness-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentResultShapeReadinessOnly: true,
    readinessPhase: determineResultShapeReadinessPhase(
      resultShapeContractAvailable,
      ruleEvaluationReadinessAvailable,
      ruleEvaluationReadinessStructurallySatisfied,
      assignmentInputReadinessStructurallySatisfied,
      draftPickExecutionPrerequisitesStructurallySatisfied
    ),
    futureRosterAssignmentResultShapeStructurallyReady,
    requiredInputAvailabilitySummary: Object.freeze({
      resultShapeContractAvailable,
      ruleEvaluationSummaryAvailable: ruleEvaluationReadinessAvailable,
      ruleEvaluationReadinessValidatorAvailable:
        ruleEvaluationReadinessValidator.rosterAssignmentRuleEvaluationReadinessValidatorId ===
        "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1",
      ruleEvaluationReadinessStructurallySatisfied,
      assignmentInputReadinessSummaryAvailable: assignmentInputReadinessAvailable,
      assignmentInputReadinessStructurallySatisfied,
      draftPickExecutionPrerequisiteSummaryAvailable:
        executedPickPrerequisiteAvailable,
      draftPickExecutionPrerequisitesStructurallySatisfied,
      rosterSlotRequirementContractAvailable:
        rosterSlotRequirement.rosterSlotRequirementContractAvailable,
      championshipDivisionRequirementContractAvailable:
        championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      assignmentResultObjectAvailable: false,
      actualAssignmentResultCreationReady: false,
      rosterStateAvailable: false,
      actualRosterMutationReady: false
    }),
    fixtureHandoffCounts: Object.freeze({
      totalFixtureCount,
      eligibleDisplayReadyCount,
      excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_CATALOG_METRICS.totalFixtureCount,
      expectedEligibleDisplayReadyCount:
        EXPECTED_CATALOG_METRICS.eligibleFixtureCount,
      expectedExcludedIneligibleCount:
        EXPECTED_CATALOG_METRICS.ineligibleFixtureCount
    }),
    resultShapeRequirementCount: resultShapeContract.resultShapeRequirementCount,
    issueCount: issues.length,
    readinessIssues: issues,
    blockedReasons: resultShapeContract.blockedReasons,
    capabilityFlags: resultShapeContract.capabilityFlags,
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

function collectResultShapeReadinessIssues(
  resultShapeContractAvailable: boolean,
  ruleEvaluationReadinessStructurallySatisfied: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisitesStructurallySatisfied: boolean,
  totalFixtureCount: number,
  eligibleDisplayReadyCount: number,
  excludedIneligibleCount: number
): readonly NewGMModeRosterAssignmentResultShapeReadinessIssue[] {
  const issues: NewGMModeRosterAssignmentResultShapeReadinessIssue[] = [];

  if (!resultShapeContractAvailable) {
    issues.push(
      createIssue("rosterAssignmentResultShapeContract", "result-shape-contract-missing")
    );
  }

  if (!ruleEvaluationReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "rosterAssignmentRuleEvaluationReadiness",
        "rule-evaluation-readiness-not-structurally-satisfied"
      )
    );
  }

  if (!assignmentInputReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "rosterAssignmentRuleInputReadiness",
        "assignment-input-readiness-not-structurally-satisfied"
      )
    );
  }

  if (!draftPickExecutionPrerequisitesStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftPickExecutionPrerequisiteSummary",
        "executed-pick-prerequisite-not-structurally-satisfied"
      )
    );
  }

  if (totalFixtureCount !== EXPECTED_CATALOG_METRICS.totalFixtureCount) {
    issues.push(createIssue("totalFixtureCount", "fixture-count-not-stable"));
  }

  if (
    eligibleDisplayReadyCount !== EXPECTED_CATALOG_METRICS.eligibleFixtureCount
  ) {
    issues.push(
      createIssue(
        "eligibleDisplayReadyCount",
        "eligible-display-ready-count-not-stable"
      )
    );
  }

  if (
    excludedIneligibleCount !== EXPECTED_CATALOG_METRICS.ineligibleFixtureCount
  ) {
    issues.push(
      createIssue(
        "excludedIneligibleCount",
        "excluded-ineligible-count-not-stable"
      )
    );
  }

  return Object.freeze(issues);
}

function determineResultShapeReadinessPhase(
  resultShapeContractAvailable: boolean,
  ruleEvaluationReadinessAvailable: boolean,
  ruleEvaluationReadinessStructurallySatisfied: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisitesStructurallySatisfied: boolean
): NewGMModeRosterAssignmentResultShapeReadinessPhaseId {
  if (!resultShapeContractAvailable) {
    return "missing-result-shape-contract";
  }

  if (!ruleEvaluationReadinessAvailable) {
    return "missing-rule-evaluation-readiness";
  }

  if (!assignmentInputReadinessStructurallySatisfied) {
    return "missing-assignment-input-readiness";
  }

  if (!draftPickExecutionPrerequisitesStructurallySatisfied) {
    return "missing-executed-pick-prerequisite";
  }

  if (!ruleEvaluationReadinessStructurallySatisfied) {
    return "missing-rule-evaluation-readiness";
  }

  return "structurally-ready-result-shape-blocked";
}

function createIssue(
  fieldId: string,
  issue: NewGMModeRosterAssignmentResultShapeReadinessIssueCode
): NewGMModeRosterAssignmentResultShapeReadinessIssue {
  return Object.freeze({ fieldId, issue });
}
