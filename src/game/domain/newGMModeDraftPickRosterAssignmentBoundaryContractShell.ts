export type NewGMModeDraftPickRosterAssignmentBoundaryRequirementId =
  | "valid-execution-result-object-readiness-prerequisite"
  | "execution-result-status-prerequisite"
  | "candidate-wrestler-reference-prerequisite"
  | "selecting-brand-prerequisite"
  | "roster-capacity-prerequisite"
  | "duplicate-roster-membership-prevention-prerequisite"
  | "division-championship-adjacency-prerequisite"
  | "transaction-safety-prerequisite"
  | "rollback-prerequisite"
  | "persistence-prerequisite";

export type NewGMModeDraftPickRosterAssignmentBoundaryBlockedReason =
  | "roster-assignment-boundary-contract-only"
  | "execution-result-object-readiness-required"
  | "execution-result-status-not-assignable"
  | "candidate-wrestler-reference-required"
  | "selecting-brand-context-required"
  | "roster-capacity-validation-not-implemented"
  | "duplicate-roster-membership-prevention-not-implemented"
  | "division-championship-adjacency-not-implemented"
  | "transaction-safety-not-implemented"
  | "rollback-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "roster-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftPickRosterAssignmentBoundaryRequirement {
  readonly id: NewGMModeDraftPickRosterAssignmentBoundaryRequirementId;
  readonly slug: NewGMModeDraftPickRosterAssignmentBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickRosterAssignmentBoundaryCapabilityFlags {
  readonly executionResultObjectReadinessConsumable: true;
  readonly canExecuteDraftPick: false;
  readonly canMutateDraftState: false;
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

export interface NewGMModeDraftPickRosterAssignmentBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickRosterAssignmentBoundaryContractId: "new-gm-mode-draft-pick-roster-assignment-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickRosterAssignmentBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftPickRosterAssignmentBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickRosterAssignmentBoundaryRequirementId[] =
  Object.freeze([
    "valid-execution-result-object-readiness-prerequisite",
    "execution-result-status-prerequisite",
    "candidate-wrestler-reference-prerequisite",
    "selecting-brand-prerequisite",
    "roster-capacity-prerequisite",
    "duplicate-roster-membership-prevention-prerequisite",
    "division-championship-adjacency-prerequisite",
    "transaction-safety-prerequisite",
    "rollback-prerequisite",
    "persistence-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPickRosterAssignmentBoundaryBlockedReason[] =
  Object.freeze([
    "roster-assignment-boundary-contract-only",
    "execution-result-object-readiness-required",
    "execution-result-status-not-assignable",
    "candidate-wrestler-reference-required",
    "selecting-brand-context-required",
    "roster-capacity-validation-not-implemented",
    "duplicate-roster-membership-prevention-not-implemented",
    "division-championship-adjacency-not-implemented",
    "transaction-safety-not-implemented",
    "rollback-not-implemented",
    "gameplay-persistence-not-implemented",
    "roster-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_BOUNDARY_CAPABILITY_FLAGS: NewGMModeDraftPickRosterAssignmentBoundaryCapabilityFlags =
  Object.freeze({
    executionResultObjectReadinessConsumable: true,
    canExecuteDraftPick: false,
    canMutateDraftState: false,
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

export function createNewGMModeDraftPickRosterAssignmentBoundaryContractShell(): NewGMModeDraftPickRosterAssignmentBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPickRosterAssignmentBoundaryContractId:
      "new-gm-mode-draft-pick-roster-assignment-boundary-contract-v0.1",
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
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_BOUNDARY_CAPABILITY_FLAGS
  });
}
