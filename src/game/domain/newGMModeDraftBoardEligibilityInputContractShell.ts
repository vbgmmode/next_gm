import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  type NewGMModeTalentPoolEligibilityCapabilityFlags
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import { createNewGMModeTalentPoolReadinessAggregatorShell } from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftBoardEligibilityInputRequirementId =
  | "talent-pool-readiness-aggregator-availability"
  | "structurally-ready-talent-pool-signal"
  | "eligible-wrestler-identity-list"
  | "stable-eligible-wrestler-ordering"
  | "wrestler-display-identity"
  | "brand-eligibility-visibility"
  | "draft-eligibility-visibility"
  | "availability-status-visibility"
  | "gender-division-eligibility-visibility"
  | "role-category-tag-visibility"
  | "championship-division-eligibility-visibility"
  | "minimum-eligible-wrestler-count"
  | "future-draft-board-persistence-compatibility-marker"
  | "blocked-actual-draft-board-creation";

export type NewGMModeDraftBoardEligibilityInputBlockedReason =
  | "draft-board-eligibility-input-contract-only"
  | "talent-pool-readiness-required"
  | "eligible-wrestler-list-not-persisted"
  | "actual-draft-board-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftBoardEligibilityInputRequirement {
  readonly id: NewGMModeDraftBoardEligibilityInputRequirementId;
  readonly slug: NewGMModeDraftBoardEligibilityInputRequirementId;
  readonly label: string;
  readonly blockedReason: NewGMModeDraftBoardEligibilityInputBlockedReason;
}

export interface NewGMModeDraftBoardEligibilityInputContractShell {
  readonly status: "diagnostics-only";
  readonly draftBoardEligibilityInputContractId: "new-gm-mode-draft-board-eligibility-input-contract-v0.1";
  readonly version: "0.1";
  readonly deterministicOrdering: true;
  readonly inputRequirements: readonly NewGMModeDraftBoardEligibilityInputRequirement[];
  readonly inputRequirementSummary: {
    readonly requirementCount: number;
    readonly inputContractOnly: true;
    readonly futureDraftBoardInputsDefined: true;
    readonly actualDraftBoardCreationReady: false;
    readonly draftPickValidationReady: false;
    readonly draftExecutionReady: false;
  };
  readonly talentPoolReadinessAggregatorAvailable: true;
  readonly draftBoardEligibilityInputContractAvailable: true;
  readonly draftBoardEligibilityInputSummaryAvailable: true;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly capabilityFlags: NewGMModeTalentPoolEligibilityCapabilityFlags & {
    readonly talentPoolReadinessAggregatorAvailable: true;
    readonly draftBoardEligibilityInputContractAvailable: true;
    readonly draftBoardEligibilityInputSummaryAvailable: true;
    readonly actualDraftBoardCreationAvailable: false;
  };
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
  readonly blockedReasons: readonly NewGMModeDraftBoardEligibilityInputBlockedReason[];
}

const INPUT_REQUIREMENTS: readonly NewGMModeDraftBoardEligibilityInputRequirement[] =
  Object.freeze([
    createInputRequirement(
      "talent-pool-readiness-aggregator-availability",
      "Talent pool readiness aggregator availability",
      "talent-pool-readiness-required"
    ),
    createInputRequirement(
      "structurally-ready-talent-pool-signal",
      "Structurally ready talent pool signal",
      "talent-pool-readiness-required"
    ),
    createInputRequirement(
      "eligible-wrestler-identity-list",
      "Eligible wrestler identity list",
      "eligible-wrestler-list-not-persisted"
    ),
    createInputRequirement(
      "stable-eligible-wrestler-ordering",
      "Stable eligible wrestler ordering",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "wrestler-display-identity",
      "Wrestler display identity",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "brand-eligibility-visibility",
      "Brand eligibility visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "draft-eligibility-visibility",
      "Draft eligibility visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "availability-status-visibility",
      "Availability status visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "gender-division-eligibility-visibility",
      "Gender and division eligibility visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "role-category-tag-visibility",
      "Role and category tag visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "championship-division-eligibility-visibility",
      "Championship division eligibility visibility",
      "draft-board-eligibility-input-contract-only"
    ),
    createInputRequirement(
      "minimum-eligible-wrestler-count",
      "Minimum eligible wrestler count",
      "talent-pool-readiness-required"
    ),
    createInputRequirement(
      "future-draft-board-persistence-compatibility-marker",
      "Future draft board persistence compatibility marker",
      "gameplay-payload-persistence-not-implemented"
    ),
    createInputRequirement(
      "blocked-actual-draft-board-creation",
      "Blocked actual draft board creation",
      "actual-draft-board-creation-not-implemented"
    )
  ]);

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

export function createNewGMModeDraftBoardEligibilityInputContractShell(): NewGMModeDraftBoardEligibilityInputContractShell {
  const talentPoolReadiness = createNewGMModeTalentPoolReadinessAggregatorShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardEligibilityInputContractId:
      "new-gm-mode-draft-board-eligibility-input-contract-v0.1",
    version: "0.1",
    deterministicOrdering: true,
    inputRequirements: INPUT_REQUIREMENTS,
    inputRequirementSummary: Object.freeze({
      requirementCount: INPUT_REQUIREMENTS.length,
      inputContractOnly: true,
      futureDraftBoardInputsDefined: true,
      actualDraftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    }),
    talentPoolReadinessAggregatorAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    draftBoardEligibilityInputContractAvailable: true,
    draftBoardEligibilityInputSummaryAvailable: true,
    actualDraftBoardCreationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
      talentPoolReadinessAggregatorAvailable: true,
      draftBoardEligibilityInputContractAvailable: true,
      draftBoardEligibilityInputSummaryAvailable: true,
      actualDraftBoardCreationAvailable: false
    }),
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
    blockedReasons: BLOCKED_REASONS
  });
}

function createInputRequirement(
  id: NewGMModeDraftBoardEligibilityInputRequirementId,
  label: string,
  blockedReason: NewGMModeDraftBoardEligibilityInputBlockedReason
): NewGMModeDraftBoardEligibilityInputRequirement {
  return Object.freeze({
    id,
    slug: id,
    label,
    blockedReason
  });
}
