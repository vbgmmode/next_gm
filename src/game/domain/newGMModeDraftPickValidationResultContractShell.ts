export type NewGMModeDraftPickValidationResultRequirementId =
  | "validation-result-id-requirement"
  | "source-selection-intent-reference-requirement"
  | "candidate-object-reference-requirement"
  | "fixture-wrestler-reference-requirement"
  | "selecting-brand-reference-requirement"
  | "draft-round-pick-number-reference-requirement"
  | "validation-status-requirement"
  | "issue-ids-requirement"
  | "blocked-capability-flags-requirement"
  | "future-draft-pick-creation-prerequisite";

export type NewGMModeDraftPickValidationResultBlockedReason =
  | "draft-pick-validation-result-contract-only"
  | "real-validation-result-creation-not-implemented"
  | "candidate-eligibility-validation-not-implemented"
  | "candidate-object-lookup-not-implemented"
  | "selection-intent-readiness-required"
  | "draft-order-validation-not-implemented"
  | "brand-context-validation-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "roster-capacity-validation-not-implemented"
  | "draft-state-unavailable"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftPickValidationResultRequirement {
  readonly id: NewGMModeDraftPickValidationResultRequirementId;
  readonly slug: NewGMModeDraftPickValidationResultRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickValidationResultCapabilityFlags {
  readonly validationResultShapeDefined: true;
  readonly canCreateRealValidationResult: false;
  readonly canValidateCandidateEligibility: false;
  readonly canValidateDraftPick: false;
  readonly canCreateDraftPick: false;
  readonly canExecuteDraftPick: false;
  readonly canAssignRoster: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canCreateMatchShowOrWeekState: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftPickValidationResultContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickValidationResultContractId: "new-gm-mode-draft-pick-validation-result-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickValidationResultRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickValidationResultBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationResultCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickValidationResultRequirementId[] =
  Object.freeze([
    "validation-result-id-requirement",
    "source-selection-intent-reference-requirement",
    "candidate-object-reference-requirement",
    "fixture-wrestler-reference-requirement",
    "selecting-brand-reference-requirement",
    "draft-round-pick-number-reference-requirement",
    "validation-status-requirement",
    "issue-ids-requirement",
    "blocked-capability-flags-requirement",
    "future-draft-pick-creation-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickValidationResultBlockedReason[] =
  Object.freeze([
    "draft-pick-validation-result-contract-only",
    "real-validation-result-creation-not-implemented",
    "candidate-eligibility-validation-not-implemented",
    "candidate-object-lookup-not-implemented",
    "selection-intent-readiness-required",
    "draft-order-validation-not-implemented",
    "brand-context-validation-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "roster-capacity-validation-not-implemented",
    "draft-state-unavailable",
    "draft-pick-creation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-assignment-not-implemented",
    "gameplay-persistence-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS: NewGMModeDraftPickValidationResultCapabilityFlags =
  Object.freeze({
    validationResultShapeDefined: true,
    canCreateRealValidationResult: false,
    canValidateCandidateEligibility: false,
    canValidateDraftPick: false,
    canCreateDraftPick: false,
    canExecuteDraftPick: false,
    canAssignRoster: false,
    canCreateOrMutateRosterState: false,
    canAssignChampionshipOrDivision: false,
    canCreateMatchShowOrWeekState: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canStartGameplay: false,
    canUnlockWeekOne: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftPickValidationResultContractShell(): NewGMModeDraftPickValidationResultContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPickValidationResultContractId:
      "new-gm-mode-draft-pick-validation-result-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
  });
}
