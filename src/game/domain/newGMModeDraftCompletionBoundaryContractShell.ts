import {
  createNewGMModeDraftCompletionBlockedReasonCatalog,
  type NewGMModeDraftCompletionBlockedReasonCatalogId
} from "./newGMModeDraftCompletionBlockedReasonCatalog.ts";

export type NewGMModeDraftCompletionBoundaryRequirementId =
  | "valid-roster-state-object-readiness-prerequisite"
  | "roster-completeness-prerequisite"
  | "brand-roster-minimum-prerequisite"
  | "duplicate-membership-prevention-prerequisite"
  | "championship-division-setup-prerequisite"
  | "save-identity-prerequisite"
  | "persistence-prerequisite"
  | "gameplay-start-prerequisite"
  | "week-one-initialization-prerequisite";

export interface NewGMModeDraftCompletionBoundaryRequirement {
  readonly id: NewGMModeDraftCompletionBoundaryRequirementId;
  readonly slug: NewGMModeDraftCompletionBoundaryRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftCompletionBoundaryCapabilityFlags {
  readonly draftCompletionShapeDefined: true;
  readonly rosterStateObjectReadinessConsumable: true;
  readonly canCompleteDraft: false;
  readonly canStartGameplay: false;
  readonly canInitializeWeekOne: false;
  readonly canUnlockWeekOne: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canMutateState: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftCompletionBoundaryContractShell {
  readonly status: "diagnostics-only";
  readonly draftCompletionBoundaryContractId: "new-gm-mode-draft-completion-boundary-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realDraftCompletionUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeDraftCompletionBoundaryRequirement[];
  readonly blockedReasonIds: readonly NewGMModeDraftCompletionBlockedReasonCatalogId[];
  readonly capabilityFlags: NewGMModeDraftCompletionBoundaryCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftCompletionBoundaryRequirementId[] =
  Object.freeze([
    "valid-roster-state-object-readiness-prerequisite",
    "roster-completeness-prerequisite",
    "brand-roster-minimum-prerequisite",
    "duplicate-membership-prevention-prerequisite",
    "championship-division-setup-prerequisite",
    "save-identity-prerequisite",
    "persistence-prerequisite",
    "gameplay-start-prerequisite",
    "week-one-initialization-prerequisite"
  ]);

export const NEW_GM_MODE_DRAFT_COMPLETION_BOUNDARY_CAPABILITY_FLAGS: NewGMModeDraftCompletionBoundaryCapabilityFlags =
  Object.freeze({
    draftCompletionShapeDefined: true,
    rosterStateObjectReadinessConsumable: true,
    canCompleteDraft: false,
    canStartGameplay: false,
    canInitializeWeekOne: false,
    canUnlockWeekOne: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canMutateState: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftCompletionBoundaryContractShell(): NewGMModeDraftCompletionBoundaryContractShell {
  const blockedReasonCatalog =
    createNewGMModeDraftCompletionBlockedReasonCatalog();

  return Object.freeze({
    status: "diagnostics-only",
    draftCompletionBoundaryContractId:
      "new-gm-mode-draft-completion-boundary-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realDraftCompletionUnavailable: true,
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
    capabilityFlags: NEW_GM_MODE_DRAFT_COMPLETION_BOUNDARY_CAPABILITY_FLAGS
  });
}
