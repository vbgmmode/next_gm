import {
  createNewGMModeRosterStateBlockedReasonCatalog,
  type NewGMModeRosterStateBlockedReasonCatalogId
} from "./newGMModeRosterStateBlockedReasonCatalog.ts";

export type NewGMModeRosterStateRequirementId =
  | "roster-state-id-requirement"
  | "brand-roster-reference-requirement"
  | "assigned-wrestler-membership-list-requirement"
  | "source-roster-assignment-result-references-requirement"
  | "roster-capacity-rules-requirement"
  | "duplicate-membership-rules-requirement"
  | "division-reference-placeholders-requirement"
  | "championship-adjacency-placeholders-requirement"
  | "roster-state-status-requirement"
  | "mutation-version-placeholder-requirement"
  | "persistence-prerequisite"
  | "gameplay-unlock-prerequisite";

export interface NewGMModeRosterStateRequirement {
  readonly id: NewGMModeRosterStateRequirementId;
  readonly slug: NewGMModeRosterStateRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeRosterStateContractCapabilityFlags {
  readonly rosterStateShapeDefined: true;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignRoster: false;
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

export interface NewGMModeRosterStateContractShell {
  readonly status: "diagnostics-only";
  readonly newGMModeRosterStateContractId: "new-gm-mode-roster-state-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realRosterStateCreationOrMutationUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeRosterStateRequirement[];
  readonly blockedReasonIds: readonly NewGMModeRosterStateBlockedReasonCatalogId[];
  readonly capabilityFlags: NewGMModeRosterStateContractCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeRosterStateRequirementId[] =
  Object.freeze([
    "roster-state-id-requirement",
    "brand-roster-reference-requirement",
    "assigned-wrestler-membership-list-requirement",
    "source-roster-assignment-result-references-requirement",
    "roster-capacity-rules-requirement",
    "duplicate-membership-rules-requirement",
    "division-reference-placeholders-requirement",
    "championship-adjacency-placeholders-requirement",
    "roster-state-status-requirement",
    "mutation-version-placeholder-requirement",
    "persistence-prerequisite",
    "gameplay-unlock-prerequisite"
  ]);

export const NEW_GM_MODE_ROSTER_STATE_CONTRACT_CAPABILITY_FLAGS: NewGMModeRosterStateContractCapabilityFlags =
  Object.freeze({
    rosterStateShapeDefined: true,
    canCreateOrMutateRosterState: false,
    canAssignRoster: false,
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

export function createNewGMModeRosterStateContractShell(): NewGMModeRosterStateContractShell {
  const blockedReasonCatalog = createNewGMModeRosterStateBlockedReasonCatalog();

  return Object.freeze({
    status: "diagnostics-only",
    newGMModeRosterStateContractId: "new-gm-mode-roster-state-contract-v0.1",
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
    blockedReasonIds: blockedReasonCatalog.blockedReasonIds,
    capabilityFlags: NEW_GM_MODE_ROSTER_STATE_CONTRACT_CAPABILITY_FLAGS
  });
}
