import {
  createNewGMModeRosterStateBlockedReasonCatalog,
  type NewGMModeRosterStateBlockedReasonCatalogId
} from "./newGMModeRosterStateBlockedReasonCatalog.ts";
import {
  type NewGMModeRosterStateObjectCapabilityFlags,
  NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeRosterStateObject.ts";

export type NewGMModeRosterStateObjectValidationIssueId =
  | "roster-state-object-missing"
  | "roster-state-object-id-missing"
  | "roster-state-object-id-not-deterministic"
  | "roster-state-id-seed-reference-missing"
  | "brand-roster-reference-missing"
  | "assigned-wrestler-membership-references-missing"
  | "assigned-wrestler-membership-reference-invalid"
  | "source-roster-assignment-result-object-ids-missing"
  | "source-roster-assignment-result-object-id-invalid"
  | "version-reference-missing"
  | "brand-roster-reference-not-inert"
  | "version-reference-not-inert"
  | "roster-state-status-unknown"
  | "blocked-reason-ids-missing"
  | "blocked-reason-id-not-in-static-catalog"
  | "domain-object-flag-invalid"
  | "diagnostics-only-flag-invalid"
  | "player-facing-flag-invalid"
  | "gameplay-affecting-flag-invalid"
  | "mutable-flag-invalid"
  | "capability-flags-missing"
  | "capability-flag-invalid"
  | "forbidden-field-present";

export interface NewGMModeRosterStateObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeRosterStateObjectValidationIssueId;
}

export interface NewGMModeRosterStateObjectValidatorInput {
  readonly rosterStateObject?: unknown;
}

export interface NewGMModeRosterStateObjectValidatorResult {
  readonly validatorId: "new-gm-mode-roster-state-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeRosterStateObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeRosterStateObjectCapabilityFlags;
}

const ALLOWED_ROSTER_STATE_STATUSES = Object.freeze([
  "roster-state-object-created-mutation-unavailable",
  "roster-state-object-blocked-creation-unavailable",
  "roster-state-created-draft-complete-gameplay-start-blocked",
  "roster-state-creation-blocked"
]);
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedCandidate",
  "selectedCandidateObject",
  "draftState",
  "realRosterMutation",
  "rosterMutationAction",
  "championshipDivision",
  "match",
  "matchState",
  "show",
  "showState",
  "week",
  "weekState",
  "calendar",
  "calendarState",
  "save",
  "savePayload",
  "SQLite",
  "sqlite",
  "sqliteConnection",
  "ui",
  "generatedText",
  "genAI",
  "genAIClient"
]);

export function createNewGMModeRosterStateObjectValidator(
  input: NewGMModeRosterStateObjectValidatorInput = {}
): NewGMModeRosterStateObjectValidatorResult {
  const issues: NewGMModeRosterStateObjectValidationIssue[] = [];

  validateRosterStateObject(input.rosterStateObject, issues);

  return Object.freeze({
    validatorId: "new-gm-mode-roster-state-object-validator-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    validationOnly: true,
    structurallyValid: issues.length === 0,
    issueCount: issues.length,
    issues: Object.freeze(issues),
    capabilityFlags: NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS
  });
}

function validateRosterStateObject(
  rosterStateObject: unknown,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  if (!isRecord(rosterStateObject)) {
    issues.push(createIssue("rosterStateObject", "roster-state-object-missing"));
    return;
  }

  validateObjectId(rosterStateObject, issues);
  validateReferenceFields(rosterStateObject, issues);
  validateRosterStateStatus(rosterStateObject, issues);
  validateBlockedReasonIds(rosterStateObject, issues);
  validateDomainFlags(rosterStateObject, issues);
  validateCapabilityFlags(rosterStateObject.capabilityFlags, issues);
  validateForbiddenFields(rosterStateObject, issues);
}

function validateObjectId(
  rosterStateObject: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  const objectId = readString(rosterStateObject, "rosterStateObjectId");

  if (!objectId) {
    issues.push(
      createIssue("rosterStateObjectId", "roster-state-object-id-missing")
    );
    return;
  }

  const expectedId = createExpectedRosterStateObjectId(rosterStateObject);

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "rosterStateObjectId",
        "roster-state-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  rosterStateObject: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  const rosterStateSeedReference = rosterStateObject.rosterStateSeedReference;
  const brandRosterReference = rosterStateObject.brandRosterReference;
  const versionReference = rosterStateObject.versionReference;

  if (
    !isRecord(rosterStateSeedReference) ||
    !readString(rosterStateSeedReference, "rosterStateIdSeedReference")
  ) {
    issues.push(
      createIssue(
        "rosterStateSeedReference.rosterStateIdSeedReference",
        "roster-state-id-seed-reference-missing"
      )
    );
  }

  if (
    !isRecord(brandRosterReference) ||
    !readString(brandRosterReference, "brandRosterReference")
  ) {
    issues.push(
      createIssue(
        "brandRosterReference.brandRosterReference",
        "brand-roster-reference-missing"
      )
    );
  }

  if (!Array.isArray(rosterStateObject.assignedWrestlerMembershipReferences)) {
    issues.push(
      createIssue(
        "assignedWrestlerMembershipReferences",
        "assigned-wrestler-membership-references-missing"
      )
    );
  } else {
    rosterStateObject.assignedWrestlerMembershipReferences.forEach(
      (membershipReference, index) => {
        if (
          typeof membershipReference !== "string" ||
          membershipReference.length === 0
        ) {
          issues.push(
            createIssue(
              `assignedWrestlerMembershipReferences.${index}`,
              "assigned-wrestler-membership-reference-invalid"
            )
          );
        }
      }
    );
  }

  if (!Array.isArray(rosterStateObject.sourceRosterAssignmentResultObjectIds)) {
    issues.push(
      createIssue(
        "sourceRosterAssignmentResultObjectIds",
        "source-roster-assignment-result-object-ids-missing"
      )
    );
  } else {
    rosterStateObject.sourceRosterAssignmentResultObjectIds.forEach(
      (assignmentResultObjectId, index) => {
        if (
          typeof assignmentResultObjectId !== "string" ||
          assignmentResultObjectId.length === 0
        ) {
          issues.push(
            createIssue(
              `sourceRosterAssignmentResultObjectIds.${index}`,
              "source-roster-assignment-result-object-id-invalid"
            )
          );
        }
      }
    );
  }

  if (
    !isRecord(versionReference) ||
    !readString(versionReference, "versionReference")
  ) {
    issues.push(
      createIssue(
        "versionReference.versionReference",
        "version-reference-missing"
      )
    );
  }

  if (
    isRecord(brandRosterReference) &&
    brandRosterReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "brandRosterReference.placeholderOnly",
        "brand-roster-reference-not-inert"
      )
    );
  }

  if (
    isRecord(versionReference) &&
    versionReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "versionReference.placeholderOnly",
        "version-reference-not-inert"
      )
    );
  }
}

function validateRosterStateStatus(
  rosterStateObject: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  if (
    typeof rosterStateObject.rosterStateStatus !== "string" ||
    !ALLOWED_ROSTER_STATE_STATUSES.includes(rosterStateObject.rosterStateStatus)
  ) {
    issues.push(createIssue("rosterStateStatus", "roster-state-status-unknown"));
  }
}

function validateBlockedReasonIds(
  rosterStateObject: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  const blockedReasonReferences = rosterStateObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    issues.push(
      createIssue(
        "blockedReasonReferences.blockedReasonIds",
        "blocked-reason-ids-missing"
      )
    );
    return;
  }

  const catalogIds = new Set(
    createNewGMModeRosterStateBlockedReasonCatalog().blockedReasonIds
  );

  blockedReasonReferences.blockedReasonIds.forEach((blockedReasonId, index) => {
    if (
      typeof blockedReasonId !== "string" ||
      !catalogIds.has(
        blockedReasonId as NewGMModeRosterStateBlockedReasonCatalogId
      )
    ) {
      issues.push(
        createIssue(
          `blockedReasonReferences.blockedReasonIds.${index}`,
          "blocked-reason-id-not-in-static-catalog"
        )
      );
    }
  });
}

function validateDomainFlags(
  rosterStateObject: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  if (rosterStateObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (rosterStateObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (rosterStateObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (rosterStateObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (rosterStateObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(NEW_GM_MODE_ROSTER_STATE_OBJECT_CAPABILITY_FLAGS).forEach(
    ([flagId, expectedValue]) => {
      if (capabilityFlags[flagId] !== expectedValue) {
        issues.push(
          createIssue(`capabilityFlags.${flagId}`, "capability-flag-invalid")
        );
      }
    }
  );
}

function validateForbiddenFields(
  source: Record<string, unknown>,
  issues: NewGMModeRosterStateObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
}

function createExpectedRosterStateObjectId(
  rosterStateObject: Record<string, unknown>
): string | null {
  const rosterStateSeedReference = rosterStateObject.rosterStateSeedReference;
  const brandRosterReference = rosterStateObject.brandRosterReference;
  const versionReference = rosterStateObject.versionReference;
  const blockedReasonReferences = rosterStateObject.blockedReasonReferences;

  if (
    !isRecord(rosterStateSeedReference) ||
    !isRecord(brandRosterReference) ||
    !isRecord(versionReference) ||
    !Array.isArray(rosterStateObject.assignedWrestlerMembershipReferences) ||
    !Array.isArray(rosterStateObject.sourceRosterAssignmentResultObjectIds) ||
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds) ||
    typeof rosterStateObject.rosterStateStatus !== "string"
  ) {
    return null;
  }

  const rosterStateIdSeedReference = readString(
    rosterStateSeedReference,
    "rosterStateIdSeedReference"
  );
  const brandRosterReferenceId = readString(
    brandRosterReference,
    "brandRosterReference"
  );
  const versionReferenceId = readString(versionReference, "versionReference");
  const assignedWrestlerMembershipReferences =
    rosterStateObject.assignedWrestlerMembershipReferences;
  const sourceRosterAssignmentResultObjectIds =
    rosterStateObject.sourceRosterAssignmentResultObjectIds;
  const blockedReasonIds = blockedReasonReferences.blockedReasonIds;

  if (
    !rosterStateIdSeedReference ||
    !brandRosterReferenceId ||
    !versionReferenceId ||
    !assignedWrestlerMembershipReferences.every(
      (membershipReference) => typeof membershipReference === "string"
    ) ||
    !sourceRosterAssignmentResultObjectIds.every(
      (assignmentResultObjectId) => typeof assignmentResultObjectId === "string"
    ) ||
    !blockedReasonIds.every((blockedReasonId) => typeof blockedReasonId === "string")
  ) {
    return null;
  }

  return [
    "new-gm-mode-roster-state-object",
    normalizeIdPart(rosterStateIdSeedReference),
    normalizeIdPart(brandRosterReferenceId),
    createArrayIdPart(
      "membership",
      assignedWrestlerMembershipReferences as string[]
    ),
    createArrayIdPart(
      "assignment-results",
      sourceRosterAssignmentResultObjectIds as string[]
    ),
    normalizeIdPart(rosterStateObject.rosterStateStatus),
    createBlockedReasonIdPart(blockedReasonIds as string[]),
    normalizeIdPart(versionReferenceId)
  ].join(":");
}

function createArrayIdPart(label: string, values: readonly string[]): string {
  if (values.length === 0) {
    return `${label}-none`;
  }

  return `${label}-${values.map((value) => normalizeIdPart(value)).join("-")}`;
}

function createBlockedReasonIdPart(
  blockedReasonIds: readonly string[]
): string {
  if (blockedReasonIds.length === 0) {
    return "blocked-reasons-none";
  }

  return `blocked-reasons-${blockedReasonIds
    .map((id) => normalizeIdPart(id))
    .join("-")}`;
}

function collectForbiddenFieldPaths(
  source: unknown,
  parentPath = ""
): readonly string[] {
  if (Array.isArray(source) || !isRecord(source)) {
    return [];
  }

  return Object.entries(source).flatMap(([key, value]) => {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key;
    const directMatch = FORBIDDEN_FIELD_IDS.includes(key) ? [fieldPath] : [];

    return [...directMatch, ...collectForbiddenFieldPaths(value, fieldPath)];
  });
}

function createIssue(
  fieldId: string,
  issueId: NewGMModeRosterStateObjectValidationIssueId
): NewGMModeRosterStateObjectValidationIssue {
  return Object.freeze({
    fieldId,
    issueId
  });
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

function readString(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}
