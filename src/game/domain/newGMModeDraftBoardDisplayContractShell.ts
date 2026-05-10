import {
  type NewGMModeDraftBoardOrderingCapabilityFlags,
  createNewGMModeDraftBoardOrderingContractShell
} from "./newGMModeDraftBoardOrderingContractShell.ts";

export type NewGMModeDraftBoardDisplayRequirementId =
  | "draft-board-ordering-summary-availability"
  | "draft-board-eligibility-input-summary-availability"
  | "talent-pool-readiness-availability"
  | "eligible-ordered-wrestler-entries-availability"
  | "wrestler-display-name-visibility"
  | "wrestler-brand-eligibility-visibility"
  | "wrestler-draft-eligibility-visibility"
  | "wrestler-availability-status-visibility"
  | "wrestler-gender-division-eligibility-visibility"
  | "wrestler-role-category-tag-visibility"
  | "wrestler-championship-division-eligibility-visibility"
  | "placeholder-attributes-visibility"
  | "deterministic-display-ordering-requirement"
  | "no-player-facing-ui-rendering-requirement"
  | "future-draft-board-display-compatibility-marker"
  | "blocked-actual-draft-board-creation";

export type NewGMModeDraftBoardDisplayBlockedReason =
  | "draft-board-display-contract-only"
  | "draft-board-ordering-summary-required"
  | "draft-board-eligibility-input-summary-required"
  | "talent-pool-readiness-required"
  | "eligible-ordered-wrestler-entries-not-persisted"
  | "actual-draft-board-creation-not-implemented"
  | "draft-board-ui-rendering-not-implemented"
  | "player-facing-draft-board-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftBoardDisplayRequirement {
  readonly id: NewGMModeDraftBoardDisplayRequirementId;
  readonly slug: NewGMModeDraftBoardDisplayRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftBoardDisplayCapabilityFlags =
  NewGMModeDraftBoardOrderingCapabilityFlags & {
    readonly draftBoardDisplayContractAvailable: true;
    readonly draftBoardDisplayReadinessValidatorAvailable: true;
    readonly draftBoardDisplayReadinessSummaryAvailable: true;
    readonly actualDraftBoardDisplayAvailable: false;
    readonly draftBoardUiRenderingAvailable: false;
    readonly playerFacingDraftBoardAvailable: false;
  };

export interface NewGMModeDraftBoardDisplayContractShell {
  readonly status: "diagnostics-only";
  readonly draftBoardDisplayContractId: "new-gm-mode-draft-board-display-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly displayContractAvailable: true;
  readonly orderedDisplayRequirements: readonly NewGMModeDraftBoardDisplayRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftBoardDisplayBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardDisplayCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly actualDraftBoardDisplayAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const ORDERED_DISPLAY_REQUIREMENT_IDS: readonly NewGMModeDraftBoardDisplayRequirementId[] =
  Object.freeze([
    "draft-board-ordering-summary-availability",
    "draft-board-eligibility-input-summary-availability",
    "talent-pool-readiness-availability",
    "eligible-ordered-wrestler-entries-availability",
    "wrestler-display-name-visibility",
    "wrestler-brand-eligibility-visibility",
    "wrestler-draft-eligibility-visibility",
    "wrestler-availability-status-visibility",
    "wrestler-gender-division-eligibility-visibility",
    "wrestler-role-category-tag-visibility",
    "wrestler-championship-division-eligibility-visibility",
    "placeholder-attributes-visibility",
    "deterministic-display-ordering-requirement",
    "no-player-facing-ui-rendering-requirement",
    "future-draft-board-display-compatibility-marker",
    "blocked-actual-draft-board-creation"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftBoardDisplayBlockedReason[] =
  Object.freeze([
    "draft-board-display-contract-only",
    "draft-board-ordering-summary-required",
    "draft-board-eligibility-input-summary-required",
    "talent-pool-readiness-required",
    "eligible-ordered-wrestler-entries-not-persisted",
    "actual-draft-board-creation-not-implemented",
    "draft-board-ui-rendering-not-implemented",
    "player-facing-draft-board-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftBoardDisplayContractShell(): NewGMModeDraftBoardDisplayContractShell {
  const orderingContract = createNewGMModeDraftBoardOrderingContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardDisplayContractId:
      "new-gm-mode-draft-board-display-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    displayContractAvailable: true,
    orderedDisplayRequirements: Object.freeze(
      ORDERED_DISPLAY_REQUIREMENT_IDS.map((id) =>
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
      ...orderingContract.capabilityFlags,
      draftBoardDisplayContractAvailable: true,
      draftBoardDisplayReadinessValidatorAvailable: true,
      draftBoardDisplayReadinessSummaryAvailable: true,
      actualDraftBoardDisplayAvailable: false,
      draftBoardUiRenderingAvailable: false,
      playerFacingDraftBoardAvailable: false
    }),
    actualDraftBoardCreationAvailable: false,
    actualDraftBoardDisplayAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}
