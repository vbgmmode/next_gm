import type { NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId } from "./newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts";
import {
  createNewGMModeDraftPickRosterAssignmentResultObject,
  type NewGMModeDraftPickRosterAssignmentResultObject
} from "./newGMModeDraftPickRosterAssignmentResultObject.ts";
import { createNewGMModeDraftPickExecutionResultObjectValidator } from "./newGMModeDraftPickExecutionResultObjectValidator.ts";

export interface NewGMModeDraftPickRosterAssignmentServiceInput {
  readonly executionResultObject: unknown;
}

export function createNewGMModeDraftPickRosterAssignmentService(
  input: NewGMModeDraftPickRosterAssignmentServiceInput
): NewGMModeDraftPickRosterAssignmentResultObject {
  const executionResultObject = input.executionResultObject;
  const validator = createNewGMModeDraftPickExecutionResultObjectValidator({
    executionResultObject
  });
  const refs = readExecutionResultReferences(executionResultObject);
  const blockedReasonIds: NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[] =
    [];

  if (!validator.structurallyValid) {
    blockedReasonIds.push("execution-result-object-invalid");
  } else if (
    refs.executionStatus !== "draft-pick-executed-roster-assignment-ready"
  ) {
    blockedReasonIds.push("execution-result-status-not-assignable");
  }

  if (!refs.candidateObjectId) {
    blockedReasonIds.push("candidate-reference-missing");
  }

  if (!refs.sourceWrestlerId) {
    blockedReasonIds.push("wrestler-reference-missing");
  }

  if (!refs.selectingBrandId) {
    blockedReasonIds.push("brand-reference-missing");
  }

  return createNewGMModeDraftPickRosterAssignmentResultObject({
    sourceExecutionResultObjectId:
      refs.sourceExecutionResultObjectId ||
      "missing-execution-result-object-id",
    sourceDraftPickObjectId:
      refs.sourceDraftPickObjectId || "missing-draft-pick-object-id",
    candidateObjectId: refs.candidateObjectId || "missing-candidate-object-id",
    sourceFixtureId: refs.sourceFixtureId || "missing-source-fixture-id",
    sourceWrestlerId: refs.sourceWrestlerId || "missing-source-wrestler-id",
    selectingBrandId: refs.selectingBrandId || "missing-selecting-brand-id",
    rosterSlotReference: createRosterSlotReference({
      selectingBrandId: refs.selectingBrandId || "missing-selecting-brand-id",
      sourceWrestlerId: refs.sourceWrestlerId || "missing-source-wrestler-id",
      sourceDraftPickObjectId:
        refs.sourceDraftPickObjectId || "missing-draft-pick-object-id"
    }),
    assignmentStatus:
      blockedReasonIds.length === 0
        ? "roster-assignment-created-roster-state-ready"
        : "roster-assignment-blocked",
    blockedReasonIds
  });
}

export function createNewGMModeDraftPickRosterSlotReference(input: {
  readonly selectingBrandId: string;
  readonly sourceWrestlerId: string;
  readonly sourceDraftPickObjectId: string;
}): string {
  return createRosterSlotReference(input);
}

interface ExecutionResultReferences {
  readonly sourceExecutionResultObjectId: string | null;
  readonly sourceDraftPickObjectId: string | null;
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly executionStatus: string | null;
}

function readExecutionResultReferences(
  executionResultObject: unknown
): ExecutionResultReferences {
  if (!isRecord(executionResultObject)) {
    return {
      sourceExecutionResultObjectId: null,
      sourceDraftPickObjectId: null,
      candidateObjectId: null,
      sourceFixtureId: null,
      sourceWrestlerId: null,
      selectingBrandId: null,
      executionStatus: null
    };
  }

  return {
    sourceExecutionResultObjectId: readString(
      executionResultObject,
      "draftPickExecutionResultObjectId"
    ),
    sourceDraftPickObjectId: readNestedString(
      executionResultObject,
      "sourceDraftPickReference",
      "sourceDraftPickObjectId"
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
    executionStatus: readString(executionResultObject, "executionStatus")
  };
}

function createRosterSlotReference(input: {
  readonly selectingBrandId: string;
  readonly sourceWrestlerId: string;
  readonly sourceDraftPickObjectId: string;
}): string {
  return [
    "new-gm-mode-roster-slot",
    normalizeIdPart(input.selectingBrandId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.sourceDraftPickObjectId)
  ].join(":");
}

function readNestedString(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): string | null {
  const parent = source[parentKey];

  return isRecord(parent) ? readString(parent, childKey) : null;
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "empty";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
