import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
  type NewGMModeTalentPoolEligibilityCapabilityFlags,
  type NewGMModeTalentPoolEligibilityRuleBlockedReason,
  createNewGMModeTalentPoolEligibilityRuleContractShell
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  createNewGMModeTalentPoolFixtureEligibilitySummaryShell
} from "./newGMModeTalentPoolFixtureEligibilitySummaryShell.ts";
import {
  type NewGMModeTalentPoolFixtureEligibilityIssue,
  createNewGMModeTalentPoolFixtureEligibilityValidatorShell
} from "./newGMModeTalentPoolFixtureEligibilityValidatorShell.ts";
import { createNewGMModeStaticWrestlerFixtureValidationSummaryShell } from "./newGMModeStaticWrestlerFixtureValidationSummaryShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";
import { createNewGMModeWrestlerDataShapeReadinessAggregatorShell } from "./newGMModeWrestlerDataShapeReadinessAggregatorShell.ts";
import { createNewGMModeDraftReadinessAggregatorShell } from "./newGMModeDraftReadinessAggregatorShell.ts";

export type NewGMModeTalentPoolReadinessPhaseId =
  | "missing-rule-contract"
  | "missing-fixture-validation"
  | "insufficient-eligible-fixtures"
  | "invalid-fixture-eligibility"
  | "structurally-ready-talent-pool-blocked";

export interface NewGMModeTalentPoolReadinessPhase {
  readonly id: NewGMModeTalentPoolReadinessPhaseId;
  readonly slug: NewGMModeTalentPoolReadinessPhaseId;
  readonly label: string;
  readonly blockedReason: NewGMModeTalentPoolEligibilityRuleBlockedReason;
}

export interface NewGMModeTalentPoolReadinessAggregatorInput {
  readonly fixtures?: readonly unknown[];
  readonly sourceCatalogId?: string;
}

export interface NewGMModeTalentPoolReadinessAggregatorShell {
  readonly status: "diagnostics-only";
  readonly talentPoolReadinessAggregatorId: "new-gm-mode-talent-pool-readiness-aggregator-v0.1";
  readonly version: "0.1";
  readonly deterministicOrdering: true;
  readonly readinessPhase: NewGMModeTalentPoolReadinessPhaseId;
  readonly readinessPhases: readonly NewGMModeTalentPoolReadinessPhase[];
  readonly readinessSummary: {
    readonly totalFixtureCount: number;
    readonly eligibleFixtureCount: number;
    readonly ineligibleFixtureCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly structuralTalentPoolReadinessSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualTalentPoolCreationReady: false;
  };
  readonly ruleContractAvailable: true;
  readonly fixtureValidatorAvailable: true;
  readonly fixtureEligibilitySummaryAvailable: true;
  readonly staticFixtureValidationAvailable: true;
  readonly wrestlerDataShapeReadinessAvailable: true;
  readonly draftReadinessContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly eligibilityIssues: readonly NewGMModeTalentPoolFixtureEligibilityIssue[];
  readonly blockedReasons: readonly NewGMModeTalentPoolEligibilityRuleBlockedReason[];
  readonly capabilityFlags: NewGMModeTalentPoolEligibilityCapabilityFlags;
  readonly talentPoolCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly wrestlerRecordsCreated: false;
  readonly rosterStateCreated: false;
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
  readonly talentPoolsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly rostersCreated: false;
  readonly rosterAssignmentsCreated: false;
  readonly championshipsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionsCreated: false;
  readonly divisionAssignmentsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
  readonly draftExecutionExecuted: false;
  readonly weekOneUnlocked: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
}

const READINESS_PHASES: readonly NewGMModeTalentPoolReadinessPhase[] =
  Object.freeze([
    createReadinessPhase(
      "missing-rule-contract",
      "Missing rule contract",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createReadinessPhase(
      "missing-fixture-validation",
      "Missing fixture validation",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createReadinessPhase(
      "insufficient-eligible-fixtures",
      "Insufficient eligible fixtures",
      "talent-pool-creation-not-implemented"
    ),
    createReadinessPhase(
      "invalid-fixture-eligibility",
      "Invalid fixture eligibility",
      "talent-pool-creation-not-implemented"
    ),
    createReadinessPhase(
      "structurally-ready-talent-pool-blocked",
      "Structurally ready talent pool blocked",
      "talent-pool-creation-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeTalentPoolEligibilityRuleBlockedReason[] =
  Object.freeze([
    "talent-pool-eligibility-rule-contract-only",
    "selected-brand-context-not-implemented",
    "real-wrestler-record-creation-not-implemented",
    "talent-pool-creation-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeTalentPoolReadinessAggregatorShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeTalentPoolReadinessAggregatorShell {
  const ruleContract = createNewGMModeTalentPoolEligibilityRuleContractShell();
  const fixtureValidator =
    createNewGMModeTalentPoolFixtureEligibilityValidatorShell(input);
  const fixtureEligibilitySummary =
    createNewGMModeTalentPoolFixtureEligibilitySummaryShell();
  const staticFixtureValidation =
    createNewGMModeStaticWrestlerFixtureValidationSummaryShell();
  const talentPoolPrerequisite =
    createNewGMModeTalentPoolPrerequisiteContractShell();
  const wrestlerDataShapeReadiness =
    createNewGMModeWrestlerDataShapeReadinessAggregatorShell();
  const draftReadiness = createNewGMModeDraftReadinessAggregatorShell();
  const structuralTalentPoolReadinessSatisfied =
    fixtureValidator.fixtureEligibilitySummary.minimumEligibleTalentCountSatisfied &&
    !hasMalformedFixtureIssue(fixtureValidator.eligibilityIssues);

  return Object.freeze({
    status: "diagnostics-only",
    talentPoolReadinessAggregatorId:
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    version: "0.1",
    deterministicOrdering: true,
    readinessPhase: resolveReadinessPhase(
      ruleContract.talentPoolEligibilityRuleContractAvailable,
      staticFixtureValidation.staticWrestlerFixtureValidationSummaryAvailable,
      fixtureValidator.fixtureEligibilitySummary.minimumEligibleTalentCountSatisfied,
      fixtureValidator.eligibilityIssues
    ),
    readinessPhases: READINESS_PHASES,
    readinessSummary: Object.freeze({
      totalFixtureCount: fixtureValidator.fixtureEligibilitySummary.totalFixtureCount,
      eligibleFixtureCount:
        fixtureValidator.fixtureEligibilitySummary.eligibleCandidateCount,
      ineligibleFixtureCount:
        fixtureValidator.fixtureEligibilitySummary.ineligibleCandidateCount,
      minimumEligibleRequirement:
        NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
      minimumEligibleRequirementSatisfied:
        fixtureValidator.fixtureEligibilitySummary.minimumEligibleTalentCountSatisfied,
      structuralTalentPoolReadinessSatisfied,
      validationIssueCount: fixtureValidator.eligibilityIssues.length,
      actualTalentPoolCreationReady: false
    }),
    ruleContractAvailable: ruleContract.talentPoolEligibilityRuleContractAvailable,
    fixtureValidatorAvailable:
      ruleContract.talentPoolFixtureEligibilityValidatorAvailable,
    fixtureEligibilitySummaryAvailable:
      fixtureEligibilitySummary.talentPoolFixtureEligibilitySummaryAvailable,
    staticFixtureValidationAvailable:
      staticFixtureValidation.staticWrestlerFixtureValidationSummaryAvailable,
    wrestlerDataShapeReadinessAvailable:
      wrestlerDataShapeReadiness.wrestlerDataShapeReadinessAggregatorAvailable,
    draftReadinessContractAvailable:
      draftReadiness.draftReadinessAggregatorAvailable,
    talentPoolPrerequisiteContractAvailable:
      talentPoolPrerequisite.talentPoolPrerequisiteContractAvailable,
    eligibilityIssues: fixtureValidator.eligibilityIssues,
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
    talentPoolCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    wrestlerRecordsCreated: false,
    rosterStateCreated: false,
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
    talentPoolsCreated: false,
    eligibleTalentPoolsCreated: false,
    draftBoardsCreated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    rostersCreated: false,
    rosterAssignmentsCreated: false,
    championshipsCreated: false,
    championshipAssignmentsCreated: false,
    divisionsCreated: false,
    divisionAssignmentsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
    draftExecutionExecuted: false,
    weekOneUnlocked: false,
    generatedTextCreated: false,
    genAIUsed: false,
    gameplayAffecting: false,
    diagnosticsOnly: true,
    playerFacing: false
  });
}

function resolveReadinessPhase(
  ruleContractAvailable: boolean,
  staticFixtureValidationAvailable: boolean,
  minimumEligibleTalentCountSatisfied: boolean,
  eligibilityIssues: readonly NewGMModeTalentPoolFixtureEligibilityIssue[]
): NewGMModeTalentPoolReadinessPhaseId {
  if (!ruleContractAvailable) {
    return "missing-rule-contract";
  }
  if (!staticFixtureValidationAvailable) {
    return "missing-fixture-validation";
  }
  if (!minimumEligibleTalentCountSatisfied) {
    return "insufficient-eligible-fixtures";
  }
  if (hasMalformedFixtureIssue(eligibilityIssues)) {
    return "invalid-fixture-eligibility";
  }
  return "structurally-ready-talent-pool-blocked";
}

function hasMalformedFixtureIssue(
  eligibilityIssues: readonly NewGMModeTalentPoolFixtureEligibilityIssue[]
): boolean {
  return eligibilityIssues.some(
    (issue) =>
      issue.issue.startsWith("missing-") ||
      issue.issue === "fixture-validation-failed"
  );
}

function createReadinessPhase(
  id: NewGMModeTalentPoolReadinessPhaseId,
  label: string,
  blockedReason: NewGMModeTalentPoolEligibilityRuleBlockedReason
): NewGMModeTalentPoolReadinessPhase {
  return Object.freeze({
    id,
    slug: id,
    label,
    blockedReason
  });
}
