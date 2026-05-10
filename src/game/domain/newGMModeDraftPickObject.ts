import type { NewGMModeDraftPickObjectBlockedReasonCatalogId } from "./newGMModeDraftPickObjectBlockedReasonCatalog.ts";

export type NewGMModeDraftPickObjectStatus =
  | "draft-pick-object-created-execution-unavailable"
  | "draft-pick-object-blocked-creation-unavailable"
  | "draft-pick-created-execution-ready"
  | "draft-pick-creation-blocked";

export interface NewGMModeDraftPickObjectInput {
  readonly sourceValidationResultObjectId: string;
  readonly sourceSelectionIntentObjectId: string;
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly selectingBrandId: string;
  readonly draftRound: number;
  readonly draftPickNumber: number;
  readonly draftPickStatus: NewGMModeDraftPickObjectStatus;
  readonly blockedReasonIds: readonly NewGMModeDraftPickObjectBlockedReasonCatalogId[];
}

export interface NewGMModeDraftPickObjectCapabilityFlags {
  readonly draftPickObjectAvailable: true;
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

export interface NewGMModeDraftPickObject {
  readonly draftPickObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly draftPickStatus: NewGMModeDraftPickObjectStatus;
  readonly sourceValidationResultReference: {
    readonly sourceValidationResultObjectId: string;
  };
  readonly sourceSelectionIntentReference: {
    readonly sourceSelectionIntentObjectId: string;
  };
  readonly sourceCandidateReference: {
    readonly candidateObjectId: string;
  };
  readonly sourceFixtureReference: {
    readonly sourceFixtureId: string;
  };
  readonly sourceWrestlerReference: {
    readonly sourceWrestlerId: string;
  };
  readonly selectingBrandReference: {
    readonly selectingBrandId: string;
    readonly placeholderOnly: true;
  };
  readonly draftOrderReference: {
    readonly draftRound: number;
    readonly draftPickNumber: number;
    readonly placeholderOnly: true;
  };
  readonly blockedReasonReferences: {
    readonly blockedReasonIds: readonly NewGMModeDraftPickObjectBlockedReasonCatalogId[];
    readonly staticCatalogOnly: true;
    readonly evaluatedNow: false;
  };
  readonly capabilityFlags: NewGMModeDraftPickObjectCapabilityFlags;
}

export const NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS: NewGMModeDraftPickObjectCapabilityFlags =
  Object.freeze({
    draftPickObjectAvailable: true,
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

export function createNewGMModeDraftPickObject(
  input: NewGMModeDraftPickObjectInput
): NewGMModeDraftPickObject {
  return Object.freeze({
    draftPickObjectId: createDraftPickObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    draftPickStatus: input.draftPickStatus,
    sourceValidationResultReference: Object.freeze({
      sourceValidationResultObjectId: input.sourceValidationResultObjectId
    }),
    sourceSelectionIntentReference: Object.freeze({
      sourceSelectionIntentObjectId: input.sourceSelectionIntentObjectId
    }),
    sourceCandidateReference: Object.freeze({
      candidateObjectId: input.candidateObjectId
    }),
    sourceFixtureReference: Object.freeze({
      sourceFixtureId: input.sourceFixtureId
    }),
    sourceWrestlerReference: Object.freeze({
      sourceWrestlerId: input.sourceWrestlerId
    }),
    selectingBrandReference: Object.freeze({
      selectingBrandId: input.selectingBrandId,
      placeholderOnly: true
    }),
    draftOrderReference: Object.freeze({
      draftRound: input.draftRound,
      draftPickNumber: input.draftPickNumber,
      placeholderOnly: true
    }),
    blockedReasonReferences: Object.freeze({
      blockedReasonIds: Object.freeze([...input.blockedReasonIds]),
      staticCatalogOnly: true,
      evaluatedNow: false
    }),
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS
  });
}

function createDraftPickObjectId(input: NewGMModeDraftPickObjectInput): string {
  return [
    "new-gm-mode-draft-pick-object",
    normalizeIdPart(input.sourceValidationResultObjectId),
    normalizeIdPart(input.sourceSelectionIntentObjectId),
    normalizeIdPart(input.candidateObjectId),
    normalizeIdPart(input.sourceFixtureId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.selectingBrandId),
    `round-${normalizeIdPart(String(input.draftRound))}`,
    `pick-${normalizeIdPart(String(input.draftPickNumber))}`,
    normalizeIdPart(input.draftPickStatus),
    createBlockedReasonIdPart(input.blockedReasonIds)
  ].join(":");
}

function createBlockedReasonIdPart(
  blockedReasonIds: readonly string[]
): string {
  if (blockedReasonIds.length === 0) {
    return "blocked-reasons-none";
  }

  return `blocked-reasons-${blockedReasonIds
    .map((id) => normalizeIdPart(id))
    .join("-")}`;
}

function normalizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "empty";
}
