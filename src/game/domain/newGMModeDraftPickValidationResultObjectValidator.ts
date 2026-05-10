import {
  createNewGMModeDraftPickValidationIssueCatalog,
  type NewGMModeDraftPickValidationIssueCatalogId
} from "./newGMModeDraftPickValidationIssueCatalog.ts";
import {
  type NewGMModeDraftPickValidationResultCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickValidationResultContractShell.ts";

export type NewGMModeDraftPickValidationResultObjectValidationIssueId =
  | "validation-result-object-missing"
  | "draft-pick-validation-result-object-id-missing"
  | "draft-pick-validation-result-object-id-not-deterministic"
  | "source-selection-intent-object-id-reference-missing"
  | "candidate-object-id-reference-missing"
  | "source-fixture-id-reference-missing"
  | "source-wrestler-id-reference-missing"
  | "selecting-brand-id-reference-missing"
  | "draft-round-reference-missing"
  | "draft-pick-number-reference-missing"
  | "selecting-brand-reference-not-inert"
  | "draft-order-reference-not-inert"
  | "validation-status-unknown"
  | "issue-ids-missing"
  | "issue-id-not-in-static-catalog"
  | "domain-object-flag-invalid"
  | "diagnostics-only-flag-invalid"
  | "player-facing-flag-invalid"
  | "gameplay-affecting-flag-invalid"
  | "mutable-flag-invalid"
  | "capability-flags-missing"
  | "capability-flag-invalid"
  | "forbidden-field-present";

export interface NewGMModeDraftPickValidationResultObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftPickValidationResultObjectValidationIssueId;
}

export interface NewGMModeDraftPickValidationResultObjectValidatorInput {
  readonly validationResultObject?: unknown;
}

export interface NewGMModeDraftPickValidationResultObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-pick-validation-result-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftPickValidationResultObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftPickValidationResultCapabilityFlags;
}

const ALLOWED_VALIDATION_STATUSES = Object.freeze([
  "validation-result-created-real-validation-unavailable",
  "validation-result-blocked-real-validation-unavailable",
  "draft-pick-validation-approved",
  "draft-pick-validation-blocked"
]);
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedCandidate",
  "selectedCandidateObject",
  "draftPickId",
  "draftPickObject",
  "draftState",
  "rosterAssignment",
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

export function createNewGMModeDraftPickValidationResultObjectValidator(
  input: NewGMModeDraftPickValidationResultObjectValidatorInput = {}
): NewGMModeDraftPickValidationResultObjectValidatorResult {
  const issues: NewGMModeDraftPickValidationResultObjectValidationIssue[] = [];

  validateValidationResultObject(input.validationResultObject, issues);

  return Object.freeze({
    validatorId:
      "new-gm-mode-draft-pick-validation-result-object-validator-v0.1",
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
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
  });
}

function validateValidationResultObject(
  validationResultObject: unknown,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  if (!isRecord(validationResultObject)) {
    issues.push(
      createIssue("validationResultObject", "validation-result-object-missing")
    );
    return;
  }

  validateObjectId(validationResultObject, issues);
  validateReferenceFields(validationResultObject, issues);
  validateValidationStatus(validationResultObject, issues);
  validateIssueIds(validationResultObject, issues);
  validateDomainFlags(validationResultObject, issues);
  validateCapabilityFlags(validationResultObject.capabilityFlags, issues);
  validateForbiddenFields(validationResultObject, issues);
}

function validateObjectId(
  validationResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  const objectId = readString(
    validationResultObject,
    "draftPickValidationResultObjectId"
  );

  if (!objectId) {
    issues.push(
      createIssue(
        "draftPickValidationResultObjectId",
        "draft-pick-validation-result-object-id-missing"
      )
    );
    return;
  }

  const expectedId = createExpectedValidationResultObjectId(
    validationResultObject
  );

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "draftPickValidationResultObjectId",
        "draft-pick-validation-result-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  validationResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  const sourceSelectionIntentReference =
    validationResultObject.sourceSelectionIntentReference;
  const sourceCandidateReference = validationResultObject.sourceCandidateReference;
  const sourceFixtureReference = validationResultObject.sourceFixtureReference;
  const sourceWrestlerReference = validationResultObject.sourceWrestlerReference;
  const selectingBrandReference = validationResultObject.selectingBrandReference;
  const draftOrderReference = validationResultObject.draftOrderReference;

  if (
    !isRecord(sourceSelectionIntentReference) ||
    !readString(
      sourceSelectionIntentReference,
      "sourceSelectionIntentObjectId"
    )
  ) {
    issues.push(
      createIssue(
        "sourceSelectionIntentReference.sourceSelectionIntentObjectId",
        "source-selection-intent-object-id-reference-missing"
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
    !isRecord(draftOrderReference) ||
    !Number.isFinite(draftOrderReference.draftRound)
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.draftRound",
        "draft-round-reference-missing"
      )
    );
  }

  if (
    !isRecord(draftOrderReference) ||
    !Number.isFinite(draftOrderReference.draftPickNumber)
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.draftPickNumber",
        "draft-pick-number-reference-missing"
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
    isRecord(draftOrderReference) &&
    draftOrderReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.placeholderOnly",
        "draft-order-reference-not-inert"
      )
    );
  }
}

function validateValidationStatus(
  validationResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  if (
    typeof validationResultObject.validationStatus !== "string" ||
    !ALLOWED_VALIDATION_STATUSES.includes(
      validationResultObject.validationStatus
    )
  ) {
    issues.push(createIssue("validationStatus", "validation-status-unknown"));
  }
}

function validateIssueIds(
  validationResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  const issueReferences = validationResultObject.issueReferences;

  if (!isRecord(issueReferences) || !Array.isArray(issueReferences.issueIds)) {
    issues.push(createIssue("issueReferences.issueIds", "issue-ids-missing"));
    return;
  }

  const catalogIssueIds = new Set(
    createNewGMModeDraftPickValidationIssueCatalog().issueIds
  );

  issueReferences.issueIds.forEach((issueId, index) => {
    if (
      typeof issueId !== "string" ||
      !catalogIssueIds.has(issueId as NewGMModeDraftPickValidationIssueCatalogId)
    ) {
      issues.push(
        createIssue(
          `issueReferences.issueIds.${index}`,
          "issue-id-not-in-static-catalog"
        )
      );
    }
  });
}

function validateDomainFlags(
  validationResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  if (validationResultObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (validationResultObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (validationResultObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (validationResultObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (validationResultObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS).forEach(
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
  issues: NewGMModeDraftPickValidationResultObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
}

function createExpectedValidationResultObjectId(
  validationResultObject: Record<string, unknown>
): string | null {
  const sourceSelectionIntentReference =
    validationResultObject.sourceSelectionIntentReference;
  const sourceCandidateReference = validationResultObject.sourceCandidateReference;
  const sourceFixtureReference = validationResultObject.sourceFixtureReference;
  const sourceWrestlerReference = validationResultObject.sourceWrestlerReference;
  const selectingBrandReference = validationResultObject.selectingBrandReference;
  const draftOrderReference = validationResultObject.draftOrderReference;
  const issueReferences = validationResultObject.issueReferences;

  if (
    !isRecord(sourceSelectionIntentReference) ||
    !isRecord(sourceCandidateReference) ||
    !isRecord(sourceFixtureReference) ||
    !isRecord(sourceWrestlerReference) ||
    !isRecord(selectingBrandReference) ||
    !isRecord(draftOrderReference) ||
    !isRecord(issueReferences) ||
    !Array.isArray(issueReferences.issueIds) ||
    typeof validationResultObject.validationStatus !== "string"
  ) {
    return null;
  }

  const sourceSelectionIntentObjectId = readString(
    sourceSelectionIntentReference,
    "sourceSelectionIntentObjectId"
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
  const draftRound = draftOrderReference.draftRound;
  const draftPickNumber = draftOrderReference.draftPickNumber;
  const issueIds = issueReferences.issueIds;

  if (
    !sourceSelectionIntentObjectId ||
    !candidateObjectId ||
    !sourceFixtureId ||
    !sourceWrestlerId ||
    !selectingBrandId ||
    !Number.isFinite(draftRound) ||
    !Number.isFinite(draftPickNumber) ||
    !issueIds.every((issueId) => typeof issueId === "string")
  ) {
    return null;
  }

  return [
    "new-gm-mode-draft-pick-validation-result",
    normalizeIdPart(sourceSelectionIntentObjectId),
    normalizeIdPart(candidateObjectId),
    normalizeIdPart(sourceFixtureId),
    normalizeIdPart(sourceWrestlerId),
    normalizeIdPart(selectingBrandId),
    `round-${normalizeIdPart(String(draftRound))}`,
    `pick-${normalizeIdPart(String(draftPickNumber))}`,
    normalizeIdPart(validationResultObject.validationStatus),
    createIssueIdPart(issueIds as string[])
  ].join(":");
}

function createIssueIdPart(issueIds: readonly string[]): string {
  if (issueIds.length === 0) {
    return "issues-none";
  }

  return `issues-${issueIds.map((id) => normalizeIdPart(id)).join("-")}`;
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
  issueId: NewGMModeDraftPickValidationResultObjectValidationIssueId
): NewGMModeDraftPickValidationResultObjectValidationIssue {
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
