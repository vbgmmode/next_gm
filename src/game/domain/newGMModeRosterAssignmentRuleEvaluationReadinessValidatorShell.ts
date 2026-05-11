import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftPickExecutionPrerequisiteSummaryShell } from "./newGMModeDraftPickExecutionPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickValidationReadinessSummaryShell } from "./newGMModeDraftPickValidationReadinessSummaryShell.ts";
import {
  type NewGMModeRosterAssignmentRuleEvaluationBlockedReason,
  type NewGMModeRosterAssignmentRuleEvaluationCapabilityFlags,
  createNewGMModeRosterAssignmentRuleEvaluationContractShell
} from "./newGMModeRosterAssignmentRuleEvaluationContractShell.ts";
import { createNewGMModeRosterAssignmentRuleInputContractShell } from "./newGMModeRosterAssignmentRuleInputContractShell.ts";
import { createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell } from "./newGMModeRosterAssignmentRuleInputReadinessSummaryShell.ts";
import { createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell } from "./newGMModeRosterAssignmentRuleInputReadinessValidatorShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeRosterAssignmentRuleEvaluationReadinessPhaseId =
  | "missing-rule-evaluation-contract"
  | "missing-assignment-input-readiness"
  | "missing-executed-pick-prerequisite"
  | "missing-roster-slot-requirements"
  | "missing-championship-division-requirements"
  | "structurally-ready-rule-evaluation-blocked";

export type NewGMModeRosterAssignmentRuleEvaluationReadinessIssueCode =
  | "rule-evaluation-contract-missing"
  | "assignment-input-readiness-not-structurally-satisfied"
  | "executed-pick-prerequisite-not-structurally-satisfied"
  | "roster-slot-requirement-contract-missing"
  | "championship-division-requirement-contract-missing"
  | "talent-pool-readiness-not-structurally-satisfied"
  | "fixture-count-not-stable"
  | "eligible-display-ready-count-not-stable"
  | "excluded-ineligible-count-not-stable";

export interface NewGMModeRosterAssignmentRuleEvaluationAvailabilityOverrides {
  readonly ruleEvaluationContractAvailable?: boolean;
  readonly assignmentInputReadinessAvailable?: boolean;
  readonly executedPickPrerequisiteAvailable?: boolean;
  readonly rosterSlotRequirementAvailable?: boolean;
  readonly championshipDivisionRequirementAvailable?: boolean;
}

export interface NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput
  extends NewGMModeTalentPoolReadinessAggregatorInput {
  readonly availabilityOverrides?: NewGMModeRosterAssignmentRuleEvaluationAvailabilityOverrides;
}

export interface NewGMModeRosterAssignmentRuleEvaluationReadinessIssue {
  readonly fieldId: string;
  readonly issue: NewGMModeRosterAssignmentRuleEvaluationReadinessIssueCode;
}

export interface NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleEvaluationReadinessValidatorId: "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentRuleEvaluationReadinessOnly: true;
  readonly readinessPhase: NewGMModeRosterAssignmentRuleEvaluationReadinessPhaseId;
  readonly futureRosterAssignmentRuleEvaluationStructurallyReady: boolean;
  readonly requiredInputAvailabilitySummary: {
    readonly ruleEvaluationContractAvailable: boolean;
    readonly assignmentInputReadinessSummaryAvailable: boolean;
    readonly assignmentInputReadinessValidatorAvailable: boolean;
    readonly assignmentInputContractAvailable: boolean;
    readonly assignmentInputReadinessStructurallySatisfied: boolean;
    readonly draftPickExecutionPrerequisiteSummaryAvailable: boolean;
    readonly draftPickExecutionPrerequisitesStructurallySatisfied: boolean;
    readonly draftPickValidationReadinessSummaryAvailable: boolean;
    readonly rosterSlotRequirementContractAvailable: boolean;
    readonly championshipDivisionRequirementContractAvailable: boolean;
    readonly talentPoolReadinessAggregatorAvailable: boolean;
    readonly talentPoolReadinessStructurallySatisfied: boolean;
    readonly selectedWrestlerIdentityAvailable: false;
    readonly selectedWrestlerChosen: false;
    readonly executedPickAvailable: false;
    readonly targetBrandRosterContextAvailable: false;
    readonly rosterStateAvailable: false;
    readonly actualRuleEvaluationReady: false;
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
  readonly evaluationRuleCount: number;
  readonly issueCount: number;
  readonly readinessIssues: readonly NewGMModeRosterAssignmentRuleEvaluationReadinessIssue[];
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

const EXPECTED_FIXTURE_COUNT = 245;
const EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT = 235;
const EXPECTED_EXCLUDED_INELIGIBLE_COUNT = 10;

export function createNewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell(
  input: NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorInput = {}
): NewGMModeRosterAssignmentRuleEvaluationReadinessValidatorShell {
  const ruleEvaluationContract =
    createNewGMModeRosterAssignmentRuleEvaluationContractShell();
  const assignmentInputReadinessSummary =
    createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell(input);
  const assignmentInputReadinessValidator =
    createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell(input);
  const assignmentInputContract =
    createNewGMModeRosterAssignmentRuleInputContractShell();
  const executionPrerequisiteSummary =
    createNewGMModeDraftPickExecutionPrerequisiteSummaryShell(input);
  const validationReadinessSummary =
    createNewGMModeDraftPickValidationReadinessSummaryShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const overrides = input.availabilityOverrides;
  const ruleEvaluationContractAvailable =
    overrides?.ruleEvaluationContractAvailable ??
    ruleEvaluationContract.rosterAssignmentRuleEvaluationContractAvailable;
  const assignmentInputReadinessAvailable =
    overrides?.assignmentInputReadinessAvailable ??
    (assignmentInputReadinessSummary.rosterAssignmentRuleInputReadinessSummaryId ===
      "new-gm-mode-roster-assignment-rule-input-readiness-summary-v0.1");
  const executedPickPrerequisiteAvailable =
    overrides?.executedPickPrerequisiteAvailable ??
    (executionPrerequisiteSummary.draftPickExecutionPrerequisiteSummaryId ===
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1");
  const rosterSlotRequirementAvailable =
    overrides?.rosterSlotRequirementAvailable ??
    rosterSlotRequirement.rosterSlotRequirementContractAvailable;
  const championshipDivisionRequirementAvailable =
    overrides?.championshipDivisionRequirementAvailable ??
    championshipDivisionRequirement.championshipDivisionRequirementContractAvailable;
  const totalFixtureCount =
    assignmentInputReadinessSummary.totalFixtureCount;
  const eligibleDisplayReadyCount =
    assignmentInputReadinessSummary.eligibleDisplayReadyCount;
  const excludedIneligibleCount =
    assignmentInputReadinessSummary.excludedIneligibleCount;
  const assignmentInputReadinessStructurallySatisfied =
    assignmentInputReadinessAvailable &&
    assignmentInputReadinessSummary.futureRosterAssignmentRuleInputsStructurallySatisfied;
  const draftPickExecutionPrerequisitesStructurallySatisfied =
    executedPickPrerequisiteAvailable &&
    executionPrerequisiteSummary.futureDraftPickExecutionPrerequisitesStructurallySatisfied;
  const issues = collectRuleEvaluationReadinessIssues(
    ruleEvaluationContractAvailable,
    assignmentInputReadinessStructurallySatisfied,
    draftPickExecutionPrerequisitesStructurallySatisfied,
    rosterSlotRequirementAvailable,
    championshipDivisionRequirementAvailable,
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
    totalFixtureCount,
    eligibleDisplayReadyCount,
    excludedIneligibleCount
  );
  const futureRosterAssignmentRuleEvaluationStructurallyReady =
    issues.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleEvaluationReadinessValidatorId:
      "new-gm-mode-roster-assignment-rule-evaluation-readiness-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentRuleEvaluationReadinessOnly: true,
    readinessPhase: determineRuleEvaluationReadinessPhase(
      ruleEvaluationContractAvailable,
      assignmentInputReadinessStructurallySatisfied,
      draftPickExecutionPrerequisitesStructurallySatisfied,
      rosterSlotRequirementAvailable,
      championshipDivisionRequirementAvailable
    ),
    futureRosterAssignmentRuleEvaluationStructurallyReady,
    requiredInputAvailabilitySummary: Object.freeze({
      ruleEvaluationContractAvailable,
      assignmentInputReadinessSummaryAvailable: assignmentInputReadinessAvailable,
      assignmentInputReadinessValidatorAvailable:
        assignmentInputReadinessValidator.rosterAssignmentRuleInputReadinessValidatorId ===
        "new-gm-mode-roster-assignment-rule-input-readiness-validator-v0.1",
      assignmentInputContractAvailable:
        assignmentInputContract.rosterAssignmentRuleInputContractAvailable,
      assignmentInputReadinessStructurallySatisfied,
      draftPickExecutionPrerequisiteSummaryAvailable:
        executedPickPrerequisiteAvailable,
      draftPickExecutionPrerequisitesStructurallySatisfied,
      draftPickValidationReadinessSummaryAvailable:
        validationReadinessSummary.draftPickValidationReadinessSummaryId ===
        "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
      rosterSlotRequirementContractAvailable: rosterSlotRequirementAvailable,
      championshipDivisionRequirementContractAvailable:
        championshipDivisionRequirementAvailable,
      talentPoolReadinessAggregatorAvailable:
        talentPoolReadiness.talentPoolReadinessAggregatorId ===
        "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
      talentPoolReadinessStructurallySatisfied:
        talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      targetBrandRosterContextAvailable: false,
      rosterStateAvailable: false,
      actualRuleEvaluationReady: false,
      actualRosterMutationReady: false
    }),
    fixtureHandoffCounts: Object.freeze({
      totalFixtureCount,
      eligibleDisplayReadyCount,
      excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_FIXTURE_COUNT,
      expectedEligibleDisplayReadyCount: EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT,
      expectedExcludedIneligibleCount: EXPECTED_EXCLUDED_INELIGIBLE_COUNT
    }),
    evaluationRuleCount: ruleEvaluationContract.evaluationRuleCount,
    issueCount: issues.length,
    readinessIssues: issues,
    blockedReasons: ruleEvaluationContract.blockedReasons,
    capabilityFlags: ruleEvaluationContract.capabilityFlags,
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

function collectRuleEvaluationReadinessIssues(
  ruleEvaluationContractAvailable: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisitesStructurallySatisfied: boolean,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean,
  talentPoolReadinessStructurallySatisfied: boolean,
  totalFixtureCount: number,
  eligibleDisplayReadyCount: number,
  excludedIneligibleCount: number
): readonly NewGMModeRosterAssignmentRuleEvaluationReadinessIssue[] {
  const issues: NewGMModeRosterAssignmentRuleEvaluationReadinessIssue[] = [];

  if (!ruleEvaluationContractAvailable) {
    issues.push(
      createIssue(
        "rosterAssignmentRuleEvaluationContract",
        "rule-evaluation-contract-missing"
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

  if (!rosterSlotRequirementAvailable) {
    issues.push(
      createIssue(
        "rosterSlotRequirementContract",
        "roster-slot-requirement-contract-missing"
      )
    );
  }

  if (!championshipDivisionRequirementAvailable) {
    issues.push(
      createIssue(
        "championshipDivisionRequirementContract",
        "championship-division-requirement-contract-missing"
      )
    );
  }

  if (!talentPoolReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "talentPoolReadinessAggregator",
        "talent-pool-readiness-not-structurally-satisfied"
      )
    );
  }

  if (totalFixtureCount !== EXPECTED_FIXTURE_COUNT) {
    issues.push(createIssue("totalFixtureCount", "fixture-count-not-stable"));
  }

  if (eligibleDisplayReadyCount !== EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT) {
    issues.push(
      createIssue(
        "eligibleDisplayReadyCount",
        "eligible-display-ready-count-not-stable"
      )
    );
  }

  if (excludedIneligibleCount !== EXPECTED_EXCLUDED_INELIGIBLE_COUNT) {
    issues.push(
      createIssue(
        "excludedIneligibleCount",
        "excluded-ineligible-count-not-stable"
      )
    );
  }

  return Object.freeze(issues);
}

function determineRuleEvaluationReadinessPhase(
  ruleEvaluationContractAvailable: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisitesStructurallySatisfied: boolean,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean
): NewGMModeRosterAssignmentRuleEvaluationReadinessPhaseId {
  if (!ruleEvaluationContractAvailable) {
    return "missing-rule-evaluation-contract";
  }

  if (!assignmentInputReadinessStructurallySatisfied) {
    return "missing-assignment-input-readiness";
  }

  if (!draftPickExecutionPrerequisitesStructurallySatisfied) {
    return "missing-executed-pick-prerequisite";
  }

  if (!rosterSlotRequirementAvailable) {
    return "missing-roster-slot-requirements";
  }

  if (!championshipDivisionRequirementAvailable) {
    return "missing-championship-division-requirements";
  }

  return "structurally-ready-rule-evaluation-blocked";
}

function createIssue(
  fieldId: string,
  issue: NewGMModeRosterAssignmentRuleEvaluationReadinessIssueCode
): NewGMModeRosterAssignmentRuleEvaluationReadinessIssue {
  return Object.freeze({ fieldId, issue });
}
