import {
  createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog,
  type NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId
} from "./newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickRosterAssignmentResultObject.ts";

export type NewGMModeDraftPickRosterAssignmentResultObjectValidationIssueId =
  | "roster-assignment-result-object-missing"
  | "roster-assignment-result-object-id-missing"
  | "roster-assignment-result-object-id-not-deterministic"
  | "source-execution-result-object-id-reference-missing"
  | "source-draft-pick-object-id-reference-missing"
  | "candidate-object-id-reference-missing"
  | "source-fixture-id-reference-missing"
  | "source-wrestler-id-reference-missing"
  | "selecting-brand-id-reference-missing"
  | "roster-slot-reference-missing"
  | "selecting-brand-reference-not-inert"
  | "roster-slot-reference-not-inert"
  | "assignment-status-unknown"
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

export interface NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssueId;
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectValidatorInput {
  readonly rosterAssignmentResultObject?: unknown;
}

export interface NewGMModeDraftPickRosterAssignmentResultObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-pick-roster-assignment-result-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentResultObjectCapabilityFlags;
}

const ALLOWED_ASSIGNMENT_STATUSES = Object.freeze([
  "roster-assignment-result-created-mutation-unavailable",
  "roster-assignment-result-blocked-assignment-unavailable",
  "roster-assignment-created-roster-state-ready",
  "roster-assignment-blocked"
]);
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedCandidate",
  "selectedCandidateObject",
  "draftState",
  "rosterState",
  "championshipDivision",
  "match",
  "matchState",
  "show",
  "showState",
  "week",
  "weekState",
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

export function createNewGMModeDraftPickRosterAssignmentResultObjectValidator(
  input: NewGMModeDraftPickRosterAssignmentResultObjectValidatorInput = {}
): NewGMModeDraftPickRosterAssignmentResultObjectValidatorResult {
  const issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[] =
    [];

  validateRosterAssignmentResultObject(
    input.rosterAssignmentResultObject,
    issues
  );

  return Object.freeze({
    validatorId:
      "new-gm-mode-draft-pick-roster-assignment-result-object-validator-v0.1",
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
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS
  });
}

function validateRosterAssignmentResultObject(
  rosterAssignmentResultObject: unknown,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  if (!isRecord(rosterAssignmentResultObject)) {
    issues.push(
      createIssue(
        "rosterAssignmentResultObject",
        "roster-assignment-result-object-missing"
      )
    );
    return;
  }

  validateObjectId(rosterAssignmentResultObject, issues);
  validateReferenceFields(rosterAssignmentResultObject, issues);
  validateAssignmentStatus(rosterAssignmentResultObject, issues);
  validateBlockedReasonIds(rosterAssignmentResultObject, issues);
  validateDomainFlags(rosterAssignmentResultObject, issues);
  validateCapabilityFlags(rosterAssignmentResultObject.capabilityFlags, issues);
  validateForbiddenFields(rosterAssignmentResultObject, issues);
}

function validateObjectId(
  rosterAssignmentResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  const objectId = readString(
    rosterAssignmentResultObject,
    "rosterAssignmentResultObjectId"
  );

  if (!objectId) {
    issues.push(
      createIssue(
        "rosterAssignmentResultObjectId",
        "roster-assignment-result-object-id-missing"
      )
    );
    return;
  }

  const expectedId = createExpectedRosterAssignmentResultObjectId(
    rosterAssignmentResultObject
  );

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "rosterAssignmentResultObjectId",
        "roster-assignment-result-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  rosterAssignmentResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  const sourceExecutionResultReference =
    rosterAssignmentResultObject.sourceExecutionResultReference;
  const sourceDraftPickReference =
    rosterAssignmentResultObject.sourceDraftPickReference;
  const sourceCandidateReference =
    rosterAssignmentResultObject.sourceCandidateReference;
  const sourceFixtureReference =
    rosterAssignmentResultObject.sourceFixtureReference;
  const sourceWrestlerReference =
    rosterAssignmentResultObject.sourceWrestlerReference;
  const selectingBrandReference =
    rosterAssignmentResultObject.selectingBrandReference;
  const rosterSlotReference =
    rosterAssignmentResultObject.rosterSlotReference;

  if (
    !isRecord(sourceExecutionResultReference) ||
    !readString(
      sourceExecutionResultReference,
      "sourceExecutionResultObjectId"
    )
  ) {
    issues.push(
      createIssue(
        "sourceExecutionResultReference.sourceExecutionResultObjectId",
        "source-execution-result-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceDraftPickReference) ||
    !readString(sourceDraftPickReference, "sourceDraftPickObjectId")
  ) {
    issues.push(
      createIssue(
        "sourceDraftPickReference.sourceDraftPickObjectId",
        "source-draft-pick-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceCandidateReference) ||
    !readString(sourceCandidateReference, "candidateObjectId")
  ) {
    issues.push(
      createIssue(
        "sourceCandidateReference.candidateObjectId",
        "candidate-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceFixtureReference) ||
    !readString(sourceFixtureReference, "sourceFixtureId")
  ) {
    issues.push(
      createIssue(
        "sourceFixtureReference.sourceFixtureId",
        "source-fixture-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceWrestlerReference) ||
    !readString(sourceWrestlerReference, "sourceWrestlerId")
  ) {
    issues.push(
      createIssue(
        "sourceWrestlerReference.sourceWrestlerId",
        "source-wrestler-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(selectingBrandReference) ||
    !readString(selectingBrandReference, "selectingBrandId")
  ) {
    issues.push(
      createIssue(
        "selectingBrandReference.selectingBrandId",
        "selecting-brand-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(rosterSlotReference) ||
    !readString(rosterSlotReference, "rosterSlotReference")
  ) {
    issues.push(
      createIssue(
        "rosterSlotReference.rosterSlotReference",
        "roster-slot-reference-missing"
      )
    );
  }

  if (
    isRecord(selectingBrandReference) &&
    selectingBrandReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "selectingBrandReference.placeholderOnly",
        "selecting-brand-reference-not-inert"
      )
    );
  }

  if (
    isRecord(rosterSlotReference) &&
    rosterSlotReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "rosterSlotReference.placeholderOnly",
        "roster-slot-reference-not-inert"
      )
    );
  }
}

function validateAssignmentStatus(
  rosterAssignmentResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  if (
    typeof rosterAssignmentResultObject.assignmentStatus !== "string" ||
    !ALLOWED_ASSIGNMENT_STATUSES.includes(
      rosterAssignmentResultObject.assignmentStatus
    )
  ) {
    issues.push(
      createIssue("assignmentStatus", "assignment-status-unknown")
    );
  }
}

function validateBlockedReasonIds(
  rosterAssignmentResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  const blockedReasonReferences =
    rosterAssignmentResultObject.blockedReasonReferences;

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
    createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog()
      .blockedReasonIds
  );

  blockedReasonReferences.blockedReasonIds.forEach((blockedReasonId, index) => {
    if (
      typeof blockedReasonId !== "string" ||
      !catalogIds.has(
        blockedReasonId as NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId
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
  rosterAssignmentResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  if (rosterAssignmentResultObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (rosterAssignmentResultObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (rosterAssignmentResultObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (rosterAssignmentResultObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (rosterAssignmentResultObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(
    NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_OBJECT_CAPABILITY_FLAGS
  ).forEach(([flagId, expectedValue]) => {
    if (capabilityFlags[flagId] !== expectedValue) {
      issues.push(
        createIssue(`capabilityFlags.${flagId}`, "capability-flag-invalid")
      );
    }
  });
}

function validateForbiddenFields(
  source: Record<string, unknown>,
  issues: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
}

function createExpectedRosterAssignmentResultObjectId(
  rosterAssignmentResultObject: Record<string, unknown>
): string | null {
  const sourceExecutionResultReference =
    rosterAssignmentResultObject.sourceExecutionResultReference;
  const sourceDraftPickReference =
    rosterAssignmentResultObject.sourceDraftPickReference;
  const sourceCandidateReference =
    rosterAssignmentResultObject.sourceCandidateReference;
  const sourceFixtureReference =
    rosterAssignmentResultObject.sourceFixtureReference;
  const sourceWrestlerReference =
    rosterAssignmentResultObject.sourceWrestlerReference;
  const selectingBrandReference =
    rosterAssignmentResultObject.selectingBrandReference;
  const rosterSlotReference =
    rosterAssignmentResultObject.rosterSlotReference;
  const blockedReasonReferences =
    rosterAssignmentResultObject.blockedReasonReferences;

  if (
    !isRecord(sourceExecutionResultReference) ||
    !isRecord(sourceDraftPickReference) ||
    !isRecord(sourceCandidateReference) ||
    !isRecord(sourceFixtureReference) ||
    !isRecord(sourceWrestlerReference) ||
    !isRecord(selectingBrandReference) ||
    !isRecord(rosterSlotReference) ||
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds) ||
    typeof rosterAssignmentResultObject.assignmentStatus !== "string"
  ) {
    return null;
  }

  const sourceExecutionResultObjectId = readString(
    sourceExecutionResultReference,
    "sourceExecutionResultObjectId"
  );
  const sourceDraftPickObjectId = readString(
    sourceDraftPickReference,
    "sourceDraftPickObjectId"
  );
  const candidateObjectId = readString(
    sourceCandidateReference,
    "candidateObjectId"
  );
  const sourceFixtureId = readString(sourceFixtureReference, "sourceFixtureId");
  const sourceWrestlerId = readString(
    sourceWrestlerReference,
    "sourceWrestlerId"
  );
  const selectingBrandId = readString(
    selectingBrandReference,
    "selectingBrandId"
  );
  const rosterSlotReferenceId = readString(
    rosterSlotReference,
    "rosterSlotReference"
  );
  const blockedReasonIds = blockedReasonReferences.blockedReasonIds;

  if (
    !sourceExecutionResultObjectId ||
    !sourceDraftPickObjectId ||
    !candidateObjectId ||
    !sourceFixtureId ||
    !sourceWrestlerId ||
    !selectingBrandId ||
    !rosterSlotReferenceId ||
    !blockedReasonIds.every((blockedReasonId) => typeof blockedReasonId === "string")
  ) {
    return null;
  }

  return [
    "new-gm-mode-draft-pick-roster-assignment-result",
    normalizeIdPart(sourceExecutionResultObjectId),
    normalizeIdPart(sourceDraftPickObjectId),
    normalizeIdPart(candidateObjectId),
    normalizeIdPart(sourceFixtureId),
    normalizeIdPart(sourceWrestlerId),
    normalizeIdPart(selectingBrandId),
    normalizeIdPart(rosterSlotReferenceId),
    normalizeIdPart(rosterAssignmentResultObject.assignmentStatus),
    createBlockedReasonIdPart(blockedReasonIds as string[])
  ].join(":");
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
  issueId: NewGMModeDraftPickRosterAssignmentResultObjectValidationIssueId
): NewGMModeDraftPickRosterAssignmentResultObjectValidationIssue {
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
