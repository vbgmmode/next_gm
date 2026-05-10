import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell } from "./newGMModeDraftBoardSelectionPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickExecutionPrerequisiteSummaryShell } from "./newGMModeDraftPickExecutionPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickValidationReadinessSummaryShell } from "./newGMModeDraftPickValidationReadinessSummaryShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeBlockedReason,
  type NewGMModeRosterAssignmentResultShapeCapabilityFlags
} from "./newGMModeRosterAssignmentResultShapeContractShell.ts";
import {
  type NewGMModeRosterAssignmentResultShapeReadinessValidatorInput,
  createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell
} from "./newGMModeRosterAssignmentResultShapeReadinessValidatorShell.ts";
import { createNewGMModeRosterAssignmentResultShapeSummaryShell } from "./newGMModeRosterAssignmentResultShapeSummaryShell.ts";
import { createNewGMModeRosterAssignmentRuleEvaluationSummaryShell } from "./newGMModeRosterAssignmentRuleEvaluationSummaryShell.ts";
import { createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell } from "./newGMModeRosterAssignmentRuleInputReadinessSummaryShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import { createNewGMModeTalentPoolReadinessAggregatorShell } from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeRosterAssignmentHandoffPhaseId =
  | "missing-result-shape-readiness"
  | "missing-rule-evaluation-readiness"
  | "missing-assignment-input-readiness"
  | "missing-draft-execution-prerequisite"
  | "missing-roster-mutation-boundary"
  | "structurally-ready-roster-assignment-handoff-blocked";

export interface NewGMModeRosterAssignmentHandoffPhase {
  readonly id: NewGMModeRosterAssignmentHandoffPhaseId;
  readonly slug: NewGMModeRosterAssignmentHandoffPhaseId;
  readonly diagnosticsOnly: true;
}

export type NewGMModeRosterAssignmentHandoffIssueCode =
  | "result-shape-readiness-not-structurally-satisfied"
  | "rule-evaluation-readiness-not-structurally-satisfied"
  | "assignment-input-readiness-not-structurally-satisfied"
  | "draft-execution-prerequisite-not-structurally-satisfied"
  | "fixture-count-not-stable"
  | "eligible-display-ready-count-not-stable"
  | "excluded-ineligible-count-not-stable";

export interface NewGMModeRosterAssignmentHandoffIssue {
  readonly fieldId: string;
  readonly issue: NewGMModeRosterAssignmentHandoffIssueCode;
}

export interface NewGMModeRosterAssignmentHandoffSummaryShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentHandoffSummaryId: "new-gm-mode-roster-assignment-handoff-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly handoffPhases: readonly NewGMModeRosterAssignmentHandoffPhase[];
  readonly topLevelHandoffPhase: NewGMModeRosterAssignmentHandoffPhaseId;
  readonly resultShapeReadinessAvailable: true;
  readonly resultShapeReadinessStructurallySatisfied: boolean;
  readonly ruleEvaluationReadinessAvailable: true;
  readonly ruleEvaluationReadinessStructurallySatisfied: boolean;
  readonly assignmentInputReadinessAvailable: true;
  readonly assignmentInputReadinessStructurallySatisfied: boolean;
  readonly draftPickExecutionPrerequisiteAvailable: true;
  readonly draftPickExecutionPrerequisiteStructurallySatisfied: boolean;
  readonly draftPickValidationReadinessAvailable: true;
  readonly draftPickValidationReadinessStructurallySatisfied: boolean;
  readonly draftBoardSelectionPrerequisiteAvailable: true;
  readonly draftBoardSelectionPrerequisiteStructurallySatisfied: boolean;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly talentPoolReadinessStructurallySatisfied: boolean;
  readonly futureRosterMutationBoundaryAvailable: false;
  readonly fixtureHandoffCounts: {
    readonly totalFixtureCount: number;
    readonly eligibleDisplayReadyCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: 10;
    readonly expectedEligibleDisplayReadyCount: 9;
    readonly expectedExcludedIneligibleCount: 1;
  };
  readonly issueCount: number;
  readonly handoffIssues: readonly NewGMModeRosterAssignmentHandoffIssue[];
  readonly deterministicBlockedReasons: readonly NewGMModeRosterAssignmentResultShapeBlockedReason[];
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

const EXPECTED_FIXTURE_COUNT = 10;
const EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT = 9;
const EXPECTED_EXCLUDED_INELIGIBLE_COUNT = 1;

const HANDOFF_PHASES: readonly NewGMModeRosterAssignmentHandoffPhase[] =
  Object.freeze([
    createPhase("missing-result-shape-readiness"),
    createPhase("missing-rule-evaluation-readiness"),
    createPhase("missing-assignment-input-readiness"),
    createPhase("missing-draft-execution-prerequisite"),
    createPhase("missing-roster-mutation-boundary"),
    createPhase("structurally-ready-roster-assignment-handoff-blocked")
  ]);

export function createNewGMModeRosterAssignmentHandoffSummaryShell(
  input: NewGMModeRosterAssignmentResultShapeReadinessValidatorInput = {}
): NewGMModeRosterAssignmentHandoffSummaryShell {
  const resultShapeSummary =
    createNewGMModeRosterAssignmentResultShapeSummaryShell(input);
  const resultShapeReadiness =
    createNewGMModeRosterAssignmentResultShapeReadinessValidatorShell(input);
  const ruleEvaluationSummary =
    createNewGMModeRosterAssignmentRuleEvaluationSummaryShell(input);
  const assignmentInputReadiness =
    createNewGMModeRosterAssignmentRuleInputReadinessSummaryShell(input);
  const executionPrerequisite =
    createNewGMModeDraftPickExecutionPrerequisiteSummaryShell(input);
  const validationReadiness =
    createNewGMModeDraftPickValidationReadinessSummaryShell(input);
  const selectionPrerequisite =
    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const resultShapeReadinessStructurallySatisfied =
    resultShapeSummary.futureRosterAssignmentResultShapeStructurallyReady &&
    resultShapeReadiness.futureRosterAssignmentResultShapeStructurallyReady;
  const ruleEvaluationReadinessStructurallySatisfied =
    ruleEvaluationSummary.futureRosterAssignmentRuleEvaluationStructurallyReady;
  const assignmentInputReadinessStructurallySatisfied =
    assignmentInputReadiness.futureRosterAssignmentRuleInputsStructurallySatisfied;
  const draftPickExecutionPrerequisiteStructurallySatisfied =
    executionPrerequisite.futureDraftPickExecutionPrerequisitesStructurallySatisfied;
  const draftPickValidationReadinessStructurallySatisfied =
    validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied;
  const draftBoardSelectionPrerequisiteStructurallySatisfied =
    selectionPrerequisite.futureSelectionPrerequisitesStructurallySatisfied;
  const talentPoolReadinessStructurallySatisfied =
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied;
  const totalFixtureCount =
    resultShapeSummary.fixtureHandoffCounts.totalFixtureCount;
  const eligibleDisplayReadyCount =
    resultShapeSummary.fixtureHandoffCounts.eligibleDisplayReadyCount;
  const excludedIneligibleCount =
    resultShapeSummary.fixtureHandoffCounts.excludedIneligibleCount;
  const issues = collectHandoffIssues(
    resultShapeReadinessStructurallySatisfied,
    ruleEvaluationReadinessStructurallySatisfied,
    assignmentInputReadinessStructurallySatisfied,
    draftPickExecutionPrerequisiteStructurallySatisfied,
    totalFixtureCount,
    eligibleDisplayReadyCount,
    excludedIneligibleCount
  );

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentHandoffSummaryId:
      "new-gm-mode-roster-assignment-handoff-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    handoffPhases: HANDOFF_PHASES,
    topLevelHandoffPhase: determineHandoffPhase(
      resultShapeReadinessStructurallySatisfied,
      ruleEvaluationReadinessStructurallySatisfied,
      assignmentInputReadinessStructurallySatisfied,
      draftPickExecutionPrerequisiteStructurallySatisfied
    ),
    resultShapeReadinessAvailable:
      resultShapeSummary.rosterAssignmentResultShapeSummaryId ===
      "new-gm-mode-roster-assignment-result-shape-summary-v0.1",
    resultShapeReadinessStructurallySatisfied,
    ruleEvaluationReadinessAvailable:
      ruleEvaluationSummary.rosterAssignmentRuleEvaluationSummaryId ===
      "new-gm-mode-roster-assignment-rule-evaluation-summary-v0.1",
    ruleEvaluationReadinessStructurallySatisfied,
    assignmentInputReadinessAvailable:
      assignmentInputReadiness.rosterAssignmentRuleInputReadinessSummaryId ===
      "new-gm-mode-roster-assignment-rule-input-readiness-summary-v0.1",
    assignmentInputReadinessStructurallySatisfied,
    draftPickExecutionPrerequisiteAvailable:
      executionPrerequisite.draftPickExecutionPrerequisiteSummaryId ===
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1",
    draftPickExecutionPrerequisiteStructurallySatisfied,
    draftPickValidationReadinessAvailable:
      validationReadiness.draftPickValidationReadinessSummaryId ===
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    draftPickValidationReadinessStructurallySatisfied,
    draftBoardSelectionPrerequisiteAvailable:
      selectionPrerequisite.draftBoardSelectionPrerequisiteSummaryId ===
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1",
    draftBoardSelectionPrerequisiteStructurallySatisfied,
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    talentPoolReadinessStructurallySatisfied,
    futureRosterMutationBoundaryAvailable: false,
    fixtureHandoffCounts: Object.freeze({
      totalFixtureCount,
      eligibleDisplayReadyCount,
      excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_FIXTURE_COUNT,
      expectedEligibleDisplayReadyCount: EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT,
      expectedExcludedIneligibleCount: EXPECTED_EXCLUDED_INELIGIBLE_COUNT
    }),
    issueCount: issues.length,
    handoffIssues: issues,
    deterministicBlockedReasons: resultShapeSummary.deterministicBlockedReasons,
    capabilityFlags: resultShapeSummary.capabilityFlags,
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

function collectHandoffIssues(
  resultShapeReadinessStructurallySatisfied: boolean,
  ruleEvaluationReadinessStructurallySatisfied: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisiteStructurallySatisfied: boolean,
  totalFixtureCount: number,
  eligibleDisplayReadyCount: number,
  excludedIneligibleCount: number
): readonly NewGMModeRosterAssignmentHandoffIssue[] {
  const issues: NewGMModeRosterAssignmentHandoffIssue[] = [];

  if (!resultShapeReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "rosterAssignmentResultShapeReadiness",
        "result-shape-readiness-not-structurally-satisfied"
      )
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

  if (!draftPickExecutionPrerequisiteStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftPickExecutionPrerequisiteSummary",
        "draft-execution-prerequisite-not-structurally-satisfied"
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

function determineHandoffPhase(
  resultShapeReadinessStructurallySatisfied: boolean,
  ruleEvaluationReadinessStructurallySatisfied: boolean,
  assignmentInputReadinessStructurallySatisfied: boolean,
  draftPickExecutionPrerequisiteStructurallySatisfied: boolean
): NewGMModeRosterAssignmentHandoffPhaseId {
  if (!resultShapeReadinessStructurallySatisfied) {
    return "missing-result-shape-readiness";
  }

  if (!ruleEvaluationReadinessStructurallySatisfied) {
    return "missing-rule-evaluation-readiness";
  }

  if (!assignmentInputReadinessStructurallySatisfied) {
    return "missing-assignment-input-readiness";
  }

  if (!draftPickExecutionPrerequisiteStructurallySatisfied) {
    return "missing-draft-execution-prerequisite";
  }

  return "structurally-ready-roster-assignment-handoff-blocked";
}

function createPhase(
  id: NewGMModeRosterAssignmentHandoffPhaseId
): NewGMModeRosterAssignmentHandoffPhase {
  return Object.freeze({
    id,
    slug: id,
    diagnosticsOnly: true
  });
}

function createIssue(
  fieldId: string,
  issue: NewGMModeRosterAssignmentHandoffIssueCode
): NewGMModeRosterAssignmentHandoffIssue {
  return Object.freeze({ fieldId, issue });
}
