import {
  createNewGMModeDraftPickCandidateObjects,
  type NewGMModeDraftPickCandidateObject,
  type NewGMModeDraftPickCandidateObjectSet
} from "./newGMModeDraftPickCandidateObject.ts";
import type { NewGMModeDraftPickValidationIssueCatalogId } from "./newGMModeDraftPickValidationIssueCatalog.ts";
import {
  createNewGMModeDraftPickValidationResultObject,
  type NewGMModeDraftPickValidationResultObject
} from "./newGMModeDraftPickValidationResultObject.ts";
import { createNewGMModeDraftSelectionIntentObjectValidator } from "./newGMModeDraftSelectionIntentObjectValidator.ts";

export interface NewGMModeDraftPickValidationServiceInput {
  readonly selectionIntentObject: unknown;
  readonly candidateObjectSetOverride?: NewGMModeDraftPickCandidateObjectSet;
}

export function createNewGMModeDraftPickValidationService(
  input: NewGMModeDraftPickValidationServiceInput
): NewGMModeDraftPickValidationResultObject {
  const selectionIntentObject = input.selectionIntentObject;
  const selectionIntentValidator =
    createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject
    });
  const candidateSet =
    input.candidateObjectSetOverride ?? createNewGMModeDraftPickCandidateObjects();
  const candidateRefs = readSelectionIntentReferences(selectionIntentObject);
  const candidate = findCandidate(candidateSet, candidateRefs.candidateObjectId);
  const issueIds: NewGMModeDraftPickValidationIssueCatalogId[] = [];

  if (!selectionIntentValidator.structurallyValid) {
    pushUnique(issueIds, "selection-intent-invalid");
  }

  if (!candidateRefs.candidateObjectId) {
    pushUnique(issueIds, "candidate-reference-missing");
  } else if (!candidate) {
    pushUnique(issueIds, "candidate-not-found");
  }

  if (candidate) {
    if (candidate.sourceFixtureReference.fixtureId !== candidateRefs.sourceFixtureId) {
      pushUnique(issueIds, "selection-intent-invalid");
    }

    if (candidate.wrestlerIdentityReference.wrestlerId !== candidateRefs.sourceWrestlerId) {
      pushUnique(issueIds, "selection-intent-invalid");
    }

    if (candidate.eligibilityStatus !== "eligible") {
      pushUnique(issueIds, "candidate-ineligible");
    }
  }

  if (!candidateRefs.selectingBrandId) {
    pushUnique(issueIds, "brand-context-invalid");
  }

  if (
    !Number.isFinite(candidateRefs.draftRound) ||
    !Number.isFinite(candidateRefs.draftPickNumber)
  ) {
    pushUnique(issueIds, "draft-order-invalid");
  }

  return createNewGMModeDraftPickValidationResultObject({
    sourceSelectionIntentObjectId:
      candidateRefs.sourceSelectionIntentObjectId ||
      "missing-selection-intent-object-id",
    candidateObjectId: candidateRefs.candidateObjectId || "missing-candidate-object-id",
    sourceFixtureId: candidateRefs.sourceFixtureId || "missing-source-fixture-id",
    sourceWrestlerId: candidateRefs.sourceWrestlerId || "missing-source-wrestler-id",
    selectingBrandId: candidateRefs.selectingBrandId || "missing-selecting-brand-id",
    draftRound: Number.isFinite(candidateRefs.draftRound)
      ? candidateRefs.draftRound
      : 0,
    draftPickNumber: Number.isFinite(candidateRefs.draftPickNumber)
      ? candidateRefs.draftPickNumber
      : 0,
    validationStatus:
      issueIds.length === 0
        ? "draft-pick-validation-approved"
        : "draft-pick-validation-blocked",
    issueIds
  });
}

interface SelectionIntentReferences {
  readonly sourceSelectionIntentObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number;
  readonly draftPickNumber: number;
}

function readSelectionIntentReferences(
  selectionIntentObject: unknown
): SelectionIntentReferences {
  if (!isRecord(selectionIntentObject)) {
    return {
      sourceSelectionIntentObjectId: null,
      candidateObjectId: null,
      sourceFixtureId: null,
      sourceWrestlerId: null,
      selectingBrandId: null,
      draftRound: Number.NaN,
      draftPickNumber: Number.NaN
    };
  }

  return {
    sourceSelectionIntentObjectId: readString(
      selectionIntentObject,
      "draftSelectionIntentObjectId"
    ),
    candidateObjectId: readNestedString(
      selectionIntentObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      selectionIntentObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      selectionIntentObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      selectionIntentObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    draftRound: readNestedNumber(
      selectionIntentObject,
      "draftOrderReference",
      "draftRound"
    ),
    draftPickNumber: readNestedNumber(
      selectionIntentObject,
      "draftOrderReference",
      "draftPickNumber"
    )
  };
}

function findCandidate(
  candidateSet: NewGMModeDraftPickCandidateObjectSet,
  candidateObjectId: string | null
): NewGMModeDraftPickCandidateObject | null {
  if (!candidateObjectId) {
    return null;
  }

  return (
    candidateSet.candidates.find(
      (candidate) => candidate.candidateId === candidateObjectId
    ) ?? null
  );
}

function pushUnique(
  issueIds: NewGMModeDraftPickValidationIssueCatalogId[],
  issueId: NewGMModeDraftPickValidationIssueCatalogId
): void {
  if (!issueIds.includes(issueId)) {
    issueIds.push(issueId);
  }
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
