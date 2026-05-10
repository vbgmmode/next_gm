import {
  type NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags,
  createNewGMModeDraftPickExecutionPrerequisiteContractShell
} from "./newGMModeDraftPickExecutionPrerequisiteContractShell.ts";

export type NewGMModeDraftPickRosterAssignmentPrerequisiteId =
  | "draft-pick-execution-prerequisite-summary-availability"
  | "draft-pick-validation-readiness-summary-availability"
  | "draft-board-selection-prerequisite-summary-availability"
  | "validated-pick-dependency"
  | "executed-pick-dependency"
  | "selected-wrestler-identity-dependency"
  | "brand-assignment-context-dependency"
  | "roster-slot-requirement-dependency"
  | "roster-size-limit-dependency"
  | "gender-division-compatibility-dependency"
  | "role-category-compatibility-dependency"
  | "championship-division-compatibility-dependency"
  | "duplicate-roster-member-prevention-dependency"
  | "future-roster-state-mutation-dependency"
  | "future-roster-persistence-payload-dependency"
  | "blocked-actual-roster-assignment";

export type NewGMModeDraftPickRosterAssignmentPrerequisiteBlockedReason =
  | "draft-pick-roster-assignment-prerequisite-contract-only"
  | "draft-pick-execution-prerequisite-summary-required"
  | "draft-pick-validation-readiness-summary-required"
  | "draft-board-selection-prerequisite-summary-required"
  | "validated-pick-not-available"
  | "executed-pick-not-available"
  | "selected-wrestler-identity-not-implemented"
  | "brand-assignment-context-not-implemented"
  | "roster-slot-requirement-not-implemented"
  | "roster-size-limit-not-implemented"
  | "gender-division-compatibility-not-implemented"
  | "role-category-compatibility-not-implemented"
  | "championship-division-compatibility-not-implemented"
  | "duplicate-roster-member-prevention-not-implemented"
  | "future-roster-state-mutation-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "actual-roster-assignment-not-implemented"
  | "roster-state-creation-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-board-ui-rendering-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "match-show-week-state-not-implemented"
  | "save-creation-not-implemented"
  | "sqlite-write-not-implemented"
  | "generated-text-not-implemented"
  | "genai-not-implemented";

export interface NewGMModeDraftPickRosterAssignmentPrerequisite {
  readonly id: NewGMModeDraftPickRosterAssignmentPrerequisiteId;
  readonly slug: NewGMModeDraftPickRosterAssignmentPrerequisiteId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags =
  NewGMModeDraftPickExecutionPrerequisiteCapabilityFlags & {
    readonly draftPickRosterAssignmentPrerequisiteContractAvailable: true;
    readonly draftPickRosterAssignmentPrerequisiteSummaryAvailable: true;
    readonly draftPickExecutionPrerequisiteSummaryAvailable: true;
    readonly validatedPickDependencyAvailable: false;
    readonly executedPickDependencyAvailable: false;
    readonly selectedWrestlerIdentityDependencyAvailable: false;
    readonly brandAssignmentContextDependencyAvailable: false;
    readonly rosterSlotRequirementDependencyAvailable: false;
    readonly rosterSizeLimitDependencyAvailable: false;
    readonly genderDivisionCompatibilityDependencyAvailable: false;
    readonly roleCategoryCompatibilityDependencyAvailable: false;
    readonly championshipDivisionCompatibilityDependencyAvailable: false;
    readonly duplicateRosterMemberPreventionDependencyAvailable: false;
    readonly futureRosterStateMutationAvailable: false;
    readonly futureRosterPersistencePayloadDependencyAvailable: false;
    readonly actualRosterAssignmentAvailable: false;
  };

export interface NewGMModeDraftPickRosterAssignmentPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickRosterAssignmentPrerequisiteContractId: "new-gm-mode-draft-pick-roster-assignment-prerequisite-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly draftPickRosterAssignmentPrerequisiteContractAvailable: true;
  readonly orderedRosterAssignmentPrerequisites: readonly NewGMModeDraftPickRosterAssignmentPrerequisite[];
  readonly blockedReasons: readonly NewGMModeDraftPickRosterAssignmentPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
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
  readonly rosterStateCreated: false;
  readonly duplicateRosterMemberPreventionAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly persistencePayloadsCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const ORDERED_ROSTER_ASSIGNMENT_PREREQUISITE_IDS: readonly NewGMModeDraftPickRosterAssignmentPrerequisiteId[] =
  Object.freeze([
    "draft-pick-execution-prerequisite-summary-availability",
    "draft-pick-validation-readiness-summary-availability",
    "draft-board-selection-prerequisite-summary-availability",
    "validated-pick-dependency",
    "executed-pick-dependency",
    "selected-wrestler-identity-dependency",
    "brand-assignment-context-dependency",
    "roster-slot-requirement-dependency",
    "roster-size-limit-dependency",
    "gender-division-compatibility-dependency",
    "role-category-compatibility-dependency",
    "championship-division-compatibility-dependency",
    "duplicate-roster-member-prevention-dependency",
    "future-roster-state-mutation-dependency",
    "future-roster-persistence-payload-dependency",
    "blocked-actual-roster-assignment"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickRosterAssignmentPrerequisiteBlockedReason[] =
  Object.freeze([
    "draft-pick-roster-assignment-prerequisite-contract-only",
    "draft-pick-execution-prerequisite-summary-required",
    "draft-pick-validation-readiness-summary-required",
    "draft-board-selection-prerequisite-summary-required",
    "validated-pick-not-available",
    "executed-pick-not-available",
    "selected-wrestler-identity-not-implemented",
    "brand-assignment-context-not-implemented",
    "roster-slot-requirement-not-implemented",
    "roster-size-limit-not-implemented",
    "gender-division-compatibility-not-implemented",
    "role-category-compatibility-not-implemented",
    "championship-division-compatibility-not-implemented",
    "duplicate-roster-member-prevention-not-implemented",
    "future-roster-state-mutation-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "actual-roster-assignment-not-implemented",
    "roster-state-creation-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-pick-execution-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-board-ui-rendering-not-implemented",
    "championship-division-assignment-not-implemented",
    "match-show-week-state-not-implemented",
    "save-creation-not-implemented",
    "sqlite-write-not-implemented",
    "generated-text-not-implemented",
    "genai-not-implemented"
  ]);

export function createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell(): NewGMModeDraftPickRosterAssignmentPrerequisiteContractShell {
  const executionContract =
    createNewGMModeDraftPickExecutionPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickRosterAssignmentPrerequisiteContractId:
      "new-gm-mode-draft-pick-roster-assignment-prerequisite-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    draftPickRosterAssignmentPrerequisiteContractAvailable: true,
    orderedRosterAssignmentPrerequisites: Object.freeze(
      ORDERED_ROSTER_ASSIGNMENT_PREREQUISITE_IDS.map((id) =>
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
      ...executionContract.capabilityFlags,
      draftPickRosterAssignmentPrerequisiteContractAvailable: true,
      draftPickRosterAssignmentPrerequisiteSummaryAvailable: true,
      draftPickExecutionPrerequisiteSummaryAvailable: true,
      validatedPickDependencyAvailable: false,
      executedPickDependencyAvailable: false,
      selectedWrestlerIdentityDependencyAvailable: false,
      brandAssignmentContextDependencyAvailable: false,
      rosterSlotRequirementDependencyAvailable: false,
      rosterSizeLimitDependencyAvailable: false,
      genderDivisionCompatibilityDependencyAvailable: false,
      roleCategoryCompatibilityDependencyAvailable: false,
      championshipDivisionCompatibilityDependencyAvailable: false,
      duplicateRosterMemberPreventionDependencyAvailable: false,
      futureRosterStateMutationAvailable: false,
      futureRosterPersistencePayloadDependencyAvailable: false,
      actualRosterAssignmentAvailable: false
    }),
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
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
    rosterStateCreated: false,
    duplicateRosterMemberPreventionAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    persistencePayloadsCreated: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}
