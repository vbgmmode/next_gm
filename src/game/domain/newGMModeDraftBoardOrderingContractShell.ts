import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  type NewGMModeTalentPoolEligibilityCapabilityFlags
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";

export type NewGMModeDraftBoardOrderingRequirementId =
  | "draft-board-eligibility-input-summary-availability"
  | "talent-pool-readiness-availability"
  | "eligible-wrestler-list-availability"
  | "stable-eligible-wrestler-ordering"
  | "deterministic-ordering-key-availability"
  | "wrestler-display-identity-availability"
  | "brand-eligibility-visibility"
  | "draft-eligibility-visibility"
  | "availability-status-visibility"
  | "gender-division-eligibility-visibility"
  | "role-category-tag-visibility"
  | "championship-division-eligibility-visibility"
  | "tie-breaker-stability-requirement"
  | "no-random-ordering-requirement"
  | "future-draft-board-persistence-compatibility-marker"
  | "blocked-actual-draft-board-creation";

export type NewGMModeDraftBoardOrderingBlockedReason =
  | "draft-board-ordering-contract-only"
  | "draft-board-eligibility-input-summary-required"
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

export interface NewGMModeDraftBoardOrderingRequirement {
  readonly id: NewGMModeDraftBoardOrderingRequirementId;
  readonly slug: NewGMModeDraftBoardOrderingRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftBoardOrderingCapabilityFlags =
  NewGMModeTalentPoolEligibilityCapabilityFlags & {
    readonly talentPoolReadinessAggregatorAvailable: true;
    readonly draftBoardEligibilityInputContractAvailable: true;
    readonly draftBoardEligibilityInputSummaryAvailable: true;
    readonly draftBoardOrderingContractAvailable: true;
    readonly draftBoardOrderingValidatorAvailable: true;
    readonly draftBoardOrderingSummaryAvailable: true;
    readonly randomOrderingAvailable: false;
    readonly actualDraftBoardCreationAvailable: false;
  };

export interface NewGMModeDraftBoardOrderingContractShell {
  readonly status: "diagnostics-only";
  readonly draftBoardOrderingContractId: "new-gm-mode-draft-board-ordering-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly orderingContractAvailable: true;
  readonly orderedRequirements: readonly NewGMModeDraftBoardOrderingRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftBoardOrderingBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardOrderingCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly randomOrderingUsed: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftBoardOrderingRequirementId[] =
  Object.freeze([
    "draft-board-eligibility-input-summary-availability",
    "talent-pool-readiness-availability",
    "eligible-wrestler-list-availability",
    "stable-eligible-wrestler-ordering",
    "deterministic-ordering-key-availability",
    "wrestler-display-identity-availability",
    "brand-eligibility-visibility",
    "draft-eligibility-visibility",
    "availability-status-visibility",
    "gender-division-eligibility-visibility",
    "role-category-tag-visibility",
    "championship-division-eligibility-visibility",
    "tie-breaker-stability-requirement",
    "no-random-ordering-requirement",
    "future-draft-board-persistence-compatibility-marker",
    "blocked-actual-draft-board-creation"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftBoardOrderingBlockedReason[] =
  Object.freeze([
    "draft-board-ordering-contract-only",
    "draft-board-eligibility-input-summary-required",
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

export function createNewGMModeDraftBoardOrderingContractShell(): NewGMModeDraftBoardOrderingContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftBoardOrderingContractId:
      "new-gm-mode-draft-board-ordering-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    orderingContractAvailable: true,
    orderedRequirements: Object.freeze(
      ORDERED_REQUIREMENT_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          required: true,
          diagnosticsOnly: true
        })
      )
    ),
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
      talentPoolReadinessAggregatorAvailable: true,
      draftBoardEligibilityInputContractAvailable: true,
      draftBoardEligibilityInputSummaryAvailable: true,
      draftBoardOrderingContractAvailable: true,
      draftBoardOrderingValidatorAvailable: true,
      draftBoardOrderingSummaryAvailable: true,
      randomOrderingAvailable: false,
      actualDraftBoardCreationAvailable: false
    }),
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    randomOrderingUsed: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}
