import type { NewGMModeDraftPickObjectBlockedReasonCatalogId } from "./newGMModeDraftPickObjectBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickObjectCapabilityFlags,
  type NewGMModeDraftPickObjectStatus,
  NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS
} from "./newGMModeDraftPickObject.ts";
import {
  createNewGMModeDraftPickObjectValidator,
  type NewGMModeDraftPickObjectValidationIssueId
} from "./newGMModeDraftPickObjectValidator.ts";

export type NewGMModeDraftPickObjectReadinessPhase =
  | "draft-pick-object-valid-execution-unavailable"
  | "draft-pick-object-invalid";

export interface NewGMModeDraftPickObjectReadinessSummaryInput {
  readonly draftPickObject: unknown;
}

export interface NewGMModeDraftPickObjectReadinessReferences {
  readonly sourceValidationResultObjectId: string | null;
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number | null;
  readonly draftPickNumber: number | null;
}

export interface NewGMModeDraftPickObjectReadinessCapabilityFlags
  extends NewGMModeDraftPickObjectCapabilityFlags {
  readonly draftPickObjectAvailable: boolean;
}

export interface NewGMModeDraftPickObjectReadinessSummary {
  readonly draftPickObjectReadinessSummaryId: "new-gm-mode-draft-pick-object-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly draftPickObjectAvailable: boolean;
  readonly draftPickObjectReadinessPhase: NewGMModeDraftPickObjectReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftPickObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeDraftPickObjectReadinessReferences;
  readonly preservedDraftPickStatus: NewGMModeDraftPickObjectStatus | string | null;
  readonly preservedBlockedReasonIds: readonly unknown[];
  readonly capabilityFlags: NewGMModeDraftPickObjectReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickObjectReadinessSummary(
  input: NewGMModeDraftPickObjectReadinessSummaryInput
): NewGMModeDraftPickObjectReadinessSummary {
  const validator = createNewGMModeDraftPickObjectValidator({
    draftPickObject: input.draftPickObject
  });
  const draftPickObjectAvailable = isRecord(input.draftPickObject);

  return Object.freeze({
    draftPickObjectReadinessSummaryId:
      "new-gm-mode-draft-pick-object-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    draftPickObjectAvailable,
    draftPickObjectReadinessPhase: validator.structurallyValid
      ? "draft-pick-object-valid-execution-unavailable"
      : "draft-pick-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.draftPickObject),
    preservedDraftPickStatus: readDraftPickStatus(input.draftPickObject),
    preservedBlockedReasonIds: Object.freeze(
      readBlockedReasonIds(input.draftPickObject)
    ),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS,
      draftPickObjectAvailable
    })
  });
}

function readInertReferences(
  draftPickObject: unknown
): NewGMModeDraftPickObjectReadinessReferences {
  if (!isRecord(draftPickObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    sourceValidationResultObjectId: readNestedString(
      draftPickObject,
      "sourceValidationResultReference",
      "sourceValidationResultObjectId"
    ),
    sourceSelectionIntentObjectId: readNestedString(
      draftPickObject,
      "sourceSelectionIntentReference",
      "sourceSelectionIntentObjectId"
    ),
    candidateObjectId: readNestedString(
      draftPickObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      draftPickObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      draftPickObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      draftPickObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    draftRound: readNestedNumber(
      draftPickObject,
      "draftOrderReference",
      "draftRound"
    ),
    draftPickNumber: readNestedNumber(
      draftPickObject,
      "draftOrderReference",
      "draftPickNumber"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeDraftPickObjectReadinessReferences =
  Object.freeze({
    sourceValidationResultObjectId: null,
    sourceSelectionIntentObjectId: null,
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    draftRound: null,
    draftPickNumber: null
  });

function readDraftPickStatus(draftPickObject: unknown): string | null {
  if (isRecord(draftPickObject) && typeof draftPickObject.draftPickStatus === "string") {
    return draftPickObject.draftPickStatus;
  }

  return null;
}

function readBlockedReasonIds(draftPickObject: unknown): readonly unknown[] {
  if (!isRecord(draftPickObject)) {
    return [];
  }

  const blockedReasonReferences = draftPickObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    return [];
  }

  return [
    ...(blockedReasonReferences.blockedReasonIds as NewGMModeDraftPickObjectBlockedReasonCatalogId[])
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

function readNestedNumber(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): number | null {
  const parent = source[parentKey];

  if (!isRecord(parent)) {
    return null;
  }

  const value = parent[childKey];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
