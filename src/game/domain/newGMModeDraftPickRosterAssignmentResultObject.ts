import type { NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId } from "./newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts";

export type NewGMModeDraftPickRosterAssignmentResultObjectStatus =
  | "roster-assignment-result-created-mutation-unavailable"
  | "roster-assignment-result-blocked-assignment-unavailable"
  | "roster-assignment-created-roster-state-ready"
  | "roster-assignment-blocked";

export interface NewGMModeDraftPickRosterAssignmentResultObjectInput {
  readonly sourceExecutionResultObjectId: string;
  readonly sourceDraftPickObjectId: string;
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly selectingBrandId: string;
  readonly rosterSlotReference: string;
  readonly assignmentStatus: NewGMModeDraftPickRosterAssignmentResultObjectStatus;
  readonly blockedReasonIds: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[];
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags {
  readonly rosterAssignmentResultObjectAvailable: true;
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

export interface NewGMModeDraftPickRosterAssignmentResultObject {
  readonly rosterAssignmentResultObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly assignmentStatus: NewGMModeDraftPickRosterAssignmentResultObjectStatus;
  readonly sourceExecutionResultReference: {
    readonly sourceExecutionResultObjectId: string;
  };
  readonly sourceDraftPickReference: {
    readonly sourceDraftPickObjectId: string;
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
  readonly rosterSlotReference: {
    readonly rosterSlotReference: string;
    readonly placeholderOnly: true;
  };
  readonly blockedReasonReferences: {
    readonly blockedReasonIds: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[];
    readonly staticCatalogOnly: true;
    readonly evaluatedNow: false;
  };
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags;
}

export const NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS: NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags =
  Object.freeze({
    rosterAssignmentResultObjectAvailable: true,
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

export function createNewGMModeDraftPickRosterAssignmentResultObject(
  input: NewGMModeDraftPickRosterAssignmentResultObjectInput
): NewGMModeDraftPickRosterAssignmentResultObject {
  return Object.freeze({
    rosterAssignmentResultObjectId:
      createRosterAssignmentResultObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    assignmentStatus: input.assignmentStatus,
    sourceExecutionResultReference: Object.freeze({
      sourceExecutionResultObjectId: input.sourceExecutionResultObjectId
    }),
    sourceDraftPickReference: Object.freeze({
      sourceDraftPickObjectId: input.sourceDraftPickObjectId
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
    rosterSlotReference: Object.freeze({
      rosterSlotReference: input.rosterSlotReference,
      placeholderOnly: true
    }),
    blockedReasonReferences: Object.freeze({
      blockedReasonIds: Object.freeze([...input.blockedReasonIds]),
      staticCatalogOnly: true,
      evaluatedNow: false
    }),
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS
  });
}

function createRosterAssignmentResultObjectId(
  input: NewGMModeDraftPickRosterAssignmentResultObjectInput
): string {
  return [
    "new-gm-mode-draft-pick-roster-assignment-result",
    normalizeIdPart(input.sourceExecutionResultObjectId),
    normalizeIdPart(input.sourceDraftPickObjectId),
    normalizeIdPart(input.candidateObjectId),
    normalizeIdPart(input.sourceFixtureId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.selectingBrandId),
    normalizeIdPart(input.rosterSlotReference),
    normalizeIdPart(input.assignmentStatus),
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
