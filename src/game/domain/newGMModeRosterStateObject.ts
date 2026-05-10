import type { NewGMModeRosterStateBlockedReasonCatalogId } from "./newGMModeRosterStateBlockedReasonCatalog.ts";

export type NewGMModeRosterStateObjectStatus =
  | "roster-state-object-created-mutation-unavailable"
  | "roster-state-object-blocked-creation-unavailable"
  | "roster-state-created-draft-complete-gameplay-start-blocked"
  | "roster-state-creation-blocked";

export interface NewGMModeRosterStateObjectInput {
  readonly rosterStateIdSeedReference: string;
  readonly brandRosterReference: string;
  readonly assignedWrestlerMembershipReferences: readonly string[];
  readonly sourceRosterAssignmentResultObjectIds: readonly string[];
  readonly rosterStateStatus: NewGMModeRosterStateObjectStatus;
  readonly blockedReasonIds: readonly NewGMModeRosterStateBlockedReasonCatalogId[];
  readonly versionReference: string;
}

export interface NewGMModeRosterStateObjectCapabilityFlags {
  readonly rosterStateObjectAvailable: true;
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

export interface NewGMModeRosterStateObject {
  readonly rosterStateObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly rosterStateStatus: NewGMModeRosterStateObjectStatus;
  readonly rosterStateSeedReference: {
    readonly rosterStateIdSeedReference: string;
  };
  readonly brandRosterReference: {
    readonly brandRosterReference: string;
    readonly placeholderOnly: true;
  };
  readonly assignedWrestlerMembershipReferences: readonly string[];
  readonly sourceRosterAssignmentResultObjectIds: readonly string[];
  readonly versionReference: {
    readonly versionReference: string;
    readonly placeholderOnly: true;
  };
  readonly blockedReasonReferences: {
    readonly blockedReasonIds: readonly NewGMModeRosterStateBlockedReasonCatalogId[];
    readonly staticCatalogOnly: true;
    readonly evaluatedNow: false;
  };
  readonly capabilityFlags: NewGMModeRosterStateObjectCapabilityFlags;
}

export const NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS: NewGMModeRosterStateObjectCapabilityFlags =
  Object.freeze({
    rosterStateObjectAvailable: true,
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

export function createNewGMModeRosterStateObject(
  input: NewGMModeRosterStateObjectInput
): NewGMModeRosterStateObject {
  return Object.freeze({
    rosterStateObjectId: createRosterStateObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    rosterStateStatus: input.rosterStateStatus,
    rosterStateSeedReference: Object.freeze({
      rosterStateIdSeedReference: input.rosterStateIdSeedReference
    }),
    brandRosterReference: Object.freeze({
      brandRosterReference: input.brandRosterReference,
      placeholderOnly: true
    }),
    assignedWrestlerMembershipReferences: Object.freeze([
      ...input.assignedWrestlerMembershipReferences
    ]),
    sourceRosterAssignmentResultObjectIds: Object.freeze([
      ...input.sourceRosterAssignmentResultObjectIds
    ]),
    versionReference: Object.freeze({
      versionReference: input.versionReference,
      placeholderOnly: true
    }),
    blockedReasonReferences: Object.freeze({
      blockedReasonIds: Object.freeze([...input.blockedReasonIds]),
      staticCatalogOnly: true,
      evaluatedNow: false
    }),
    capabilityFlags: NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS
  });
}

function createRosterStateObjectId(
  input: NewGMModeRosterStateObjectInput
): string {
  return [
    "new-gm-mode-roster-state-object",
    normalizeIdPart(input.rosterStateIdSeedReference),
    normalizeIdPart(input.brandRosterReference),
    createArrayIdPart(
      "membership",
      input.assignedWrestlerMembershipReferences
    ),
    createArrayIdPart(
      "assignment-results",
      input.sourceRosterAssignmentResultObjectIds
    ),
    normalizeIdPart(input.rosterStateStatus),
    createBlockedReasonIdPart(input.blockedReasonIds),
    normalizeIdPart(input.versionReference)
  ].join(":");
}

function createArrayIdPart(label: string, values: readonly string[]): string {
  if (values.length === 0) {
    return `${label}-none`;
  }

  return `${label}-${values.map((value) => normalizeIdPart(value)).join("-")}`;
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
