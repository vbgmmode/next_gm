export type NewGMModeRosterStateBoundaryRequirementId =
  | "valid-roster-assignment-result-object-readiness-prerequisite"
  | "assignment-result-status-prerequisite"
  | "brand-roster-reference-prerequisite"
  | "wrestler-roster-membership-prerequisite"
  | "roster-capacity-prerequisite"
  | "duplicate-membership-prevention-prerequisite"
  | "division-championship-adjacency-prerequisite"
  | "transaction-safety-prerequisite"
  | "rollback-prerequisite"
  | "persistence-prerequisite"
  | "gameplay-unlock-prerequisite";

export type NewGMModeRosterStateBoundaryBlockedReason =
  | "roster-state-boundary-contract-only"
  | "roster-assignment-result-object-readiness-required"
  | "assignment-result-status-not-roster-state-ready"
  | "brand-roster-reference-required"
  | "wrestler-roster-membership-not-implemented"
  | "roster-capacity-validation-not-implemented"
  | "duplicate-membership-prevention-not-implemented"
  | "division-championship-adjacency-not-implemented"
  | "transaction-safety-not-implemented"
  | "rollback-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "roster-state-creation-not-implemented"
  | "roster-state-mutation-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeRosterStateBoundaryRequirement {
  readonly id: NewGMModeRosterStateBoundaryRequirementId;
  readonly slug: NewGMModeRosterStateBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeRosterStateBoundaryCapabilityFlags {
  readonly rosterAssignmentResultObjectReadinessConsumable: true;
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

export interface NewGMModeRosterStateBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly rosterStateBoundaryContractId: "new-gm-mode-roster-state-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realRosterStateCreationOrMutationUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeRosterStateBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeRosterStateBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterStateBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeRosterStateBoundaryRequirementId[] =
  Object.freeze([
    "valid-roster-assignment-result-object-readiness-prerequisite",
    "assignment-result-status-prerequisite",
    "brand-roster-reference-prerequisite",
    "wrestler-roster-membership-prerequisite",
    "roster-capacity-prerequisite",
    "duplicate-membership-prevention-prerequisite",
    "division-championship-adjacency-prerequisite",
    "transaction-safety-prerequisite",
    "rollback-prerequisite",
    "persistence-prerequisite",
    "gameplay-unlock-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterStateBoundaryBlockedReason[] =
  Object.freeze([
    "roster-state-boundary-contract-only",
    "roster-assignment-result-object-readiness-required",
    "assignment-result-status-not-roster-state-ready",
    "brand-roster-reference-required",
    "wrestler-roster-membership-not-implemented",
    "roster-capacity-validation-not-implemented",
    "duplicate-membership-prevention-not-implemented",
    "division-championship-adjacency-not-implemented",
    "transaction-safety-not-implemented",
    "rollback-not-implemented",
    "gameplay-persistence-not-implemented",
    "roster-state-creation-not-implemented",
    "roster-state-mutation-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_ROSTER_STATE_BOUNDARY_CAPABILITY_FLAGS: NewGMModeRosterStateBoundaryCapabilityFlags =
  Object.freeze({
    rosterAssignmentResultObjectReadinessConsumable: true,
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

export function createNewGMModeRosterStateBoundaryContractShell(): NewGMModeRosterStateBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    rosterStateBoundaryContractId:
      "new-gm-mode-roster-state-boundary-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realRosterStateCreationOrMutationUnavailable: true,
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
    capabilityFlags: NEW_GM_MODE_ROSTER_STATE_BOUNDARY_CAPABILITY_FLAGS
  });
}
