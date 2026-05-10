import {
  type NewGMModeDraftBoardDisplayCapabilityFlags,
  createNewGMModeDraftBoardDisplayContractShell
} from "./newGMModeDraftBoardDisplayContractShell.ts";

export type NewGMModeDraftBoardSelectionPrerequisiteId =
  | "draft-board-display-readiness-summary-availability"
  | "draft-board-ordering-summary-availability"
  | "draft-board-eligibility-input-summary-availability"
  | "talent-pool-readiness-availability"
  | "display-ready-eligible-entries-availability"
  | "selected-wrestler-identity-requirement"
  | "selected-wrestler-display-ready-requirement"
  | "selected-wrestler-draft-eligible-requirement"
  | "selected-wrestler-available-requirement"
  | "selected-wrestler-not-excluded-ineligible-requirement"
  | "brand-eligibility-context-requirement"
  | "roster-slot-context-requirement"
  | "championship-division-compatibility-context-requirement"
  | "future-draft-pick-validation-dependency"
  | "blocked-actual-draft-pick-validation"
  | "blocked-actual-draft-pick-execution";

export type NewGMModeDraftBoardSelectionPrerequisiteBlockedReason =
  | "draft-board-selection-prerequisite-contract-only"
  | "draft-board-display-readiness-summary-required"
  | "draft-board-ordering-summary-required"
  | "draft-board-eligibility-input-summary-required"
  | "talent-pool-readiness-required"
  | "display-ready-eligible-entries-required"
  | "selected-wrestler-identity-not-implemented"
  | "selected-wrestler-display-ready-check-not-implemented"
  | "selected-wrestler-draft-eligible-check-not-implemented"
  | "selected-wrestler-availability-check-not-implemented"
  | "excluded-ineligible-wrestler-selection-check-not-implemented"
  | "brand-eligibility-context-not-implemented"
  | "roster-slot-context-not-implemented"
  | "championship-division-compatibility-context-not-implemented"
  | "actual-draft-pick-validation-not-implemented"
  | "actual-draft-pick-execution-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-board-ui-rendering-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftBoardSelectionPrerequisite {
  readonly id: NewGMModeDraftBoardSelectionPrerequisiteId;
  readonly slug: NewGMModeDraftBoardSelectionPrerequisiteId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags =
  NewGMModeDraftBoardDisplayCapabilityFlags & {
    readonly draftBoardSelectionPrerequisiteContractAvailable: true;
    readonly draftBoardSelectionPrerequisiteSummaryAvailable: true;
    readonly selectedWrestlerIdentitySelectionAvailable: false;
    readonly selectedWrestlerDisplayReadyCheckAvailable: false;
    readonly selectedWrestlerDraftEligibleCheckAvailable: false;
    readonly selectedWrestlerAvailabilityCheckAvailable: false;
    readonly selectedWrestlerExcludedCheckAvailable: false;
    readonly brandEligibilityContextAvailable: false;
    readonly rosterSlotContextAvailable: false;
    readonly championshipDivisionCompatibilityContextAvailable: false;
    readonly actualDraftPickValidationAvailable: false;
    readonly actualDraftPickExecutionAvailable: false;
  };

export interface NewGMModeDraftBoardSelectionPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly draftBoardSelectionPrerequisiteContractId: "new-gm-mode-draft-board-selection-prerequisite-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly selectionPrerequisiteContractAvailable: true;
  readonly orderedPrerequisites: readonly NewGMModeDraftBoardSelectionPrerequisite[];
  readonly blockedReasons: readonly NewGMModeDraftBoardSelectionPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly actualDraftBoardCreationAvailable: false;
  readonly actualDraftBoardDisplayAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly selectedWrestlerIdentitySelectionAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly actualDraftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const ORDERED_PREREQUISITE_IDS: readonly NewGMModeDraftBoardSelectionPrerequisiteId[] =
  Object.freeze([
    "draft-board-display-readiness-summary-availability",
    "draft-board-ordering-summary-availability",
    "draft-board-eligibility-input-summary-availability",
    "talent-pool-readiness-availability",
    "display-ready-eligible-entries-availability",
    "selected-wrestler-identity-requirement",
    "selected-wrestler-display-ready-requirement",
    "selected-wrestler-draft-eligible-requirement",
    "selected-wrestler-available-requirement",
    "selected-wrestler-not-excluded-ineligible-requirement",
    "brand-eligibility-context-requirement",
    "roster-slot-context-requirement",
    "championship-division-compatibility-context-requirement",
    "future-draft-pick-validation-dependency",
    "blocked-actual-draft-pick-validation",
    "blocked-actual-draft-pick-execution"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftBoardSelectionPrerequisiteBlockedReason[] =
  Object.freeze([
    "draft-board-selection-prerequisite-contract-only",
    "draft-board-display-readiness-summary-required",
    "draft-board-ordering-summary-required",
    "draft-board-eligibility-input-summary-required",
    "talent-pool-readiness-required",
    "display-ready-eligible-entries-required",
    "selected-wrestler-identity-not-implemented",
    "selected-wrestler-display-ready-check-not-implemented",
    "selected-wrestler-draft-eligible-check-not-implemented",
    "selected-wrestler-availability-check-not-implemented",
    "excluded-ineligible-wrestler-selection-check-not-implemented",
    "brand-eligibility-context-not-implemented",
    "roster-slot-context-not-implemented",
    "championship-division-compatibility-context-not-implemented",
    "actual-draft-pick-validation-not-implemented",
    "actual-draft-pick-execution-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-board-ui-rendering-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftBoardSelectionPrerequisiteContractShell(): NewGMModeDraftBoardSelectionPrerequisiteContractShell {
  const displayContract = createNewGMModeDraftBoardDisplayContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardSelectionPrerequisiteContractId:
      "new-gm-mode-draft-board-selection-prerequisite-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    selectionPrerequisiteContractAvailable: true,
    orderedPrerequisites: Object.freeze(
      ORDERED_PREREQUISITE_IDS.map((id) =>
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
      ...displayContract.capabilityFlags,
      draftBoardSelectionPrerequisiteContractAvailable: true,
      draftBoardSelectionPrerequisiteSummaryAvailable: true,
      selectedWrestlerIdentitySelectionAvailable: false,
      selectedWrestlerDisplayReadyCheckAvailable: false,
      selectedWrestlerDraftEligibleCheckAvailable: false,
      selectedWrestlerAvailabilityCheckAvailable: false,
      selectedWrestlerExcludedCheckAvailable: false,
      brandEligibilityContextAvailable: false,
      rosterSlotContextAvailable: false,
      championshipDivisionCompatibilityContextAvailable: false,
      actualDraftPickValidationAvailable: false,
      actualDraftPickExecutionAvailable: false
    }),
    selectedWrestlerChosen: false,
    actualDraftBoardCreationAvailable: false,
    actualDraftBoardDisplayAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    selectedWrestlerIdentitySelectionAvailable: false,
    draftPickValidationAvailable: false,
    actualDraftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    actualDraftPickExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}
