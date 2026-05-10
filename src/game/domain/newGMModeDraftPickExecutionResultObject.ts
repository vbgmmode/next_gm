import type { NewGMModeDraftPickExecutionBlockedReasonCatalogId } from "./newGMModeDraftPickExecutionBlockedReasonCatalog.ts";

export type NewGMModeDraftPickExecutionResultObjectStatus =
  | "draft-pick-execution-result-created-mutation-unavailable"
  | "draft-pick-execution-result-blocked-execution-unavailable"
  | "draft-pick-executed-roster-assignment-ready"
  | "draft-pick-execution-blocked";

export interface NewGMModeDraftPickExecutionResultObjectInput {
  readonly sourceDraftPickObjectId: string;
  readonly sourceValidationResultObjectId: string;
  readonly sourceSelectionIntentObjectId: string;
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly selectingBrandId: string;
  readonly draftRound: number;
  readonly draftPickNumber: number;
  readonly executionStatus: NewGMModeDraftPickExecutionResultObjectStatus;
  readonly blockedReasonIds: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogId[];
}

export interface NewGMModeDraftPickExecutionResultObjectCapabilityFlags {
  readonly executionResultObjectAvailable: true;
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

export interface NewGMModeDraftPickExecutionResultObject {
  readonly draftPickExecutionResultObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly executionStatus: NewGMModeDraftPickExecutionResultObjectStatus;
  readonly sourceDraftPickReference: {
    readonly sourceDraftPickObjectId: string;
  };
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
    readonly blockedReasonIds: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogId[];
    readonly staticCatalogOnly: true;
    readonly evaluatedNow: false;
  };
  readonly capabilityFlags: NewGMModeDraftPickExecutionResultObjectCapabilityFlags;
}

export const NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS: NewGMModeDraftPickExecutionResultObjectCapabilityFlags =
  Object.freeze({
    executionResultObjectAvailable: true,
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

export function createNewGMModeDraftPickExecutionResultObject(
  input: NewGMModeDraftPickExecutionResultObjectInput
): NewGMModeDraftPickExecutionResultObject {
  return Object.freeze({
    draftPickExecutionResultObjectId:
      createDraftPickExecutionResultObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    executionStatus: input.executionStatus,
    sourceDraftPickReference: Object.freeze({
      sourceDraftPickObjectId: input.sourceDraftPickObjectId
    }),
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
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS
  });
}

function createDraftPickExecutionResultObjectId(
  input: NewGMModeDraftPickExecutionResultObjectInput
): string {
  return [
    "new-gm-mode-draft-pick-execution-result",
    normalizeIdPart(input.sourceDraftPickObjectId),
    normalizeIdPart(input.sourceValidationResultObjectId),
    normalizeIdPart(input.sourceSelectionIntentObjectId),
    normalizeIdPart(input.candidateObjectId),
    normalizeIdPart(input.sourceFixtureId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.selectingBrandId),
    `round-${normalizeIdPart(String(input.draftRound))}`,
    `pick-${normalizeIdPart(String(input.draftPickNumber))}`,
    normalizeIdPart(input.executionStatus),
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
