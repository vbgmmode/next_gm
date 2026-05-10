export type NewGMModeDraftPickValidationBoundaryRequirementId =
  | "valid-selection-intent-readiness-prerequisite"
  | "candidate-object-lookup-prerequisite"
  | "candidate-eligibility-prerequisite"
  | "draft-order-prerequisite"
  | "brand-selection-context-prerequisite"
  | "duplicate-pick-prevention-prerequisite"
  | "roster-capacity-prerequisite"
  | "future-draft-state-prerequisite"
  | "future-validation-result-prerequisite";

export type NewGMModeDraftPickValidationBoundaryBlockedReason =
  | "draft-pick-validation-boundary-contract-only"
  | "selection-intent-readiness-required"
  | "candidate-object-lookup-not-implemented"
  | "candidate-eligibility-validation-not-implemented"
  | "draft-order-validation-not-implemented"
  | "brand-selection-context-validation-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "roster-capacity-validation-not-implemented"
  | "draft-state-not-implemented"
  | "validation-result-not-implemented"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftPickValidationBoundaryRequirement {
  readonly id: NewGMModeDraftPickValidationBoundaryRequirementId;
  readonly slug: NewGMModeDraftPickValidationBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickValidationBoundaryCapabilityFlags {
  readonly selectionIntentReadinessConsumable: true;
  readonly canLookupCandidateObject: false;
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

export interface NewGMModeDraftPickValidationBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickValidationBoundaryContractId: "new-gm-mode-draft-pick-validation-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickValidationBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickValidationBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickValidationBoundaryRequirementId[] =
  Object.freeze([
    "valid-selection-intent-readiness-prerequisite",
    "candidate-object-lookup-prerequisite",
    "candidate-eligibility-prerequisite",
    "draft-order-prerequisite",
    "brand-selection-context-prerequisite",
    "duplicate-pick-prevention-prerequisite",
    "roster-capacity-prerequisite",
    "future-draft-state-prerequisite",
    "future-validation-result-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickValidationBoundaryBlockedReason[] =
  Object.freeze([
    "draft-pick-validation-boundary-contract-only",
    "selection-intent-readiness-required",
    "candidate-object-lookup-not-implemented",
    "candidate-eligibility-validation-not-implemented",
    "draft-order-validation-not-implemented",
    "brand-selection-context-validation-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "roster-capacity-validation-not-implemented",
    "draft-state-not-implemented",
    "validation-result-not-implemented",
    "draft-pick-creation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-assignment-not-implemented",
    "gameplay-persistence-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_VALIDATION_BOUNDARY_CAPABILITY_FLAGS: NewGMModeDraftPickValidationBoundaryCapabilityFlags =
  Object.freeze({
    selectionIntentReadinessConsumable: true,
    canLookupCandidateObject: false,
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

export function createNewGMModeDraftPickValidationBoundaryContractShell(): NewGMModeDraftPickValidationBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPickValidationBoundaryContractId:
      "new-gm-mode-draft-pick-validation-boundary-contract-v0.1",
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_VALIDATION_BOUNDARY_CAPABILITY_FLAGS
  });
}
