export type NewGMModeDraftPickExecutionBoundaryRequirementId =
  | "valid-draft-pick-object-readiness-prerequisite"
  | "draft-pick-status-prerequisite"
  | "draft-state-prerequisite"
  | "pick-order-prerequisite"
  | "duplicate-pick-prevention-prerequisite"
  | "roster-assignment-prerequisite"
  | "transaction-safety-prerequisite"
  | "rollback-prerequisite"
  | "persistence-prerequisite"
  | "gameplay-unlock-prerequisite";

export type NewGMModeDraftPickExecutionBoundaryBlockedReason =
  | "draft-pick-execution-boundary-contract-only"
  | "draft-pick-object-readiness-required"
  | "draft-pick-status-not-executable"
  | "draft-state-unavailable"
  | "pick-order-validation-not-implemented"
  | "duplicate-pick-prevention-not-implemented"
  | "roster-assignment-not-implemented"
  | "transaction-safety-not-implemented"
  | "rollback-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftPickExecutionBoundaryRequirement {
  readonly id: NewGMModeDraftPickExecutionBoundaryRequirementId;
  readonly slug: NewGMModeDraftPickExecutionBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickExecutionBoundaryCapabilityFlags {
  readonly draftPickObjectReadinessConsumable: true;
  readonly canExecuteDraftPick: false;
  readonly canAssignRoster: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canCreateMatchShowOrWeekState: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canMutateState: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftPickExecutionBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickExecutionBoundaryContractId: "new-gm-mode-draft-pick-execution-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickExecutionBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickExecutionBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickExecutionBoundaryRequirementId[] =
  Object.freeze([
    "valid-draft-pick-object-readiness-prerequisite",
    "draft-pick-status-prerequisite",
    "draft-state-prerequisite",
    "pick-order-prerequisite",
    "duplicate-pick-prevention-prerequisite",
    "roster-assignment-prerequisite",
    "transaction-safety-prerequisite",
    "rollback-prerequisite",
    "persistence-prerequisite",
    "gameplay-unlock-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickExecutionBoundaryBlockedReason[] =
  Object.freeze([
    "draft-pick-execution-boundary-contract-only",
    "draft-pick-object-readiness-required",
    "draft-pick-status-not-executable",
    "draft-state-unavailable",
    "pick-order-validation-not-implemented",
    "duplicate-pick-prevention-not-implemented",
    "roster-assignment-not-implemented",
    "transaction-safety-not-implemented",
    "rollback-not-implemented",
    "gameplay-persistence-not-implemented",
    "draft-pick-execution-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_EXECUTION_BOUNDARY_CAPABILITY_FLAGS: NewGMModeDraftPickExecutionBoundaryCapabilityFlags =
  Object.freeze({
    draftPickObjectReadinessConsumable: true,
    canExecuteDraftPick: false,
    canAssignRoster: false,
    canCreateOrMutateRosterState: false,
    canAssignChampionshipOrDivision: false,
    canCreateMatchShowOrWeekState: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canMutateState: false,
    canStartGameplay: false,
    canUnlockWeekOne: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftPickExecutionBoundaryContractShell(): NewGMModeDraftPickExecutionBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPickExecutionBoundaryContractId:
      "new-gm-mode-draft-pick-execution-boundary-contract-v0.1",
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_EXECUTION_BOUNDARY_CAPABILITY_FLAGS
  });
}
