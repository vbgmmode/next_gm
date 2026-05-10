import {
  createNewGMModeRosterStateObject,
  type NewGMModeRosterStateObject
} from "./newGMModeRosterStateObject.ts";
import type { NewGMModeRosterStateBlockedReasonCatalogId } from "./newGMModeRosterStateBlockedReasonCatalog.ts";
import { createNewGMModeDraftPickRosterAssignmentResultObjectValidator } from "./newGMModeDraftPickRosterAssignmentResultObjectValidator.ts";

export interface NewGMModeRosterStateCreationServiceInput {
  readonly rosterAssignmentResultObjects: readonly unknown[];
}

export function createNewGMModeRosterStateCreationService(
  input: NewGMModeRosterStateCreationServiceInput
): NewGMModeRosterStateObject {
  const assignmentResults = [...input.rosterAssignmentResultObjects];
  const refs = assignmentResults.map(readAssignmentResultReferences);
  const blockedReasonIds: NewGMModeRosterStateBlockedReasonCatalogId[] = [];

  if (assignmentResults.length === 0) {
    pushUnique(blockedReasonIds, "assignment-result-object-invalid");
  }

  assignmentResults.forEach((assignmentResultObject, index) => {
    const validator =
      createNewGMModeDraftPickRosterAssignmentResultObjectValidator({
        rosterAssignmentResultObject: assignmentResultObject
      });

    if (!validator.structurallyValid) {
      pushUnique(blockedReasonIds, "assignment-result-object-invalid");
    }

    if (refs[index].assignmentStatus !== "roster-assignment-created-roster-state-ready") {
      pushUnique(blockedReasonIds, "assignment-result-status-not-state-ready");
    }
  });

  if (refs.some((ref) => !ref.selectingBrandId)) {
    pushUnique(blockedReasonIds, "brand-roster-reference-missing");
  }

  if (refs.some((ref) => !ref.sourceWrestlerId)) {
    pushUnique(blockedReasonIds, "wrestler-membership-reference-missing");
  }

  if (hasDuplicateWrestlerMembershipForBrand(refs)) {
    pushUnique(blockedReasonIds, "duplicate-membership-rules-unavailable");
  }

  const brandRosterReference = createBrandRosterReference(refs);
  const membershipReferences = createMembershipReferences(refs);
  const sourceRosterAssignmentResultObjectIds = refs.map(
    (ref, index) =>
      ref.rosterAssignmentResultObjectId ||
      `missing-roster-assignment-result-object-id-${index + 1}`
  );

  return createNewGMModeRosterStateObject({
    rosterStateIdSeedReference: createRosterStateSeedReference(
      brandRosterReference,
      sourceRosterAssignmentResultObjectIds
    ),
    brandRosterReference,
    assignedWrestlerMembershipReferences: membershipReferences,
    sourceRosterAssignmentResultObjectIds,
    rosterStateStatus:
      blockedReasonIds.length === 0
        ? "roster-state-created-draft-complete-gameplay-start-blocked"
        : "roster-state-creation-blocked",
    blockedReasonIds,
    versionReference: "new-gm-mode-real-draft-system-v1.0"
  });
}

interface AssignmentResultReferences {
  readonly rosterAssignmentResultObjectId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly assignmentStatus: string | null;
}

function readAssignmentResultReferences(
  assignmentResultObject: unknown
): AssignmentResultReferences {
  if (!isRecord(assignmentResultObject)) {
    return {
      rosterAssignmentResultObjectId: null,
      sourceWrestlerId: null,
      selectingBrandId: null,
      assignmentStatus: null
    };
  }

  return {
    rosterAssignmentResultObjectId: readString(
      assignmentResultObject,
      "rosterAssignmentResultObjectId"
    ),
    sourceWrestlerId: readNestedString(
      assignmentResultObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      assignmentResultObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    assignmentStatus: readString(assignmentResultObject, "assignmentStatus")
  };
}

function createMembershipReferences(
  refs: readonly AssignmentResultReferences[]
): readonly string[] {
  return Object.freeze(
    refs.map((ref, index) =>
      [
        "new-gm-mode-roster-membership",
        normalizeIdPart(ref.selectingBrandId || "missing-brand"),
        normalizeIdPart(ref.sourceWrestlerId || "missing-wrestler"),
        `assignment-${index + 1}`
      ].join(":")
    )
  );
}

function createBrandRosterReference(
  refs: readonly AssignmentResultReferences[]
): string {
  const brandIds = [
    ...new Set(
      refs.map((ref) => ref.selectingBrandId).filter((brandId): brandId is string => !!brandId)
    )
  ];

  if (brandIds.length === 0) {
    return "missing-brand-roster";
  }

  return `new-gm-mode-brand-roster:${brandIds
    .map((brandId) => normalizeIdPart(brandId))
    .join("-")}`;
}

function createRosterStateSeedReference(
  brandRosterReference: string,
  sourceRosterAssignmentResultObjectIds: readonly string[]
): string {
  return [
    "new-gm-mode-roster-state",
    normalizeIdPart(brandRosterReference),
    ...sourceRosterAssignmentResultObjectIds.map((id) => normalizeIdPart(id))
  ].join(":");
}

function hasDuplicateWrestlerMembershipForBrand(
  refs: readonly AssignmentResultReferences[]
): boolean {
  const seen = new Set<string>();

  for (const ref of refs) {
    if (!ref.selectingBrandId || !ref.sourceWrestlerId) {
      continue;
    }

    const key = `${ref.selectingBrandId}::${ref.sourceWrestlerId}`;

    if (seen.has(key)) {
      return true;
    }

    seen.add(key);
  }

  return false;
}

function pushUnique(
  blockedReasonIds: NewGMModeRosterStateBlockedReasonCatalogId[],
  blockedReasonId: NewGMModeRosterStateBlockedReasonCatalogId
): void {
  if (!blockedReasonIds.includes(blockedReasonId)) {
    blockedReasonIds.push(blockedReasonId);
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
