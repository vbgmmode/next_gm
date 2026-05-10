import type { NewGMModeDraftPickExecutionBlockedReasonCatalogId } from "./newGMModeDraftPickExecutionBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickExecutionResultObjectCapabilityFlags,
  type NewGMModeDraftPickExecutionResultObjectStatus,
  NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickExecutionResultObject.ts";
import {
  createNewGMModeDraftPickExecutionResultObjectValidator,
  type NewGMModeDraftPickExecutionResultObjectValidationIssueId
} from "./newGMModeDraftPickExecutionResultObjectValidator.ts";

export type NewGMModeDraftPickExecutionResultObjectReadinessPhase =
  | "draft-pick-execution-result-object-valid-mutation-unavailable"
  | "draft-pick-execution-result-object-invalid";

export interface NewGMModeDraftPickExecutionResultObjectReadinessSummaryInput {
  readonly executionResultObject: unknown;
}

export interface NewGMModeDraftPickExecutionResultObjectReadinessReferences {
  readonly sourceDraftPickObjectId: string | null;
  readonly sourceValidationResultObjectId: string | null;
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number | null;
  readonly draftPickNumber: number | null;
}

export interface NewGMModeDraftPickExecutionResultObjectReadinessCapabilityFlags
  extends NewGMModeDraftPickExecutionResultObjectCapabilityFlags {
  readonly executionResultObjectAvailable: boolean;
}

export interface NewGMModeDraftPickExecutionResultObjectReadinessSummary {
  readonly draftPickExecutionResultObjectReadinessSummaryId: "new-gm-mode-draft-pick-execution-result-object-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly executionResultObjectAvailable: boolean;
  readonly executionResultObjectReadinessPhase: NewGMModeDraftPickExecutionResultObjectReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-execution-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftPickExecutionResultObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeDraftPickExecutionResultObjectReadinessReferences;
  readonly preservedExecutionStatus:
    | NewGMModeDraftPickExecutionResultObjectStatus
    | string
    | null;
  readonly preservedBlockedReasonIds: readonly unknown[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionResultObjectReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickExecutionResultObjectReadinessSummary(
  input: NewGMModeDraftPickExecutionResultObjectReadinessSummaryInput
): NewGMModeDraftPickExecutionResultObjectReadinessSummary {
  const validator = createNewGMModeDraftPickExecutionResultObjectValidator({
    executionResultObject: input.executionResultObject
  });
  const executionResultObjectAvailable = isRecord(input.executionResultObject);

  return Object.freeze({
    draftPickExecutionResultObjectReadinessSummaryId:
      "new-gm-mode-draft-pick-execution-result-object-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    executionResultObjectAvailable,
    executionResultObjectReadinessPhase: validator.structurallyValid
      ? "draft-pick-execution-result-object-valid-mutation-unavailable"
      : "draft-pick-execution-result-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.executionResultObject),
    preservedExecutionStatus: readExecutionStatus(input.executionResultObject),
    preservedBlockedReasonIds: Object.freeze(
      readBlockedReasonIds(input.executionResultObject)
    ),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS,
      executionResultObjectAvailable
    })
  });
}

function readInertReferences(
  executionResultObject: unknown
): NewGMModeDraftPickExecutionResultObjectReadinessReferences {
  if (!isRecord(executionResultObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    sourceDraftPickObjectId: readNestedString(
      executionResultObject,
      "sourceDraftPickReference",
      "sourceDraftPickObjectId"
    ),
    sourceValidationResultObjectId: readNestedString(
      executionResultObject,
      "sourceValidationResultReference",
      "sourceValidationResultObjectId"
    ),
    sourceSelectionIntentObjectId: readNestedString(
      executionResultObject,
      "sourceSelectionIntentReference",
      "sourceSelectionIntentObjectId"
    ),
    candidateObjectId: readNestedString(
      executionResultObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      executionResultObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      executionResultObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      executionResultObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    draftRound: readNestedNumber(
      executionResultObject,
      "draftOrderReference",
      "draftRound"
    ),
    draftPickNumber: readNestedNumber(
      executionResultObject,
      "draftOrderReference",
      "draftPickNumber"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeDraftPickExecutionResultObjectReadinessReferences =
  Object.freeze({
    sourceDraftPickObjectId: null,
    sourceValidationResultObjectId: null,
    sourceSelectionIntentObjectId: null,
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    draftRound: null,
    draftPickNumber: null
  });

function readExecutionStatus(executionResultObject: unknown): string | null {
  if (
    isRecord(executionResultObject) &&
    typeof executionResultObject.executionStatus === "string"
  ) {
    return executionResultObject.executionStatus;
  }

  return null;
}

function readBlockedReasonIds(executionResultObject: unknown): readonly unknown[] {
  if (!isRecord(executionResultObject)) {
    return [];
  }

  const blockedReasonReferences = executionResultObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    return [];
  }

  return [
    ...(blockedReasonReferences.blockedReasonIds as NewGMModeDraftPickExecutionBlockedReasonCatalogId[])
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
