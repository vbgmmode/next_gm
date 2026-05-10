export type NewGMModeDraftPickCreationBoundaryRequirementId =
  | "valid-validation-result-object-readiness-prerequisite"
  | "validation-result-status-prerequisite"
  | "candidate-object-reference-prerequisite"
  | "selection-intent-reference-prerequisite"
  | "draft-order-prerequisite"
  | "brand-context-prerequisite"
  | "duplicate-pick-prevention-prerequisite"
  | "future-draft-state-prerequisite"
  | "future-roster-assignment-prerequisite";

export type NewGMModeDraftPickCreationBoundaryBlockedReason =
  | "draft-pick-creation-boundary-contract-only"
  | "validation-result-object-readiness-required"
  | "validation-result-status-not-actionable"
  | "candidate-object-reference-only"
  | "selection-intent-reference-only"
  | "draft-order-validation-not-implemented"
  | "brand-context-validation-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "draft-state-unavailable"
  | "draft-pick-creation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftPickCreationBoundaryRequirement {
  readonly id: NewGMModeDraftPickCreationBoundaryRequirementId;
  readonly slug: NewGMModeDraftPickCreationBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickCreationBoundaryCapabilityFlags {
  readonly validationResultObjectReadinessConsumable: true;
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

export interface NewGMModeDraftPickCreationBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickCreationBoundaryContractId: "new-gm-mode-draft-pick-creation-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickCreationBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickCreationBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickCreationBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickCreationBoundaryRequirementId[] =
  Object.freeze([
    "valid-validation-result-object-readiness-prerequisite",
    "validation-result-status-prerequisite",
    "candidate-object-reference-prerequisite",
    "selection-intent-reference-prerequisite",
    "draft-order-prerequisite",
    "brand-context-prerequisite",
    "duplicate-pick-prevention-prerequisite",
    "future-draft-state-prerequisite",
    "future-roster-assignment-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickCreationBoundaryBlockedReason[] =
  Object.freeze([
    "draft-pick-creation-boundary-contract-only",
    "validation-result-object-readiness-required",
    "validation-result-status-not-actionable",
    "candidate-object-reference-only",
    "selection-intent-reference-only",
    "draft-order-validation-not-implemented",
    "brand-context-validation-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "draft-state-unavailable",
    "draft-pick-creation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-assignment-not-implemented",
    "gameplay-persistence-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_CREATION_BOUNDARY_CAPABILITY_FLAGS: NewGMModeDraftPickCreationBoundaryCapabilityFlags =
  Object.freeze({
    validationResultObjectReadinessConsumable: true,
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

export function createNewGMModeDraftPickCreationBoundaryContractShell(): NewGMModeDraftPickCreationBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPickCreationBoundaryContractId:
      "new-gm-mode-draft-pick-creation-boundary-contract-v0.1",
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_CREATION_BOUNDARY_CAPABILITY_FLAGS
  });
}
