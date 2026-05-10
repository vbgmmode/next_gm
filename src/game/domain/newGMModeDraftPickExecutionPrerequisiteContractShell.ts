import {
  type NewGMModeDraftPickValidationCapabilityFlags,
  createNewGMModeDraftPickValidationContractShell
} from "./newGMModeDraftPickValidationContractShell.ts";

export type NewGMModeDraftPickExecutionPrerequisiteId =
  | "draft-pick-validation-readiness-summary-availability"
  | "draft-board-selection-prerequisite-summary-availability"
  | "draft-board-display-readiness-summary-availability"
  | "draft-board-ordering-summary-availability"
  | "draft-board-input-readiness-availability"
  | "talent-pool-readiness-availability"
  | "validated-pick-dependency"
  | "selected-wrestler-identity-dependency"
  | "selected-wrestler-draft-eligibility-dependency"
  | "selected-wrestler-availability-dependency"
  | "duplicate-pick-prevention-dependency"
  | "draft-turn-context-dependency"
  | "brand-assignment-context-dependency"
  | "roster-slot-context-dependency"
  | "championship-division-compatibility-context-dependency"
  | "future-roster-assignment-dependency"
  | "future-draft-state-mutation-dependency"
  | "future-persistence-payload-dependency"
  | "blocked-actual-pick-execution";

export type NewGMModeDraftPickExecutionPrerequisiteBlockedReason =
  | "draft-pick-execution-prerequisite-contract-only"
  | "draft-pick-validation-readiness-summary-required"
  | "draft-board-selection-prerequisite-summary-required"
  | "draft-board-display-readiness-summary-required"
  | "draft-board-ordering-summary-required"
  | "draft-board-input-readiness-required"
  | "talent-pool-readiness-required"
  | "validated-pick-not-available"
  | "selected-wrestler-identity-not-implemented"
  | "selected-wrestler-draft-eligible-check-not-implemented"
  | "selected-wrestler-availability-check-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "draft-turn-context-not-implemented"
  | "brand-assignment-context-not-implemented"
  | "roster-slot-context-not-implemented"
  | "championship-division-compatibility-context-not-implemented"
  | "future-roster-assignment-not-implemented"
  | "draft-state-mutation-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "actual-draft-pick-execution-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-board-ui-rendering-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftPickExecutionPrerequisite {
  readonly id: NewGMModeDraftPickExecutionPrerequisiteId;
  readonly slug: NewGMModeDraftPickExecutionPrerequisiteId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags =
  NewGMModeDraftPickValidationCapabilityFlags & {
    readonly draftPickExecutionPrerequisiteContractAvailable: true;
    readonly draftPickExecutionPrerequisiteSummaryAvailable: true;
    readonly validatedPickDependencyAvailable: false;
    readonly selectedWrestlerIdentityDependencyAvailable: false;
    readonly selectedWrestlerDraftEligibilityDependencyAvailable: false;
    readonly selectedWrestlerAvailabilityDependencyAvailable: false;
    readonly duplicatePickPreventionDependencyAvailable: false;
    readonly draftTurnContextDependencyAvailable: false;
    readonly brandAssignmentContextAvailable: false;
    readonly rosterSlotContextDependencyAvailable: false;
    readonly championshipDivisionCompatibilityContextDependencyAvailable: false;
    readonly futureRosterAssignmentDependencyAvailable: false;
    readonly draftStateMutationAvailable: false;
    readonly futurePersistencePayloadDependencyAvailable: false;
    readonly actualDraftPickExecutionAvailable: false;
  };

export interface NewGMModeDraftPickExecutionPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickExecutionPrerequisiteContractId: "new-gm-mode-draft-pick-execution-prerequisite-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly draftPickExecutionPrerequisiteContractAvailable: true;
  readonly orderedExecutionPrerequisites: readonly NewGMModeDraftPickExecutionPrerequisite[];
  readonly blockedReasons: readonly NewGMModeDraftPickExecutionPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly concreteDraftPickValidated: false;
  readonly validatedPickAvailable: false;
  readonly draftPickCreated: false;
  readonly draftPickExecuted: false;
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

const ORDERED_EXECUTION_PREREQUISITE_IDS: readonly NewGMModeDraftPickExecutionPrerequisiteId[] =
  Object.freeze([
    "draft-pick-validation-readiness-summary-availability",
    "draft-board-selection-prerequisite-summary-availability",
    "draft-board-display-readiness-summary-availability",
    "draft-board-ordering-summary-availability",
    "draft-board-input-readiness-availability",
    "talent-pool-readiness-availability",
    "validated-pick-dependency",
    "selected-wrestler-identity-dependency",
    "selected-wrestler-draft-eligibility-dependency",
    "selected-wrestler-availability-dependency",
    "duplicate-pick-prevention-dependency",
    "draft-turn-context-dependency",
    "brand-assignment-context-dependency",
    "roster-slot-context-dependency",
    "championship-division-compatibility-context-dependency",
    "future-roster-assignment-dependency",
    "future-draft-state-mutation-dependency",
    "future-persistence-payload-dependency",
    "blocked-actual-pick-execution"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickExecutionPrerequisiteBlockedReason[] =
  Object.freeze([
    "draft-pick-execution-prerequisite-contract-only",
    "draft-pick-validation-readiness-summary-required",
    "draft-board-selection-prerequisite-summary-required",
    "draft-board-display-readiness-summary-required",
    "draft-board-ordering-summary-required",
    "draft-board-input-readiness-required",
    "talent-pool-readiness-required",
    "validated-pick-not-available",
    "selected-wrestler-identity-not-implemented",
    "selected-wrestler-draft-eligible-check-not-implemented",
    "selected-wrestler-availability-check-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "draft-turn-context-not-implemented",
    "brand-assignment-context-not-implemented",
    "roster-slot-context-not-implemented",
    "championship-division-compatibility-context-not-implemented",
    "future-roster-assignment-not-implemented",
    "draft-state-mutation-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "actual-draft-pick-execution-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-board-ui-rendering-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftPickExecutionPrerequisiteContractShell(): NewGMModeDraftPickExecutionPrerequisiteContractShell {
  const validationContract = createNewGMModeDraftPickValidationContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickExecutionPrerequisiteContractId:
      "new-gm-mode-draft-pick-execution-prerequisite-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    draftPickExecutionPrerequisiteContractAvailable: true,
    orderedExecutionPrerequisites: Object.freeze(
      ORDERED_EXECUTION_PREREQUISITE_IDS.map((id) =>
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
      ...validationContract.capabilityFlags,
      draftPickExecutionPrerequisiteContractAvailable: true,
      draftPickExecutionPrerequisiteSummaryAvailable: true,
      validatedPickDependencyAvailable: false,
      selectedWrestlerIdentityDependencyAvailable: false,
      selectedWrestlerDraftEligibilityDependencyAvailable: false,
      selectedWrestlerAvailabilityDependencyAvailable: false,
      duplicatePickPreventionDependencyAvailable: false,
      draftTurnContextDependencyAvailable: false,
      brandAssignmentContextAvailable: false,
      rosterSlotContextDependencyAvailable: false,
      championshipDivisionCompatibilityContextDependencyAvailable: false,
      futureRosterAssignmentDependencyAvailable: false,
      draftStateMutationAvailable: false,
      futurePersistencePayloadDependencyAvailable: false,
      actualDraftPickExecutionAvailable: false
    }),
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    concreteDraftPickValidated: false,
    validatedPickAvailable: false,
    draftPickCreated: false,
    draftPickExecuted: false,
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
