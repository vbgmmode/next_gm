import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftPickExecutionPrerequisiteSummaryShell } from "./newGMModeDraftPickExecutionPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell } from "./newGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell.ts";
import { createNewGMModeDraftPickValidationReadinessSummaryShell } from "./newGMModeDraftPickValidationReadinessSummaryShell.ts";
import {
  type NewGMModeRosterAssignmentRuleInputBlockedReason,
  type NewGMModeRosterAssignmentRuleInputCapabilityFlags,
  createNewGMModeRosterAssignmentRuleInputContractShell
} from "./newGMModeRosterAssignmentRuleInputContractShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeRosterAssignmentRuleInputReadinessPhaseId =
  | "missing-roster-assignment-rule-input-contract"
  | "missing-roster-assignment-prerequisites"
  | "missing-execution-prerequisites"
  | "missing-validation-readiness"
  | "missing-roster-slot-requirements"
  | "missing-championship-division-requirements"
  | "rule-inputs-structurally-ready-roster-assignment-blocked";

export type NewGMModeRosterAssignmentRuleInputReadinessIssueCode =
  | "roster-assignment-prerequisite-summary-not-structurally-satisfied"
  | "execution-prerequisite-summary-not-structurally-satisfied"
  | "validation-readiness-summary-not-structurally-satisfied"
  | "roster-slot-requirement-contract-missing"
  | "championship-division-requirement-contract-missing"
  | "fixture-count-not-stable"
  | "eligible-display-ready-count-not-stable"
  | "excluded-ineligible-count-not-stable"
  | "talent-pool-readiness-not-structurally-satisfied";

export interface NewGMModeRosterAssignmentRuleInputReadinessIssue {
  readonly fieldId: string;
  readonly issue: NewGMModeRosterAssignmentRuleInputReadinessIssueCode;
}

export interface NewGMModeRosterAssignmentRuleInputReadinessValidatorShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleInputReadinessValidatorId: "new-gm-mode-roster-assignment-rule-input-readiness-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentRuleInputReadinessOnly: true;
  readonly ruleInputContractAvailable: true;
  readonly rosterAssignmentPrerequisiteAvailable: true;
  readonly executionPrerequisiteAvailable: true;
  readonly validationReadinessAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly ruleInputReadinessPhase: NewGMModeRosterAssignmentRuleInputReadinessPhaseId;
  readonly futureRosterAssignmentRuleInputsStructurallySatisfied: boolean;
  readonly ruleInputReadinessSummary: {
    readonly totalFixtureCount: number;
    readonly eligibleDisplayReadyCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: number;
    readonly expectedEligibleDisplayReadyCount: number;
    readonly expectedExcludedIneligibleCount: number;
    readonly selectedWrestlerIdentityAvailable: false;
    readonly selectedWrestlerChosen: false;
    readonly executedPickAvailable: false;
    readonly rosterStateAvailable: false;
    readonly actualRosterAssignmentReady: false;
    readonly issueCount: number;
  };
  readonly ruleInputReadinessIssues: readonly NewGMModeRosterAssignmentRuleInputReadinessIssue[];
  readonly blockedReasons: readonly NewGMModeRosterAssignmentRuleInputBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterAssignmentRuleInputCapabilityFlags;
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

const EXPECTED_FIXTURE_COUNT = 245;
const EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT = 235;
const EXPECTED_EXCLUDED_INELIGIBLE_COUNT = 10;

export function createNewGMModeRosterAssignmentRuleInputReadinessValidatorShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeRosterAssignmentRuleInputReadinessValidatorShell {
  const ruleInputContract = createNewGMModeRosterAssignmentRuleInputContractShell();
  const rosterAssignmentPrerequisites =
    createNewGMModeDraftPickRosterAssignmentPrerequisiteSummaryShell(input);
  const executionPrerequisites =
    createNewGMModeDraftPickExecutionPrerequisiteSummaryShell(input);
  const validationReadiness =
    createNewGMModeDraftPickValidationReadinessSummaryShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const totalFixtureCount =
    rosterAssignmentPrerequisites.rosterAssignmentPrerequisiteSummary.totalFixtureCount;
  const eligibleDisplayReadyCount =
    rosterAssignmentPrerequisites.rosterAssignmentPrerequisiteSummary.displayReadyEligibleCount;
  const excludedIneligibleCount =
    rosterAssignmentPrerequisites.rosterAssignmentPrerequisiteSummary.excludedIneligibleCount;
  const issues = collectRuleInputReadinessIssues(
    rosterAssignmentPrerequisites.futureRosterAssignmentPrerequisitesStructurallySatisfied,
    executionPrerequisites.futureDraftPickExecutionPrerequisitesStructurallySatisfied,
    validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied,
    rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
    totalFixtureCount,
    eligibleDisplayReadyCount,
    excludedIneligibleCount
  );
  const futureRosterAssignmentRuleInputsStructurallySatisfied =
    issues.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleInputReadinessValidatorId:
      "new-gm-mode-roster-assignment-rule-input-readiness-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentRuleInputReadinessOnly: true,
    ruleInputContractAvailable:
      ruleInputContract.rosterAssignmentRuleInputContractAvailable,
    rosterAssignmentPrerequisiteAvailable:
      rosterAssignmentPrerequisites.draftPickRosterAssignmentPrerequisiteSummaryId ===
      "new-gm-mode-draft-pick-roster-assignment-prerequisite-summary-v0.1",
    executionPrerequisiteAvailable:
      executionPrerequisites.draftPickExecutionPrerequisiteSummaryId ===
      "new-gm-mode-draft-pick-execution-prerequisite-summary-v0.1",
    validationReadinessAvailable:
      validationReadiness.draftPickValidationReadinessSummaryId ===
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    ruleInputReadinessPhase: determineRuleInputReadinessPhase(
      ruleInputContract.rosterAssignmentRuleInputContractAvailable,
      rosterAssignmentPrerequisites.futureRosterAssignmentPrerequisitesStructurallySatisfied,
      executionPrerequisites.futureDraftPickExecutionPrerequisitesStructurallySatisfied,
      validationReadiness.futureDraftPickValidationPrerequisitesStructurallySatisfied,
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable
    ),
    futureRosterAssignmentRuleInputsStructurallySatisfied,
    ruleInputReadinessSummary: Object.freeze({
      totalFixtureCount,
      eligibleDisplayReadyCount,
      excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_FIXTURE_COUNT,
      expectedEligibleDisplayReadyCount: EXPECTED_ELIGIBLE_DISPLAY_READY_COUNT,
      expectedExcludedIneligibleCount: EXPECTED_EXCLUDED_INELIGIBLE_COUNT,
      selectedWrestlerIdentityAvailable: false,
      selectedWrestlerChosen: false,
      executedPickAvailable: false,
      rosterStateAvailable: false,
      actualRosterAssignmentReady: false,
      issueCount: issues.length
    }),
    ruleInputReadinessIssues: issues,
    blockedReasons: ruleInputContract.blockedReasons,
    capabilityFlags: ruleInputContract.capabilityFlags,
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

function collectRuleInputReadinessIssues(
  rosterAssignmentPrerequisitesStructurallySatisfied: boolean,
  executionPrerequisitesStructurallySatisfied: boolean,
  validationReadinessStructurallySatisfied: boolean,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean,
  talentPoolReadinessStructurallySatisfied: boolean,
  totalFixtureCount: number,
  eligibleDisplayReadyCount: number,
  excludedIneligibleCount: number
): readonly NewGMModeRosterAssignmentRuleInputReadinessIssue[] {
  const issues: NewGMModeRosterAssignmentRuleInputReadinessIssue[] = [];

  if (!rosterAssignmentPrerequisitesStructurallySatisfied) {
    issues.push(
      createIssue(
        "rosterAssignmentPrerequisiteSummary",
        "roster-assignment-prerequisite-summary-not-structurally-satisfied"
      )
    );
  }

  if (!executionPrerequisitesStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftPickExecutionPrerequisiteSummary",
        "execution-prerequisite-summary-not-structurally-satisfied"
      )
    );
  }

  if (!validationReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftPickValidationReadinessSummary",
        "validation-readiness-summary-not-structurally-satisfied"
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

function determineRuleInputReadinessPhase(
  ruleInputContractAvailable: boolean,
  rosterAssignmentPrerequisitesStructurallySatisfied: boolean,
  executionPrerequisitesStructurallySatisfied: boolean,
  validationReadinessStructurallySatisfied: boolean,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean
): NewGMModeRosterAssignmentRuleInputReadinessPhaseId {
  if (!ruleInputContractAvailable) {
    return "missing-roster-assignment-rule-input-contract";
  }

  if (!rosterAssignmentPrerequisitesStructurallySatisfied) {
    return "missing-roster-assignment-prerequisites";
  }

  if (!executionPrerequisitesStructurallySatisfied) {
    return "missing-execution-prerequisites";
  }

  if (!validationReadinessStructurallySatisfied) {
    return "missing-validation-readiness";
  }

  if (!rosterSlotRequirementAvailable) {
    return "missing-roster-slot-requirements";
  }

  if (!championshipDivisionRequirementAvailable) {
    return "missing-championship-division-requirements";
  }

  return "rule-inputs-structurally-ready-roster-assignment-blocked";
}

function createIssue(
  fieldId: string,
  issue: NewGMModeRosterAssignmentRuleInputReadinessIssueCode
): NewGMModeRosterAssignmentRuleInputReadinessIssue {
  return Object.freeze({ fieldId, issue });
}
