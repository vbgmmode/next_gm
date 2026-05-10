import {
  createNewGMModeDraftPickObjectBlockedReasonCatalog,
  type NewGMModeDraftPickObjectBlockedReasonCatalogId
} from "./newGMModeDraftPickObjectBlockedReasonCatalog.ts";

export type NewGMModeDraftPickObjectRequirementId =
  | "draft-pick-object-id-requirement"
  | "source-validation-result-object-reference-requirement"
  | "source-selection-intent-object-reference-requirement"
  | "candidate-object-reference-requirement"
  | "fixture-wrestler-reference-requirement"
  | "selecting-brand-reference-requirement"
  | "draft-round-pick-number-reference-requirement"
  | "draft-pick-status-requirement"
  | "creation-timestamp-placeholder-requirement"
  | "execution-prerequisite-requirement"
  | "roster-assignment-prerequisite-requirement"
  | "persistence-prerequisite-requirement";

export interface NewGMModeDraftPickObjectRequirement {
  readonly id: NewGMModeDraftPickObjectRequirementId;
  readonly slug: NewGMModeDraftPickObjectRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickObjectCapabilityFlags {
  readonly draftPickObjectShapeDefined: true;
  readonly canCreateDraftPickObject: false;
  readonly canCreateDraftPick: false;
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

export interface NewGMModeDraftPickObjectContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickObjectContractShellId: "new-gm-mode-draft-pick-object-contract-shell-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realObjectUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickObjectRequirement[];
  readonly blockedReasonIds: readonly NewGMModeDraftPickObjectBlockedReasonCatalogId[];
  readonly capabilityFlags: NewGMModeDraftPickObjectCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickObjectRequirementId[] =
  Object.freeze([
    "draft-pick-object-id-requirement",
    "source-validation-result-object-reference-requirement",
    "source-selection-intent-object-reference-requirement",
    "candidate-object-reference-requirement",
    "fixture-wrestler-reference-requirement",
    "selecting-brand-reference-requirement",
    "draft-round-pick-number-reference-requirement",
    "draft-pick-status-requirement",
    "creation-timestamp-placeholder-requirement",
    "execution-prerequisite-requirement",
    "roster-assignment-prerequisite-requirement",
    "persistence-prerequisite-requirement"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_OBJECT_CAPABILITY_FLAGS: NewGMModeDraftPickObjectCapabilityFlags =
  Object.freeze({
    draftPickObjectShapeDefined: true,
    canCreateDraftPickObject: false,
    canCreateDraftPick: false,
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

export function createNewGMModeDraftPickObjectContractShell(): NewGMModeDraftPickObjectContractShell {
  const blockedReasonCatalog =
    createNewGMModeDraftPickObjectBlockedReasonCatalog();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickObjectContractShellId:
      "new-gm-mode-draft-pick-object-contract-shell-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realObjectUnavailable: true,
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_OBJECT_CAPABILITY_FLAGS
  });
}
