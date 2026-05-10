import {
  type NewGMModeDraftBoardEligibilityInputBlockedReason,
  createNewGMModeDraftBoardEligibilityInputContractShell
} from "./newGMModeDraftBoardEligibilityInputContractShell.ts";
import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  type NewGMModeTalentPoolEligibilityCapabilityFlags
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  type NewGMModeTalentPoolReadinessPhaseId,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";
import { createNewGMModeTalentPoolFixtureEligibilitySummaryShell } from "./newGMModeTalentPoolFixtureEligibilitySummaryShell.ts";

export interface NewGMModeDraftBoardEligibilityInputSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftBoardEligibilityInputSummaryId: "new-gm-mode-draft-board-eligibility-input-summary-v0.1";
  readonly version: "0.1";
  readonly deterministicOrdering: true;
  readonly draftBoardInputContractAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly topLevelReadinessPhase: NewGMModeTalentPoolReadinessPhaseId;
  readonly futureDraftBoardInputsStructurallySatisfied: boolean;
  readonly draftBoardInputSummary: {
    readonly totalFixtureCount: number;
    readonly eligibleFixtureCount: number;
    readonly ineligibleFixtureCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualDraftBoardCreationReady: false;
    readonly draftPickValidationReady: false;
    readonly draftExecutionReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftBoardEligibilityInputBlockedReason[];
  readonly capabilityFlags: NewGMModeTalentPoolEligibilityCapabilityFlags & {
    readonly talentPoolReadinessAggregatorAvailable: true;
    readonly draftBoardEligibilityInputContractAvailable: true;
    readonly draftBoardEligibilityInputSummaryAvailable: true;
    readonly actualDraftBoardCreationAvailable: false;
  };
  readonly actualDraftBoardCreationAvailable: false;
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
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
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

const BLOCKED_REASONS: readonly NewGMModeDraftBoardEligibilityInputBlockedReason[] =
  Object.freeze([
    "draft-board-eligibility-input-contract-only",
    "talent-pool-readiness-required",
    "eligible-wrestler-list-not-persisted",
    "actual-draft-board-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftBoardEligibilityInputSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardEligibilityInputSummaryShell {
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const draftBoardInputContract =
    createNewGMModeDraftBoardEligibilityInputContractShell();
  const talentPoolEligibilitySummary =
    createNewGMModeTalentPoolFixtureEligibilitySummaryShell();
  const draftBoardPrerequisite = createNewGMModeDraftBoardPrerequisiteContractShell();
  const futureDraftBoardInputsStructurallySatisfied =
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied;

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardEligibilityInputSummaryId:
      "new-gm-mode-draft-board-eligibility-input-summary-v0.1",
    version: "0.1",
    deterministicOrdering: true,
    draftBoardInputContractAvailable:
      draftBoardInputContract.draftBoardEligibilityInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    draftBoardPrerequisiteContractAvailable:
      draftBoardPrerequisite.draftBoardPrerequisiteContractAvailable,
    topLevelReadinessPhase: talentPoolReadiness.readinessPhase,
    futureDraftBoardInputsStructurallySatisfied,
    draftBoardInputSummary: Object.freeze({
      totalFixtureCount:
        talentPoolReadiness.readinessSummary.totalFixtureCount,
      eligibleFixtureCount:
        talentPoolReadiness.readinessSummary.eligibleFixtureCount,
      ineligibleFixtureCount:
        talentPoolReadiness.readinessSummary.ineligibleFixtureCount,
      minimumEligibleRequirement:
        talentPoolReadiness.readinessSummary.minimumEligibleRequirement,
      minimumEligibleRequirementSatisfied:
        talentPoolReadiness.readinessSummary.minimumEligibleRequirementSatisfied,
      validationIssueCount:
        talentPoolReadiness.readinessSummary.validationIssueCount,
      actualDraftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    }),
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
      talentPoolReadinessAggregatorAvailable: true,
      draftBoardEligibilityInputContractAvailable: true,
      draftBoardEligibilityInputSummaryAvailable: true,
      actualDraftBoardCreationAvailable: false
    }),
    actualDraftBoardCreationAvailable: false,
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
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
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
    playerFacing: false,
    ...(talentPoolEligibilitySummary.talentPoolFixtureEligibilitySummaryAvailable
      ? {}
      : {})
  });
}
