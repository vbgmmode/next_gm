import {
  type NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags,
  createNewGMModeDraftBoardSelectionPrerequisiteContractShell
} from "./newGMModeDraftBoardSelectionPrerequisiteContractShell.ts";

export type NewGMModeDraftPickValidationRequirementId =
  | "draft-board-selection-prerequisite-summary-availability"
  | "draft-board-display-readiness-availability"
  | "draft-board-ordering-readiness-availability"
  | "draft-board-input-readiness-availability"
  | "talent-pool-readiness-availability"
  | "selected-wrestler-identity-requirement"
  | "selected-wrestler-display-ready-requirement"
  | "selected-wrestler-draft-eligible-requirement"
  | "selected-wrestler-availability-requirement"
  | "selected-wrestler-not-excluded-requirement"
  | "brand-eligibility-context-requirement"
  | "roster-slot-context-requirement"
  | "championship-division-compatibility-context-requirement"
  | "draft-turn-context-requirement"
  | "duplicate-pick-prevention-requirement"
  | "future-draft-pick-execution-dependency"
  | "blocked-concrete-pick-validation"
  | "blocked-actual-draft-pick-execution";

export type NewGMModeDraftPickValidationBlockedReason =
  | "draft-pick-validation-contract-only"
  | "draft-board-selection-prerequisite-summary-required"
  | "draft-board-display-readiness-required"
  | "draft-board-ordering-readiness-required"
  | "draft-board-input-readiness-required"
  | "talent-pool-readiness-required"
  | "selected-wrestler-identity-not-implemented"
  | "selected-wrestler-display-ready-check-not-implemented"
  | "selected-wrestler-draft-eligible-check-not-implemented"
  | "selected-wrestler-availability-check-not-implemented"
  | "selected-wrestler-exclusion-check-not-implemented"
  | "brand-eligibility-context-not-implemented"
  | "roster-slot-context-not-implemented"
  | "championship-division-compatibility-context-not-implemented"
  | "draft-turn-context-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "concrete-draft-pick-validation-not-implemented"
  | "actual-draft-pick-execution-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-board-ui-rendering-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftPickValidationRequirement {
  readonly id: NewGMModeDraftPickValidationRequirementId;
  readonly slug: NewGMModeDraftPickValidationRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftPickValidationCapabilityFlags =
  NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags & {
    readonly draftPickValidationContractAvailable: true;
    readonly draftPickValidationReadinessValidatorAvailable: true;
    readonly draftPickValidationReadinessSummaryAvailable: true;
    readonly concreteDraftPickValidationAvailable: false;
    readonly draftTurnContextAvailable: false;
    readonly duplicatePickPreventionAvailable: false;
    readonly draftPickCreationAvailable: false;
  };

export interface NewGMModeDraftPickValidationContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickValidationContractId: "new-gm-mode-draft-pick-validation-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly draftPickValidationContractAvailable: true;
  readonly orderedValidationRequirements: readonly NewGMModeDraftPickValidationRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickValidationBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly concreteDraftPickValidated: false;
  readonly draftPickCreated: false;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly concreteDraftPickValidationAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
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

const ORDERED_VALIDATION_REQUIREMENT_IDS: readonly NewGMModeDraftPickValidationRequirementId[] =
  Object.freeze([
    "draft-board-selection-prerequisite-summary-availability",
    "draft-board-display-readiness-availability",
    "draft-board-ordering-readiness-availability",
    "draft-board-input-readiness-availability",
    "talent-pool-readiness-availability",
    "selected-wrestler-identity-requirement",
    "selected-wrestler-display-ready-requirement",
    "selected-wrestler-draft-eligible-requirement",
    "selected-wrestler-availability-requirement",
    "selected-wrestler-not-excluded-requirement",
    "brand-eligibility-context-requirement",
    "roster-slot-context-requirement",
    "championship-division-compatibility-context-requirement",
    "draft-turn-context-requirement",
    "duplicate-pick-prevention-requirement",
    "future-draft-pick-execution-dependency",
    "blocked-concrete-pick-validation",
    "blocked-actual-draft-pick-execution"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickValidationBlockedReason[] =
  Object.freeze([
    "draft-pick-validation-contract-only",
    "draft-board-selection-prerequisite-summary-required",
    "draft-board-display-readiness-required",
    "draft-board-ordering-readiness-required",
    "draft-board-input-readiness-required",
    "talent-pool-readiness-required",
    "selected-wrestler-identity-not-implemented",
    "selected-wrestler-display-ready-check-not-implemented",
    "selected-wrestler-draft-eligible-check-not-implemented",
    "selected-wrestler-availability-check-not-implemented",
    "selected-wrestler-exclusion-check-not-implemented",
    "brand-eligibility-context-not-implemented",
    "roster-slot-context-not-implemented",
    "championship-division-compatibility-context-not-implemented",
    "draft-turn-context-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "concrete-draft-pick-validation-not-implemented",
    "actual-draft-pick-execution-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-board-ui-rendering-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftPickValidationContractShell(): NewGMModeDraftPickValidationContractShell {
  const selectionPrerequisiteContract =
    createNewGMModeDraftBoardSelectionPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickValidationContractId:
      "new-gm-mode-draft-pick-validation-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    draftPickValidationContractAvailable: true,
    orderedValidationRequirements: Object.freeze(
      ORDERED_VALIDATION_REQUIREMENT_IDS.map((id) =>
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
      ...selectionPrerequisiteContract.capabilityFlags,
      draftPickValidationContractAvailable: true,
      draftPickValidationReadinessValidatorAvailable: true,
      draftPickValidationReadinessSummaryAvailable: true,
      concreteDraftPickValidationAvailable: false,
      draftTurnContextAvailable: false,
      duplicatePickPreventionAvailable: false,
      draftPickCreationAvailable: false
    }),
    selectedWrestlerChosen: false,
    concreteDraftPickValidated: false,
    draftPickCreated: false,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    concreteDraftPickValidationAvailable: false,
    actualDraftPickExecutionAvailable: false,
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
