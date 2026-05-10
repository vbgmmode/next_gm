import {
  type NewGMModeDraftPickValidationResultCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickValidationResultContractShell.ts";
import type { NewGMModeDraftPickValidationIssueCatalogId } from "./newGMModeDraftPickValidationIssueCatalog.ts";
import {
  createNewGMModeDraftPickValidationResultObjectValidator,
  type NewGMModeDraftPickValidationResultObjectValidationIssueId
} from "./newGMModeDraftPickValidationResultObjectValidator.ts";

export type NewGMModeDraftPickValidationResultObjectReadinessPhase =
  | "draft-pick-validation-result-object-valid-pick-creation-unavailable"
  | "draft-pick-validation-result-object-invalid";

export interface NewGMModeDraftPickValidationResultObjectReadinessSummaryInput {
  readonly validationResultObject?: unknown;
}

export interface NewGMModeDraftPickValidationResultObjectReadinessReferences {
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number | null;
  readonly draftPickNumber: number | null;
}

export interface NewGMModeDraftPickValidationResultObjectReadinessCapabilityFlags
  extends NewGMModeDraftPickValidationResultCapabilityFlags {
  readonly validationResultObjectAvailable: boolean;
}

export interface NewGMModeDraftPickValidationResultObjectReadinessSummary {
  readonly draftPickValidationResultObjectReadinessSummaryId: "new-gm-mode-draft-pick-validation-result-object-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly validationResultObjectAvailable: boolean;
  readonly validationResultObjectReadinessPhase: NewGMModeDraftPickValidationResultObjectReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-validation-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftPickValidationResultObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeDraftPickValidationResultObjectReadinessReferences;
  readonly preservedValidationStatus: string | null;
  readonly preservedIssueIds: readonly unknown[];
  readonly capabilityFlags: NewGMModeDraftPickValidationResultObjectReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickValidationResultObjectReadinessSummary(
  input: NewGMModeDraftPickValidationResultObjectReadinessSummaryInput = {}
): NewGMModeDraftPickValidationResultObjectReadinessSummary {
  const validator = createNewGMModeDraftPickValidationResultObjectValidator({
    validationResultObject: input.validationResultObject
  });
  const validationResultObjectAvailable = isRecord(input.validationResultObject);

  return Object.freeze({
    draftPickValidationResultObjectReadinessSummaryId:
      "new-gm-mode-draft-pick-validation-result-object-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    validationResultObjectAvailable,
    validationResultObjectReadinessPhase: validator.structurallyValid
      ? "draft-pick-validation-result-object-valid-pick-creation-unavailable"
      : "draft-pick-validation-result-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.validationResultObject),
    preservedValidationStatus: readValidationStatus(input.validationResultObject),
    preservedIssueIds: Object.freeze(readIssueIds(input.validationResultObject)),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS,
      validationResultObjectAvailable
    })
  });
}

function readInertReferences(
  validationResultObject: unknown
): NewGMModeDraftPickValidationResultObjectReadinessReferences {
  if (!isRecord(validationResultObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    sourceSelectionIntentObjectId: readNestedString(
      validationResultObject,
      "sourceSelectionIntentReference",
      "sourceSelectionIntentObjectId"
    ),
    candidateObjectId: readNestedString(
      validationResultObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      validationResultObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      validationResultObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      validationResultObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    draftRound: readNestedNumber(
      validationResultObject,
      "draftOrderReference",
      "draftRound"
    ),
    draftPickNumber: readNestedNumber(
      validationResultObject,
      "draftOrderReference",
      "draftPickNumber"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeDraftPickValidationResultObjectReadinessReferences =
  Object.freeze({
    sourceSelectionIntentObjectId: null,
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    draftRound: null,
    draftPickNumber: null
  });

function readValidationStatus(validationResultObject: unknown): string | null {
  if (
    isRecord(validationResultObject) &&
    typeof validationResultObject.validationStatus === "string"
  ) {
    return validationResultObject.validationStatus;
  }

  return null;
}

function readIssueIds(validationResultObject: unknown): readonly unknown[] {
  if (!isRecord(validationResultObject)) {
    return [];
  }

  const issueReferences = validationResultObject.issueReferences;

  if (!isRecord(issueReferences) || !Array.isArray(issueReferences.issueIds)) {
    return [];
  }

  return [...(issueReferences.issueIds as NewGMModeDraftPickValidationIssueCatalogId[])];
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
