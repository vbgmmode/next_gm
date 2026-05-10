import {
  createNewGMModeDraftPickObject,
  type NewGMModeDraftPickObject
} from "./newGMModeDraftPickObject.ts";
import type { NewGMModeDraftPickObjectBlockedReasonCatalogId } from "./newGMModeDraftPickObjectBlockedReasonCatalog.ts";
import { createNewGMModeDraftPickValidationResultObjectValidator } from "./newGMModeDraftPickValidationResultObjectValidator.ts";

export interface NewGMModeDraftPickCreationServiceInput {
  readonly validationResultObject: unknown;
}

export function createNewGMModeDraftPickCreationService(
  input: NewGMModeDraftPickCreationServiceInput
): NewGMModeDraftPickObject {
  const validationResultObject = input.validationResultObject;
  const validator = createNewGMModeDraftPickValidationResultObjectValidator({
    validationResultObject
  });
  const refs = readValidationResultReferences(validationResultObject);
  const blockedReasonIds: NewGMModeDraftPickObjectBlockedReasonCatalogId[] = [];

  if (!validator.structurallyValid) {
    blockedReasonIds.push("validation-result-object-invalid");
  } else if (refs.validationStatus !== "draft-pick-validation-approved") {
    blockedReasonIds.push("validation-result-status-not-approved");
  }

  return createNewGMModeDraftPickObject({
    sourceValidationResultObjectId:
      refs.sourceValidationResultObjectId ||
      "missing-validation-result-object-id",
    sourceSelectionIntentObjectId:
      refs.sourceSelectionIntentObjectId ||
      "missing-selection-intent-object-id",
    candidateObjectId: refs.candidateObjectId || "missing-candidate-object-id",
    sourceFixtureId: refs.sourceFixtureId || "missing-source-fixture-id",
    sourceWrestlerId: refs.sourceWrestlerId || "missing-source-wrestler-id",
    selectingBrandId: refs.selectingBrandId || "missing-selecting-brand-id",
    draftRound: Number.isFinite(refs.draftRound) ? refs.draftRound : 0,
    draftPickNumber: Number.isFinite(refs.draftPickNumber)
      ? refs.draftPickNumber
      : 0,
    draftPickStatus:
      blockedReasonIds.length === 0
        ? "draft-pick-created-execution-ready"
        : "draft-pick-creation-blocked",
    blockedReasonIds
  });
}

interface ValidationResultReferences {
  readonly sourceValidationResultObjectId: string | null;
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number;
  readonly draftPickNumber: number;
  readonly validationStatus: string | null;
}

function readValidationResultReferences(
  validationResultObject: unknown
): ValidationResultReferences {
  if (!isRecord(validationResultObject)) {
    return emptyReferences();
  }

  return {
    sourceValidationResultObjectId: readString(
      validationResultObject,
      "draftPickValidationResultObjectId"
    ),
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
    ),
    validationStatus: readString(validationResultObject, "validationStatus")
  };
}

function emptyReferences(): ValidationResultReferences {
  return {
    sourceValidationResultObjectId: null,
    sourceSelectionIntentObjectId: null,
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    draftRound: Number.NaN,
    draftPickNumber: Number.NaN,
    validationStatus: null
  };
}

function readNestedString(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): string | null {
  const parent = source[parentKey];

  return isRecord(parent) ? readString(parent, childKey) : null;
}

function readNestedNumber(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): number {
  const parent = source[parentKey];
  const value = isRecord(parent) ? parent[childKey] : undefined;

  return typeof value === "number" ? value : Number.NaN;
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
