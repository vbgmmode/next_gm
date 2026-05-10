export type NewGMModeGameplayStartBoundaryRequirementId =
  | "valid-roster-state-object-readiness-prerequisite"
  | "brand-roster-completeness-prerequisite"
  | "minimum-roster-count-prerequisite"
  | "division-championship-setup-prerequisite"
  | "schedule-calendar-prerequisite"
  | "save-identity-prerequisite"
  | "persistence-prerequisite"
  | "week-one-initialization-prerequisite";

export type NewGMModeGameplayStartBoundaryBlockedReason =
  | "gameplay-start-boundary-contract-only"
  | "roster-state-object-readiness-required"
  | "brand-roster-completeness-not-implemented"
  | "minimum-roster-count-not-implemented"
  | "division-championship-setup-not-implemented"
  | "schedule-calendar-not-implemented"
  | "save-identity-not-connected"
  | "gameplay-persistence-not-implemented"
  | "week-one-initialization-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-not-implemented"
  | "generated-text-not-implemented"
  | "genai-not-implemented";

export interface NewGMModeGameplayStartBoundaryRequirement {
  readonly id: NewGMModeGameplayStartBoundaryRequirementId;
  readonly slug: NewGMModeGameplayStartBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeGameplayStartBoundaryCapabilityFlags {
  readonly rosterStateObjectReadinessConsumable: true;
  readonly canMutateRosterState: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignRoster: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canCreateMatchShowWeekOrCalendarState: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canMutateState: false;
  readonly canStartGameplay: false;
  readonly canInitializeWeekOne: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeGameplayStartBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly gameplayStartBoundaryContractId: "new-gm-mode-gameplay-start-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realGameplayStartUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeGameplayStartBoundaryRequirement[];
  readonly blockedReasons: readonly NewGMModeGameplayStartBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeGameplayStartBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeGameplayStartBoundaryRequirementId[] =
  Object.freeze([
    "valid-roster-state-object-readiness-prerequisite",
    "brand-roster-completeness-prerequisite",
    "minimum-roster-count-prerequisite",
    "division-championship-setup-prerequisite",
    "schedule-calendar-prerequisite",
    "save-identity-prerequisite",
    "persistence-prerequisite",
    "week-one-initialization-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeGameplayStartBoundaryBlockedReason[] =
  Object.freeze([
    "gameplay-start-boundary-contract-only",
    "roster-state-object-readiness-required",
    "brand-roster-completeness-not-implemented",
    "minimum-roster-count-not-implemented",
    "division-championship-setup-not-implemented",
    "schedule-calendar-not-implemented",
    "save-identity-not-connected",
    "gameplay-persistence-not-implemented",
    "week-one-initialization-not-implemented",
    "gameplay-start-not-implemented",
    "ui-not-implemented",
    "generated-text-not-implemented",
    "genai-not-implemented"
  ]);

export const NEW_GM_MODE_GAMEPLAY_START_BOUNDARY_CAPABILITY_FLAGS: NewGMModeGameplayStartBoundaryCapabilityFlags =
  Object.freeze({
    rosterStateObjectReadinessConsumable: true,
    canMutateRosterState: false,
    canCreateOrMutateRosterState: false,
    canAssignRoster: false,
    canAssignChampionshipOrDivision: false,
    canCreateMatchShowWeekOrCalendarState: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canMutateState: false,
    canStartGameplay: false,
    canInitializeWeekOne: false,
    canUnlockWeekOne: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeGameplayStartBoundaryContractShell(): NewGMModeGameplayStartBoundaryContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    gameplayStartBoundaryContractId:
      "new-gm-mode-gameplay-start-boundary-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realGameplayStartUnavailable: true,
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
    capabilityFlags: NEW_GM_MODE_GAMEPLAY_START_BOUNDARY_CAPABILITY_FLAGS
  });
}
