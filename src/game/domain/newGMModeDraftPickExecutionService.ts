import type { NewGMModeDraftPickExecutionBlockedReasonCatalogId } from "./newGMModeDraftPickExecutionBlockedReasonCatalog.ts";
import {
  createNewGMModeDraftPickExecutionResultObject,
  type NewGMModeDraftPickExecutionResultObject
} from "./newGMModeDraftPickExecutionResultObject.ts";
import { createNewGMModeDraftPickObjectValidator } from "./newGMModeDraftPickObjectValidator.ts";

export interface NewGMModeDraftPickExecutionServiceInput {
  readonly draftPickObject: unknown;
}

export function createNewGMModeDraftPickExecutionService(
  input: NewGMModeDraftPickExecutionServiceInput
): NewGMModeDraftPickExecutionResultObject {
  const draftPickObject = input.draftPickObject;
  const validator = createNewGMModeDraftPickObjectValidator({ draftPickObject });
  const refs = readDraftPickObjectReferences(draftPickObject);
  const blockedReasonIds: NewGMModeDraftPickExecutionBlockedReasonCatalogId[] =
    [];

  if (!validator.structurallyValid) {
    blockedReasonIds.push("draft-pick-object-invalid");
  } else if (refs.draftPickStatus !== "draft-pick-created-execution-ready") {
    blockedReasonIds.push("draft-pick-status-not-executable");
  }

  return createNewGMModeDraftPickExecutionResultObject({
    sourceDraftPickObjectId:
      refs.sourceDraftPickObjectId || "missing-draft-pick-object-id",
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
    executionStatus:
      blockedReasonIds.length === 0
        ? "draft-pick-executed-roster-assignment-ready"
        : "draft-pick-execution-blocked",
    blockedReasonIds
  });
}

interface DraftPickObjectReferences {
  readonly sourceDraftPickObjectId: string | null;
  readonly sourceValidationResultObjectId: string | null;
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number;
  readonly draftPickNumber: number;
  readonly draftPickStatus: string | null;
}

function readDraftPickObjectReferences(
  draftPickObject: unknown
): DraftPickObjectReferences {
  if (!isRecord(draftPickObject)) {
    return {
      sourceDraftPickObjectId: null,
      sourceValidationResultObjectId: null,
      sourceSelectionIntentObjectId: null,
      candidateObjectId: null,
      sourceFixtureId: null,
      sourceWrestlerId: null,
      selectingBrandId: null,
      draftRound: Number.NaN,
      draftPickNumber: Number.NaN,
      draftPickStatus: null
    };
  }

  return {
    sourceDraftPickObjectId: readString(draftPickObject, "draftPickObjectId"),
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
    ),
    draftPickStatus: readString(draftPickObject, "draftPickStatus")
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
