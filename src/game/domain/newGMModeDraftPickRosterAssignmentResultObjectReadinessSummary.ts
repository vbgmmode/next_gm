import type { NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId } from "./newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags,
  type NewGMModeDraftPickRosterAssignmentResultObjectStatus,
  NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickRosterAssignmentResultObject.ts";
import {
  createNewGMModeDraftPickRosterAssignmentResultObjectValidator,
  type NewGMModeDraftPickRosterAssignmentResultObjectValidationIssueId
} from "./newGMModeDraftPickRosterAssignmentResultObjectValidator.ts";

export type NewGMModeDraftPickRosterAssignmentResultObjectReadinessPhase =
  | "roster-assignment-result-object-valid-roster-state-unavailable"
  | "roster-assignment-result-object-invalid";

export interface NewGMModeDraftPickRosterAssignmentResultObjectReadinessSummaryInput {
  readonly rosterAssignmentResultObject: unknown;
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectReadinessReferences {
  readonly sourceExecutionResultObjectId: string | null;
  readonly sourceDraftPickObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly rosterSlotReference: string | null;
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectReadinessCapabilityFlags
  extends NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags {
  readonly rosterAssignmentResultObjectAvailable: boolean;
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary {
  readonly draftPickRosterAssignmentResultObjectReadinessSummaryId: "new-gm-mode-draft-pick-roster-assignment-result-object-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentResultObjectAvailable: boolean;
  readonly rosterAssignmentResultObjectReadinessPhase: NewGMModeDraftPickRosterAssignmentResultObjectReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-roster-assignment-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftPickRosterAssignmentResultObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeDraftPickRosterAssignmentResultObjectReadinessReferences;
  readonly preservedAssignmentStatus:
    | NewGMModeDraftPickRosterAssignmentResultObjectStatus
    | string
    | null;
  readonly preservedBlockedReasonIds: readonly unknown[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentResultObjectReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary(
  input: NewGMModeDraftPickRosterAssignmentResultObjectReadinessSummaryInput
): NewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary {
  const validator =
    createNewGMModeDraftPickRosterAssignmentResultObjectValidator({
      rosterAssignmentResultObject: input.rosterAssignmentResultObject
    });
  const rosterAssignmentResultObjectAvailable = isRecord(
    input.rosterAssignmentResultObject
  );

  return Object.freeze({
    draftPickRosterAssignmentResultObjectReadinessSummaryId:
      "new-gm-mode-draft-pick-roster-assignment-result-object-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    rosterAssignmentResultObjectAvailable,
    rosterAssignmentResultObjectReadinessPhase: validator.structurallyValid
      ? "roster-assignment-result-object-valid-roster-state-unavailable"
      : "roster-assignment-result-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.rosterAssignmentResultObject),
    preservedAssignmentStatus: readAssignmentStatus(
      input.rosterAssignmentResultObject
    ),
    preservedBlockedReasonIds: Object.freeze(
      readBlockedReasonIds(input.rosterAssignmentResultObject)
    ),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS,
      rosterAssignmentResultObjectAvailable
    })
  });
}

function readInertReferences(
  rosterAssignmentResultObject: unknown
): NewGMModeDraftPickRosterAssignmentResultObjectReadinessReferences {
  if (!isRecord(rosterAssignmentResultObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    sourceExecutionResultObjectId: readNestedString(
      rosterAssignmentResultObject,
      "sourceExecutionResultReference",
      "sourceExecutionResultObjectId"
    ),
    sourceDraftPickObjectId: readNestedString(
      rosterAssignmentResultObject,
      "sourceDraftPickReference",
      "sourceDraftPickObjectId"
    ),
    candidateObjectId: readNestedString(
      rosterAssignmentResultObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      rosterAssignmentResultObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      rosterAssignmentResultObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      rosterAssignmentResultObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    rosterSlotReference: readNestedString(
      rosterAssignmentResultObject,
      "rosterSlotReference",
      "rosterSlotReference"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeDraftPickRosterAssignmentResultObjectReadinessReferences =
  Object.freeze({
    sourceExecutionResultObjectId: null,
    sourceDraftPickObjectId: null,
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    rosterSlotReference: null
  });

function readAssignmentStatus(
  rosterAssignmentResultObject: unknown
): string | null {
  if (
    isRecord(rosterAssignmentResultObject) &&
    typeof rosterAssignmentResultObject.assignmentStatus === "string"
  ) {
    return rosterAssignmentResultObject.assignmentStatus;
  }

  return null;
}

function readBlockedReasonIds(
  rosterAssignmentResultObject: unknown
): readonly unknown[] {
  if (!isRecord(rosterAssignmentResultObject)) {
    return [];
  }

  const blockedReasonReferences =
    rosterAssignmentResultObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    return [];
  }

  return [
    ...(blockedReasonReferences.blockedReasonIds as NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[])
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
