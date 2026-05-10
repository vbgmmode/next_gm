import type { NewGMModeRosterStateBlockedReasonCatalogId } from "./newGMModeRosterStateBlockedReasonCatalog.ts";
import {
  type NewGMModeRosterStateObjectCapabilityFlags,
  type NewGMModeRosterStateObjectStatus,
  NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeRosterStateObject.ts";
import {
  createNewGMModeRosterStateObjectValidator,
  type NewGMModeRosterStateObjectValidationIssueId
} from "./newGMModeRosterStateObjectValidator.ts";

export type NewGMModeRosterStateObjectReadinessPhase =
  | "roster-state-object-valid-mutation-unavailable"
  | "roster-state-object-invalid";

export interface NewGMModeRosterStateObjectReadinessSummaryInput {
  readonly rosterStateObject: unknown;
}

export interface NewGMModeRosterStateObjectReadinessReferences {
  readonly rosterStateIdSeedReference: string | null;
  readonly brandRosterReference: string | null;
  readonly assignedWrestlerMembershipReferences: readonly unknown[];
  readonly sourceRosterAssignmentResultObjectIds: readonly unknown[];
  readonly versionReference: string | null;
}

export interface NewGMModeRosterStateObjectReadinessCapabilityFlags
  extends NewGMModeRosterStateObjectCapabilityFlags {
  readonly rosterStateObjectAvailable: boolean;
}

export interface NewGMModeRosterStateObjectReadinessSummary {
  readonly rosterStateObjectReadinessSummaryId: "new-gm-mode-roster-state-object-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly rosterStateObjectAvailable: boolean;
  readonly rosterStateObjectReadinessPhase: NewGMModeRosterStateObjectReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-roster-state-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeRosterStateObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeRosterStateObjectReadinessReferences;
  readonly preservedRosterStateStatus:
    | NewGMModeRosterStateObjectStatus
    | string
    | null;
  readonly preservedBlockedReasonIds: readonly unknown[];
  readonly capabilityFlags: NewGMModeRosterStateObjectReadinessCapabilityFlags;
}

export function createNewGMModeRosterStateObjectReadinessSummary(
  input: NewGMModeRosterStateObjectReadinessSummaryInput
): NewGMModeRosterStateObjectReadinessSummary {
  const validator = createNewGMModeRosterStateObjectValidator({
    rosterStateObject: input.rosterStateObject
  });
  const rosterStateObjectAvailable = isRecord(input.rosterStateObject);

  return Object.freeze({
    rosterStateObjectReadinessSummaryId:
      "new-gm-mode-roster-state-object-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    rosterStateObjectAvailable,
    rosterStateObjectReadinessPhase: validator.structurallyValid
      ? "roster-state-object-valid-mutation-unavailable"
      : "roster-state-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.rosterStateObject),
    preservedRosterStateStatus: readRosterStateStatus(input.rosterStateObject),
    preservedBlockedReasonIds: Object.freeze(
      readBlockedReasonIds(input.rosterStateObject)
    ),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS,
      rosterStateObjectAvailable
    })
  });
}

function readInertReferences(
  rosterStateObject: unknown
): NewGMModeRosterStateObjectReadinessReferences {
  if (!isRecord(rosterStateObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    rosterStateIdSeedReference: readNestedString(
      rosterStateObject,
      "rosterStateSeedReference",
      "rosterStateIdSeedReference"
    ),
    brandRosterReference: readNestedString(
      rosterStateObject,
      "brandRosterReference",
      "brandRosterReference"
    ),
    assignedWrestlerMembershipReferences: Object.freeze(
      Array.isArray(rosterStateObject.assignedWrestlerMembershipReferences)
        ? [...rosterStateObject.assignedWrestlerMembershipReferences]
        : []
    ),
    sourceRosterAssignmentResultObjectIds: Object.freeze(
      Array.isArray(rosterStateObject.sourceRosterAssignmentResultObjectIds)
        ? [...rosterStateObject.sourceRosterAssignmentResultObjectIds]
        : []
    ),
    versionReference: readNestedString(
      rosterStateObject,
      "versionReference",
      "versionReference"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeRosterStateObjectReadinessReferences =
  Object.freeze({
    rosterStateIdSeedReference: null,
    brandRosterReference: null,
    assignedWrestlerMembershipReferences: Object.freeze([]),
    sourceRosterAssignmentResultObjectIds: Object.freeze([]),
    versionReference: null
  });

function readRosterStateStatus(rosterStateObject: unknown): string | null {
  if (
    isRecord(rosterStateObject) &&
    typeof rosterStateObject.rosterStateStatus === "string"
  ) {
    return rosterStateObject.rosterStateStatus;
  }

  return null;
}

function readBlockedReasonIds(rosterStateObject: unknown): readonly unknown[] {
  if (!isRecord(rosterStateObject)) {
    return [];
  }

  const blockedReasonReferences = rosterStateObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    return [];
  }

  return [
    ...(blockedReasonReferences.blockedReasonIds as NewGMModeRosterStateBlockedReasonCatalogId[])
  ];
}

function readNestedString(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): string | null {
  const parent = source[parentKey];

  if (!isRecord(parent)) {
    return null;
  }

  const value = parent[childKey];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
