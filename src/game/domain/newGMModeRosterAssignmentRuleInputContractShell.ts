import {
  type NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags,
  createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell
} from "./newGMModeDraftPickRosterAssignmentPrerequisiteContractShell.ts";

export type NewGMModeRosterAssignmentRuleInputRequirementId =
  | "roster-assignment-prerequisite-summary-availability"
  | "draft-pick-execution-prerequisite-summary-availability"
  | "draft-pick-validation-readiness-summary-availability"
  | "selected-wrestler-identity-dependency"
  | "executed-pick-dependency"
  | "brand-assignment-context-dependency"
  | "roster-slot-requirement-context"
  | "roster-size-limit-context"
  | "mens-division-slot-context"
  | "womens-division-slot-context"
  | "tag-division-slot-context"
  | "role-category-compatibility-context"
  | "championship-division-compatibility-context"
  | "duplicate-roster-member-prevention-context"
  | "future-roster-state-mutation-dependency"
  | "future-roster-persistence-payload-dependency"
  | "blocked-actual-roster-assignment";

export type NewGMModeRosterAssignmentRuleInputBlockedReason =
  | "roster-assignment-rule-input-contract-only"
  | "roster-assignment-prerequisite-summary-required"
  | "draft-pick-execution-prerequisite-summary-required"
  | "draft-pick-validation-readiness-summary-required"
  | "selected-wrestler-identity-not-implemented"
  | "executed-pick-not-available"
  | "brand-assignment-context-not-implemented"
  | "roster-slot-requirement-context-not-implemented"
  | "roster-size-limit-context-not-implemented"
  | "mens-division-slot-context-not-implemented"
  | "womens-division-slot-context-not-implemented"
  | "tag-division-slot-context-not-implemented"
  | "role-category-compatibility-context-not-implemented"
  | "championship-division-compatibility-context-not-implemented"
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

export interface NewGMModeRosterAssignmentRuleInputRequirement {
  readonly id: NewGMModeRosterAssignmentRuleInputRequirementId;
  readonly slug: NewGMModeRosterAssignmentRuleInputRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export type NewGMModeRosterAssignmentRuleInputCapabilityFlags =
  NewGMModeDraftPickRosterAssignmentPrerequisiteCapabilityFlags & {
    readonly rosterAssignmentRuleInputContractAvailable: true;
    readonly rosterAssignmentRuleInputReadinessValidatorAvailable: true;
    readonly rosterAssignmentRuleInputReadinessSummaryAvailable: true;
    readonly rosterAssignmentPrerequisiteSummaryAvailable: true;
    readonly selectedWrestlerIdentityDependencyAvailable: false;
    readonly executedPickDependencyAvailable: false;
    readonly brandAssignmentContextDependencyAvailable: false;
    readonly rosterSlotRequirementContextAvailable: false;
    readonly rosterSizeLimitContextAvailable: false;
    readonly mensDivisionSlotContextAvailable: false;
    readonly womensDivisionSlotContextAvailable: false;
    readonly tagDivisionSlotContextAvailable: false;
    readonly roleCategoryCompatibilityContextAvailable: false;
    readonly championshipDivisionCompatibilityContextAvailable: false;
    readonly duplicateRosterMemberPreventionContextAvailable: false;
    readonly futureRosterStateMutationAvailable: false;
    readonly futureRosterPersistencePayloadDependencyAvailable: false;
    readonly actualRosterAssignmentAvailable: false;
  };

export interface NewGMModeRosterAssignmentRuleInputContractShell {
  readonly status: "diagnostics-only";
  readonly rosterAssignmentRuleInputContractId: "new-gm-mode-roster-assignment-rule-input-contract-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentRuleInputContractAvailable: true;
  readonly orderedRuleInputRequirements: readonly NewGMModeRosterAssignmentRuleInputRequirement[];
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
  readonly persistencePayloadsCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const ORDERED_RULE_INPUT_REQUIREMENT_IDS: readonly NewGMModeRosterAssignmentRuleInputRequirementId[] =
  Object.freeze([
    "roster-assignment-prerequisite-summary-availability",
    "draft-pick-execution-prerequisite-summary-availability",
    "draft-pick-validation-readiness-summary-availability",
    "selected-wrestler-identity-dependency",
    "executed-pick-dependency",
    "brand-assignment-context-dependency",
    "roster-slot-requirement-context",
    "roster-size-limit-context",
    "mens-division-slot-context",
    "womens-division-slot-context",
    "tag-division-slot-context",
    "role-category-compatibility-context",
    "championship-division-compatibility-context",
    "duplicate-roster-member-prevention-context",
    "future-roster-state-mutation-dependency",
    "future-roster-persistence-payload-dependency",
    "blocked-actual-roster-assignment"
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterAssignmentRuleInputBlockedReason[] =
  Object.freeze([
    "roster-assignment-rule-input-contract-only",
    "roster-assignment-prerequisite-summary-required",
    "draft-pick-execution-prerequisite-summary-required",
    "draft-pick-validation-readiness-summary-required",
    "selected-wrestler-identity-not-implemented",
    "executed-pick-not-available",
    "brand-assignment-context-not-implemented",
    "roster-slot-requirement-context-not-implemented",
    "roster-size-limit-context-not-implemented",
    "mens-division-slot-context-not-implemented",
    "womens-division-slot-context-not-implemented",
    "tag-division-slot-context-not-implemented",
    "role-category-compatibility-context-not-implemented",
    "championship-division-compatibility-context-not-implemented",
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

export function createNewGMModeRosterAssignmentRuleInputContractShell(): NewGMModeRosterAssignmentRuleInputContractShell {
  const rosterAssignmentPrerequisiteContract =
    createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    rosterAssignmentRuleInputContractId:
      "new-gm-mode-roster-assignment-rule-input-contract-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    rosterAssignmentRuleInputContractAvailable: true,
    orderedRuleInputRequirements: Object.freeze(
      ORDERED_RULE_INPUT_REQUIREMENT_IDS.map((id) =>
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
      ...rosterAssignmentPrerequisiteContract.capabilityFlags,
      rosterAssignmentRuleInputContractAvailable: true,
      rosterAssignmentRuleInputReadinessValidatorAvailable: true,
      rosterAssignmentRuleInputReadinessSummaryAvailable: true,
      rosterAssignmentPrerequisiteSummaryAvailable: true,
      selectedWrestlerIdentityDependencyAvailable: false,
      executedPickDependencyAvailable: false,
      brandAssignmentContextDependencyAvailable: false,
      rosterSlotRequirementContextAvailable: false,
      rosterSizeLimitContextAvailable: false,
      mensDivisionSlotContextAvailable: false,
      womensDivisionSlotContextAvailable: false,
      tagDivisionSlotContextAvailable: false,
      roleCategoryCompatibilityContextAvailable: false,
      championshipDivisionCompatibilityContextAvailable: false,
      duplicateRosterMemberPreventionContextAvailable: false,
      futureRosterStateMutationAvailable: false,
      futureRosterPersistencePayloadDependencyAvailable: false,
      actualRosterAssignmentAvailable: false
    }),
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
    persistencePayloadsCreated: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}
